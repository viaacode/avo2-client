import { type Avo } from '@viaa/avo2-types'

export function eduOrgToClientOrg(
  orgs: string[],
): Avo.EducationOrganization.Organization[] {
  return (orgs || []).map((org) => {
    const parts = org.split(':')
    return {
      organisationId: parts[0].trim(),
      organisationLabel: org, // TODO show org name and address
      unitId: (parts[1] || '').trim() || null,
      unitStreet: null,
    }
  })
}
