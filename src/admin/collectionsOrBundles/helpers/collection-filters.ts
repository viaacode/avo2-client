import { type Avo, PermissionName } from '@viaa/avo2-types';
import { first, get, isNil, without } from 'lodash-es';

import { PermissionService } from '../../../authentication/helpers/permission-service';
import { ContentTypeNumber } from '../../../collection/collection.types';
import { Lookup_Enum_Relation_Types_Enum } from '../../../shared/generated/graphql-db-types';
import { EducationLevelType } from '../../../shared/helpers/lom';
import {
	generateLomFilter,
	getBooleanFilters,
	getDateRangeFilters,
	getMultiOptionFilters,
	getMultiOptionsFilters,
	getQueryFilter,
	NULL_FILTER,
} from '../../shared/helpers/filters';
import {
	type CollectionOrBundleMarcomTableState,
	type CollectionTableStates,
} from '../collections-or-bundles.types';

/**
 * Generates the filters for the collections and bundles screens and the actualisation, quality check and marcom screens
 * @param filters the filter object containing the selected values. this is also stored in the url of the overview page
 * @param commonUser
 * @param isCollection switch between collection and bundles since they are loaded from the same table
 * @param includeDeleted determines of a filter for omitting deleted collections should be added or not
 * @param checkPermissions for the collection and bundle overview you need a specific permission
 * @param isCollectionTableOrView small differences between the editorial views and the collection/bundle table are switched using this boolean
 */
export function generateCollectionWhereObject(
	filters: Partial<CollectionTableStates>,
	commonUser: Avo.User.CommonUser | null,
	isCollection: boolean,
	includeDeleted: boolean,
	checkPermissions: boolean,
	isCollectionTableOrView: 'collectionTable' | 'view'
): any {
	const isCollectionTable: boolean = isCollectionTableOrView === 'collectionTable';
	const andFilters: any[] = [];

	andFilters.push(
		...getQueryFilter(filters.query, (queryWildcard: string) => [
			{ title: { _ilike: queryWildcard } },
			...(isCollectionTable ? [{ description: { _ilike: queryWildcard } }] : []),
			{
				owner: {
					full_name: { _ilike: queryWildcard },
				},
			},
		])
	);

	if (filters.author_user_group && filters.author_user_group.length) {
		const defaultGroupFilter = {
			profile: {
				profile_user_group: {
					group: {
						id: {
							_in: without(filters.author_user_group, NULL_FILTER),
						},
					},
				},
			},
		};
		const defaultNullFilter = { profile: { _not: { profile_user_groups: {} } } };

		const groupFilter = isCollectionTable
			? [defaultGroupFilter]
			: [{ owner: defaultGroupFilter }];
		const nullFilter = isCollectionTable ? defaultNullFilter : { owner: defaultNullFilter };

		andFilters.push({
			_or: [
				...groupFilter,
				...(filters.author_user_group.includes(NULL_FILTER) ? [nullFilter] : []),
			],
		});
	}

	andFilters.push(...getDateRangeFilters(filters, ['created_at', 'updated_at']));
	andFilters.push(...getMultiOptionFilters(filters, ['owner_profile_id']));

	if (filters.collection_labels && filters.collection_labels.length) {
		const filterKey = isCollectionTable ? 'collection_labels' : 'labels';

		andFilters.push({
			_or: [
				{
					[filterKey]: {
						label: {
							_in: filters.collection_labels,
						},
					},
				},
				...(filters.collection_labels.includes(NULL_FILTER)
					? [{ _not: { [filterKey]: {} } }]
					: []),
			],
		});
	}

	if (filters.subjects && filters.subjects.length) {
		andFilters.push(generateLomFilter(filters.subjects, EducationLevelType.vak));
	}

	// // Enable when meemoo requests a column and folder for lom themes
	// if (filters.themes && filters.themes.length) {
	// 	andFilters.push(
	// 		generateLomFilter(filters.themes, EducationLevelType.thema)
	// 	);
	// }

	if (filters.education_levels && filters.education_levels.length) {
		andFilters.push(generateLomFilter(filters.education_levels, EducationLevelType.structuur));
	}

	if (filters.organisation && filters.organisation.length) {
		andFilters.push(
			...getMultiOptionsFilters(
				{
					organisation: filters.organisation,
				},
				['organisation'],
				['owner.profile.organisation'],
				['or_id'],
				true
			)
		);
	}

	if (checkPermissions) {
		// Only show published/unpublished collections/bundles based on permissions
		if (
			(isCollection &&
				!PermissionService.hasPerm(
					commonUser,
					PermissionName.VIEW_ANY_PUBLISHED_COLLECTIONS
				)) ||
			(!isCollection &&
				!PermissionService.hasPerm(commonUser, PermissionName.VIEW_ANY_PUBLISHED_BUNDLES))
		) {
			andFilters.push({ is_public: { _eq: false } });
		}
		if (
			(isCollection &&
				!PermissionService.hasPerm(
					commonUser,
					PermissionName.VIEW_ANY_UNPUBLISHED_COLLECTIONS
				)) ||
			(!isCollection &&
				!PermissionService.hasPerm(commonUser, PermissionName.VIEW_ANY_UNPUBLISHED_BUNDLES))
		) {
			andFilters.push({ is_public: { _eq: true } });
		}
	}

	const isCopy = first(get(filters, 'is_copy'));

	if (!isNil(isCopy)) {
		if (isCopy === 'true') {
			andFilters.push({
				relations: { predicate: { _eq: Lookup_Enum_Relation_Types_Enum.IsCopyOf } },
			});
		} else if (isCopy === 'false') {
			andFilters.push({
				_not: {
					relations: { predicate: { _eq: Lookup_Enum_Relation_Types_Enum.IsCopyOf } },
				},
			});
		}
	}

	andFilters.push(...getBooleanFilters(filters, ['is_public', 'is_managed']));

	if (!includeDeleted) {
		andFilters.push({ is_deleted: { _eq: false } });
	}

	andFilters.push({
		type_id: {
			_eq: isCollection ? ContentTypeNumber.collection : ContentTypeNumber.bundle,
		},
	});

	// Actualisation filters
	andFilters.push(
		...getMultiOptionFilters(filters, ['actualisation_status'], ['mgmt_current_status'])
	);
	andFilters.push(
		...getMultiOptionFilters(filters, ['actualisation_manager'], ['manager.profile_id'])
	);
	andFilters.push(
		...getDateRangeFilters(filters, ['actualisation_last_actualised_at'], ['mgmt_updated_at'])
	);
	andFilters.push(
		...getDateRangeFilters(
			filters,
			['actualisation_status_valid_until'],
			['mgmt_status_expires_at']
		)
	);
	const approvedFilter = get(filters, 'actualisation_approved_at');
	if (get(approvedFilter, 'gte') || get(approvedFilter, 'lte')) {
		andFilters.push(
			...getDateRangeFilters(
				filters,
				['actualisation_approved_at'],
				['mgmt_last_eindcheck_date']
			)
		);
	}

	// Quality check filters
	andFilters.push(
		...getBooleanFilters(
			filters,
			['quality_check_language_check', 'quality_check_quality_check'],
			['mgmt_language_check', 'mgmt_quality_check']
		)
	);

	// Marcom filters
	const marcomFilters = filters as CollectionOrBundleMarcomTableState;

	if (marcomFilters?.marcom_last_communication_channel_name?.length) {
		andFilters.push({
			_or: [
				{
					channel_name: {
						_in: marcomFilters.marcom_last_communication_channel_name,
					},
				},
				...(marcomFilters.marcom_last_communication_channel_name.includes(NULL_FILTER)
					? [{ channel_name: { _is_null: true } }]
					: []),
			],
		});
	}

	if (marcomFilters?.marcom_last_communication_channel_type?.length) {
		andFilters.push({
			_or: [
				{
					channel_type: {
						_in: marcomFilters.marcom_last_communication_channel_type,
					},
				},
			],
		});
	}

	andFilters.push(...getBooleanFilters(filters, ['marcom_klascement'], ['klascement']));

	return andFilters;
}
