import { CONTENT_PATH } from './content/content.const';
import { DASHBOARD_PATH } from './dashboard/dashboard.const';
import { MENU_PATH } from './menu/menu.const';
import { USER_PATH } from './users/user.const';

export const ADMIN_PATH = Object.freeze({
	...DASHBOARD_PATH,
	...USER_PATH,
	...MENU_PATH,
	...CONTENT_PATH,
});
