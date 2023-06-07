export enum ContributorInfoRights {
	CONTRIBUTOR = 'BIJDRAGER',
	VIEWER = 'KIJKER',
	OWNER = 'EIGENAAR',
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

export interface DeleteContributorModalContent {
	title: string;
	body: string;
	confirm: string;
}
