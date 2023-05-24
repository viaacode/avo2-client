export enum ShareUserInfoRights {
	CONTRIBUTOR = 'BIJDRAGER',
	VIEWER = 'KIJKER',
	OWNER = 'EIGENAAR',
}

export type ShareRightsType = keyof typeof ShareUserInfoRights;

export interface ShareUserInfo {
	email: string;
	rights: ShareUserInfoRights | ShareRightsType;
	firstName?: string;
	lastName?: string;
	profileImage?: string;
	profileId?: string;
}

export interface DeleteShareUserModalContent {
	title: string;
	body: string;
	confirm: string;
}
