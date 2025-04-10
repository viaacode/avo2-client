import type { Avo } from '@viaa/avo2-types';

export type EmbedCodeContentType = 'ITEM' | 'COLLECTION' | 'ASSIGNMENT';

export interface EmbedCode {
	id: string;
	title: string;
	externalWebsite: EmbedCodeExternalWebsite;
	contentType: EmbedCodeContentType;
	contentId: string;
	content: Avo.Item.Item | Avo.Collection.Collection | Avo.Assignment.Assignment;
	descriptionType: EmbedCodeDescriptionType;
	description: string | null;
	owner: Avo.User.CommonUser;
	ownerProfileId: string;
	start: number | null;
	end: number | null;
	createdAt: string; // ISO datetime string
	updatedAt: string; // ISO datetime string
}

export enum EmbedCodeExternalWebsite {
	SMARTSCHOOL = 'SMARTSCHOOL',
	BOOKWIDGETS = 'BOOKWIDGETS',
}

export enum EmbedCodeDescriptionType {
	ORIGINAL = 'ORIGINAL',
	CUSTOM = 'CUSTOM',
	NONE = 'NONE',
}
