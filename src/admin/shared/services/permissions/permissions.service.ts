import { ApiService } from '../api-service';

import { PERMISSIONS_SERVICE_BASE_URL } from './permissions.const';
import { PermissionData } from './permissions.types';

export class PermissionsService {
	public static async getAllPermissions(): Promise<PermissionData[]> {
		return await ApiService.getApi().get(PERMISSIONS_SERVICE_BASE_URL).json();
	}
}
