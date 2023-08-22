export enum ContributorInfoRights {
	CONTRIBUTOR = 'CONTRIBUTOR',
	VIEWER = 'VIEWER',
	OWNER = 'OWNER',
}

export interface ContributorInfo {
	email?: string;
	inviteEmail?: string;
	rights: ContributorInfoRights;
	firstName?: string;
	lastName?: string;
	profileImage?: string;
	profileId?: string;
	contributorId?: string;
}
