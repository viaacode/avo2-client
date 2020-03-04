import { CONTENT_PATH } from './content/content.const';
import { DASHBOARD_PATH } from './dashboard/dashboard.const';
import { MENU_PATH } from './menu/menu.const';
import { PERMISSION_GROUP_PATH } from './permission-groups/permission-group.const';

export const ADMIN_PATH = Object.freeze({
	...DASHBOARD_PATH,
	...MENU_PATH,
	...CONTENT_PATH,
	...PERMISSION_GROUP_PATH,
});
