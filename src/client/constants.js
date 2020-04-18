export const GAME_NAME = location.pathname.split('/')[1];
export const API_GAME_PATH = `/api/game/${GAME_NAME}`;
export const IS_ADMIN = /admin$/.test(location.pathname);
