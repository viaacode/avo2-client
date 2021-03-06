import { first, get, isNil, without } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import {
	PermissionName,
	PermissionService,
} from '../../../authentication/helpers/permission-service';
import { ContentTypeNumber } from '../../../collection/collection.types';
import {
	getBooleanFilters,
	getDateRangeFilters,
	getMultiOptionFilters,
	getMultiOptionsFilters,
	getQueryFilter,
	NULL_FILTER,
} from '../../shared/helpers/filters';
import { CollectionTableStates } from '../collections-or-bundles.types';

/**
 * Generates the filters for the collections and bundles screens and the actualisation, quality check and marcom screens
 * @param filters: the filter object containing the selected values. this is also stored in the url of the overview page
 * @param user
 * @param isCollection: switch between collection and bundles since they are loaded from the same table
 * @param includeDeleted: determines of a filter for omitting deleted collections should be added or not
 * @param checkPermissions: for the collection and bundle overview you need a specific permission
 * @param isCollectionTableOrView: small differences between the editorial views and the collection/bundle table are switched using this boolean
 */
export function generateCollectionWhereObject(
	filters: Partial<CollectionTableStates>,
	user: Avo.User.User,
	isCollection: boolean,
	includeDeleted: boolean,
	checkPermissions: boolean,
	isCollectionTableOrView: 'collectionTable' | 'view'
) {
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

	andFilters.push(
		...getMultiOptionFilters(
			filters,
			['author_user_group'],
			[
				isCollectionTable
					? 'profile.profile_user_group.group.id'
					: 'owner.profile.profile_user_group.group.id',
			]
		)
	);
	andFilters.push(...getDateRangeFilters(filters, ['created_at', 'updated_at']));
	andFilters.push(...getMultiOptionFilters(filters, ['owner_profile_id']));

	// TODO remove isCollectionTable after https://meemoo.atlassian.net/browse/DEV-1438
	if (filters.collection_labels && filters.collection_labels.length) {
		andFilters.push({
			_or: [
				...getMultiOptionFilters(
					{
						collection_labels: without(filters.collection_labels, NULL_FILTER),
					},
					['collection_labels'],
					[isCollectionTable ? 'collection_labels.label' : 'labels.label']
				),
				...(filters.collection_labels.includes(NULL_FILTER)
					? [{ _not: { collection_labels: {} } }]
					: []),
			],
		});
	}
	if (filters.subjects && filters.subjects.length) {
		andFilters.push({
			_or: [
				...getMultiOptionsFilters(
					{
						subjects: without(filters.subjects, NULL_FILTER),
					},
					['subjects'],
					['lom_classification']
				),
			],
		});
	}
	if (filters.education_levels && filters.education_levels.length) {
		andFilters.push({
			_or: [
				...getMultiOptionsFilters(
					{
						education_levels: without(filters.education_levels, NULL_FILTER),
					},
					['education_levels'],
					['lom_context']
				),
			],
		});
	}

	if (checkPermissions) {
		// Only show published/unpublished collections/bundles based on permissions
		if (
			(isCollection &&
				!PermissionService.hasPerm(user, PermissionName.VIEW_ANY_PUBLISHED_COLLECTIONS)) ||
			(!isCollection &&
				!PermissionService.hasPerm(user, PermissionName.VIEW_ANY_PUBLISHED_BUNDLES))
		) {
			andFilters.push({ is_public: { _eq: false } });
		}
		if (
			(isCollection &&
				!PermissionService.hasPerm(
					user,
					PermissionName.VIEW_ANY_UNPUBLISHED_COLLECTIONS
				)) ||
			(!isCollection &&
				!PermissionService.hasPerm(user, PermissionName.VIEW_ANY_UNPUBLISHED_BUNDLES))
		) {
			andFilters.push({ is_public: { _eq: true } });
		}
	}

	const isCopy = first(get(filters, 'is_copy'));

	if (!isNil(isCopy)) {
		if (isCopy === 'true') {
			andFilters.push({
				relations: { predicate: { _eq: 'IS_COPY_OF' } },
			});
		} else if (isCopy === 'false') {
			andFilters.push({
				_not: { relations: { predicate: { _eq: 'IS_COPY_OF' } } },
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
			['mgmt_quality_check', 'mgmt_language_check']
		)
	);

	// Marcom filters
	andFilters.push(...getBooleanFilters(filters, ['marcom_klascement'], ['klascement']));

	return andFilters;
}
