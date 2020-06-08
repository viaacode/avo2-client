import { gql } from 'apollo-boost';

export const INSERT_COLLECTION_RELATION = gql`
	mutation insertCollectionRelation(
		$objectId: uuid!
		$subjectId: uuid!
		$relationType: lookup_enum_relation_types_enum!
	) {
		insert_app_collection_relations(
			objects: [{ object: $objectId, subject: $subjectId, predicate: $relationType }]
		) {
			returning {
				id
			}
		}
	}
`;

export const INSERT_ITEM_RELATION = gql`
	mutation insertItemRelation(
		$objectId: uuid!
		$subjectId: uuid!
		$relationType: lookup_enum_relation_types_enum!
	) {
		insert_app_item_relations(
			objects: [{ object: $objectId, subject: $subjectId, predicate: $relationType }]
		) {
			returning {
				id
			}
		}
	}
`;
