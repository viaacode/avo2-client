import type { Avo } from '@viaa/avo2-types';
import { type ReactNode } from 'react';

import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { CollectionFragmentType } from '../../collection.types';

export const COLLECTION_FRAGMENT_TYPE_TO_EVENT_OBJECT_TYPE: Partial<
	Record<Avo.Core.BlockItemType, Avo.EventLogging.ObjectType>
> = {
	[CollectionFragmentType.ITEM]: 'item',
	[CollectionFragmentType.COLLECTION]: 'collection',
	[CollectionFragmentType.ASSIGNMENT]: 'assignment',
};

export function GET_FRAGMENT_DELETE_SUCCESS_MESSAGES(): Record<Avo.Core.BlockItemType, ReactNode> {
	return {
		TEXT: tHtml('Tekst is succesvol verwijderd uit de collectie.'),
		ITEM: tHtml('Fragment is succesvol verwijderd uit de collectie.'),
		ZOEK: tHtml('Zoek blok is succesvol verwijderd uit de collectie.'),
		BOUW: tHtml('Zoek blok is succesvol verwijderd uit de collectie.'),
		COLLECTION: tHtml('Collectie is succesvol verwijderd uit de bundel.'),
		ASSIGNMENT: tHtml('Opdracht is succesvol verwijderd uit de bundel.'),
	};
}

export function GET_FRAGMENT_DELETE_LABELS(): Record<Avo.Core.BlockItemType, string> {
	return {
		ITEM: tText('Ben je zeker dat je het fragment uit deze collectie wil verwijderen?'),
		TEXT: tText('Ben je zeker dat je deze tekst blok wil verwijderen uit deze collectie?'),
		ZOEK: '',
		BOUW: '',
		COLLECTION: tText('Ben je zeker dat je de collectie uit deze bundel wil verwijderen?'),
		ASSIGNMENT: tText('Ben je zeker dat je de opdracht uit deze bundel wil verwijderen?'),
	};
}

export function GET_FRAGMENT_EDIT_SWITCH_LABELS(): Record<Avo.Core.BlockItemType, string> {
	return {
		ITEM: tText('Eigen beschrijving bij fragment'),
		TEXT: tText('Eigen beschrijving bij fragment'),
		ZOEK: '',
		BOUW: '',
		COLLECTION: tText('Eigen titel bij deze collectie'),
		ASSIGNMENT: tText('Eigen titel bij deze opdracht'),
	};
}

/**
 * Get the labels for a fragment publish status by type and publish status
 * @constructor
 */
export function GET_FRAGMENT_PUBLISH_STATUS_LABELS(): Record<
	Avo.Core.BlockItemType,
	Record<string | 'true' | 'false', string>
> {
	return {
		COLLECTION: {
			true: tText('Deze collectie is publiek'),
			false: tText('Deze collectie is privé'),
		},
		ASSIGNMENT: {
			true: tText('Deze opdracht is publiek'),
			false: tText('Deze opdracht is privé'),
		},
		ZOEK: {
			true: '',
			false: '',
		},
		BOUW: {
			true: '',
			false: '',
		},
		TEXT: {
			true: '',
			false: '',
		},
		ITEM: {
			true: '',
			false: '',
		},
	};
}
