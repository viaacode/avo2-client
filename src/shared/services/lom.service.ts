import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/client'
import { type Avo } from '@viaa/avo2-types'

import { CustomError } from '../helpers/custom-error.js'
import { getEnv } from '../helpers/env.js'
import { EducationLevelId } from '../helpers/lom.js'

export class LomService {
  public static async fetchSubjects(): Promise<Avo.Lom.LomField[]> {
    try {
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/admin/lookup/subjects`,
      )
    } catch (err) {
      throw new CustomError('Failed to get subjects from the database', err, {
        path: '/admin/lookup/subjects',
      })
    }
  }

  public static async fetchThemes(): Promise<Avo.Lom.LomField[]> {
    try {
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/admin/lookup/themes`,
      )
    } catch (err) {
      throw new CustomError('Failed to get themas from the database', err, {
        path: '/admin/lookup/themes',
      })
    }
  }

  public static async fetchEducationLevelsAndDegrees(): Promise<
    Avo.Lom.LomField[]
  > {
    try {
      const educationLevels = await fetchWithLogoutJson<Avo.Lom.LomField[]>(
        `${getEnv('PROXY_URL')}/admin/lookup/education-levels-and-degrees`,
      )
      return educationLevels.filter(
        (level) => level.id !== EducationLevelId.andere,
      )
    } catch (err) {
      throw new CustomError(
        'Failed to get education levels and degrees from the database',
        err,
        {
          path: '/admin/lookup/education-levels-and-degrees',
        },
      )
    }
  }
}
