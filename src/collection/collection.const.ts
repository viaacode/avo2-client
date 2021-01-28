import { SelectOption, TableColumn } from '@viaa/avo2-components';

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
	{ label: i18n.t('Leeg'), value: '' },
	{ label: i18n.t('Nieuwsbericht'), value: 'NIEUWSBERICHT' },
	{ label: i18n.t('Nieuwsbrief'), value: 'NIEUWSBRIEF' },
	{ label: i18n.t('Social'), value: 'SOCIAL' },
	{ label: i18n.t('Campagne'), value: 'CAMPAGNE' },
	{ label: i18n.t('Overige'), value: 'OVERIGE' },
];

export const GET_MARCOM_CHANNEL_NAME_OPTIONS: () => SelectOption<string>[] = () => [
	{ label: i18n.t('Leeg'), value: '' },
	{ label: i18n.t('Facebook'), value: 'FACEBOOK' },
	{ label: i18n.t('Twitter'), value: 'TWITTER' },
	{ label: i18n.t('Nieuwsbrief meemoo'), value: 'NIEUWSBRIEF_MEEMOO' },
	{ label: i18n.t('Nieuwsbrief Avo'), value: 'NIEUWSBRIEF_AVO' },
	{ label: i18n.t('KlasCement'), value: 'KLAS_CEMENT' },
	{ label: i18n.t('Zill'), value: 'ZILL' },
	{ label: i18n.t('Overige'), value: 'OVERIGE' },
];

export const GET_MARCOM_ENTRY_TABLE_COLUMNS: () => TableColumn[] = () => [
	{ label: i18n.t('Datum'), id: 'publish_date' },
	{
		label: i18n.t('Kanaal type'),
		id: 'channel_type',
	},
	{
		label: i18n.t('Kanaal naam'),
		id: 'channel_name',
	},
	{
		label: i18n.t('Link'),
		id: 'external_link',
	},
];
