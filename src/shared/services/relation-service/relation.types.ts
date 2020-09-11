export enum RelationType {
	IS_COPY_OF = 'IS_COPY_OF',
	IS_REPLACED_BY = 'IS_REPLACED_BY',
	REPLACES = 'REPLACES',
	HAS_COPY = 'HAS_COPY',
}

export interface RelationEntry {
	id: number;
	object: string;
	subject: string;
	predicate: RelationType;
}
