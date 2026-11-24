import repository from '../repositories/spreadsheetRepository.js';

export function createChallengeService(repo = repository) {
  return {
    addDefi: (name, content, date) => repo.addDefi(name, content, date),
    getDefis: () => repo.getDefis(),
    getByDate: async date => (await repo.getDefis()).find(d => d.date === date),
    getById: async id => (await repo.getDefis()).find(d => d.DefiID === id),
    addDefaultResponse: (id, content) => repo.addDefaultResponse(id, content),
    getDefaultResponse: id => repo.getDefaultResponse(id),
    removeDefaultResponse: id => repo.removeDefaultResponse(id),
  };
}
export default createChallengeService();
