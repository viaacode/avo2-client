import { Avo } from '@viaa/avo2-types';

import {
  type GetUserGroupsWithFiltersQuery,
  type GetUserGroupsWithFiltersQueryVariables,
} from '../../shared/generated/graphql-db-operations';
import { GetUserGroupsWithFiltersDocument } from '../../shared/generated/graphql-db-react-query';
import { CustomError } from '../../shared/helpers/custom-error';
import { dataService } from '../../shared/services/data-service';

import { ITEMS_PER_PAGE } from './user-group.const';
import { type UserGroup } from './user-group.types';

export class UserGroupService {
  public static async fetchUserGroups(
    page: number,
    sortColumn: string,
    sortOrder: Avo.Search.OrderDirection,
    where: GetUserGroupsWithFiltersQueryVariables['where'],
  ): Promise<[UserGroup[], number]> {
    let variables: GetUserGroupsWithFiltersQueryVariables | null = null;
    try {
      variables = {
        where,
        offset: ITEMS_PER_PAGE * page,
        limit: ITEMS_PER_PAGE,
        orderBy: [{ [sortColumn]: sortOrder }],
      };
      const response = await dataService.query<
        GetUserGroupsWithFiltersQuery,
        GetUserGroupsWithFiltersQueryVariables
      >({
        variables,
        query: GetUserGroupsWithFiltersDocument,
      });
      const userGroups = response.users_groups;
      const userGroupCount =
        response.users_groups_aggregate.aggregate?.count ?? 0;

      if (!userGroups) {
        throw new CustomError(
          'Response from database does not contain any user groups',
          null,
          { response },
        );
      }

      const userGroupsCleaned: UserGroup[] = userGroups.map((userGroup) => ({
        id: String(userGroup.id),
        label: userGroup.label,
        description: userGroup.description,
        created_at: userGroup.created_at,
        updated_at: userGroup.updated_at,
      }));
      return [userGroupsCleaned, userGroupCount];
    } catch (err) {
      throw new CustomError('Failed to fetch user groups from graphql', err, {
        variables,
        query: 'GET_USER_GROUPS_WITH_FILTERS',
      });
    }
  }

  public static async fetchAllUserGroups(): Promise<UserGroup[]> {
    const response = await UserGroupService.fetchUserGroups(
      0,
      'label',
      Avo.Search.OrderDirection.ASC,
      {},
    );
    return response[0];
  }
}
