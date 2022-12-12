import type { Avo } from '@viaa/avo2-types';

export function eduOrgToClientOrg(orgs: string[]): Avo.EducationOrganization.Organization[] {
	return (orgs || []).map((org) => {
		const parts = org.split(':');
		return {
			organizationId: parts[0].trim(),
			unitId: (parts[1] || '').trim() || null,
			label: org, // TODO show org name and address
		};
	});
}
