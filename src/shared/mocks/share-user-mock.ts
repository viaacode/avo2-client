import {
	ContributorInfo,
	ContributorInfoRights,
} from '../components/ShareWithColleagues/ShareWithColleagues.types';

export const mockShareUsers: ContributorInfo[] = [
	{
		firstName: 'Edgar',
		lastName: 'Poe',
		email: 'edgarallanpoe@email.com',
		profileImage: 'https://cdn.britannica.com/52/76652-050-F4A6B093/Edgar-Allan-Poe.jpg',
		rights: ContributorInfoRights.VIEWER,
	},
	{
		firstName: 'John',
		lastName: 'Doe',
		email: 'johnDoe@email.com',
		rights: ContributorInfoRights.VIEWER,
	},
	{
		firstName: 'Jane',
		lastName: 'Doe',
		email: 'janeDoe@email.com',
		rights: ContributorInfoRights.VIEWER,
	},
	{
		firstName: 'Joe',
		lastName: 'Average',
		email: 'averagejoe@email.com',
		rights: ContributorInfoRights.CONTRIBUTOR,
	},
	{
		firstName: 'Meemoo',
		lastName: 'Admin',
		email: 'hetarchief2.0+bztmeemooadmin@meemoo.be',
		rights: ContributorInfoRights.OWNER,
		profileId: '31051baa-94ab-4fc2-a859-750a52774d3a',
	},
];
