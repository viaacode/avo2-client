import { get, isNil, without } from 'lodash-es';

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
import { CollectionTableStates, QualityCheckLabel } from '../collections-or-bundles.types';

function generateQualityCheckFilter(
	filters: Partial<CollectionTableStates>,
	prop: string,
	label: QualityCheckLabel
): any[] {
	const allLanguageCheckValues = get(filters, prop) || [];
	const languageCheckValues = without(allLanguageCheckValues, NULL_FILTER);
	const containsNullValue = allLanguageCheckValues.includes(NULL_FILTER);
	if (allLanguageCheckValues && allLanguageCheckValues.length) {
		const orFilters: any[] = languageCheckValues.map((value) => ({
			qc_status: { _eq: value },
		}));
		if (containsNullValue) {
			orFilters.push({ qc_status: { _is_null: true } });
		}
		return [
			{
				management: {
					QC: {
						qc_label: { _eq: label },
						_or: orFilters,
					},
				},
			},
		];
	}
	return [];
}

export function generateCollectionWhereObject(
	filters: Partial<CollectionTableStates>,
	user: Avo.User.User,
	isCollection: boolean,
	includeDeleted: boolean,
	checkPermissions: boolean
) {
	const andFilters: any[] = [];
	andFilters.push(
		...getQueryFilter(filters.query, (queryWildcard: string) => [
			{ title: { _ilike: queryWildcard } },
			{ description: { _ilike: queryWildcard } },
			{
				owner: {
					full_name: { _ilike: queryWildcard },
				},
			},
		])
	);
	andFilters.push(...getDateRangeFilters(filters, ['created_at', 'updated_at']));
	andFilters.push(...getMultiOptionFilters(filters, ['owner_profile_id']));
	andFilters.push(
		...getMultiOptionFilters(
			filters,
			['author_user_group'],
			['profile.profile_user_group.group.id']
		)
	);
	if (filters.collection_labels && filters.collection_labels.length) {
		andFilters.push({
			_or: [
				...getMultiOptionFilters(
					{
						collection_labels: without(filters.collection_labels, 'NO_LABEL'),
					},
					['collection_labels'],
					['collection_labels.label']
				),
				...(filters.collection_labels.includes('NO_LABEL')
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
						subjects: without(filters.collection_labels, 'NO_LABEL'),
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
						education_levels: without(filters.education_levels, 'NO_LABEL'),
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

	const isCopy = get(filters, 'is_copy');
	if (!isNil(isCopy)) {
		if (isCopy) {
			andFilters.push({
				relations: { predicate: { _eq: 'IS_COPY_OF' } },
			});
		} else {
			andFilters.push({
				_not: { relations: { predicate: { _eq: 'IS_COPY_OF' } } },
			});
		}
	}

	andFilters.push(...getBooleanFilters(filters, ['is_public']));

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
		...getMultiOptionFilters(filters, ['actualisation_status'], ['management.current_status'])
	);
	andFilters.push(
		...getMultiOptionFilters(
			filters,
			['actualisation_manager'],
			['management.manager_profile_id']
		)
	);
	andFilters.push(
		...getDateRangeFilters(
			filters,
			['actualisation_last_actualised_at'],
			['management.updated_at']
		)
	);
	andFilters.push(
		...getDateRangeFilters(
			filters,
			['actualisation_status_valid_until'],
			['management.status_valid_until']
		)
	);
	const approvedFilter = get(filters, 'actualisation_approved_at');
	if (get(approvedFilter, 'gte') || get(approvedFilter, 'lte')) {
		const dateFilters = getDateRangeFilters(
			filters,
			['actualisation_approved_at'],
			['QC.created_at']
		);
		andFilters.push({
			management: {
				QC: {
					qc_label: { _eq: 'EINDCHECK' },
					...dateFilters[0].management.QC,
				},
			},
		});
	}

	// Quality check filters
	andFilters.push(
		...generateQualityCheckFilter(filters, 'quality_check_language_check', 'TAALCHECK')
	);
	andFilters.push(
		...generateQualityCheckFilter(filters, 'quality_check_quality_check', 'KWALITEITSCHECK')
	);

	// Marcom filters
	// TODO after the database supports marcom fields

	return andFilters;
}
