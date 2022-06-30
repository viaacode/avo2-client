import { ButtonType, SelectOption } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import type { DocumentNode } from 'graphql';

import { CheckboxDropdownModalProps, CheckboxOption } from '../../shared/components';
import { BooleanCheckboxDropdownProps } from '../../shared/components/BooleanCheckboxDropdown/BooleanCheckboxDropdown';
import { DateRangeDropdownProps } from '../../shared/components/DateRangeDropdown/DateRangeDropdown';
import { ROUTE_PARTS } from '../../shared/constants';
import { stringToCheckboxOption } from '../../shared/helpers/set-selected-checkboxes';
import i18n from '../../shared/translations/i18n';
import { FilterableColumn } from '../shared/components/FilterTable/FilterTable';
import { NULL_FILTER } from '../shared/helpers/filters';

import {
	GET_COLLECTION_ACTUALISATION,
	GET_COLLECTION_MARCOM,
	GET_COLLECTION_QUALITY_CHECK,
} from './collections-or-bundles.gql';
import { CollectionTableCols, EditorialType } from './collections-or-bundles.types';

export const COLLECTIONS_OR_BUNDLES_PATH = {
	COLLECTIONS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.collections}`,
	COLLECTION_ACTUALISATION_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.collections}/${ROUTE_PARTS.actualisation}`,
	COLLECTION_QUALITYCHECK_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.collections}/${ROUTE_PARTS.qualitycheck}`,
	COLLECTION_MARCOM_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.collections}/${ROUTE_PARTS.marcom}`,
	BUNDLES_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.bundles}`,
	BUNDLE_ACTUALISATION_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.bundles}/${ROUTE_PARTS.actualisation}`,
	BUNDLE_QUALITYCHECK_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.bundles}/${ROUTE_PARTS.qualitycheck}`,
	BUNDLE_MARCOM_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.bundles}/${ROUTE_PARTS.marcom}`,
};

export const ITEMS_PER_PAGE = 10;

export const TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<{
	[columnId in CollectionTableCols]: (order: Avo.Search.OrderDirection) => any;
}> = {
	owner_profile_id: (order: Avo.Search.OrderDirection) => ({
		profile: { usersByuserId: { last_name: order } },
	}),
	author_user_group: (order: Avo.Search.OrderDirection) => ({
		profile: { profile_user_group: { group: { label: order } } },
	}),
	last_updated_by_profile: (order: Avo.Search.OrderDirection) => ({
		updated_by: { usersByuserId: { last_name: order } },
	}),
	views: (order: Avo.Search.OrderDirection) => ({
		view_counts_aggregate: {
			sum: {
				count: order,
			},
		},
	}),
	bookmarks: (order: Avo.Search.OrderDirection) => ({
		counts: {
			bookmarks: order,
		},
	}),
	copies: (order: Avo.Search.OrderDirection) => ({
		counts: {
			copies: order,
		},
	}),
	in_bundle: (order: Avo.Search.OrderDirection) => ({
		counts: {
			in_collection: order,
		},
	}),
	in_assignment: (order: Avo.Search.OrderDirection) => ({
		counts: {
			in_assignment: order,
		},
	}),
	quick_lane_links: (order: Avo.Search.OrderDirection) => ({
		counts: {
			quick_lane_links: order,
		},
	}),
};

export const EDITORIAL_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<{
	[columnId in CollectionTableCols]: (order: Avo.Search.OrderDirection) => any;
}> = {
	...TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
	owner_profile_id: (order: Avo.Search.OrderDirection) => ({
		owner: { profile: { usersByuserId: { last_name: order } } },
	}),
	author_user_group: (order: Avo.Search.OrderDirection) => ({
		owner: { profile: { profile_user_group: { group: { label: order } } } },
	}),
	last_updated_by_profile: (order: Avo.Search.OrderDirection) => ({
		last_editor: { last_name: order },
	}),
	actualisation_status: (order: Avo.Search.OrderDirection) => ({
		mgmt_current_status: order,
	}),
	actualisation_last_actualised_at: (order: Avo.Search.OrderDirection) => ({
		mgmt_updated_at: order,
	}),
	actualisation_status_valid_until: (order: Avo.Search.OrderDirection) => ({
		mgmt_status_expires_at: order,
	}),
	actualisation_approved_at: (order: Avo.Search.OrderDirection) => ({
		mgmt_last_eindcheck_date: order,
	}),
	quality_check_language_check: (order: Avo.Search.OrderDirection) => ({
		mgmt_language_check: order,
	}),
	quality_check_quality_check: (order: Avo.Search.OrderDirection) => ({
		mgmt_quality_check: order,
	}),
	quality_check_approved_at: (order: Avo.Search.OrderDirection) => ({
		mgmt_eind_check_date: order,
	}),
	marcom_last_communication_channel_type: (order: Avo.Search.OrderDirection) => ({
		channel_type: order,
	}),
	marcom_last_communication_channel_name: (order: Avo.Search.OrderDirection) => ({
		channel_name: order,
	}),
	marcom_last_communication_at: (order: Avo.Search.OrderDirection) => ({
		last_marcom_date: order,
	}),
	marcom_klascement: (order: Avo.Search.OrderDirection) => ({
		klascement: order,
	}),
};

type CollectionBulkActionOption = SelectOption<string> & {
	confirm?: boolean;
	confirmButtonType?: ButtonType;
};

export const GET_COLLECTION_BULK_ACTIONS = (): CollectionBulkActionOption[] => {
	return [
		{
			label: i18n.t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___publiceren'
			),
			value: 'publish',
			confirm: true,
			confirmButtonType: 'primary',
		},
		{
			label: i18n.t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___depubliceren'
			),
			value: 'depublish',
			confirm: true,
			confirmButtonType: 'danger',
		},
		{
			label: i18n.t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___verwijderen'
			),
			value: 'delete',
			confirm: true,
			confirmButtonType: 'danger',
		},
		{
			label: i18n.t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___auteur-aanpassen'
			),
			value: 'change_author',
		},
		{
			label: i18n.t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___labels-aanpassen'
			),
			value: 'change_labels',
		},
	];
};

const getCollectionTitleColumn = (): FilterableColumn => ({
	id: 'title',
	label: i18n.t('admin/collections-or-bundles/collections-or-bundles___title'),
	sortable: true,
	visibleByDefault: true,
	dataType: 'string',
});

const getCollectionAuthorColumn = (): FilterableColumn => ({
	id: 'owner_profile_id',
	label: i18n.t('admin/collections-or-bundles/views/collections-or-bundles-overview___auteur'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'MultiUserSelectDropdown',
	dataType: 'string',
});

const getCollectionAuthorUserGroupColumn = (
	userGroupOptions: CheckboxOption[],
	visibleByDefault: boolean
): FilterableColumn => ({
	visibleByDefault,
	id: 'author_user_group',
	label: i18n.t('admin/collections-or-bundles/collections-or-bundles___auteur-rol'),
	sortable: true,
	filterType: 'CheckboxDropdownModal',
	filterProps: {
		options: userGroupOptions,
	} as CheckboxDropdownModalProps,
	dataType: 'string',
});

const getCollectionLastUpdatedByColumn = (): FilterableColumn => ({
	id: 'last_updated_by_profile',
	label: i18n.t(
		'admin/collections-or-bundles/views/collections-or-bundles-overview___laatste-bewerkt-door'
	),
	sortable: true,
	visibleByDefault: true,
	dataType: 'string',
});

const getCollectionCreatedAtColumn = (): FilterableColumn => ({
	id: 'created_at',
	label: i18n.t('admin/collections-or-bundles/collections-or-bundles___aangemaakt-op'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'DateRangeDropdown',
	filterProps: {},
	dataType: 'dateTime',
});

const getCollectionUpdatedAtColumn = (): FilterableColumn => ({
	id: 'updated_at',
	label: i18n.t('admin/collections-or-bundles/collections-or-bundles___aangepast-op'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'DateRangeDropdown',
	filterProps: {},
	dataType: 'dateTime',
});

const getCollectionIsPublicColumn = (): FilterableColumn => ({
	id: 'is_public',
	label: i18n.t('admin/collections-or-bundles/collections-or-bundles___publiek'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'BooleanCheckboxDropdown',
	dataType: 'boolean',
});

const getCollectionLabelsColumn = (collectionLabelOptions: CheckboxOption[]): FilterableColumn => ({
	id: 'collection_labels',
	label: i18n.t('admin/collections-or-bundles/views/collections-or-bundles-overview___labels'),
	sortable: false,
	visibleByDefault: true,
	filterType: 'CheckboxDropdownModal',
	filterProps: {
		options: collectionLabelOptions,
	} as CheckboxDropdownModalProps,
});

const getCollectionIsCopyColumn = (): FilterableColumn => ({
	id: 'is_copy',
	label: i18n.t('admin/collections-or-bundles/views/collections-or-bundles-overview___kopie'),
	sortable: false,
	visibleByDefault: false,
	filterType: 'BooleanCheckboxDropdown',
});

const getCollectionManagedColumn = (): FilterableColumn => ({
	id: 'is_managed',
	label: i18n.t('admin/collections-or-bundles/collections-or-bundles___redactie'),
	sortable: true,
	visibleByDefault: false,
	filterType: 'BooleanCheckboxDropdown',
	dataType: 'boolean',
});

const getCollectionViewsColumn = (): FilterableColumn => ({
	id: 'views',
	tooltip: i18n.t('admin/collections-or-bundles/collections-or-bundles___bekeken'),
	icon: 'eye',
	sortable: true,
	visibleByDefault: true,
	dataType: 'number',
});

const getCollectionBookmarksColumn = (): FilterableColumn => ({
	id: 'bookmarks',
	tooltip: i18n.t(
		'admin/collections-or-bundles/views/collections-or-bundles-overview___aantal-keer-opgenomen-in-een-bladwijzer'
	),
	icon: 'bookmark',
	sortable: true,
	visibleByDefault: true,
	dataType: 'number',
});

const getCollectionCopiesColumn = (): FilterableColumn => ({
	id: 'copies',
	tooltip: i18n.t(
		'admin/collections-or-bundles/views/collections-or-bundles-overview___aantal-keer-gekopieerd'
	),
	icon: 'copy',
	sortable: true,
	visibleByDefault: true,
	dataType: 'number',
});

const getCollectionInBundleColumn = (isCollection: boolean): FilterableColumn[] => {
	if (isCollection) {
		return [
			{
				id: 'in_bundle',
				tooltip: i18n.t(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___aantal-keer-opgenomen-in-een-bundel'
				),
				icon: 'folder',
				sortable: true,
				visibleByDefault: true,
				dataType: 'number',
			},
		];
	}
	return [];
};

const getCollectionInAssignmentColumn = (isCollection: boolean): FilterableColumn[] => {
	if (isCollection) {
		return [
			{
				id: 'in_assignment',
				tooltip: i18n.t(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___aantal-keer-opgenomen-in-een-opdracht'
				),
				icon: 'clipboard',
				sortable: true,
				visibleByDefault: true,
				dataType: 'number',
			},
		];
	}
	return [];
};

const getCollectionQuickLanesColumn = (): FilterableColumn => ({
	id: 'quick_lane_links',
	tooltip: i18n.t(
		'admin/collections-or-bundles/collections-or-bundles___aantal-keer-gedeeld-met-leerlingen'
	),
	icon: 'link-2',
	sortable: true,
	visibleByDefault: true,
	dataType: 'number',
});

const getCollectionSubjectsColumn = (subjects: string[]): FilterableColumn => ({
	id: 'subjects',
	label: i18n.t('admin/collections-or-bundles/collections-or-bundles___vakken'),
	sortable: false,
	visibleByDefault: false,
	filterType: 'CheckboxDropdownModal',
	filterProps: {
		options: subjects.map(stringToCheckboxOption),
	} as CheckboxDropdownModalProps,
});

const getCollectionEducationLevelsColumn = (educationLevels: string[]): FilterableColumn => ({
	id: 'education_levels',
	label: i18n.t('admin/collections-or-bundles/collections-or-bundles___opleidingsniveaus'),
	sortable: false,
	visibleByDefault: false,
	filterType: 'CheckboxDropdownModal',
	filterProps: {
		options: educationLevels.map(stringToCheckboxOption),
	} as CheckboxDropdownModalProps,
});

const getCollectionOrganisationColumn = (
	organisationOptions: CheckboxOption[]
): FilterableColumn => ({
	id: 'organisation',
	label: i18n.t('admin/collections-or-bundles/collections-or-bundles___organisatie'),
	sortable: false,
	visibleByDefault: false,
	filterType: 'CheckboxDropdownModal',
	filterProps: {
		options: organisationOptions,
	} as CheckboxDropdownModalProps,
});

const getActualisationStatusColumn = (): FilterableColumn => ({
	id: 'actualisation_status',
	label: i18n.t('admin/collections-or-bundles/collections-or-bundles___status'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'CheckboxDropdownModal',
	filterProps: {
		options: getCollectionManagementStatuses(),
	} as CheckboxDropdownModalProps,
	dataType: 'string',
});

const getActualisationLastActualisedAtColumn = (): FilterableColumn => ({
	id: 'actualisation_last_actualised_at',
	label: i18n.t(
		'admin/collections-or-bundles/collections-or-bundles___datum-laatste-actualisatie'
	),
	sortable: true,
	visibleByDefault: true,
	filterType: 'DateRangeDropdown',
	dataType: 'dateTime',
});

const getActualisationStatusValidUntilColumn = (): FilterableColumn => ({
	id: 'actualisation_status_valid_until',
	label: i18n.t('admin/collections-or-bundles/collections-or-bundles___vervaldatum'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'DateRangeDropdown',
	filterProps: {
		showPastFutureOptions: true,
		defaultControls: 'past',
	} as Partial<DateRangeDropdownProps>,
	dataType: 'dateTime',
});

const getActualisationApprovedAtColumn = (): FilterableColumn => ({
	id: 'actualisation_approved_at',
	label: i18n.t('admin/collections-or-bundles/collections-or-bundles___datum-goedkeuring'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'DateRangeDropdown',
	dataType: 'dateTime',
});

const getActualisationResponsibleProfileColumn = (): FilterableColumn => ({
	id: 'actualisation_manager',
	label: i18n.t(
		'admin/collections-or-bundles/collections-or-bundles___actualisatie-verantwoordelijke'
	),
	sortable: true,
	visibleByDefault: false,
	filterType: 'MultiUserSelectDropdown',
	dataType: 'string',
});

const getQualityCheckLanguageCheckColumn = (): FilterableColumn => ({
	id: 'quality_check_language_check',
	label: i18n.t('admin/collections-or-bundles/collections-or-bundles___taalcheck'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'BooleanCheckboxDropdown',
	filterProps: {
		trueLabel: i18n.t('admin/collections-or-bundles/collections-or-bundles___ok'),
		falseLabel: i18n.t('admin/collections-or-bundles/collections-or-bundles___nok'),
		includeEmpty: true,
	} as BooleanCheckboxDropdownProps,
	dataType: 'boolean',
});

const getQualityCheckQualityCheckColumn = (): FilterableColumn => ({
	id: 'quality_check_quality_check',
	label: i18n.t('admin/collections-or-bundles/collections-or-bundles___kwaliteitscontrole'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'BooleanCheckboxDropdown',
	filterProps: {
		trueLabel: i18n.t('admin/collections-or-bundles/collections-or-bundles___ok'),
		falseLabel: i18n.t('admin/collections-or-bundles/collections-or-bundles___nok'),
		includeEmpty: true,
	} as BooleanCheckboxDropdownProps,
	dataType: 'boolean',
});

const getQualityCheckApprovedAtColumn = (): FilterableColumn => ({
	id: 'quality_check_approved_at',
	label: i18n.t('admin/collections-or-bundles/collections-or-bundles___datum-goedkeuring'),
	sortable: true,
	visibleByDefault: true,
	dataType: 'dateTime',
});

const getMarcomLastCommunicationChannelTypeColumn = (): FilterableColumn => ({
	id: 'marcom_last_communication_channel_type',
	label: i18n.t(
		'admin/collections-or-bundles/collections-or-bundles___laatste-communicatie-kanaal-type'
	),
	sortable: true,
	visibleByDefault: true,
	dataType: 'string',
});

const getMarcomLastCommunicationChannelNameColumn = (): FilterableColumn => ({
	id: 'marcom_last_communication_channel_name',
	label: i18n.t(
		'admin/collections-or-bundles/collections-or-bundles___laatste-communicatie-kanaal-naam'
	),
	sortable: true,
	visibleByDefault: true,
	dataType: 'string',
});

const getMarcomLastCommunicationAtColumn = (): FilterableColumn => ({
	id: 'marcom_last_communication_at',
	label: i18n.t(
		'admin/collections-or-bundles/collections-or-bundles___laatste-communicatiedatum'
	),
	sortable: true,
	visibleByDefault: true,
	dataType: 'dateTime',
});

const getMarcomKlascementColumn = (): FilterableColumn => ({
	id: 'marcom_klascement',
	label: i18n.t('admin/collections-or-bundles/collections-or-bundles___klas-cement'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'BooleanCheckboxDropdown',
	dataType: 'boolean',
});

const getMarcomLastUpdatedByColumn = (): FilterableColumn => ({
	id: 'last_updated_by_profile',
	label: i18n.t(
		'admin/collections-or-bundles/views/collections-or-bundles-overview___laatste-bewerkt-door'
	),
	sortable: true,
	visibleByDefault: false,
	dataType: 'dateTime',
});

export const GET_COLLECTIONS_COLUMNS = (
	isCollection: boolean,
	userGroupOptions: CheckboxOption[],
	collectionLabelOptions: CheckboxOption[],
	subjects: string[],
	educationLevels: string[],
	organisations: CheckboxOption[]
): FilterableColumn[] => [
	getCollectionTitleColumn(),
	getCollectionAuthorColumn(),
	getCollectionAuthorUserGroupColumn(userGroupOptions, true),
	getCollectionLastUpdatedByColumn(),
	getCollectionCreatedAtColumn(),
	getCollectionUpdatedAtColumn(),
	getCollectionIsPublicColumn(),
	getCollectionLabelsColumn(collectionLabelOptions),
	getCollectionIsCopyColumn(),
	getCollectionManagedColumn(),
	getCollectionViewsColumn(),
	getCollectionBookmarksColumn(),
	getCollectionCopiesColumn(),
	...getCollectionInBundleColumn(isCollection),
	...getCollectionInAssignmentColumn(isCollection),
	getCollectionQuickLanesColumn(),
	getCollectionSubjectsColumn(subjects),
	getCollectionEducationLevelsColumn(educationLevels),
	getCollectionOrganisationColumn(organisations),
	{
		id: 'actions',
		tooltip: i18n.t(
			'admin/collections-or-bundles/views/collections-or-bundles-overview___acties'
		),
		visibleByDefault: true,
	},
];

export const GET_COLLECTION_ACTUALISATION_COLUMNS = (
	userGroupOptions: CheckboxOption[],
	collectionLabelOptions: CheckboxOption[],
	subjects: string[],
	educationLevels: string[],
	organisations: CheckboxOption[]
): FilterableColumn[] => [
	getCollectionTitleColumn(),
	getCollectionAuthorColumn(),
	getCollectionAuthorUserGroupColumn(userGroupOptions, false),
	getCollectionLastUpdatedByColumn(),
	getCollectionCreatedAtColumn(),
	getCollectionUpdatedAtColumn(),
	getActualisationStatusColumn(),
	getActualisationLastActualisedAtColumn(),
	getActualisationStatusValidUntilColumn(),
	getActualisationApprovedAtColumn(),
	getActualisationResponsibleProfileColumn(),
	getCollectionIsPublicColumn(),
	getCollectionLabelsColumn(collectionLabelOptions),
	getCollectionSubjectsColumn(subjects),
	getCollectionEducationLevelsColumn(educationLevels),
	getCollectionOrganisationColumn(organisations),
	{
		id: 'actions',
		tooltip: i18n.t(
			'admin/collections-or-bundles/views/collections-or-bundles-overview___acties'
		),
		visibleByDefault: true,
	},
];

export const GET_COLLECTION_QUALITY_CHECK_COLUMNS = (
	userGroupOptions: CheckboxOption[],
	collectionLabelOptions: CheckboxOption[],
	subjects: string[],
	educationLevels: string[],
	organisations: CheckboxOption[]
) => [
	getCollectionTitleColumn(),
	getCollectionAuthorColumn(),
	getCollectionAuthorUserGroupColumn(userGroupOptions, false),
	getCollectionLastUpdatedByColumn(),
	getCollectionCreatedAtColumn(),
	getCollectionUpdatedAtColumn(),
	getQualityCheckLanguageCheckColumn(),
	getQualityCheckQualityCheckColumn(),
	getQualityCheckApprovedAtColumn(),
	getCollectionIsPublicColumn(),
	getCollectionLabelsColumn(collectionLabelOptions),
	getCollectionSubjectsColumn(subjects),
	getCollectionEducationLevelsColumn(educationLevels),
	getCollectionOrganisationColumn(organisations),
	{
		id: 'actions',
		tooltip: i18n.t(
			'admin/collections-or-bundles/views/collections-or-bundles-overview___acties'
		),
		visibleByDefault: true,
	},
];

export const GET_COLLECTION_MARCOM_COLUMNS = (
	userGroupOptions: CheckboxOption[],
	collectionLabelOptions: CheckboxOption[],
	subjects: string[],
	educationLevels: string[],
	organisations: CheckboxOption[]
) => [
	getCollectionTitleColumn(),
	getCollectionAuthorColumn(),
	getCollectionAuthorUserGroupColumn(userGroupOptions, false),
	getMarcomLastUpdatedByColumn(),
	getCollectionCreatedAtColumn(),
	getCollectionUpdatedAtColumn(),
	getMarcomLastCommunicationChannelTypeColumn(),
	getMarcomLastCommunicationChannelNameColumn(),
	getMarcomLastCommunicationAtColumn(),
	getMarcomKlascementColumn(),
	getCollectionIsPublicColumn(),
	getCollectionLabelsColumn(collectionLabelOptions),
	getCollectionSubjectsColumn(subjects),
	getCollectionEducationLevelsColumn(educationLevels),
	getCollectionOrganisationColumn(organisations),
	{
		id: 'actions',
		tooltip: i18n.t(
			'admin/collections-or-bundles/views/collections-or-bundles-overview___acties'
		),
		visibleByDefault: true,
	},
];

export const getCollectionManagementStatuses = (): CheckboxOption[] => [
	{ checked: false, label: 'Actueel', id: 'ACTUEEL' },
	{ checked: false, label: 'Te actualiseren', id: 'ACTUALISEREN' },
	{ checked: false, label: 'Volledig te herzien', id: 'HERZIEN' },
	{ checked: false, label: 'Gearchiveerd', id: 'GEARCHIVEERD' },
	{ checked: false, label: i18n.t('admin/users/user___leeg'), id: NULL_FILTER },
];

export const EDITORIAL_QUERIES: Record<EditorialType, DocumentNode> = {
	actualisation: GET_COLLECTION_ACTUALISATION,
	quality_check: GET_COLLECTION_QUALITY_CHECK,
	marcom: GET_COLLECTION_MARCOM,
};
