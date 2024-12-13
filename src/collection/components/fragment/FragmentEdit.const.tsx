import type { Avo } from '@viaa/avo2-types';
import { type ReactNode } from 'react';

import { tHtml } from '../../../shared/helpers/translate-html';
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
