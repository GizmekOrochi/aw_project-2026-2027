import * as admins from '../db/admins.js';

export const isValidDiscordId = id => typeof id === 'string' && /^\d{17,20}$/.test(id);
export const isAdmin = (db, id) => admins.isAdmin(db, id);
export const addAdmin = (db, id) => admins.addAdmin(db, id);
export const removeAdmin = (db, id) => admins.removeAdmin(db, id);
export const getAdmins = db => admins.getAdmins(db);
