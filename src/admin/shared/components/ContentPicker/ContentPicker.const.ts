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
		placeholder: 'https://',
	},
	{
		value: 'SEARCH_QUERY',
		label: i18n.t('Zoekfilters'),
		disabled: false,
		picker: 'TEXT_INPUT',
		placeholder: i18n.t('Plak hier uw zoekpagina-URL'),
	},
];

export const DEFAULT_ALLOWED_TYPES = [
	'CONTENT_PAGE',
	'ITEM',
	'COLLECTION',
	'BUNDLE',
	'INTERNAL_LINK',
	'EXTERNAL_LINK',
];

export const REACT_SELECT_DEFAULT_OPTIONS = {
	className: 'c-select',
	classNamePrefix: 'c-select',
};
