import { ClientEducationOrganization } from '@viaa/avo2-types/types/education-organizations';

export function eduOrgToClientOrg(orgs: string[]): ClientEducationOrganization[] {
	return (orgs || []).map((org) => {
		const parts = org.split(':');
		return {
			organizationId: parts[0].trim(),
			unitId: (parts[1] || '').trim() || null,
			label: org, // TODO show org name and address
		};
	});
}
