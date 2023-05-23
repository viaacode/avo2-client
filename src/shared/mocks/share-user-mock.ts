import {
	ShareUserInfo,
	ShareUserInfoRights,
} from '../components/ShareWithColleagues/ShareWithColleagues.types';

export const mockShareUsers: ShareUserInfo[] = [
	{
		firstName: 'Edgar',
		lastName: 'Poe',
		email: 'edgarallanpoe@email.com',
		profileImage: 'https://cdn.britannica.com/52/76652-050-F4A6B093/Edgar-Allan-Poe.jpg',
		rights: ShareUserInfoRights.VIEWER,
	},
	{
		firstName: 'John',
		lastName: 'Doe',
		email: 'johnDoe@email.com',
		rights: ShareUserInfoRights.VIEWER,
	},
	{
		firstName: 'Jane',
		lastName: 'Doe',
		email: 'janeDoe@email.com',
		rights: ShareUserInfoRights.VIEWER,
	},
	{
		firstName: 'Joe',
		lastName: 'Average',
		email: 'averagejoe@email.com',
		rights: ShareUserInfoRights.OWNER,
	},
	{
		firstName: 'Meemoo',
		lastName: 'Admin',
		email: 'hetarchief2.0+bztmeemooadmin@meemoo.be',
		rights: ShareUserInfoRights.CONTRIBUTOR,
	},
];
