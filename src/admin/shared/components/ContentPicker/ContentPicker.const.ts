import i18n from '../../../../shared/translations/i18n';
import { retrieveAnchorBlocks } from '../../helpers/content-picker/anchor-link';
import { retrieveBundles, retrieveCollections } from '../../helpers/content-picker/collection';
import {
	retrieveContentPages,
	retrieveProjectContentPages,
} from '../../helpers/content-picker/content-page';
import { retrieveInternalLinks } from '../../helpers/content-picker/internal-link';
import { retrieveItems } from '../../helpers/content-picker/item';
import { retrieveProfiles } from '../../helpers/content-picker/profile';
import { ContentPickerType, PickerTypeOption } from '../../types';

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
	{
		value: 'PROJECTS',
		label: i18n.t('admin/shared/components/content-picker/content-picker___projecten'),
		disabled: false,
		fetch: retrieveProjectContentPages,
		picker: 'SELECT',
	},
	{
		value: 'PROFILE',
		label: i18n.t('admin/shared/components/content-picker/content-picker___gebruiker'),
		disabled: false,
		fetch: retrieveProfiles,
		picker: 'SELECT',
	},
	{
		value: 'ANCHOR_LINK',
		label: i18n.t('admin/shared/components/content-picker/content-picker___anchors'),
		disabled: false,
		fetch: retrieveAnchorBlocks,
		picker: 'SELECT',
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
