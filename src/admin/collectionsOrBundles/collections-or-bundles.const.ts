import { ButtonType, IconName, SelectOption } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';

import { CheckboxDropdownModalProps, CheckboxOption } from '../../shared/components';
import { BooleanCheckboxDropdownProps } from '../../shared/components/BooleanCheckboxDropdown/BooleanCheckboxDropdown';
import { DateRangeDropdownProps } from '../../shared/components/DateRangeDropdown/DateRangeDropdown';
import { ROUTE_PARTS } from '../../shared/constants';
import {
	GetCollectionActualisationsDocument,
	GetCollectionMarcomDocument,
	GetCollectionQualityCheckDocument,
} from '../../shared/generated/graphql-db-react-query';
import { lomToCheckboxOption } from '../../shared/helpers/set-selected-checkboxes';
import { tText } from '../../shared/helpers/translate';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { FilterableColumn } from '../shared/components/FilterTable/FilterTable';
import { NULL_FILTER } from '../shared/helpers/filters';

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
			label: tText(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___publiceren'
			),
			value: 'publish',
			confirm: true,
			confirmButtonType: 'primary',
		},
		{
			label: tText(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___depubliceren'
			),
			value: 'depublish',
			confirm: true,
			confirmButtonType: 'danger',
		},
		{
			label: tText(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___verwijderen'
			),
			value: 'delete',
			confirm: true,
			confirmButtonType: 'danger',
		},
		{
			label: tText(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___auteur-aanpassen'
			),
			value: 'change_author',
		},
		{
			label: tText(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___labels-aanpassen'
			),
			value: 'change_labels',
		},
	];
};

const getCollectionTitleColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'title',
	label: tText('admin/collections-or-bundles/collections-or-bundles___title'),
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.string,
});

const getCollectionAuthorColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'owner_profile_id',
	label: tText('admin/collections-or-bundles/views/collections-or-bundles-overview___auteur'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'MultiUserSelectDropdown',
	dataType: TableColumnDataType.string,
});

const getCollectionAuthorUserGroupColumn = (
	userGroupOptions: CheckboxOption[],
	visibleByDefault: boolean
): FilterableColumn<CollectionTableCols> => ({
	visibleByDefault,
	id: 'author_user_group',
	label: tText('admin/collections-or-bundles/collections-or-bundles___auteur-rol'),
	sortable: true,
	filterType: 'CheckboxDropdownModal',
	filterProps: {
		options: userGroupOptions,
	} as CheckboxDropdownModalProps,
	dataType: TableColumnDataType.string,
});

const getCollectionLastUpdatedByColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'last_updated_by_profile',
	label: tText(
		'admin/collections-or-bundles/views/collections-or-bundles-overview___laatste-bewerkt-door'
	),
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.string,
});

const getCollectionCreatedAtColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'created_at',
	label: tText('admin/collections-or-bundles/collections-or-bundles___aangemaakt-op'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'DateRangeDropdown',
	filterProps: {},
	dataType: TableColumnDataType.dateTime,
});

const getCollectionUpdatedAtColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'updated_at',
	label: tText('admin/collections-or-bundles/collections-or-bundles___aangepast-op'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'DateRangeDropdown',
	filterProps: {},
	dataType: TableColumnDataType.dateTime,
});

const getCollectionIsPublicColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'is_public',
	label: tText('admin/collections-or-bundles/collections-or-bundles___publiek'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'BooleanCheckboxDropdown',
	dataType: TableColumnDataType.boolean,
});

const getCollectionLabelsColumn = (
	collectionLabelOptions: CheckboxOption[]
): FilterableColumn<CollectionTableCols> => ({
	id: 'collection_labels',
	label: tText('admin/collections-or-bundles/views/collections-or-bundles-overview___labels'),
	sortable: false,
	visibleByDefault: true,
	filterType: 'CheckboxDropdownModal',
	filterProps: {
		options: collectionLabelOptions,
	} as CheckboxDropdownModalProps,
});

const getCollectionIsCopyColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'is_copy',
	label: tText('admin/collections-or-bundles/views/collections-or-bundles-overview___kopie'),
	sortable: false,
	visibleByDefault: false,
	filterType: 'BooleanCheckboxDropdown',
});

const getCollectionManagedColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'is_managed',
	label: tText('admin/collections-or-bundles/collections-or-bundles___redactie'),
	sortable: true,
	visibleByDefault: false,
	filterType: 'BooleanCheckboxDropdown',
	dataType: TableColumnDataType.boolean,
});

const getCollectionViewsColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'views',
	tooltip: tText('admin/collections-or-bundles/collections-or-bundles___bekeken'),
	icon: IconName.eye,
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.number,
});

const getCollectionBookmarksColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'bookmarks',
	tooltip: tText(
		'admin/collections-or-bundles/views/collections-or-bundles-overview___aantal-keer-opgenomen-in-een-bladwijzer'
	),
	icon: IconName.bookmark,
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.number,
});

const getCollectionCopiesColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'copies',
	tooltip: tText(
		'admin/collections-or-bundles/views/collections-or-bundles-overview___aantal-keer-gekopieerd'
	),
	icon: IconName.copy,
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.number,
});

const getCollectionInBundleColumn = (
	isCollection: boolean
): FilterableColumn<CollectionTableCols>[] => {
	if (isCollection) {
		return [
			{
				id: 'in_bundle',
				tooltip: tText(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___aantal-keer-opgenomen-in-een-bundel'
				),
				icon: IconName.folder,
				sortable: true,
				visibleByDefault: true,
				dataType: TableColumnDataType.number,
			},
		];
	}
	return [];
};

const getCollectionInAssignmentColumn = (
	isCollection: boolean
): FilterableColumn<CollectionTableCols>[] => {
	if (isCollection) {
		return [
			{
				id: 'in_assignment',
				tooltip: tText(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___aantal-keer-opgenomen-in-een-opdracht'
				),
				icon: IconName.clipboard,
				sortable: true,
				visibleByDefault: true,
				dataType: TableColumnDataType.number,
			},
		];
	}
	return [];
};

const getCollectionQuickLanesColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'quick_lane_links',
	tooltip: tText(
		'admin/collections-or-bundles/collections-or-bundles___aantal-keer-gedeeld-met-leerlingen'
	),
	icon: IconName.link2,
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.number,
});

const getCollectionSubjectsColumn = (
	subjects: Avo.Lom.LomField[]
): FilterableColumn<CollectionTableCols> => ({
	id: 'subjects',
	label: tText('admin/collections-or-bundles/collections-or-bundles___vakken'),
	sortable: false,
	visibleByDefault: false,
	filterType: 'CheckboxDropdownModal',
	filterProps: {
		options: [
			...subjects.map(lomToCheckboxOption),
			{ checked: false, label: tText('admin/users/user___leeg'), id: NULL_FILTER },
		],
	} as CheckboxDropdownModalProps,
});

const getCollectionThemesColumn = () // themes: Avo.Lom.LomField[]
: FilterableColumn<CollectionTableCols> => ({
	id: 'themas',
	label: tText('admin/collections-or-bundles/collections-or-bundles___themas'),
	sortable: false,
	visibleByDefault: false,
	// filterType: 'CheckboxDropdownModal',
	// filterProps: {
	// 	options: [
	// 		...themes.map(lomToCheckboxOption),
	// 		{ checked: false, label: tText('admin/users/user___leeg'), id: NULL_FILTER },
	// 	],
	// } as CheckboxDropdownModalProps,
});

const getCollectionEducationLevelsColumn = (
	educationLevels: Avo.Lom.LomField[]
): FilterableColumn<CollectionTableCols> => ({
	id: 'education_levels',
	label: tText('admin/collections-or-bundles/collections-or-bundles___opleidingsniveaus'),
	sortable: false,
	visibleByDefault: false,
	filterType: 'CheckboxDropdownModal',
	filterProps: {
		options: [
			...educationLevels.map(lomToCheckboxOption),
			{ checked: false, label: tText('admin/users/user___leeg'), id: NULL_FILTER },
		],
	} as CheckboxDropdownModalProps,
});

const getCollectionOrganisationColumn = (
	organisationOptions: CheckboxOption[]
): FilterableColumn<CollectionTableCols> => ({
	id: 'organisation',
	label: tText('admin/collections-or-bundles/collections-or-bundles___organisatie'),
	sortable: false,
	visibleByDefault: false,
	filterType: 'CheckboxDropdownModal',
	filterProps: {
		options: organisationOptions,
	} as CheckboxDropdownModalProps,
});

const getActualisationStatusColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'actualisation_status',
	label: tText('admin/collections-or-bundles/collections-or-bundles___status'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'CheckboxDropdownModal',
	filterProps: {
		options: getCollectionManagementStatuses(),
	} as CheckboxDropdownModalProps,
	dataType: TableColumnDataType.string,
});

const getActualisationLastActualisedAtColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'actualisation_last_actualised_at',
	label: tText(
		'admin/collections-or-bundles/collections-or-bundles___datum-laatste-actualisatie'
	),
	sortable: true,
	visibleByDefault: true,
	filterType: 'DateRangeDropdown',
	dataType: TableColumnDataType.dateTime,
});

const getActualisationStatusValidUntilColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'actualisation_status_valid_until',
	label: tText('admin/collections-or-bundles/collections-or-bundles___vervaldatum'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'DateRangeDropdown',
	filterProps: {
		showPastFutureOptions: true,
		defaultControls: 'past',
	} as Partial<DateRangeDropdownProps>,
	dataType: TableColumnDataType.dateTime,
});

const getActualisationApprovedAtColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'actualisation_approved_at',
	label: tText('admin/collections-or-bundles/collections-or-bundles___datum-goedkeuring'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'DateRangeDropdown',
	dataType: TableColumnDataType.dateTime,
});

const getActualisationResponsibleProfileColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'actualisation_manager',
	label: tText(
		'admin/collections-or-bundles/collections-or-bundles___actualisatie-verantwoordelijke'
	),
	sortable: true,
	visibleByDefault: false,
	filterType: 'MultiUserSelectDropdown',
	dataType: TableColumnDataType.string,
});

const getQualityCheckLanguageCheckColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'quality_check_language_check',
	label: tText('admin/collections-or-bundles/collections-or-bundles___taalcheck'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'BooleanCheckboxDropdown',
	filterProps: {
		trueLabel: tText('admin/collections-or-bundles/collections-or-bundles___ok'),
		falseLabel: tText('admin/collections-or-bundles/collections-or-bundles___nok'),
		includeEmpty: true,
	} as BooleanCheckboxDropdownProps,
	dataType: TableColumnDataType.boolean,
});

const getQualityCheckQualityCheckColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'quality_check_quality_check',
	label: tText('admin/collections-or-bundles/collections-or-bundles___kwaliteitscontrole'),
	sortable: true,
	visibleByDefault: true,
	filterType: 'BooleanCheckboxDropdown',
	filterProps: {
		trueLabel: tText('admin/collections-or-bundles/collections-or-bundles___ok'),
		falseLabel: tText('admin/collections-or-bundles/collections-or-bundles___nok'),
		includeEmpty: true,
	} as BooleanCheckboxDropdownProps,
	dataType: TableColumnDataType.boolean,
});

const getQualityCheckApprovedAtColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'quality_check_approved_at',
	label: tText('admin/collections-or-bundles/collections-or-bundles___datum-goedkeuring'),
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.dateTime,
});

const getMarcomLastCommunicationChannelTypeColumn = (
	channelTypeOptions: CheckboxOption[]
): FilterableColumn<CollectionTableCols> => ({
	id: 'marcom_last_communication_channel_type',
	label: tText(
		'admin/collections-or-bundles/collections-or-bundles___laatste-communicatie-kanaal-type'
	),
	filterType: 'CheckboxDropdownModal',
	filterProps: {
		label: tText('admin/collections-or-bundles/collections-or-bundles___communicatietype'),
		options: channelTypeOptions,
	},
	sortable: true,
	visibleByDefault: true,
});

const getMarcomLastCommunicationChannelNameColumn = (
	channelNameOptions: CheckboxOption[]
): FilterableColumn<CollectionTableCols> => ({
	id: 'marcom_last_communication_channel_name',
	label: tText(
		'admin/collections-or-bundles/collections-or-bundles___laatste-communicatie-kanaal-naam'
	),
	sortable: true,
	visibleByDefault: true,
	filterType: 'CheckboxDropdownModal',
	filterProps: {
		label: tText('admin/collections-or-bundles/collections-or-bundles___communicatiekanaal'),
		options: channelNameOptions,
	},
	dataType: TableColumnDataType.string,
});

const getMarcomLastCommunicationAtColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'marcom_last_communication_at',
	label: tText('admin/collections-or-bundles/collections-or-bundles___laatste-communicatiedatum'),
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.dateTime,
});

const getMarcomKlascementColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'marcom_klascement',
	label: tText('admin/collections-or-bundles/collections-or-bundles___klas-cement'),
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.boolean,
});

const getMarcomLastUpdatedByColumn = (): FilterableColumn<CollectionTableCols> => ({
	id: 'last_updated_by_profile',
	label: tText(
		'admin/collections-or-bundles/views/collections-or-bundles-overview___laatste-bewerkt-door'
	),
	sortable: true,
	visibleByDefault: false,
	dataType: TableColumnDataType.dateTime,
});

export const GET_COLLECTIONS_COLUMNS = (
	isCollection: boolean,
	userGroupOptions: CheckboxOption[],
	collectionLabelOptions: CheckboxOption[],
	subjects: Avo.Lom.LomField[],
	educationLevels: Avo.Lom.LomField[],
	organisations: CheckboxOption[]
): FilterableColumn<CollectionTableCols>[] => [
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
	getCollectionThemesColumn(),
	getCollectionEducationLevelsColumn(educationLevels),
	getCollectionOrganisationColumn(organisations),
	{
		id: 'actions',
		tooltip: tText(
			'admin/collections-or-bundles/views/collections-or-bundles-overview___acties'
		),
		visibleByDefault: true,
	},
];

export const GET_COLLECTION_ACTUALISATION_COLUMNS = (
	userGroupOptions: CheckboxOption[],
	collectionLabelOptions: CheckboxOption[],
	subjects: Avo.Lom.LomField[],
	educationLevels: Avo.Lom.LomField[],
	organisations: CheckboxOption[]
): FilterableColumn<CollectionTableCols>[] => [
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
	getCollectionThemesColumn(),
	getCollectionEducationLevelsColumn(educationLevels),
	getCollectionOrganisationColumn(organisations),
	{
		id: 'actions',
		tooltip: tText(
			'admin/collections-or-bundles/views/collections-or-bundles-overview___acties'
		),
		visibleByDefault: true,
	},
];

export const GET_COLLECTION_QUALITY_CHECK_COLUMNS = (
	userGroupOptions: CheckboxOption[],
	collectionLabelOptions: CheckboxOption[],
	subjects: Avo.Lom.LomField[],
	educationLevels: Avo.Lom.LomField[],
	organisations: CheckboxOption[]
): FilterableColumn<CollectionTableCols>[] => [
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
	getCollectionThemesColumn(),
	getCollectionEducationLevelsColumn(educationLevels),
	getCollectionOrganisationColumn(organisations),
	{
		id: 'actions',
		tooltip: tText(
			'admin/collections-or-bundles/views/collections-or-bundles-overview___acties'
		),
		visibleByDefault: true,
	},
];

export const GET_COLLECTION_MARCOM_COLUMNS = (
	userGroupOptions: CheckboxOption[],
	collectionLabelOptions: CheckboxOption[],
	channelNameOptions: CheckboxOption[],
	subjects: Avo.Lom.LomField[],
	educationLevels: Avo.Lom.LomField[],
	organisations: CheckboxOption[],
	channelTypeOptions: CheckboxOption[]
): FilterableColumn<CollectionTableCols>[] => [
	getCollectionTitleColumn(),
	getCollectionAuthorColumn(),
	getCollectionAuthorUserGroupColumn(userGroupOptions, false),
	getMarcomLastUpdatedByColumn(),
	getCollectionCreatedAtColumn(),
	getCollectionUpdatedAtColumn(),
	getMarcomLastCommunicationChannelTypeColumn(channelTypeOptions),
	getMarcomLastCommunicationChannelNameColumn(channelNameOptions),
	getMarcomLastCommunicationAtColumn(),
	getMarcomKlascementColumn(),
	getCollectionIsPublicColumn(),
	getCollectionLabelsColumn(collectionLabelOptions),
	getCollectionSubjectsColumn(subjects),
	getCollectionEducationLevelsColumn(educationLevels),
	getCollectionOrganisationColumn(organisations),
	{
		id: 'actions',
		tooltip: tText(
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
	{ checked: false, label: tText('admin/users/user___leeg'), id: NULL_FILTER },
];

export const EDITORIAL_QUERIES: Record<EditorialType, string> = {
	actualisation: GetCollectionActualisationsDocument,
	quality_check: GetCollectionQualityCheckDocument,
	marcom: GetCollectionMarcomDocument,
};
