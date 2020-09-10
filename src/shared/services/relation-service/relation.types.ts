// TODO replace with typings version after v2.23.0
export type RelationType = 'IS_COPY_OF' | 'IS_REPLACED_BY' | 'REPLACES' | 'HAS_COPY';

export interface RelationEntry<T> {
	id: number;
	object: string;
	subject: string;
	created_at: string;
	updated_at: string;
	predicate: RelationType;
	object_meta?: T;
}
