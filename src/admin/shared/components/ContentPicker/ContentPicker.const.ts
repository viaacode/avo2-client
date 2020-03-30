import i18n from '../../../../shared/translations/i18n';

import { ContentPickerType, PickerTypeOption } from '../../types';

import { retrieveBundles, retrieveCollections } from '../../helpers/content-picker/collection';
import { retrieveContentPages } from '../../helpers/content-picker/content-page';
import { retrieveInternalLinks } from '../../helpers/content-picker/internal-link';
import { retrieveItems } from '../../helpers/content-picker/item';

export const GET_CONTENT_TYPES: () => PickerTypeOption[] = () => [
	{
		value: 'CONTENT_PAGE',
		label: i18n.t('admin/content/content___content'),
		disabled: false,
		fetch: retrieveContentPages,
		picker: 'SELECT',
	},
	{
		value: 'INTERNAL_LINK',
		label: i18n.t('admin/content/content___statisch'),
		disabled: false,
		fetch: retrieveInternalLinks,
		picker: 'SELECT',
	},
	{
		value: 'COLLECTION',
		label: i18n.t('admin/content/content___collecties'),
		disabled: false,
		fetch: retrieveCollections,
		picker: 'SELECT',
	},
	{
		value: 'ITEM',
		label: i18n.t('admin/content/content___items'),
		disabled: false,
		fetch: retrieveItems,
		picker: 'SELECT',
	},
	{
		value: 'BUNDLE',
		label: i18n.t('admin/content/content___bundels'),
		disabled: false,
		fetch: retrieveBundles,
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
		label: i18n.t('admin/shared/components/content-picker/content-picker___zoekfilters'),
		disabled: false,
		picker: 'TEXT_INPUT',
		placeholder: i18n.t(
			'admin/shared/components/content-picker/content-picker___plak-hier-uw-zoekpagina-url'
		),
	},
];

export const DEFAULT_ALLOWED_TYPES: ContentPickerType[] = [
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
