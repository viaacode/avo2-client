// TODO move these types to Types repo
export interface Assignment {
	id: number;
	title: string;
	description: string;
	type: AssignmentType;
	content_id?: string;
	content_type?: AssignmentContentType;
	content_layout?: AssignmentLayout;
	answerUrl?: string;
	available_at?: Date;
	deadline?: Date;
	owner_id: string;
	is_archived: boolean;
	is_deleted: boolean;
	class_room?: string;
	allow_group_work: boolean;
}

export enum AssignmentType {
	View = 0,
	Search = 1,
	Build = 2,
}

export enum AssignmentLayout {
	OnlyPlayer = 0,
	PlayerAndText = 1,
}

export type AssignmentContentType = 'audio' | 'video' | 'collectie' | 'zoek';
