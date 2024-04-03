import { TagList, type TagOption } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { isBefore } from 'date-fns';
import { compact } from 'lodash-es';
import React from 'react';

import { getUserGroupLabel } from '../../../authentication/helpers/get-profile-info';
import {
	GET_MARCOM_CHANNEL_NAME_OPTIONS,
	GET_MARCOM_CHANNEL_TYPE_OPTIONS,
} from '../../../collection/collection.const';
import { type QualityLabel } from '../../../collection/collection.types';
import { booleanToOkNok } from '../../../collection/helpers/ok-nok-parser';
import { APP_PATH } from '../../../constants';
import { buildLink, formatDate } from '../../../shared/helpers';
import { groupLomLinks } from '../../../shared/helpers/lom';
import { lomsToTagList } from '../../../shared/helpers/strings-to-taglist';
import { tText } from '../../../shared/helpers/translate';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import { getCollectionManagementStatuses } from '../collections-or-bundles.const';
import { type CollectionTableCols, type ManagementStatus } from '../collections-or-bundles.types';

export const getDisplayTextForManagementStatus = (
	status: ManagementStatus | null | undefined
): string | null => {
	return (
		getCollectionManagementStatuses().find((option) => !!status && option.id === status)
			?.label || null
	);
};

export const renderCollectionOverviewColumns = (
	rowData: Partial<Avo.Collection.Collection>,
	columnId: CollectionTableCols,
	collectionLabels: QualityLabel[]
) => {
	switch (columnId) {
		case 'owner_profile_id': {
			const user: Avo.User.User | undefined = rowData?.profile?.user || rowData?.owner;
			return user ? truncateTableValue((user as any).full_name) : '-';
		}

		case 'author_user_group':
			return (
				getUserGroupLabel(
					(rowData?.profile || rowData?.owner) as
						| Avo.User.Profile
						| { profile: Avo.User.Profile }
						| undefined
				) || '-'
			);

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
			return rowData?.counts?.views || '0';

		case 'bookmarks':
			return rowData?.counts?.bookmarks || '0';

		case 'copies':
			return rowData?.counts?.copies || '0';

		case 'in_bundle':
			return rowData?.counts?.in_collection || '0';

		case 'in_assignment':
			return rowData?.counts?.in_assignment || '0';

		case 'quick_lane_links':
			return rowData?.counts?.quick_lane_links || '0';

		case 'contributors':
			return rowData?.counts?.contributors || '0';

		case 'created_at':
		case 'updated_at':
			return rowData[columnId] ? formatDate(new Date(rowData[columnId] as string)) : '-';

		case 'collection_labels': {
			const labelObjects: { id: number; label: string }[] = rowData?.collection_labels || [];

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

		case 'is_copy': {
			const relationObjectId = rowData?.relations?.[0]?.object;
			if (relationObjectId) {
				return (
					<a
						href={buildLink(APP_PATH.COLLECTION_DETAIL.route, {
							id: relationObjectId,
						})}
					>
						Ja
					</a>
				);
			}
			return 'Nee';
		}

		case 'education_levels': {
			const groupedLoms = groupLomLinks(rowData.loms);
			return (
				lomsToTagList([...groupedLoms.educationLevel, ...groupedLoms.educationDegree]) ||
				'-'
			);
		}

		case 'subjects': {
			const groupedLoms = groupLomLinks(rowData.loms);
			return lomsToTagList(groupedLoms.subject) || '-';
		}

		case 'themas': {
			const groupedLoms = groupLomLinks(rowData.loms);
			return lomsToTagList(groupedLoms.theme) || '-';
		}

		case 'actualisation_status':
			return (
				getDisplayTextForManagementStatus(
					rowData?.mgmt_current_status as ManagementStatus | undefined | null
				) || '-'
			);

		case 'actualisation_last_actualised_at':
			return formatDate(rowData?.mgmt_updated_at) || '-';

		case 'actualisation_status_valid_until': {
			const validDate = rowData?.mgmt_status_expires_at;
			const isValid = !validDate || !isBefore(new Date(validDate), new Date());
			return (
				<span className={isValid ? '' : 'a-table-cell__invalid'}>
					{formatDate(validDate) || '-'}
				</span>
			);
		}

		case 'actualisation_approved_at':
			return formatDate(rowData?.mgmt_last_eindcheck_date) || '-';

		case 'actualisation_manager':
			return rowData?.manager?.full_name || '-';

		case 'quality_check_language_check':
			return booleanToOkNok(rowData.mgmt_language_check) || '-';

		case 'quality_check_quality_check':
			return booleanToOkNok(rowData.mgmt_quality_check) || '-';

		case 'quality_check_approved_at':
			return formatDate(rowData?.mgmt_eind_check_date) || '-';

		case 'marcom_last_communication_channel_type': {
			const channelTypeId = rowData?.channel_type || '';
			return truncateTableValue(
				GET_MARCOM_CHANNEL_TYPE_OPTIONS().find((option) => option.value === channelTypeId)
					?.label
			);
		}

		case 'marcom_last_communication_channel_name': {
			const channelNameId = rowData?.channel_name || '';
			return truncateTableValue(
				GET_MARCOM_CHANNEL_NAME_OPTIONS().find((option) => option.value === channelNameId)
					?.label
			);
		}

		case 'marcom_last_communication_at':
			return formatDate(rowData?.last_marcom_date) || '-';

		case 'marcom_klascement':
			return rowData?.klascement ? 'Ja' : 'Nee';

		case 'organisation':
			return rowData?.owner?.profile?.organisation?.name || '-';

		default:
			return truncateTableValue((rowData as any)[columnId]);
	}
};
