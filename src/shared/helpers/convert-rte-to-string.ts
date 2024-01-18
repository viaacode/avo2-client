import { sanitizeHtml, SanitizePreset } from '@meemoo/admin-core-ui';
import { type Avo } from '@viaa/avo2-types';
import { cloneDeep } from 'lodash-es';

import { getFragmentsFromCollection } from '../../collection/collection.helpers';

export function convertRteToString(
	collection: Partial<Avo.Collection.Collection> | null
): Partial<Avo.Collection.Collection> | null {
	if (!collection) {
		return collection;
	}
	const clonedCollection = cloneDeep(collection);
	getFragmentsFromCollection(clonedCollection).forEach((fragment) => {
		if (fragment.custom_description && (fragment.custom_description as any).toHTML) {
			fragment.custom_description = sanitizeHtml(
				(fragment.custom_description as any).toHTML(),
				SanitizePreset.link
			);
		}
	});
	return clonedCollection;
}
