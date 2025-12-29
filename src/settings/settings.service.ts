import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/client';
import { AvoUserUpdateProfileValues } from '@viaa/avo2-types';
import { CustomError } from '../shared/helpers/custom-error';
import { getEnv } from '../shared/helpers/env';

export class SettingsService {
  public static async updateProfileInfo(
    profile: Partial<AvoUserUpdateProfileValues>,
  ): Promise<void> {
    try {
      if (!profile) {
        return;
      }

      await fetchWithLogoutJson(`${getEnv('PROXY_URL')}/profile`, {
        method: 'POST',
        body: JSON.stringify(profile),
      });
    } catch (err) {
      throw new CustomError('Failed to update profile information', err, {
        profile,
      });
    }
  }
}
