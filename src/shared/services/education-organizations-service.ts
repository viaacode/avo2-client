import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/client'
import { type Avo } from '@viaa/avo2-types'
import queryString from 'query-string'

import { CustomError } from '../helpers/custom-error';
import { getEnv } from '../helpers/env';

export class EducationOrganisationService {
  public static async fetchCities(): Promise<string[]> {
    let url: string | undefined = undefined
    try {
      url = `${getEnv('PROXY_URL')}/education-organisations/cities`

      return fetchWithLogoutJson<string[]>(url)
    } catch (err) {
      throw new CustomError('Failed to get cities', err, { url })
    }
  }

  public static async fetchEducationOrganisations(
    city: string | null,
    zipCode: string | null,
  ): Promise<Avo.EducationOrganization.Organization[]> {
    let url: string | undefined = undefined
    try {
      url = `${getEnv(
        'PROXY_URL',
      )}/education-organisations/organisations?${queryString.stringify({
        city,
        zipCode,
      })}`

      return fetchWithLogoutJson<Avo.EducationOrganization.Organization[]>(url)
    } catch (err) {
      throw new CustomError('Failed to get educational organisations', err, {
        url,
      })
    }
  }

  public static async fetchEducationOrganisationName(
    organisationId: string,
    unitId?: string,
  ): Promise<string | null> {
    let url: string | undefined = undefined
    try {
      url = `${getEnv(
        'PROXY_URL',
      )}/education-organisations/organisation-name?${queryString.stringify({
        organisationId,
        unitId,
      })}`

      const response = await fetchWithLogoutJson<{ name: string } | null>(url)

      return response?.name || null
    } catch (err) {
      throw new CustomError(
        'Failed to get educational organisation name',
        err,
        {
          url,
          organisationId,
          unitId,
        },
      )
    }
  }
}
