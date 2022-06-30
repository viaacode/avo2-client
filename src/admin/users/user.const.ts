import { ButtonType, SelectOption } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { CheckboxDropdownModalProps, CheckboxOption } from '../../shared/components';
import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { FilterableColumn } from '../shared/components/FilterTable/FilterTable';
import { NULL_FILTER } from '../shared/helpers/filters';

import { UserBulkAction, UserOverviewTableCol } from './user.types';

export const USER_PATH = {
	USER_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.user}`,
	USER_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.user}/:id`,
	USER_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.user}/:id/${ROUTE_PARTS.edit}`,
};

export const ITEMS_PER_PAGE = 50;

export const GET_USER_OVERVIEW_TABLE_COLS: (
	user: Avo.User.User | undefined,
	userGroupOptions: CheckboxOption[],
	companyOptions: CheckboxOption[],
	businessCategoryOptions: CheckboxOption[],
	educationLevels: CheckboxOption[],
	subjects: CheckboxOption[],
	idps: CheckboxOption[]
) => FilterableColumn[] = (
	user: Avo.User.User | undefined,
	userGroupOptions: CheckboxOption[],
	companyOptions: CheckboxOption[],
	businessCategoryOptions: CheckboxOption[],
	educationLevels: CheckboxOption[],
	subjects: CheckboxOption[],
	idps: CheckboxOption[]
) => [
	{
		id: 'id',
		label: i18n.t('admin/users/user___id'),
		sortable: false,
		visibleByDefault: false,
	},
	{
		id: 'first_name',
		label: i18n.t('admin/users/user___voornaam'),
		sortable: true,
		visibleByDefault: true,
		dataType: TableColumnDataType.string,
	},
	{
		id: 'last_name',
		label: i18n.t('admin/users/user___achternaam'),
		sortable: true,
		visibleByDefault: true,
		dataType: TableColumnDataType.string,
	},
	{
		id: 'mail',
		label: i18n.t('admin/users/user___email'),
		sortable: true,
		visibleByDefault: true,
		dataType: TableColumnDataType.string,
	},
	{
		id: 'user_group',
		label: i18n.t('admin/users/user___gebruikersgroep'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'CheckboxDropdownModal',
		filterProps: {
			options: [
				...userGroupOptions,
				{ label: i18n.t('admin/users/user___leeg'), id: NULL_FILTER },
			],
		} as CheckboxDropdownModalProps,
		dataType: TableColumnDataType.string,
	},
	{
		id: 'business_category',
		label: i18n.t('admin/users/user___oormerk'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'CheckboxDropdownModal',
		filterProps: {
			options: [
				...businessCategoryOptions,
				{ label: i18n.t('admin/users/user___leeg'), id: NULL_FILTER },
			],
		} as CheckboxDropdownModalProps,
		dataType: TableColumnDataType.string,
	},
	{
		id: 'is_exception',
		label: i18n.t('admin/users/user___uitzonderingsaccount'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'BooleanCheckboxDropdown',
		dataType: TableColumnDataType.boolean,
	},
	{
		id: 'is_blocked',
		label: i18n.t('admin/users/user___geblokkeerd'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'BooleanCheckboxDropdown',
		dataType: TableColumnDataType.boolean,
	},
	{
		id: 'blocked_at',
		label: i18n.t('admin/users/user___geblokkeerd-op'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'DateRangeDropdown',
		dataType: TableColumnDataType.dateTime,
	},
	{
		id: 'unblocked_at',
		label: i18n.t('admin/users/user___ongeblokkeerd-op'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'DateRangeDropdown',
		dataType: TableColumnDataType.dateTime,
	},
	...((PermissionService.hasPerm(user, PermissionName.EDIT_USER_TEMP_ACCESS)
		? [
				{
					id: 'temp_access',
					label: i18n.t('admin/users/user___tijdelijke-toegang'),
					sortable: true,
					visibleByDefault: false,
					filterType: 'CheckboxDropdownModal',
					filterProps: {
						options: [
							{ label: i18n.t('admin/users/user___tijdelijke-toegang-ja'), id: '1' },
							{ label: i18n.t('admin/users/user___tijdelijke-toegang-nee'), id: '0' },
						],
					} as CheckboxDropdownModalProps,
					dataType: TableColumnDataType.booleanNullsLast, // Users without a value are always last when sorting
				},
				{
					id: 'temp_access_from',
					label: i18n.t('admin/users/user___te-deblokkeren-op'),
					sortable: true,
					visibleByDefault: false,
					dataType: TableColumnDataType.dateTime,
				},
				{
					id: 'temp_access_until',
					label: i18n.t('admin/users/user___te-blokkeren-op'),
					sortable: true,
					visibleByDefault: false,
					dataType: TableColumnDataType.dateTime,
				},
		  ]
		: []) as FilterableColumn[]),
	{
		id: 'stamboek',
		label: i18n.t('admin/users/user___stamboek'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'BooleanCheckboxDropdown',
		dataType: TableColumnDataType.number,
	},
	{
		id: 'organisation',
		label: i18n.t('admin/users/user___organisatie'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'CheckboxDropdownModal',
		filterProps: {
			options: [
				...companyOptions,
				{ label: i18n.t('admin/users/user___leeg'), id: NULL_FILTER },
			],
		} as CheckboxDropdownModalProps,
		dataType: TableColumnDataType.string,
	},
	{
		id: 'created_at',
		label: i18n.t('admin/users/user___gebruiker-sinds'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'DateRangeDropdown',
		dataType: TableColumnDataType.dateTime,
	},
	{
		id: 'last_access_at',
		label: i18n.t('admin/users/user___laatste-toegang'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'DateRangeDropdown',
		dataType: TableColumnDataType.dateTime,
	},
	{
		id: 'education_levels',
		label: i18n.t('admin/users/user___onderwijs-niveaus'),
		sortable: false,
		visibleByDefault: false,
		filterType: 'CheckboxDropdownModal',
		filterProps: {
			options: [
				...educationLevels,
				{ label: i18n.t('admin/users/user___leeg'), id: NULL_FILTER },
			],
		} as CheckboxDropdownModalProps,
	},
	{
		id: 'subjects',
		label: i18n.t('admin/users/user___vakken'),
		sortable: false,
		visibleByDefault: false,
		filterType: 'CheckboxDropdownModal',
		filterProps: {
			options: [...subjects, { label: i18n.t('admin/users/user___leeg'), id: NULL_FILTER }],
		} as CheckboxDropdownModalProps,
	},
	{
		id: 'idps',
		label: i18n.t('admin/users/user___toegang-via'),
		sortable: false,
		visibleByDefault: false,
		filterType: 'CheckboxDropdownModal',
		filterProps: {
			options: [...idps, { label: i18n.t('admin/users/user___leeg'), id: NULL_FILTER }],
		} as CheckboxDropdownModalProps,
	},
	{
		id: 'educational_organisations',
		label: i18n.t('admin/users/user___educatieve-organisaties'),
		sortable: false,
		visibleByDefault: false,
		filterType: 'MultiEducationalOrganisationSelectModal',
	},
];

export const TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<
	{
		[columnId in UserOverviewTableCol]: (order: Avo.Search.OrderDirection) => any;
	}
> = {
	first_name: (order: Avo.Search.OrderDirection) => ({
		first_name_lower: order,
	}),
	last_name: (order: Avo.Search.OrderDirection) => ({
		last_name_lower: order,
	}),
	mail: (order: Avo.Search.OrderDirection) => ({
		mail: order,
	}),
	user_group: (order: Avo.Search.OrderDirection) => ({
		group_name: order,
	}),
	business_category: (order: Avo.Search.OrderDirection) => ({
		business_category: order,
	}),
	is_blocked: (order: Avo.Search.OrderDirection) => ({
		is_blocked: order,
	}),
	blocked_at: (order: Avo.Search.OrderDirection) => ({
		blocked_at: {
			max: order,
		},
	}),
	unblocked_at: (order: Avo.Search.OrderDirection) => ({
		unblocked_at: {
			max: order,
		},
	}),
	stamboek: (order: Avo.Search.OrderDirection) => ({
		stamboek: order,
	}),
	organisation: (order: Avo.Search.OrderDirection) => ({
		company_name: order,
	}),
	created_at: (order: Avo.Search.OrderDirection) => ({
		acc_created_at: order,
	}),
	last_access_at: (order: Avo.Search.OrderDirection) => ({
		last_access_at: order,
	}),
	temp_access: (order: Avo.Search.OrderDirection) => ({
		user: { temp_access: { current: { status: order } } },
	}),
	temp_access_from: (order: Avo.Search.OrderDirection) => ({
		user: { temp_access: { from: order } },
	}),
	temp_access_until: (order: Avo.Search.OrderDirection) => ({
		user: { temp_access: { until: order } },
	}),
};

type UserDeleteRadioOption = { label: string; value: Avo.User.UserDeleteOption };
export const GET_DELETE_RADIO_OPTIONS = (): UserDeleteRadioOption[] => {
	return [
		{
			label: i18n.t('admin/users/user___verwijder-alle-content'),
			value: 'DELETE_ALL',
		},
		{
			label: i18n.t('admin/users/user___anonimiseer-de-publieke-content-verwijder-de-rest'),
			value: 'ANONYMIZE_PUBLIC',
		},
		{
			label: i18n.t(
				'admin/users/user___verwijder-prive-content-behoud-publieke-content-met-de-naam-van-de-gebruiker'
			),
			value: 'DELETE_PRIVATE_KEEP_NAME',
		},
		{
			label: i18n.t(
				'admin/users/user___zet-publieke-content-over-naar-een-andere-gebruiker-verwijder-de-rest'
			),
			value: 'TRANSFER_PUBLIC',
		},
		{
			label: i18n.t('admin/users/user___zet-alle-content-over-naar-een-andere-gebruiker'),
			value: 'TRANSFER_ALL',
		},
	];
};

type UserBulkActionOption = SelectOption<UserBulkAction> & {
	confirm?: boolean;
	confirmButtonType?: ButtonType;
};
export const GET_USER_BULK_ACTIONS = (user: Avo.User.User | undefined): UserBulkActionOption[] => {
	if (!user) {
		return [];
	}
	const actions: UserBulkActionOption[] = [];

	if (PermissionService.hasPerm(user, PermissionName.EDIT_ANY_USER)) {
		actions.push({
			label: i18n.t('admin/users/user___blokkeren'),
			value: 'block',
		});
		actions.push({
			label: i18n.t('admin/users/user___deblokkeren'),
			value: 'unblock',
		});
	}
	if (PermissionService.hasPerm(user, PermissionName.DELETE_ANY_USER)) {
		actions.push({
			label: i18n.t('admin/users/user___verwijderen'),
			value: 'delete',
		});
	}
	if (PermissionService.hasPerm(user, PermissionName.EDIT_ANY_USER)) {
		actions.push({
			label: i18n.t('admin/users/user___vakken-aanpassen'),
			value: 'change_subjects',
		});
	}
	actions.push({
		label: i18n.t('admin/users/user___exporteren'),
		value: 'export',
	});

	return actions;
};
