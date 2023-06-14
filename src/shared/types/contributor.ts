import { ShareRightsType } from '../components/ShareWithColleagues/ShareWithColleagues.types';

export interface Contributor {
	id: string;
	profile_id: string;
	assignment_id?: string;
	invite_email?: string;
	invite_token?: string;
	collection_id?: string;
	rights: ShareRightsType;
	profile: {
		id: string;
		avatar: string;
		user: {
			last_name: string;
			first_name: string;
			mail: string;
			full_name: string;
		};
	};
}
