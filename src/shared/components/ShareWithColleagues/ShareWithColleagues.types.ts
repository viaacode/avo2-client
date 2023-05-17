export enum ShareUserInfoRights {
	CONTRIBUTOR = 'BIJDRAGER',
	VIEWER = 'KIJKER',
	OWNER = 'EIGENAAR',
}

export interface ShareUserInfo {
	email: string;
	rights: ShareUserInfoRights;
	firstName?: string;
	lastName?: string;
	profileImage?: string;
}
