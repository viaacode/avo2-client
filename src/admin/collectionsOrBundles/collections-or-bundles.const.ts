import { type FilterableColumn, TableFilterType } from '@meemoo/admin-core-ui/admin';
import { type ButtonType, IconName, type SelectOption } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';

import { type BooleanCheckboxDropdownProps } from '../../shared/components/BooleanCheckboxDropdown/BooleanCheckboxDropdown';
import {
	type CheckboxDropdownModalProps,
	type CheckboxOption,
} from '../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import { type DateRangeDropdownProps } from '../../shared/components/DateRangeDropdown/DateRangeDropdown';
import { ROUTE_PARTS } from '../../shared/constants';
import { lomToCheckboxOption } from '../../shared/helpers/set-selected-checkboxes';
import { ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { tText } from '../../shared/helpers/translate-text';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { NULL_FILTER } from '../shared/helpers/filters';

import { CollectionBulkAction, type CollectionTableColumns } from './collections-or-bundles.types';

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

type CollectionBulkActionOption = SelectOption<string> & {
	confirm?: boolean;
	confirmButtonType?: ButtonType;
};

export const GET_COLLECTION_BULK_ACTIONS = (
	hasSelectedRows: boolean
): CollectionBulkActionOption[] => {
	return [
		{
			label: tText(
				'admin/collections-or-bundles/collections-or-bundles___selectie-publiceren'
			),
			value: CollectionBulkAction.PUBLISH,
			confirm: true,
			confirmButtonType: 'primary',
			disabled: !hasSelectedRows,
		},
		{
			label: tText(
				'admin/collections-or-bundles/collections-or-bundles___selectie-depubliceren'
			),
			value: CollectionBulkAction.DEPUBLISH,
			confirm: true,
			confirmButtonType: 'danger',
			disabled: !hasSelectedRows,
		},
		{
			label: tText(
				'admin/collections-or-bundles/collections-or-bundles___selectie-verwijderen'
			),
			value: CollectionBulkAction.DELETE,
			confirm: true,
			confirmButtonType: 'danger',
			disabled: !hasSelectedRows,
		},
		{
			label: tText(
				'admin/collections-or-bundles/collections-or-bundles___selectie-eigenaar-aanpassen'
			),
			value: CollectionBulkAction.CHANGE_AUTHOR,
			disabled: !hasSelectedRows,
		},
		{
			label: tText(
				'admin/collections-or-bundles/collections-or-bundles___selectie-labels-aanpassen'
			),
			value: CollectionBulkAction.CHANGE_LABELS,
			disabled: !hasSelectedRows,
		},
		{
			label: tText('admin/collections-or-bundles/collections-or-bundles___alles-exporteren'),
			value: CollectionBulkAction.EXPORT_ALL,
		},
	];
};

const getCollectionTitleColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'title',
	label: tText('admin/collections-or-bundles/collections-or-bundles___title'),
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.string,
});

const getCollectionAuthorColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'owner_profile_id',
	label: tText('admin/collections-or-bundles/views/collections-or-bundles-overview___auteur'),
	sortable: true,
	visibleByDefault: true,
	filterType: TableFilterType.MultiUserSelectDropdown,
	dataType: TableColumnDataType.string,
});

const getCollectionAuthorUserGroupColumn = (
	userGroupOptions: CheckboxOption[],
	visibleByDefault: boolean
): FilterableColumn<CollectionTableColumns> => ({
	visibleByDefault,
	id: 'author_user_group',
	label: tText('admin/collections-or-bundles/collections-or-bundles___auteur-rol'),
	sortable: true,
	filterType: TableFilterType.CheckboxDropdownModal,
	filterProps: {
		options: userGroupOptions,
	} as CheckboxDropdownModalProps,
	dataType: TableColumnDataType.string,
});

const getCollectionLastUpdatedByColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'last_updated_by_profile',
	label: tText(
		'admin/collections-or-bundles/views/collections-or-bundles-overview___laatste-bewerkt-door'
	),
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.string,
});

const getCollectionCreatedAtColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'created_at',
	label: tText('admin/collections-or-bundles/collections-or-bundles___aangemaakt-op'),
	sortable: true,
	visibleByDefault: true,
	filterType: TableFilterType.DateRangeDropdown,
	filterProps: {},
	dataType: TableColumnDataType.dateTime,
});

const getCollectionUpdatedAtColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'updated_at',
	label: tText('admin/collections-or-bundles/collections-or-bundles___aangepast-op'),
	sortable: true,
	visibleByDefault: true,
	filterType: TableFilterType.DateRangeDropdown,
	filterProps: {},
	dataType: TableColumnDataType.dateTime,
});

const getCollectionIsPublicColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'is_public',
	label: tText('admin/collections-or-bundles/collections-or-bundles___publiek'),
	sortable: true,
	visibleByDefault: true,
	filterType: TableFilterType.BooleanCheckboxDropdown,
	dataType: TableColumnDataType.boolean,
});

const getCollectionLabelsColumn = (
	collectionLabelOptions: CheckboxOption[]
): FilterableColumn<CollectionTableColumns> => ({
	id: 'collection_labels',
	label: tText('admin/collections-or-bundles/views/collections-or-bundles-overview___labels'),
	sortable: false,
	visibleByDefault: true,
	filterType: TableFilterType.CheckboxDropdownModal,
	filterProps: {
		options: collectionLabelOptions,
	} as CheckboxDropdownModalProps,
});

const getCollectionIsCopyColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'is_copy',
	label: tText('admin/collections-or-bundles/views/collections-or-bundles-overview___kopie'),
	sortable: false,
	visibleByDefault: false,
	filterType: TableFilterType.BooleanCheckboxDropdown,
});

const getCollectionManagedColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'is_managed',
	label: tText('admin/collections-or-bundles/collections-or-bundles___redactie'),
	sortable: true,
	visibleByDefault: false,
	filterType: TableFilterType.BooleanCheckboxDropdown,
	dataType: TableColumnDataType.boolean,
});

const getCollectionViewsColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'views',
	tooltip: tText('admin/collections-or-bundles/collections-or-bundles___bekeken'),
	icon: IconName.eye,
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.number,
});

const getCollectionBookmarksColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'bookmarks',
	tooltip: tText(
		'admin/collections-or-bundles/views/collections-or-bundles-overview___aantal-keer-opgenomen-in-een-bladwijzer'
	),
	icon: IconName.bookmark,
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.number,
});

const getCollectionCopiesColumn = (): FilterableColumn<CollectionTableColumns> => ({
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
): FilterableColumn<CollectionTableColumns>[] => {
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
): FilterableColumn<CollectionTableColumns>[] => {
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

const getCollectionQuickLanesColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'quick_lane_links',
	tooltip: tText(
		'admin/collections-or-bundles/collections-or-bundles___aantal-keer-gedeeld-met-leerlingen'
	),
	icon: IconName.link2,
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.number,
});

const getCollectionSharedColumn = (
	isCollection: boolean
): FilterableColumn<CollectionTableColumns>[] => {
	if (!isCollection) return [];

	return [
		{
			id: 'contributors',
			tooltip: tText('admin/collections-or-bundles/collections-or-bundles___gedeeld'),
			icon: IconName.share2,
			sortable: true,
			visibleByDefault: true,
			dataType: TableColumnDataType.number,
		},
	];
};

const getCollectionSubjectsColumn = (
	subjects: Avo.Lom.LomField[]
): FilterableColumn<CollectionTableColumns> => ({
	id: 'subjects',
	label: tText('admin/collections-or-bundles/collections-or-bundles___vakken'),
	sortable: false,
	visibleByDefault: false,
	filterType: TableFilterType.CheckboxDropdownModal,
	filterProps: {
		options: [
			...subjects.map(lomToCheckboxOption),
			{ checked: false, label: tText('admin/users/user___leeg'), id: NULL_FILTER },
		],
	} as CheckboxDropdownModalProps,
});

const getCollectionThemesColumn = () // themes: Avo.Lom.LomField[]
: FilterableColumn<CollectionTableColumns> => ({
	id: 'themas',
	label: tText('admin/collections-or-bundles/collections-or-bundles___themas'),
	sortable: false,
	visibleByDefault: false,
	// filterType: TableFilterType.CheckboxDropdownModal,
	// filterProps: {
	// 	options: [
	// 		...themes.map(lomToCheckboxOption),
	// 		{ checked: false, label: tText('admin/users/user___leeg'), id: NULL_FILTER },
	// 	],
	// } as CheckboxDropdownModalProps,
});

const getCollectionEducationLevelsColumn = (
	educationLevels: Avo.Lom.LomField[]
): FilterableColumn<CollectionTableColumns> => ({
	id: 'education_levels',
	label: tText('admin/collections-or-bundles/collections-or-bundles___onderwijsniveaus'),
	sortable: false,
	visibleByDefault: false,
	filterType: TableFilterType.CheckboxDropdownModal,
	filterProps: {
		options: [
			...educationLevels.map(lomToCheckboxOption),
			{ checked: false, label: tText('admin/users/user___leeg'), id: NULL_FILTER },
		],
	} as CheckboxDropdownModalProps,
});

const getCollectionEducationDegreesColumn = (
	educationDegrees: Avo.Lom.LomField[]
): FilterableColumn<CollectionTableColumns> => ({
	id: 'education_degrees',
	label: tText('admin/collections-or-bundles/collections-or-bundles___onderwijsgraden'),
	sortable: false,
	visibleByDefault: false,
	filterType: TableFilterType.CheckboxDropdownModal,
	filterProps: {
		options: [
			...educationDegrees.map(lomToCheckboxOption),
			{ checked: false, label: tText('admin/users/user___leeg'), id: NULL_FILTER },
		],
	} as CheckboxDropdownModalProps,
});

const getCollectionOrganisationColumn = (
	organisationOptions: CheckboxOption[]
): FilterableColumn<CollectionTableColumns> => ({
	id: 'organisation',
	label: tText('admin/collections-or-bundles/collections-or-bundles___organisatie'),
	sortable: false,
	visibleByDefault: false,
	filterType: TableFilterType.CheckboxDropdownModal,
	filterProps: {
		options: organisationOptions,
	} as CheckboxDropdownModalProps,
});

const getActualisationStatusColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'mgmt_current_status',
	label: tText('admin/collections-or-bundles/collections-or-bundles___status'),
	sortable: true,
	visibleByDefault: true,
	filterType: TableFilterType.CheckboxDropdownModal,
	filterProps: {
		options: getCollectionManagementStatuses(),
	} as CheckboxDropdownModalProps,
	dataType: TableColumnDataType.string,
});

const getActualisationLastActualisedAtColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'mgmt_updated_at',
	label: tText(
		'admin/collections-or-bundles/collections-or-bundles___datum-laatste-actualisatie'
	),
	sortable: true,
	visibleByDefault: true,
	filterType: TableFilterType.DateRangeDropdown,
	dataType: TableColumnDataType.dateTime,
});

const getActualisationStatusValidUntilColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'mgmt_status_expires_at',
	label: tText('admin/collections-or-bundles/collections-or-bundles___vervaldatum'),
	sortable: true,
	visibleByDefault: true,
	filterType: TableFilterType.DateRangeDropdown,
	filterProps: {
		showPastFutureOptions: true,
		defaultControls: 'past',
	} as Partial<DateRangeDropdownProps>,
	dataType: TableColumnDataType.dateTime,
});

const getActualisationApprovedAtColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'mgmt_last_eindcheck_date',
	label: tText('admin/collections-or-bundles/collections-or-bundles___datum-goedkeuring'),
	sortable: true,
	visibleByDefault: true,
	filterType: TableFilterType.DateRangeDropdown,
	dataType: TableColumnDataType.dateTime,
});

const getActualisationResponsibleProfileColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'actualisation_manager',
	label: tText(
		'admin/collections-or-bundles/collections-or-bundles___actualisatie-verantwoordelijke'
	),
	sortable: true,
	visibleByDefault: false,
	filterType: TableFilterType.MultiUserSelectDropdown,
	dataType: TableColumnDataType.string,
});

const getQualityCheckLanguageCheckColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'mgmt_language_check',
	label: tText('admin/collections-or-bundles/collections-or-bundles___taalcheck'),
	sortable: true,
	visibleByDefault: true,
	filterType: TableFilterType.BooleanCheckboxDropdown,
	filterProps: {
		trueLabel: tText('admin/collections-or-bundles/collections-or-bundles___ok'),
		falseLabel: tText('admin/collections-or-bundles/collections-or-bundles___nok'),
		includeEmpty: true,
	} as BooleanCheckboxDropdownProps,
	dataType: TableColumnDataType.boolean,
});

const getQualityCheckQualityCheckColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'mgmt_quality_check',
	label: tText('admin/collections-or-bundles/collections-or-bundles___kwaliteitscontrole'),
	sortable: true,
	visibleByDefault: true,
	filterType: TableFilterType.BooleanCheckboxDropdown,
	filterProps: {
		trueLabel: tText('admin/collections-or-bundles/collections-or-bundles___ok'),
		falseLabel: tText('admin/collections-or-bundles/collections-or-bundles___nok'),
		includeEmpty: true,
	} as BooleanCheckboxDropdownProps,
	dataType: TableColumnDataType.boolean,
});

const getQualityCheckApprovedAtColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'mgmt_eind_check_date',
	label: tText('admin/collections-or-bundles/collections-or-bundles___datum-goedkeuring'),
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.dateTime,
});

const getMarcomLastCommunicationChannelTypeColumn = (
	channelTypeOptions: CheckboxOption[]
): FilterableColumn<CollectionTableColumns> => ({
	id: 'marcom_last_communication_channel_type',
	label: tText(
		'admin/collections-or-bundles/collections-or-bundles___laatste-communicatie-kanaal-type'
	),
	filterType: TableFilterType.CheckboxDropdownModal,
	filterProps: {
		label: tText('admin/collections-or-bundles/collections-or-bundles___communicatietype'),
		options: channelTypeOptions,
	},
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.string,
});

const getMarcomLastCommunicationChannelNameColumn = (
	channelNameOptions: CheckboxOption[]
): FilterableColumn<CollectionTableColumns> => ({
	id: 'marcom_last_communication_channel_name',
	label: tText(
		'admin/collections-or-bundles/collections-or-bundles___laatste-communicatie-kanaal-naam'
	),
	sortable: true,
	visibleByDefault: true,
	filterType: TableFilterType.CheckboxDropdownModal,
	filterProps: {
		label: tText('admin/collections-or-bundles/collections-or-bundles___communicatiekanaal'),
		options: channelNameOptions,
	},
	dataType: TableColumnDataType.string,
});

const getMarcomLastCommunicationAtColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'marcom_last_communication_at',
	label: tText('admin/collections-or-bundles/collections-or-bundles___laatste-communicatiedatum'),
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.dateTime,
});

const getMarcomKlascementColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'marcom_klascement',
	label: tText('admin/collections-or-bundles/collections-or-bundles___klas-cement'),
	sortable: true,
	visibleByDefault: true,
	dataType: TableColumnDataType.boolean,
});

const getMarcomLastUpdatedByColumn = (): FilterableColumn<CollectionTableColumns> => ({
	id: 'last_updated_by_profile',
	label: tText(
		'admin/collections-or-bundles/views/collections-or-bundles-overview___laatste-bewerkt-door'
	),
	sortable: true,
	visibleByDefault: false,
	dataType: TableColumnDataType.string,
});

export const GET_COLLECTIONS_COLUMNS = (
	isCollection: boolean,
	userGroupOptions: CheckboxOption[],
	collectionLabelOptions: CheckboxOption[],
	subjects: Avo.Lom.LomField[],
	educationLevelsAndDegrees: Avo.Lom.LomField[],
	organisations: CheckboxOption[]
): FilterableColumn<CollectionTableColumns>[] => [
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
	...getCollectionSharedColumn(isCollection),
	getCollectionSubjectsColumn(subjects),
	getCollectionThemesColumn(),
	getCollectionEducationLevelsColumn(educationLevelsAndDegrees.filter((item) => !item.broader)),
	getCollectionEducationDegreesColumn(educationLevelsAndDegrees.filter((item) => !!item.broader)),
	getCollectionOrganisationColumn(organisations),
	{
		id: ACTIONS_TABLE_COLUMN_ID,
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
	educationLevelsAndDegrees: Avo.Lom.LomField[],
	organisations: CheckboxOption[]
): FilterableColumn<CollectionTableColumns>[] => [
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
	getCollectionEducationLevelsColumn(educationLevelsAndDegrees.filter((item) => !item.broader)),
	getCollectionEducationDegreesColumn(educationLevelsAndDegrees.filter((item) => !!item.broader)),
	getCollectionOrganisationColumn(organisations),
	{
		id: ACTIONS_TABLE_COLUMN_ID,
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
	educationLevelsAndDegrees: Avo.Lom.LomField[],
	organisations: CheckboxOption[]
): FilterableColumn<CollectionTableColumns>[] => [
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
	getCollectionEducationLevelsColumn(educationLevelsAndDegrees.filter((item) => !item.broader)),
	getCollectionEducationDegreesColumn(educationLevelsAndDegrees.filter((item) => !!item.broader)),
	getCollectionOrganisationColumn(organisations),
	{
		id: ACTIONS_TABLE_COLUMN_ID,
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
	educationLevelsAndDegrees: Avo.Lom.LomField[],
	organisations: CheckboxOption[],
	channelTypeOptions: CheckboxOption[]
): FilterableColumn<CollectionTableColumns>[] => [
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
	getCollectionEducationLevelsColumn(educationLevelsAndDegrees.filter((item) => !item.broader)),
	getCollectionEducationDegreesColumn(educationLevelsAndDegrees.filter((item) => !!item.broader)),
	getCollectionOrganisationColumn(organisations),
	{
		id: ACTIONS_TABLE_COLUMN_ID,
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
