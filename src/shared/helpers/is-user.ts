import { AvoLomLom, AvoUserCommonUser } from '@viaa/avo2-types';
import { EducationLevelId } from './lom';

type UserLomsAndUserGroup = Partial<
  Pick<AvoUserCommonUser, 'loms' | 'userGroup'>
>;

/**
 * @param user The user to evaluate
 * @returns A boolean indicating if they have both Elementary & Secondary LOM's
 */
export function isUserSecondaryElementary(
  user: UserLomsAndUserGroup | null | undefined,
): boolean {
  if (!user) {
    return false;
  }
  return isUserLevel(user, [
    EducationLevelId.lagerOnderwijs,
    EducationLevelId.secundairOnderwijs,
  ]);
}

/**
 * Checks if the lom values of a user are matching the provided educational level
 * @param user
 * @param levels
 */
export function isUserLevel(
  user: Partial<Pick<UserLomsAndUserGroup, 'loms'>>,
  levels: EducationLevelId[],
) {
  return levels.every((level) => {
    const userLoms = (user.loms || []) as AvoLomLom[];
    return userLoms.find(({ lom, lom_id }) => {
      return (lom_id || lom?.id) === level;
    });
  });
}
