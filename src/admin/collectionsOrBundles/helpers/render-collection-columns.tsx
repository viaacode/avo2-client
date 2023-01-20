import { TagList, TagOption } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { compact, get } from 'lodash-es';
import moment from 'moment';
import React from 'react';

import { getUserGroupLabel } from '../../../authentication/helpers/get-profile-info';
import {
	GET_MARCOM_CHANNEL_NAME_OPTIONS,
	GET_MARCOM_CHANNEL_TYPE_OPTIONS,
} from '../../../collection/collection.const';
import { QualityLabel } from '../../../collection/collection.types';
import { booleanToOkNok } from '../../../collection/helpers/ok-nok-parser';
import { APP_PATH } from '../../../constants';
import { Lookup_Enum_Collection_Management_Qc_Label_Enum } from '../../../shared/generated/graphql-db-types';
import { buildLink, formatDate, normalizeTimestamp } from '../../../shared/helpers';
import { stringsToTagList } from '../../../shared/helpers/strings-to-taglist';
import { tText } from '../../../shared/helpers/translate';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import { getCollectionManagementStatuses } from '../collections-or-bundles.const';
import { CollectionTableCols, ManagementStatus } from '../collections-or-bundles.types';

export const getDisplayTextForManagementStatus = (status?: ManagementStatus): string | null => {
	return (
		get(
			getCollectionManagementStatuses().find((option) => option.id === status),
			'label'
		) || null
	);
};

export const renderCollectionOverviewColumns = (
	rowData: Partial<Avo.Collection.Collection>,
	columnId: CollectionTableCols,
	collectionLabels: QualityLabel[]
) => {
	switch (columnId) {
		case 'owner_profile_id': {
			const user: Avo.User.User | undefined =
				get(rowData, 'profile.user') || get(rowData, 'owner');
			return user ? truncateTableValue((user as any).full_name) : '-';
		}

		case 'author_user_group':
			return getUserGroupLabel(get(rowData, 'profile') || get(rowData, 'owner')) || '-';

		case 'last_updated_by_profile': {
			// Multiple options because we are processing multiple views: collections, actualisation, quality_check and marcom
			return (
				rowData?.updated_by?.user?.full_name ||
				(rowData as any)?.last_editor?.full_name ||
				(rowData as any)?.last_editor_name ||
				'-'
			);
		}

		case 'is_public':
		case 'is_managed':
			return rowData[columnId]
				? tText('admin/collections-or-bundles/views/collections-or-bundles-overview___ja')
				: tText('admin/collections-or-bundles/views/collections-or-bundles-overview___nee');

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

		case 'quick_lane_links':
			return get(rowData, 'counts.quick_lane_links') || '0';

		case 'created_at':
		case 'updated_at':
			return formatDate(rowData[columnId]) || '-';

		case 'collection_labels': {
			const labelObjects: { id: number; label: string }[] =
				get(rowData, 'collection_labels') || [];

			const tags: TagOption[] = compact(
				labelObjects.map((labelObj: any): TagOption | null => {
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
		}

		case 'is_copy':
			if (get(rowData, 'relations[0].object')) {
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

		case 'education_levels':
		case 'subjects': {
			const labels = get(rowData, columnId, []);
			return stringsToTagList(labels, null) || '-';
		}

		case 'actualisation_status':
			return getDisplayTextForManagementStatus(get(rowData, 'mgmt_current_status')) || '-';

		case 'actualisation_last_actualised_at':
			return formatDate(get(rowData, 'mgmt_updated_at')) || '-';

		case 'actualisation_status_valid_until': {
			const validDate = get(rowData, 'mgmt_status_expires_at');
			const isValid = !validDate || !normalizeTimestamp(validDate).isBefore(moment());
			return (
				<span className={isValid ? '' : 'a-table-cell__invalid'}>
					{formatDate(validDate) || '-'}
				</span>
			);
		}

		case 'actualisation_approved_at':
			return formatDate(get(rowData, 'mgmt_last_eindcheck_date')) || '-';

		case 'actualisation_manager':
			return get(rowData, 'manager.full_name') || '-';

		case 'quality_check_language_check':
			return (
				booleanToOkNok(
					!!rowData.management?.QC?.find(
						(item) =>
							item.qc_label ===
							Lookup_Enum_Collection_Management_Qc_Label_Enum.Taalcheck
					)?.qc_status
				) || '-'
			);

		case 'quality_check_quality_check':
			return (
				booleanToOkNok(
					!!rowData.management?.QC?.find(
						(item) =>
							item.qc_label ===
							Lookup_Enum_Collection_Management_Qc_Label_Enum.Kwaliteitscheck
					)?.qc_status
				) || '-'
			);

		case 'quality_check_approved_at':
			return formatDate(get(rowData, 'mgmt_eind_check_date')) || '-';

		case 'marcom_last_communication_channel_type': {
			const channelTypeId = get(rowData, 'channel_type') || '';
			return truncateTableValue(
				get(
					GET_MARCOM_CHANNEL_TYPE_OPTIONS().find(
						(option) => option.value === channelTypeId
					),
					'label'
				)
			);
		}

		case 'marcom_last_communication_channel_name': {
			const channelNameId = get(rowData, 'channel_name') || '';
			return truncateTableValue(
				get(
					GET_MARCOM_CHANNEL_NAME_OPTIONS().find(
						(option) => option.value === channelNameId
					),
					'label'
				)
			);
		}

		case 'marcom_last_communication_at':
			return formatDate(get(rowData, 'last_marcom_date')) || '-';

		case 'marcom_klascement':
			return get(rowData, 'klascement') ? 'Ja' : 'Nee';

		case 'organisation':
			return get(rowData, 'owner.profile.organisation.name');

		default:
			return truncateTableValue((rowData as any)[columnId]);
	}
};
