import repository from '../repositories/spreadsheetRepository.js';

export function createResolutionService(repo = repository) {
  return {
    addSolution: (userId, defiId, content, date) => repo.addSolution(userId, defiId, content, date),
    removeSolution: id => repo.removeSolution(id),
    getSolutions: async ({ UserID, DefiID } = {}) => (await repo.getSolutions()).filter(
      s => (!UserID || s.UserID === UserID) && (!DefiID || s.DefiID === DefiID)
    ),
    getById: async id => (await repo.getSolutions()).find(s => s.IDSolution === id),
    getByUserAndDefi: async (userId, defiId) => (await repo.getSolutions()).find(
      s => s.UserID === userId && s.DefiID === defiId
    ),
  };
}
export default createResolutionService();
