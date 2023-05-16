import {
	ShareUserInfo,
	ShareUserInfoRights,
} from '../components/ShareDropdown/ShareDropdown.types';

export const mockShareUsers: ShareUserInfo[] = [
	{
		firstName: 'Edgar',
		lastName: 'Poe',
		email: 'edgarallanpoe@email.com',
		profileImage: 'https://cdn.britannica.com/52/76652-050-F4A6B093/Edgar-Allan-Poe.jpg',
		rights: ShareUserInfoRights.CONTRIBUTOR,
	},
	{
		firstName: 'John',
		lastName: 'Doe',
		email: 'johnDoe@email.com',
		rights: ShareUserInfoRights.VIEWER,
	},
	{
		firstName: 'Meemoo',
		lastName: 'Admin',
		email: 'hetarchief2.0+bztmeemooadmin@meemoo.be',
		rights: ShareUserInfoRights.OWNER,
	},
];
