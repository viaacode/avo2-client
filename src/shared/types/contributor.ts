import { ShareRightsType } from '../components/ShareWithColleagues/ShareWithColleagues.types';

export interface Contributor {
	id: string;
	profile_id: string;
	assignment_id?: string;
	collection_id?: string;
	rights: ShareRightsType;
	profile: {
		id: string;
		avatar: string;
		usersByuserId: {
			last_name: string;
			first_name: string;
			mail: string;
			full_name: string;
		};
	};
}
