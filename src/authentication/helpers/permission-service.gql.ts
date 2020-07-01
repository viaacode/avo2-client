import { gql } from 'apollo-boost';

export const GET_LINKED_ITEMS = gql`
	query getLinkedItems($id: String!, $userId: String!) {
		app_assignment_responses(
			where: {
				_and: {
					assignment: { content_id: { _eq: $id }, content_label: { _eq: ITEM } }
					owner_profile_ids: { _has_key: $userId }
				}
			}
		) {
			id
		}
	}
`;

export const GET_LINKED_COLLECTIONS = gql`
	query getLinkedCollections($idString: String!, $idUuid: uuid!, $userId: String!) {
		app_assignment_responses(
			where: {
				_or: [
					{ collection_uuid: { _eq: $idUuid } }
					{
						assignment: {
							content_id: { _eq: $idString }
							content_label: { _eq: COLLECTIE }
						}
					}
				]
				owner_profile_ids: { _has_key: $userId }
			}
		) {
			id
		}
	}
`;

export const GET_LINKED_SEARCH_QUERIES = gql`
	query getLinkedItems($id: String!, $userId: String!) {
		app_assignment_responses(
			where: {
				_and: {
					assignment: { content_id: { _eq: $id }, content_label: { _eq: ZOEKOPDRACHT } }
					owner_profile_ids: { _has_key: $userId }
				}
			}
		) {
			id
		}
	}
`;
