export enum ShareUserInfoRights {
	CONTRIBUTOR = 'BIJDRAGER',
	VIEWER = 'KIJKER',
	OWNER = 'EIGENAAR',
}

export interface ShareUserInfo {
	firstName: string;
	lastName: string;
	email: string;
	profileImage?: string;
	rights: ShareUserInfoRights;
}
