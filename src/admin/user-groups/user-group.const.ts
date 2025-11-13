import { SpecialPermissionGroups } from '../../authentication/authentication.types';
import { ROUTE_PARTS } from '../../shared/constants/index';
import { tText } from '../../shared/helpers/translate-text';

import { type UserGroup } from './user-group.types';

export const USER_GROUP_PATH = {
  USER_GROUP_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.permissions}`,
}

export const ITEMS_PER_PAGE = 20

export const GET_SPECIAL_USER_GROUPS: () => Partial<UserGroup>[] = () => [
  {
    label: tText(
      'admin/menu/components/menu-edit-form/menu-edit-form___niet-ingelogde-gebruikers',
    ),
    id: SpecialPermissionGroups.loggedOutUsers,
  },
  {
    label: tText(
      'admin/menu/components/menu-edit-form/menu-edit-form___ingelogde-gebruikers',
    ),
    id: SpecialPermissionGroups.loggedInUsers,
  },
]

export enum SpecialUserGroupId {
  Admin = '1',
  Teacher = '2',
  TeacherElementary = '25',
  TeacherSecondary = '3',
  PupilElementary = '29',
  PupilSecondary = '4',
  Editor = '7',
  EditorInChief = '8',
  ContentPartner = '9',
  EducativeAuthor = '10',
  EducativePublisher = '11',
  EducativePartner = '12',
  StudentTeacher = '23',
  MeemooEmployee = '6',
  StudentTeacherSecondary = '5',
  StudentTeacherElementary = '26',
}
