import { TFunction } from 'i18next';

import { IconName, SelectOption, TableColumn } from '@viaa/avo2-components';
import { CollectionFragment } from '@viaa/avo2-types/types/collection';

import i18n from '../shared/translations/i18n';

export const STILL_DIMENSIONS = {
	width: 177,
	height: 100,
};

export const MAX_TITLE_LENGTH = 110;
export const MAX_SEARCH_DESCRIPTION_LENGTH = 300;
export const MAX_LONG_DESCRIPTION_LENGTH = 1200;

export const NEW_FRAGMENT = {
	text: {
		id: null,
		collection_uuid: null,
		position: 1,
		external_id: null,
		custom_description: null,
		custom_title: null,
		end_oc: null,
		start_oc: null,
		use_custom_fields: true,
		type: 'TEXT',
	},
};

export const GET_MARCOM_CHANNEL_TYPE_OPTIONS: () => SelectOption<string>[] = () => [
	{ label: i18n.t('collection/collection___nieuwsbericht'), value: 'NIEUWSBERICHT' },
	{ label: i18n.t('collection/collection___nieuwsbrief'), value: 'NIEUWSBRIEF' },
	{ label: i18n.t('collection/collection___social'), value: 'SOCIAL' },
	{ label: i18n.t('collection/collection___webpagina'), value: 'WEBPAGINA' },
	{ label: i18n.t('collection/collection___overige'), value: 'OVERIGE' },
];

export const GET_MARCOM_CHANNEL_NAME_OPTIONS: () => SelectOption<string>[] = () => [
	{ label: i18n.t('collection/collection___facebook'), value: 'FACEBOOK' },
	{ label: i18n.t('collection/collection___twitter'), value: 'TWITTER' },
	{ label: i18n.t('collection/collection___nieuwsbericht-av-o'), value: 'NIEUWSBERICHT_AVO' },
	{ label: i18n.t('collection/collection___nieuwsbrief-avo'), value: 'NIEUWSBRIEF_AVO' },
	{ label: i18n.t('collection/collection___klas-cement'), value: 'KLASCEMENT' },
	{ label: i18n.t('collection/collection___zill'), value: 'ZILL' },
	{ label: i18n.t('collection/collection___overige'), value: 'OVERIGE' },
];

export const GET_MARCOM_ENTRY_TABLE_COLUMNS: (isCollection: boolean) => TableColumn[] = (
	isCollection: boolean
) => [
	{
		label: i18n.t('collection/collection___datum'),
		id: 'publish_date',
		dateTime: 'dateTime',
	},
	{
		label: i18n.t('collection/collection___kanaal-type'),
		id: 'channel_type',
		dataType: 'string',
	},
	{
		label: i18n.t('collection/collection___kanaal-naam'),
		id: 'channel_name',
		dataType: 'string',
	},
	{
		label: i18n.t('collection/collection___link'),
		id: 'external_link',
	},
	...(isCollection
		? [
				{
					label: i18n.t('collection/collection___bundle'),
					id: 'parent_collection',
				},
		  ]
		: []),
	{
		label: '',
		id: 'actions',
	},
];

// TODO: move to avo2-types
type CollectionFragmentType = 'ITEM' | 'TEXT' | 'COLLECTION';
type CollectionFragmentTypeDict<T> = { [key in CollectionFragmentType]: T }; // eslint-disable-line

export const COLLECTION_FRAGMENT_LABELS: (t: TFunction) => CollectionFragmentTypeDict<string> = (
	t
) => ({
	COLLECTION: t('Collectie'),
	ITEM: t('Fragment'),
	TEXT: t('Instructie- of tekstblok'),
});

export const EDIT_COLLECTION_FRAGMENT_ICONS: () => CollectionFragmentTypeDict<IconName> = () => ({
	ITEM: 'video', // TODO: add custom icon
	TEXT: 'type',
	COLLECTION: 'x',
});

export const VIEW_COLLECTION_FRAGMENT_ICONS: () => CollectionFragmentTypeDict<
	(fragment?: CollectionFragment) => IconName
> = () => ({
	ITEM: (fragment) => {
		switch (fragment?.item_meta?.type?.label) {
			case 'audio':
				return 'headphone';
			case 'video':
				return 'image'; // TODO: add custom icon
		}

		return 'x';
	},
	TEXT: () => 'align-left',
	COLLECTION: () => 'x',
});
