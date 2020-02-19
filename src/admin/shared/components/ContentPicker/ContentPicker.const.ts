import i18n from '../../../../shared/translations/i18n';

import { PickerTypeOption } from '../../types';

import { fetchBundles, fetchCollections } from '../../helpers/content-picker/collection';
import { fetchContentPages } from '../../helpers/content-picker/content-page';
import { fetchInternalLinks } from '../../helpers/content-picker/internal-link';
import { fetchItems } from '../../helpers/content-picker/item';

export const CONTENT_TYPES: PickerTypeOption[] = [
	{
		value: 'CONTENT_PAGE',
		label: i18n.t('admin/content/content___content'),
		disabled: false,
		fetch: fetchContentPages,
		picker: 'SELECT',
	},
	{
		value: 'INTERNAL_LINK',
		label: i18n.t('admin/content/content___statisch'),
		disabled: false,
		fetch: fetchInternalLinks,
		picker: 'SELECT',
	},
	{
		value: 'COLLECTION',
		label: i18n.t('admin/content/content___collecties'),
		disabled: false,
		fetch: fetchCollections,
		picker: 'SELECT',
	},
	{
		value: 'ITEM',
		label: i18n.t('admin/content/content___items'),
		disabled: false,
		fetch: fetchItems,
		picker: 'SELECT',
	},
	{
		value: 'BUNDLE',
		label: i18n.t('admin/content/content___bundels'),
		disabled: false,
		fetch: fetchBundles,
		picker: 'SELECT',
	},
	{
		value: 'EXTERNAL_LINK',
		label: i18n.t('admin/shared/components/content-picker/content-picker___externe-url'),
		disabled: false,
		picker: 'TEXT_INPUT',
	},
];
