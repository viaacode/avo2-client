import { Button, ButtonToolbar, IconName, TagList, type TagOption } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { compact } from 'lodash-es';
import React, { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { ASSIGNMENT_CREATE_UPDATE_TABS } from '../../../assignment/assignment.const';
import { type AssignmentOverviewTableColumns } from '../../../assignment/assignment.types';
import { getUserGroupLabel } from '../../../authentication/helpers/get-profile-info';
import { APP_PATH } from '../../../constants';
import { CollectionOrBundleOrAssignmentTitleAndCopyTag } from '../../../shared/components/CollectionOrBundleOrAssignmentTitleAndCopyTag/CollectionOrBundleOrAssignmentTitleAndCopyTag';
import { buildLink } from '../../../shared/helpers/build-link';
import { formatDate } from '../../../shared/helpers/formatters';
import { isContentBeingEdited } from '../../../shared/helpers/is-content-being-edited';
import { groupLomLinks } from '../../../shared/helpers/lom';
import { lomsToTagList } from '../../../shared/helpers/strings-to-taglist';
import { ACTIONS_TABLE_COLUMN_ID } from '../../../shared/helpers/table-column-list-to-csv-column-list';
import { tText } from '../../../shared/helpers/translate-text';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import { ADMIN_PATH } from '../../admin.const';

export function renderAssignmentOverviewTableCellReact(
	assignment: Partial<Avo.Assignment.Assignment>,
	columnId: AssignmentOverviewTableColumns,
	info: {
		editStatuses: Avo.Share.EditStatusResponse;
		commonUser: Avo.User.CommonUser;
	}
): ReactNode {
	const { id, created_at, updated_at, deadline_at } = assignment;
	const editLink = buildLink(APP_PATH.ASSIGNMENT_EDIT_TAB.route, {
		id,
		tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT,
	});
	const editLinkOriginal = assignment.relations?.[0].object
		? buildLink(APP_PATH.ASSIGNMENT_EDIT_TAB.route, {
				id: assignment.relations?.[0].object,
				tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT,
		  })
		: null;

	switch (columnId) {
		case 'title': {
			return (
				<CollectionOrBundleOrAssignmentTitleAndCopyTag
					title={assignment.title}
					editLink={editLink}
					editLinkOriginal={editLinkOriginal}
				/>
			);
		}

		case 'author':
			return truncateTableValue((assignment as any)?.owner?.full_name);

		case 'author_user_group':
			return (
				getUserGroupLabel(
					(assignment?.profile || assignment?.owner) as
						| Avo.User.Profile
						| { profile: Avo.User.Profile }
						| undefined
				) || '-'
			);

		case 'last_user_edit_profile': {
			// Multiple options because we are processing multiple views: collections, actualisation, quality_check and marcom
			return (
				assignment?.updated_by?.user?.full_name ||
				(assignment as any)?.last_user_edit_profile?.usersByuserId?.full_name ||
				'-'
			);
		}

		case 'created_at':
			return formatDate(created_at) || '-';

		case 'updated_at':
			return formatDate(updated_at) || '-';

		case 'deadline_at':
			return formatDate(deadline_at) || '-';

		case 'status':
			return !!assignment.deadline_at &&
				new Date(assignment.deadline_at).getTime() < new Date().getTime()
				? tText('admin/assignments/views/assignments-overview-admin___afgelopen')
				: tText('admin/assignments/views/assignments-overview-admin___actief');

		case 'subjects': {
			const groupedLoms = groupLomLinks(assignment.loms);
			return lomsToTagList(groupedLoms.subject) || '-';
		}

		case 'education_level_id': {
			const level = assignment.education_level?.label;

			if (!level) return '-';

			return (
				<TagList
					swatches={false}
					tags={[
						{
							id: level,
							label: level,
							color: undefined,
						},
					]}
				/>
			);
		}

		case 'education_levels': {
			const groupedLoms = groupLomLinks(assignment.loms);
			return lomsToTagList(groupedLoms.educationLevel) || '-';
		}

		case 'education_degrees': {
			const groupedLoms = groupLomLinks(assignment.loms);
			return lomsToTagList(groupedLoms.educationDegree) || '-';
		}

		case 'is_public':
			return assignment.is_public
				? tText('admin/assignments/views/assignments-overview-admin___ja')
				: tText('admin/assignments/views/assignments-overview-admin___nee');

		case 'quality_labels': {
			const labelObjects: { id: string; label: string }[] =
				assignment?.quality_labels?.map(({ label, id }) => {
					return {
						id: `${id}`,
						label,
					};
				}) || [];

			const tags: TagOption[] = compact(labelObjects);

			if (tags.length) {
				return <TagList tags={tags} swatches={false} />;
			}

			return '-';
		}

		case 'is_copy': {
			const relationObjectId = assignment?.relations?.[0]?.object;
			if (relationObjectId) {
				return (
					<a
						href={buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, {
							id: relationObjectId,
						})}
					>
						Ja
					</a>
				);
			}
			return 'Nee';
		}

		case 'responses': {
			const responsesLength = (assignment as any)?.responses_aggregate?.aggregate?.count || 0;
			if (responsesLength >= 1) {
				return (
					<Link
						to={buildLink(
							ADMIN_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW,
							{},
							{
								query: assignment.title || '',
								teacher: (assignment?.owner as any)?.profile_id as string,
							}
						)}
					>
						{responsesLength}
					</Link>
				);
			}

			return tText('admin/assignments/views/assignments-overview-admin___nvt');
		}

		case 'views':
			return assignment?.counts?.views || '0';

		case 'bookmarks':
			return assignment?.counts?.bookmarks || '0';

		case 'copies':
			return assignment?.counts?.copies || '0';

		case 'in_bundle':
			return assignment?.counts?.in_collection || '0';

		case 'contributors':
			return assignment?.counts?.contributors || '0';

		case ACTIONS_TABLE_COLUMN_ID: {
			if (!info.editStatuses) {
				return null;
			}
			const isAssignmentBeingEdited = isContentBeingEdited(
				info.editStatuses?.[assignment.id as string],
				info.commonUser?.profileId
			);
			const viewButtonTitle = tText(
				'admin/assignments/views/assignments-overview-admin___bekijk-deze-opdracht'
			);
			const editButtonTitle = isAssignmentBeingEdited
				? tText(
						'admin/assignments/views/assignments-overview-admin___deze-opdracht-wordt-reeds-bewerkt-door-iemand-anders'
				  )
				: tText(
						'admin/assignments/views/assignments-overview-admin___bewerk-deze-opdracht'
				  );
			return (
				<ButtonToolbar>
					<Link
						to={buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, {
							id: assignment.id,
						})}
					>
						<Button
							type="secondary"
							icon={IconName.eye}
							ariaLabel={viewButtonTitle}
							title={viewButtonTitle}
						/>
					</Link>

					{isAssignmentBeingEdited ? (
						<Button
							type="secondary"
							icon={IconName.edit}
							ariaLabel={editButtonTitle}
							title={editButtonTitle}
							disabled={true}
						/>
					) : (
						<Link to={editLink}>
							<Button
								type="secondary"
								icon={IconName.edit}
								ariaLabel={editButtonTitle}
								title={editButtonTitle}
							/>
						</Link>
					)}
				</ButtonToolbar>
			);
		}

		default:
			return truncateTableValue((assignment as any)[columnId]);
	}
}

export function renderAssignmentOverviewTableCellText(
	assignment: Partial<Avo.Assignment.Assignment>,
	columnId: AssignmentOverviewTableColumns
): string {
	const { created_at, updated_at, deadline_at } = assignment;

	switch (columnId) {
		case 'title': {
			return assignment.title || '';
		}

		case 'author':
			return (assignment as any)?.owner?.full_name || '';

		case 'author_user_group':
			return (
				getUserGroupLabel(
					(assignment?.profile || assignment?.owner) as
						| Avo.User.Profile
						| { profile: Avo.User.Profile }
						| undefined
				) || '-'
			);

		case 'last_user_edit_profile': {
			// Multiple options because we are processing multiple views: collections, actualisation, quality_check and marcom
			return (
				assignment?.updated_by?.user?.full_name ||
				(assignment as any)?.last_user_edit_profile?.usersByuserId?.full_name ||
				'-'
			);
		}

		case 'created_at':
			return formatDate(created_at) || '-';

		case 'updated_at':
			return formatDate(updated_at) || '-';

		case 'deadline_at':
			return formatDate(deadline_at) || '-';

		case 'status':
			return !!assignment.deadline_at &&
				new Date(assignment.deadline_at).getTime() < new Date().getTime()
				? tText('admin/assignments/views/assignments-overview-admin___afgelopen')
				: tText('admin/assignments/views/assignments-overview-admin___actief');

		case 'subjects': {
			const groupedLoms = groupLomLinks(assignment.loms);
			return groupedLoms?.subject?.join(', ') || '';
		}

		case 'education_level_id': {
			const level = assignment.education_level?.label;
			return level || '';
		}

		case 'education_levels': {
			const groupedLoms = groupLomLinks(assignment.loms);
			return groupedLoms.educationLevel?.join(', ') || '';
		}

		case 'education_degrees': {
			const groupedLoms = groupLomLinks(assignment.loms);
			return groupedLoms.educationDegree?.join(', ') || '';
		}

		case 'is_public':
			return assignment.is_public
				? tText('admin/assignments/views/assignments-overview-admin___ja')
				: tText('admin/assignments/views/assignments-overview-admin___nee');

		case 'quality_labels': {
			return (
				assignment?.quality_labels
					?.map(({ label }) => {
						return label;
					})
					?.join(', ') || ''
			);
		}

		case 'is_copy': {
			const relationObjectId = assignment?.relations?.[0]?.object;
			if (relationObjectId) {
				return 'Ja';
			}
			return 'Nee';
		}

		case 'responses': {
			const responsesLength = (assignment as any)?.responses_aggregate?.aggregate?.count || 0;
			if (responsesLength >= 1) {
				return String(responsesLength);
			}

			return tText('admin/assignments/views/assignments-overview-admin___nvt');
		}

		case 'views':
			return String(assignment?.counts?.views || 0);

		case 'bookmarks':
			return String(assignment?.counts?.bookmarks || 0);

		case 'copies':
			return String(assignment?.counts?.copies || 0);

		case 'in_bundle':
			return String(assignment?.counts?.in_collection || 0);

		case 'contributors':
			return String(assignment?.counts?.contributors || 0);

		case ACTIONS_TABLE_COLUMN_ID: {
			return '';
		}

		default:
			return (assignment as any)[columnId] || '';
	}
}
