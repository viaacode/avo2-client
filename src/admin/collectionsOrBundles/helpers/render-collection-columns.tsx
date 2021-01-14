import { compact, get, truncate } from 'lodash-es';
import React from 'react';

import { TagList, TagOption } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { getUserGroupLabel } from '../../../authentication/helpers/get-profile-info';
import { QualityLabel } from '../../../collection/collection.types';
import { APP_PATH } from '../../../constants';
import { buildLink } from '../../../shared/helpers';
import { formatDate } from '../../../shared/helpers/formatters';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import i18n from '../../../shared/translations/i18n';
import {
	CollectionOrBundleActualisationOverviewTableCols,
	CollectionOrBundleMarcomOverviewTableCols,
	CollectionOrBundleQualityCheckOverviewTableCols,
	CollectionsOrBundlesOverviewTableCols,
} from '../collections-or-bundles.types';

export const renderCollectionOverviewColumns = (
	rowData: Partial<Avo.Collection.Collection>,
	columnId:
		| CollectionsOrBundlesOverviewTableCols
		| CollectionOrBundleActualisationOverviewTableCols
		| CollectionOrBundleQualityCheckOverviewTableCols
		| CollectionOrBundleMarcomOverviewTableCols,
	collectionLabels: QualityLabel[]
) => {
	switch (columnId) {
		case 'owner_profile_id':
			const user: Avo.User.User | undefined = get(rowData, 'profile.user');
			return user ? truncateTableValue((user as any).full_name) : '-';

		case 'author_user_group':
			return getUserGroupLabel(get(rowData, 'profile')) || '-';

		case 'last_updated_by_profile':
			const lastEditUser: Avo.User.User | undefined = get(rowData, 'updated_by.user');
			return lastEditUser ? lastEditUser.full_name : '-';

		case 'is_public':
			return rowData[columnId]
				? i18n.t('admin/collections-or-bundles/views/collections-or-bundles-overview___ja')
				: i18n.t(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___nee'
				  );

		case 'views':
			return get(rowData, 'counts.views') || '0';

		case 'bookmarks':
			return get(rowData, 'counts.bookmarks') || '0';

		case 'copies':
			return get(rowData, 'counts.copies') || '0';

		case 'in_bundle':
			return get(rowData, 'counts.in_collection') || '0';

		case 'in_assignment':
			return get(rowData, 'counts.in_assignment') || '0';

		case 'created_at':
		case 'updated_at':
			return formatDate(rowData[columnId]) || '-';

		case 'collection_labels':
			const labels: { id: number; label: string }[] = get(rowData, 'collection_labels') || [];
			const tags: TagOption[] = compact(
				labels.map((labelObj: any): TagOption | null => {
					const prettyLabel = collectionLabels.find(
						(collectionLabel) => collectionLabel.value === labelObj.label
					);
					if (!prettyLabel) {
						return null;
					}
					return { label: prettyLabel.description, id: labelObj.id };
				})
			);
			if (tags.length) {
				return <TagList tags={tags} swatches={false} />;
			}

			return '-';

		case 'is_copy':
			if (!!get(rowData, 'relations[0].object')) {
				return (
					<a
						href={buildLink(APP_PATH.COLLECTION_DETAIL.route, {
							id: get(rowData, 'relations[0].object'),
						})}
					>
						Ja
					</a>
				);
			}
			return 'Nee';

		case 'actualisation_status':
			return get(rowData, 'management.current_status') || '-';

		case 'actualisation_last_actualised_at':
			return formatDate(get(rowData, 'management.actualised_at[0].updated_at')) || '-';

		case 'actualisation_status_valid_until':
			return formatDate(get(rowData, 'management.status_valid_until')) || '-';

		case 'actualisation_approved_at':
			return formatDate(get(rowData, 'management.approved_at[0].created_at')) || '-';

		case 'actualisation_manager':
			return get(rowData, 'management.manager.full_name') || '-';

		case 'quality_check_language_check':
			return get(rowData, 'management.language_check[0].qc_status') || '-';

		case 'quality_check_quality_check':
			return get(rowData, 'management.quality_check[0].qc_status') || '-';

		case 'quality_check_approved_at':
			return formatDate(get(rowData, 'management.approved_at[0].created_at')) || '-';

		default:
			return truncate((rowData as any)[columnId] || '-', { length: 50 });
	}
};
