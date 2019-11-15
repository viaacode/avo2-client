import { DASHBOARD_PATH } from './dashboard/dashboard.const';
import { MENU_PATH } from './menu/menu.const';

export const ADMIN_PATH = Object.freeze({
	...DASHBOARD_PATH,
	...MENU_PATH,
});
