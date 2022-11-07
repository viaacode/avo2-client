import { ApiService } from '../api-service';

import { USER_GROUP_SERVICE_BASE_URL } from './user-groups.const';
import { UserGroupDb, UserGroupUpdateResponse, UserGroupUpdates } from './user-groups.types';

export class UserGroupsService {
	public static async getAllUserGroups(): Promise<UserGroupDb[]> {
		return await ApiService.getApi().get(USER_GROUP_SERVICE_BASE_URL).json();
	}

	public static async updateUserGroups(
		json: UserGroupUpdates
	): Promise<UserGroupUpdateResponse[]> {
		return await ApiService.getApi().patch(USER_GROUP_SERVICE_BASE_URL, { json }).json();
	}
}
