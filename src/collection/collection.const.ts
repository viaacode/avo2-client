import { type SelectOption, type TableColumn } from '@viaa/avo2-components';

import { ACTIONS_TABLE_COLUMN_ID } from '../shared/helpers/table-column-list-to-csv-column-list.js';
import { tText } from '../shared/helpers/translate-text.js';
import { TableColumnDataType } from '../shared/types/table-column-data-type.js';

export const MAX_SEARCH_DESCRIPTION_LENGTH = 300;
export const MAX_LONG_DESCRIPTION_LENGTH = 1200;

export enum CollectionBlockType {
	TEXT = 'TEXT',
	ITEM = 'ITEM',
	COLLECTION = 'COLLECTION',
	ASSIGNMENT = 'ASSIGNMENT',
}

export const NEW_FRAGMENT = {
	text: {
		id: null,
		collection_uuid: null,
		position: 0,
		external_id: null,
		custom_description: null,
		custom_title: null,
		end_oc: null,
		start_oc: null,
		use_custom_fields: true,
		type: CollectionBlockType.TEXT,
	},
};

export const GET_MARCOM_CHANNEL_TYPE_OPTIONS: () => SelectOption<string>[] = () => [
	{ label: tText('collection/collection___nieuwsbericht'), value: 'NIEUWSBERICHT' },
	{ label: tText('collection/collection___nieuwsbrief'), value: 'NIEUWSBRIEF' },
	{ label: tText('collection/collection___social'), value: 'SOCIAL' },
	{ label: tText('collection/collection___webpagina'), value: 'WEBPAGINA' },
	{ label: tText('collection/collection___overige'), value: 'OVERIGE' },
];

export const GET_MARCOM_CHANNEL_NAME_OPTIONS: () => SelectOption<string>[] = () => [
	{ label: tText('collection/collection___facebook'), value: 'FACEBOOK' },
	{ label: tText('collection/collection___twitter'), value: 'TWITTER' },
	{ label: tText('collection/collection___nieuwsbericht-av-o'), value: 'NIEUWSBERICHT_AVO' },
	{ label: tText('collection/collection___nieuwsbrief-avo'), value: 'NIEUWSBRIEF_AVO' },
	{ label: tText('collection/collection___klas-cement'), value: 'KLASCEMENT' },
	{ label: tText('collection/collection___zill'), value: 'ZILL' },
	{ label: tText('collection/collection___overige'), value: 'OVERIGE' },
];

export const GET_MARCOM_ENTRY_TABLE_COLUMNS: (isCollection: boolean) => TableColumn[] = (
	isCollection: boolean
) => [
	{
		label: tText('collection/collection___datum'),
		id: 'publish_date',
		dateTime: 'dateTime',
	},
	{
		label: tText('collection/collection___kanaal-type'),
		id: 'channel_type',
		dataType: TableColumnDataType.string,
	},
	{
		label: tText('collection/collection___kanaal-naam'),
		id: 'channel_name',
		dataType: TableColumnDataType.string,
	},
	{
		label: tText('collection/collection___link'),
		id: 'external_link',
	},
	...(isCollection
		? [
				{
					label: tText('collection/collection___bundle'),
					id: 'parent_collection',
				},
		  ]
		: []),
	{
		label: '',
		id: ACTIONS_TABLE_COLUMN_ID,
	},
];
