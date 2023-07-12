export enum ContributorInfoRights {
	CONTRIBUTOR = 'CONTRIBUTOR',
	VIEWER = 'VIEWER',
	OWNER = 'OWNER',
}

export enum ContributorInfoRightsInDutch {
	CONTRIBUTOR = 'Bijdrager',
	VIEWER = 'Bekijker',
	OWNER = 'Eigenaar',
}

export type ShareRightsType = keyof typeof ContributorInfoRights;

export interface ContributorInfo {
	email?: string;
	inviteEmail?: string;
	rights: ContributorInfoRights | ShareRightsType;
	firstName?: string;
	lastName?: string;
	profileImage?: string;
	profileId?: string;
	contributorId?: string;
}
