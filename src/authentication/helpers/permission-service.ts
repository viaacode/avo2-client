import authClient from '../Auth';

type PermissionInfo = { permissionName: PermissionName; obj?: any | null };

export type Permissions = PermissionName | PermissionInfo | (PermissionName | PermissionInfo)[];

export const PERMISSIONS: { [permissionName: string]: string } = {
	EDIT_OWN_COLLECTION: 'EDIT_OWN_COLLECTION',
	EDIT_ALL_COLLECTIONS: 'EDIT_ALL_COLLECTIONS',
	DELETE_OWN_COLLECTION: 'DELETE_OWN_COLLECTION',
	DELETE_ALL_COLLECTIONS: 'DELETE_ALL_COLLECTIONS',
};

type PermissionName = keyof typeof PERMISSIONS;

export class PermissionService {
	// TODO replace with userInfo.permissions
	private static currentUserPermissions: PermissionName[] = Object.values(PERMISSIONS);

	public static hasPermissions(permissions: Permissions) {
		// Reformat all permissions to format: PermissionInfo[]
		let permissionList: PermissionInfo[];
		if (typeof permissions === 'string') {
			// Single permission by name
			permissionList = [{ permissionName: permissions as PermissionName }];
		} else if ((permissions as PermissionInfo).permissionName) {
			// Single permission by name and object
			permissionList = [permissions as PermissionInfo];
		} else {
			// Permission list of strings and objects containing a permission name and an object
			permissionList = (permissions as (string | PermissionInfo)[]).map(
				(permission: string | PermissionInfo): PermissionInfo => {
					if (typeof permission === 'string') {
						// Single permission by name
						return { permissionName: permission as PermissionName };
					}
					// Single permission by name and object
					return permission as PermissionInfo;
				}
			);
		}
		// Check every permission and return true for the first permission that returns true (lazy eval)
		for (const perm of permissionList) {
			if (this.hasPermission(perm.permissionName, perm.obj)) {
				return true;
			}
		}
		return false;
	}

	private static hasPermission(permissionName: PermissionName, obj: any | null | undefined) {
		// Check if user has the requested permission
		if (!this.currentUserPermissions.includes(permissionName)) {
			return false;
		}
		// Special checks on top of permissionName being in the permission list
		switch (permissionName) {
			// TODO replace example permissions
			case PERMISSIONS.EDIT_OWN_COLLECTION:
				const profile = authClient.getProfile();
				if (profile && profile.id === obj.owner.id) {
					return true;
				}
				break;
			default:
				return true;
		}
	}
}
