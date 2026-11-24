import { createSign, randomUUID } from 'node:crypto';

const SPREADSHEET_ID =
  process.env.GOOGLE_SPREADSHEET_ID || '1CX1csa3fLwZi3vV2OWWm6-V5Wj53NXAbsI7Juo91xak';
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(SPREADSHEET_ID)}`;
const TIMEOUT_MS = 15000;

export const DEFIS = {
  name: 'Feuille 1',
  id: 0,
  headers: ['DefiID', 'Nom', 'Contenu', 'date', 'ReponseDefault'],
};

export const SOLUTIONS = {
  name: 'Feuille 2',
  id: 1130435732,
  headers: ['IDSolution', 'UserID', 'DefiID', 'Contenu', 'LastUpdatedate'],
};

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Identifiants Google Sheets manquants dans le .env à la racine');
  }

  const now = Math.floor(Date.now() / 1000);
  const encodeBase64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

  const jwtHeader = encodeBase64Url({ alg: 'RS256', typ: 'JWT' });
  const jwtPayload = encodeBase64Url({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  });

  const unsignedJwt = `${jwtHeader}.${jwtPayload}`;
  const signature = createSign('RSA-SHA256').update(unsignedJwt).sign(privateKey, 'base64url');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsignedJwt}.${signature}`,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Erreur Google OAuth : ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return cachedToken;
}

async function sheetsRequest(path, method = 'GET', body) {
  const token = await getAccessToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Erreur Google Sheets : ${response.status} - ${error.error?.message || 'Erreur inconnue'}`);
  }

  return response.json();
}

export function createRepository(api = sheetsRequest) {
  let pendingOperation = Promise.resolve();

  const runInTransaction = (operation) => {
    const result = pendingOperation.then(operation);
    pendingOperation = result.catch(() => {});
    return result;
  };

  const getRange = (sheet, rowBounds = '') => {
    const [startRow = '', endRow = ''] = rowBounds ? rowBounds.split(':') : [];
    const lastColumnLetter = String.fromCharCode(64 + sheet.headers.length);
    return `'${sheet.name}'!A${startRow}:${lastColumnLetter}${endRow}`;
  };

  const getValuesPath = (range) => `/values/${encodeURIComponent(range)}`;

  async function writeRow(sheet, rowIndex, values) {
    const range = getRange(sheet, `${rowIndex}:${rowIndex}`);
    await api(`${getValuesPath(range)}?valueInputOption=RAW`, 'PUT', {
      values: [values],
    });
  }

  async function appendRow(sheet, values) {
    const range = getRange(sheet);
    await api(`${getValuesPath(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, 'POST', {
      values: [values],
    });
  }

  async function getAllRows(sheet) {
    const range = getRange(sheet);
    const data = await api(`${getValuesPath(range)}?valueRenderOption=FORMATTED_VALUE`);
    const rawValues = data.values || [];

    if (!rawValues.length) {
      await writeRow(sheet, 1, sheet.headers);
      return [];
    }

    // Migration sans écraser une colonne E déjà utilisée.
    if (sheet.id === DEFIS.id &&
        sheet.headers.slice(0, 4).every((h, i) => rawValues[0][i] === h) &&
        rawValues.every(row => (row[4] ?? '') === '')) {
      await writeRow(sheet, 1, sheet.headers);
      rawValues[0] = [...sheet.headers];
    }

    const hasValidHeaders = sheet.headers.every((header, idx) => rawValues[0][idx] === header);
    if (!hasValidHeaders) {
      throw new Error(`En-têtes incorrects sur la feuille : ${sheet.name}`);
    }

    return rawValues
      .slice(1)
      .map((rowValues, idx) => {
        const entry = Object.fromEntries(
          sheet.headers.map((header, colIdx) => [header, String(rowValues[colIdx] ?? '')])
        );
        return { rowIndex: idx + 2, data: entry };
      })
      .filter((item) => item.data[sheet.headers[0]]);
  }

  async function upsertRow(sheet, matchPredicate, buildRowValues) {
    const allRows = await getAllRows(sheet);
    const existing = allRows.find((item) => matchPredicate(item.data));

    const id = existing?.data[sheet.headers[0]] || randomUUID();
    const rowValues = buildRowValues(id, existing?.data);

    if (existing) {
      await writeRow(sheet, existing.rowIndex, rowValues);
    } else {
      await appendRow(sheet, rowValues);
    }

    return id;
  }

  async function updateDefaultResponse(defiId, content) {
    const rows = await getAllRows(DEFIS);
    const found = rows.find(item => item.data.DefiID === defiId);
    if (!found) return false;
    const range = `'${DEFIS.name}'!E${found.rowIndex}`;
    await api(`${getValuesPath(range)}?valueInputOption=RAW`, 'PUT', { values: [[content]] });
    return true;
  }

  return {
    addDefaultResponse: (defiId, content) =>
      runInTransaction(() => updateDefaultResponse(defiId, content)),

    getDefaultResponse: (defiId) => runInTransaction(async () => {
      const rows = await getAllRows(DEFIS);
      return rows.find(item => item.data.DefiID === defiId)?.data.ReponseDefault || null;
    }),

    removeDefaultResponse: (defiId) =>
      runInTransaction(() => updateDefaultResponse(defiId, '')),

    addDefi: (name, content, date) =>
      runInTransaction(() =>
        upsertRow(
          DEFIS,
          (defi) => defi.date === date,
          (id, existing) => [id, name, content, date, existing?.ReponseDefault ?? '']
        )
      ),

    getDefis: () =>
      runInTransaction(async () => {
        const rows = await getAllRows(DEFIS);
        return rows.map(({ data: { ReponseDefault, ...defi } }) => defi);
      }),

    addSolution: (userId, defiId, content, date) =>
      runInTransaction(async () => {
        const defis = await getAllRows(DEFIS);
        const defiExists = defis.some((item) => item.data.DefiID === defiId);

        if (!defiExists) return null;

        return upsertRow(
          SOLUTIONS,
          (sol) => sol.UserID === userId && sol.DefiID === defiId,
          (id) => [id, userId, defiId, content, date]
        );
      }),

    getSolutions: () =>
      runInTransaction(async () => {
        const rows = await getAllRows(SOLUTIONS);
        return rows.map((item) => item.data);
      }),

    removeSolution: (id) =>
      runInTransaction(async () => {
        const solutions = await getAllRows(SOLUTIONS);
        const found = solutions.find((item) => item.data.IDSolution === id);

        if (!found) return false;

        await api(':batchUpdate', 'POST', {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: SOLUTIONS.id,
                  dimension: 'ROWS',
                  startIndex: found.rowIndex - 1,
                  endIndex: found.rowIndex,
                },
              },
            },
          ],
        });

        return true;
      }),
  };
}

export default createRepository();
