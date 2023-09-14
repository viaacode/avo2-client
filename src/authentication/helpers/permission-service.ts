import { ContentPageInfo, ContentPageService } from '@meemoo/admin-core-ui';
import type { Avo } from '@viaa/avo2-types';
import { PermissionName } from '@viaa/avo2-types';
import { get, isString, some } from 'lodash-es';

import { AssignmentService } from '../../assignment/assignment.service';
import { CollectionService } from '../../collection/collection.service';
import { Lookup_Enum_Right_Types_Enum } from '../../shared/generated/graphql-db-types';

import { getProfileId } from './get-profile-id';

type PermissionInfo = { name: PermissionName; obj?: any | null };

export type Permissions = PermissionName | PermissionInfo | (PermissionName | PermissionInfo)[];

export class PermissionService {
	public static hasPerm(
		user: Avo.User.User | Avo.User.CommonUser | undefined,
		permName: PermissionName
	): boolean {
		return PermissionService.getUserPermissions(user).includes(permName);
	}

	public static hasAtLeastOnePerm(
		user: Avo.User.User | Avo.User.CommonUser | undefined,
		permNames: PermissionName[]
	): boolean {
		return some(permNames, (permName) =>
			PermissionService.getUserPermissions(user).includes(permName)
		);
	}

	public static getUserPermissions(
		user: Avo.User.User | Avo.User.CommonUser | null | undefined
	): PermissionName[] {
		return ((user as Avo.User.User)?.profile?.permissions ||
			(user as Avo.User.CommonUser)?.permissions ||
			[]) as PermissionName[];
	}

	/**
	 * Checks if the user has at least one permission for the permissions list
	 * @param permissions
	 * @param user
	 */
	public static async hasPermissions(
		permissions: Permissions,
		user: Avo.User.User | Avo.User.CommonUser | null
	): Promise<boolean> {
		// Reformat all permissions to format: PermissionInfo[]
		let permissionList: PermissionInfo[];
		if (typeof permissions === 'string') {
			// Single permission by name
			permissionList = [{ name: permissions as PermissionName }];
		} else if ((permissions as PermissionInfo).name) {
			// Single permission by name and object
			permissionList = [permissions as PermissionInfo];
		} else {
			// Permission list of strings and objects containing a permission name and an object
			permissionList = (permissions as (string | PermissionInfo)[]).map(
				(permission: string | PermissionInfo): PermissionInfo => {
					if (typeof permission === 'string') {
						// Single permission by name
						return { name: permission as PermissionName };
					}
					// Single permission by name and object
					return permission as PermissionInfo;
				}
			);
		}
		if (!permissionList.length) {
			return true; // If no required permissions are passed, then the user is allowed to see the item/page
		}
		if (!user) {
			console.warn('Checking permissions without user object', { permissionList, user });
			return false;
		}
		// Check every permission and return true for the first permission that returns true (lazy eval)
		for (const perm of permissionList) {
			if (await PermissionService.hasPermission(perm.name, perm.obj, user)) {
				return true;
			}
		}
		return false;
	}

	private static isOwnerOrContributor(
		contributors: { profile_id?: string | null; rights: Lookup_Enum_Right_Types_Enum }[],
		ownerProfileId: string,
		currentUserProfileId: string | null | undefined,
		acceptableRights: Lookup_Enum_Right_Types_Enum[]
	): boolean {
		if (!currentUserProfileId) {
			return false;
		}
		const contributorInfo = contributors.find(
			(contributor) => contributor.profile_id === currentUserProfileId
		);

		return (
			(contributorInfo?.rights && acceptableRights.includes(contributorInfo?.rights)) ||
			ownerProfileId === currentUserProfileId
		);
	}

	public static async hasPermission(
		permissionName: PermissionName,
		obj: any | null | undefined,
		user: Avo.User.User | Avo.User.CommonUser | null | undefined
	): Promise<boolean> {
		const userPermissions = PermissionService.getUserPermissions(user);
		if (!user || !userPermissions) {
			return false;
		}
		// Check if user has the requested permission
		const profileId =
			(user as Avo.User.CommonUser)?.profileId ?? getProfileId(user as Avo.User.User);
		if (!userPermissions.includes(permissionName)) {
			// If the user doesn't have the permission, then we don't even need to check if the user is the owner of the object.
			return false;
		}
		if (!obj) {
			// Eg: Check if user has permission to view own collections, without checking a specific collection
			// This is used to show the workspace overview, since there only the owner's collections are shown
			return true;
		}
		// Special checks on top of name being in the permission list
		switch (permissionName) {
			case PermissionName.VIEW_OWN_COLLECTIONS:
			case PermissionName.EDIT_OWN_COLLECTIONS:
			case PermissionName.PUBLISH_OWN_COLLECTIONS:
			case PermissionName.DELETE_OWN_COLLECTIONS: {
				try {
					const collection = isString(obj)
						? await CollectionService.fetchCollectionOrBundleByIdOrInviteToken(
								obj,
								'collection',
								undefined
						  )
						: obj;

					return PermissionService.isOwnerOrContributor(
						collection.contributors,
						collection.owner_profile_id,
						profileId,
						{
							[PermissionName.VIEW_OWN_COLLECTIONS]: [
								Lookup_Enum_Right_Types_Enum.Viewer,
								Lookup_Enum_Right_Types_Enum.Contributor,
							],
							[PermissionName.EDIT_OWN_COLLECTIONS]: [
								Lookup_Enum_Right_Types_Enum.Contributor,
							],
							[PermissionName.PUBLISH_OWN_COLLECTIONS]: [
								Lookup_Enum_Right_Types_Enum.Contributor,
							],
							[PermissionName.DELETE_OWN_COLLECTIONS]: [], // Only owner has rights to delete
						}[permissionName]
					);
				} catch (err) {
					return false;
				}
			}

			case PermissionName.VIEW_OWN_BUNDLES:
			case PermissionName.EDIT_OWN_BUNDLES:
			case PermissionName.PUBLISH_OWN_BUNDLES:
			case PermissionName.DELETE_OWN_BUNDLES: {
				try {
					const bundle = isString(obj)
						? await CollectionService.fetchCollectionOrBundleByIdOrInviteToken(
								obj,
								'bundle',
								undefined
						  )
						: obj;

					return PermissionService.isOwnerOrContributor(
						bundle.contributors,
						bundle.owner_profile_id,
						profileId,
						[] // Sharing bundles with colleagues is not yet supported
					);
				} catch (err) {
					return false;
				}
			}

			case PermissionName.EDIT_OWN_ASSIGNMENTS:
			case PermissionName.PUBLISH_OWN_ASSIGNMENTS: {
				try {
					const assignment = isString(obj)
						? await AssignmentService.fetchAssignmentById(obj)
						: obj;

					return PermissionService.isOwnerOrContributor(
						assignment.contributors,
						assignment.owner_profile_id,
						profileId,
						[Lookup_Enum_Right_Types_Enum.Contributor]
					);
				} catch (err) {
					return false;
				}
			}

			case PermissionName.EDIT_OWN_CONTENT_PAGES: {
				try {
					const contentPage: ContentPageInfo = isString(obj)
						? await ContentPageService.getContentPageByPath(obj)
						: obj;
					const contentPageOwnerId = get(contentPage, 'user_profile_id');
					return !!profileId && !!contentPageOwnerId && profileId === contentPageOwnerId;
				} catch (err) {
					return false;
				}
			}

			default:
				// The permission does not require any other checks besides is presence in the permission list
				return true;
		}
	}

	public static async checkPermissions(
		permissions: Record<string, Permissions>,
		user: Avo.User.User | Avo.User.CommonUser
	): Promise<Record<string, boolean>> {
		const hasPermissions = await Promise.all(
			Object.entries(permissions).map(async ([key, permission]) => {
				const hasPermission = await this.hasPermissions(permission, user);
				return [key, hasPermission];
			})
		);
		return Object.fromEntries(hasPermissions);
	}
}
