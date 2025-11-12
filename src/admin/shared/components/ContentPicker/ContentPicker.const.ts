import {Avo} from '@viaa/avo2-types';

import {tText} from '../../../../shared/helpers/translate-text.js';
import {type PickerTypeOption} from '../../types/content-picker.js';

import {retrieveAnchors} from './item-providers/anchors.js';
import {retrieveBundles, retrieveCollections} from './item-providers/collection.js';
import {retrieveContentPages, retrieveProjectContentPages} from './item-providers/content-page.js';
import {retrieveInternalLinks} from './item-providers/internal-link.js';
import {retrieveItems} from './item-providers/item.js';
import {retrieveProfiles} from './item-providers/profile.js';

const GET_CONTENT_TYPE_LABELS: () => { [type: string]: string } = () => ({
	CONTENT_PAGE: tText('admin/content/content___content'),
	INTERNAL_LINK: tText('admin/content/content___statisch'),
	COLLECTION: tText('admin/content/content___collecties'),
	ITEM: tText('admin/content/content___items'),
	BUNDLE: tText('admin/content/content___bundels'),
	EXTERNAL_LINK: tText('admin/shared/components/content-picker/content-picker___externe-url'),
	SEARCH_QUERY: tText('admin/shared/components/content-picker/content-picker___zoekfilters'),
	PROJECTS: tText('admin/shared/components/content-picker/content-picker___projecten'),
	PROFILE: tText('admin/shared/components/content-picker/content-picker___gebruiker'),
	ANCHOR_LINK: tText('admin/shared/components/content-picker/content-picker___anchors'),
	FILE: tText('admin/shared/components/content-picker/content-picker___bestand'),
});

export const GET_CONTENT_TYPES: () => PickerTypeOption[] = () => {
	const labels = GET_CONTENT_TYPE_LABELS();
	return [
		{
			value: Avo.Core.ContentPickerType.CONTENT_PAGE,
			label: labels['CONTENT_PAGE'],
			disabled: false,
			fetch: retrieveContentPages,
			picker: 'SELECT',
		},
		{
			value: Avo.Core.ContentPickerType.INTERNAL_LINK,
			label: labels['INTERNAL_LINK'],
			disabled: false,
			fetch: retrieveInternalLinks,
			picker: 'SELECT',
		},
		{
			value: Avo.Core.ContentPickerType.COLLECTION,
			label: labels['COLLECTION'],
			disabled: false,
			fetch: retrieveCollections,
			picker: 'SELECT',
		},
		{
			value: Avo.Core.ContentPickerType.ITEM,
			label: labels['ITEM'],
			disabled: false,
			fetch: retrieveItems,
			picker: 'SELECT',
		},
		{
			value: Avo.Core.ContentPickerType.BUNDLE,
			label: labels['BUNDLE'],
			disabled: false,
			fetch: retrieveBundles,
			picker: 'SELECT',
		},
		{
			value: Avo.Core.ContentPickerType.EXTERNAL_LINK,
			label: labels['EXTERNAL_LINK'],
			disabled: false,
			picker: 'TEXT_INPUT',
			placeholder: 'https://',
		},
		{
			value: Avo.Core.ContentPickerType.SEARCH_QUERY,
			label: labels['SEARCH_QUERY'],
			disabled: false,
			picker: 'TEXT_INPUT',
			placeholder: tText(
				'admin/shared/components/content-picker/content-picker___plak-hier-uw-zoekpagina-url'
			),
		},
		{
			value: Avo.Core.ContentPickerType.PROJECTS,
			label: labels['PROJECTS'],
			disabled: false,
			fetch: retrieveProjectContentPages,
			picker: 'SELECT',
		},
		{
			value: Avo.Core.ContentPickerType.PROFILE,
			label: labels['PROFILE'],
			disabled: false,
			fetch: (name, limit) => retrieveProfiles(name, limit),
			picker: 'SELECT',
		},
		{
			value: Avo.Core.ContentPickerType.ANCHOR_LINK,
			label: labels['ANCHOR_LINK'],
			disabled: false,
			fetch: retrieveAnchors,
			picker: 'SELECT',
		},
		{
			value: Avo.Core.ContentPickerType.FILE,
			label: labels['FILE'],
			disabled: false,
			picker: 'FILE_UPLOAD',
		},
	];
};

export const DEFAULT_ALLOWED_TYPES: Avo.Core.ContentPickerType[] = [
	Avo.Core.ContentPickerType.CONTENT_PAGE,
	Avo.Core.ContentPickerType.ITEM,
	Avo.Core.ContentPickerType.COLLECTION,
	Avo.Core.ContentPickerType.BUNDLE,
	Avo.Core.ContentPickerType.INTERNAL_LINK,
	Avo.Core.ContentPickerType.EXTERNAL_LINK,
	Avo.Core.ContentPickerType.ANCHOR_LINK,
	Avo.Core.ContentPickerType.FILE,
];

export const REACT_SELECT_DEFAULT_OPTIONS = {
	className: 'c-select',
	classNamePrefix: 'c-select',
};
