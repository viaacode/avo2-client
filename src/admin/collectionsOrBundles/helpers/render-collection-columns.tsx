import {
  Button,
  ButtonToolbar,
  IconName,
  TagList,
  type TagOption,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { isBefore } from 'date-fns';
import { compact } from 'es-toolkit';
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { ASSIGNMENT_CREATE_UPDATE_TABS } from '../../../assignment/assignment.const';
import { getUserGroupLabel } from '../../../authentication/helpers/get-profile-info';
import {
  GET_MARCOM_CHANNEL_NAME_OPTIONS,
  GET_MARCOM_CHANNEL_TYPE_OPTIONS,
} from '../../../collection/collection.const';
import {
  CollectionCreateUpdateTab,
  type QualityLabel,
} from '../../../collection/collection.types';
import { booleanToOkNok } from '../../../collection/helpers/ok-nok-parser';
import { APP_PATH } from '../../../constants';
import { CollectionOrBundleOrAssignmentTitleAndCopyTag } from '../../../shared/components/CollectionOrBundleOrAssignmentTitleAndCopyTag/CollectionOrBundleOrAssignmentTitleAndCopyTag';
import { buildLink } from '../../../shared/helpers/build-link';
import { formatDate } from '../../../shared/helpers/formatters/date';
import { isContentBeingEdited } from '../../../shared/helpers/is-content-being-edited';
import { groupLomLinks } from '../../../shared/helpers/lom';
import { lomsToTagList } from '../../../shared/helpers/strings-to-taglist';
import { ACTIONS_TABLE_COLUMN_ID } from '../../../shared/helpers/table-column-list-to-csv-column-list';
import { tText } from '../../../shared/helpers/translate-text';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import { getCollectionManagementStatuses } from '../collections-or-bundles.const';
import {
  type CollectionOrBundleActualisationOverviewTableCols,
  type CollectionOrBundleMarcomOverviewTableCols,
  type CollectionOrBundleQualityCheckOverviewTableCols,
  type CollectionsOrBundlesOverviewTableCols,
  type CollectionTableColumns,
  type ManagementStatus,
} from '../collections-or-bundles.types';

const getDisplayTextForManagementStatus = (
  status: ManagementStatus | null | undefined,
): string | null => {
  return (
    getCollectionManagementStatuses().find(
      (option) => !!status && option.id === status,
    )?.label || null
  );
};

export function renderCollectionsOrBundlesOverviewCellReact(
  collectionOrBundle: Partial<Avo.Collection.Collection>,
  columnId: CollectionsOrBundlesOverviewTableCols,
  info: {
    isCollection: boolean;
    allQualityLabels: QualityLabel[];
    editStatuses: Avo.Share.EditStatusResponse;
    commonUser: Avo.User.CommonUser | null;
  },
): ReactNode {
  const editLink = buildLink(
    info.isCollection
      ? APP_PATH.COLLECTION_EDIT_TAB.route
      : APP_PATH.BUNDLE_EDIT_TAB.route,
    {
      id: collectionOrBundle.id,
      tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT,
    },
  );
  const editLinkOriginal = collectionOrBundle.relations?.[0].object
    ? buildLink(
        info.isCollection
          ? APP_PATH.COLLECTION_EDIT_TAB.route
          : APP_PATH.BUNDLE_EDIT_TAB.route,
        {
          id: collectionOrBundle.relations?.[0].object,
          tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT,
        },
      )
    : null;

  switch (columnId) {
    case 'title': {
      return (
        <CollectionOrBundleOrAssignmentTitleAndCopyTag
          title={collectionOrBundle.title}
          editLink={editLink}
          editLinkOriginal={editLinkOriginal}
        />
      );
    }

    case ACTIONS_TABLE_COLUMN_ID: {
      if (!info.editStatuses) {
        return null;
      }
      const isCollectionBeingEdited = isContentBeingEdited(
        info.editStatuses?.[collectionOrBundle.id as string],
        info.commonUser?.profileId,
      );
      const viewButtonTitle = info.isCollection
        ? tText(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___bekijk-de-collectie',
          )
        : tText(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___bekijk-de-bundel',
          );
      const editButtonTitle = isCollectionBeingEdited
        ? tText(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___deze-collectie-wordt-reeds-bewerkt-door-iemand-anders',
          )
        : info.isCollection
          ? tText(
              'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-collectie',
            )
          : tText(
              'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-bundel',
            );
      return (
        <ButtonToolbar>
          <Link
            to={buildLink(
              info.isCollection
                ? APP_PATH.COLLECTION_DETAIL.route
                : APP_PATH.BUNDLE_DETAIL.route,
              {
                id: collectionOrBundle.id,
              },
            )}
          >
            <Button
              type="secondary"
              icon={IconName.eye}
              ariaLabel={viewButtonTitle}
              title={viewButtonTitle}
            />
          </Link>

          {isCollectionBeingEdited ? (
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
      return renderCollectionCellReact(collectionOrBundle, columnId, info);
  }
}

export function renderCollectionsOrBundlesOverviewCellText(
  collectionOrBundle: Partial<Avo.Collection.Collection>,
  columnId: CollectionsOrBundlesOverviewTableCols,
  info: {
    isCollection: boolean;
    allQualityLabels: QualityLabel[];
    editStatuses: Avo.Share.EditStatusResponse;
    commonUser: Avo.User.CommonUser | null;
  },
): string {
  switch (columnId) {
    case 'title':
      return collectionOrBundle.title || '';

    case ACTIONS_TABLE_COLUMN_ID:
      return '';

    default:
      return renderCollectionCellText(collectionOrBundle, columnId, info);
  }
}

export function renderCollectionsOrBundleActualisationCellReact(
  collectionOrBundle: Partial<Avo.Collection.Collection>,
  columnId: CollectionOrBundleActualisationOverviewTableCols,
  info: {
    isCollection: boolean;
    allQualityLabels: QualityLabel[];
    editStatuses: Avo.Share.EditStatusResponse;
    commonUser: Avo.User.CommonUser | null;
  },
) {
  const editLink = buildLink(
    info.isCollection
      ? APP_PATH.COLLECTION_EDIT_TAB.route
      : APP_PATH.BUNDLE_EDIT_TAB.route,
    {
      id: collectionOrBundle.id,
      tabId: CollectionCreateUpdateTab.ACTUALISATION,
    },
  );
  const editLinkOriginal = collectionOrBundle.relations?.[0].object
    ? buildLink(
        info.isCollection
          ? APP_PATH.COLLECTION_EDIT_TAB.route
          : APP_PATH.BUNDLE_EDIT_TAB.route,
        {
          id: collectionOrBundle.relations?.[0].object,
          tabId: CollectionCreateUpdateTab.ACTUALISATION,
        },
      )
    : null;

  switch (columnId) {
    case 'title': {
      return (
        <CollectionOrBundleOrAssignmentTitleAndCopyTag
          title={collectionOrBundle.title}
          editLink={editLink}
          editLinkOriginal={editLinkOriginal}
        />
      );
    }

    case ACTIONS_TABLE_COLUMN_ID:
      return (
        <ButtonToolbar>
          <Link to={editLink}>
            <Button
              type="secondary"
              icon={IconName.edit}
              ariaLabel={
                info.isCollection
                  ? tText(
                      'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-collectie',
                    )
                  : tText(
                      'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-bundel',
                    )
              }
              title={
                info.isCollection
                  ? tText(
                      'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-collectie',
                    )
                  : tText(
                      'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-bundel',
                    )
              }
            />
          </Link>
        </ButtonToolbar>
      );

    default:
      return renderCollectionCellReact(collectionOrBundle, columnId, info);
  }
}

export function renderCollectionsOrBundleActualisationCellText(
  collectionOrBundle: Partial<Avo.Collection.Collection>,
  columnId: CollectionOrBundleActualisationOverviewTableCols,
  info: {
    isCollection: boolean;
    allQualityLabels: QualityLabel[];
    editStatuses: Avo.Share.EditStatusResponse;
    commonUser: Avo.User.CommonUser | null;
  },
) {
  switch (columnId) {
    case 'title': {
      return collectionOrBundle.title || '';
    }

    case ACTIONS_TABLE_COLUMN_ID:
      return '';

    default:
      return renderCollectionCellText(collectionOrBundle, columnId, info);
  }
}

export function renderCollectionOrBundleQualityCheckCellReact(
  collectionOrBundle: Partial<Avo.Collection.Collection>,
  columnId: CollectionOrBundleQualityCheckOverviewTableCols,
  info: {
    isCollection: boolean;
    allQualityLabels: QualityLabel[];
    editStatuses: Avo.Share.EditStatusResponse;
    commonUser: Avo.User.CommonUser | null;
  },
): ReactNode {
  const editLink = buildLink(
    info.isCollection
      ? APP_PATH.COLLECTION_EDIT_TAB.route
      : APP_PATH.BUNDLE_EDIT_TAB.route,
    {
      id: collectionOrBundle.id,
      tabId: CollectionCreateUpdateTab.QUALITY_CHECK,
    },
  );
  const editLinkOriginal = collectionOrBundle.relations?.[0].object
    ? buildLink(
        info.isCollection
          ? APP_PATH.COLLECTION_EDIT_TAB.route
          : APP_PATH.BUNDLE_EDIT_TAB.route,
        {
          id: collectionOrBundle.relations?.[0].object,
          tabId: CollectionCreateUpdateTab.QUALITY_CHECK,
        },
      )
    : null;

  switch (columnId) {
    case 'title': {
      return (
        <CollectionOrBundleOrAssignmentTitleAndCopyTag
          title={collectionOrBundle.title}
          editLink={editLink}
          editLinkOriginal={editLinkOriginal}
        />
      );
    }

    case ACTIONS_TABLE_COLUMN_ID:
      return (
        <ButtonToolbar>
          <Link to={editLink}>
            <Button
              type="secondary"
              icon={IconName.edit}
              ariaLabel={
                info.isCollection
                  ? tText(
                      'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-collectie',
                    )
                  : tText(
                      'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-bundel',
                    )
              }
              title={
                info.isCollection
                  ? tText(
                      'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-collectie',
                    )
                  : tText(
                      'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-bundel',
                    )
              }
            />
          </Link>
        </ButtonToolbar>
      );

    default:
      return renderCollectionCellReact(collectionOrBundle, columnId, info);
  }
}

export function renderCollectionOrBundleQualityCheckCellText(
  collectionOrBundle: Partial<Avo.Collection.Collection>,
  columnId: CollectionOrBundleQualityCheckOverviewTableCols,
  info: {
    isCollection: boolean;
    allQualityLabels: QualityLabel[];
    editStatuses: Avo.Share.EditStatusResponse;
    commonUser: Avo.User.CommonUser | null;
  },
): string {
  switch (columnId) {
    case 'title': {
      return collectionOrBundle.title || '';
    }

    case ACTIONS_TABLE_COLUMN_ID:
      return '';

    default:
      return renderCollectionCellText(collectionOrBundle, columnId, info);
  }
}

export function renderCollectionsOrBundlesMarcomCellReact(
  collectionOrBundle: Partial<Avo.Collection.Collection>,
  columnId: CollectionOrBundleMarcomOverviewTableCols,
  info: {
    isCollection: boolean;
    allQualityLabels: QualityLabel[];
    editStatuses: Avo.Share.EditStatusResponse;
    commonUser: Avo.User.CommonUser | null;
  },
): ReactNode {
  const editLink = buildLink(
    info.isCollection
      ? APP_PATH.COLLECTION_EDIT_TAB.route
      : APP_PATH.BUNDLE_EDIT_TAB.route,
    { id: collectionOrBundle.id, tabId: CollectionCreateUpdateTab.MARCOM },
  );
  const editLinkOriginal = collectionOrBundle.relations?.[0].object
    ? buildLink(
        info.isCollection
          ? APP_PATH.COLLECTION_EDIT_TAB.route
          : APP_PATH.BUNDLE_EDIT_TAB.route,
        {
          id: collectionOrBundle.relations?.[0].object,
          tabId: CollectionCreateUpdateTab.MARCOM,
        },
      )
    : null;

  switch (columnId) {
    case 'title': {
      return (
        <CollectionOrBundleOrAssignmentTitleAndCopyTag
          title={collectionOrBundle.title}
          editLink={editLink}
          editLinkOriginal={editLinkOriginal}
        />
      );
    }

    case ACTIONS_TABLE_COLUMN_ID:
      return (
        <ButtonToolbar>
          <Link to={editLink}>
            <Button
              type="secondary"
              icon={IconName.edit}
              ariaLabel={
                info.isCollection
                  ? tText(
                      'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-collectie',
                    )
                  : tText(
                      'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-bundel',
                    )
              }
              title={
                info.isCollection
                  ? tText(
                      'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-collectie',
                    )
                  : tText(
                      'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-bundel',
                    )
              }
            />
          </Link>
        </ButtonToolbar>
      );

    default:
      return renderCollectionCellReact(collectionOrBundle, columnId, info);
  }
}

export function renderCollectionsOrBundlesMarcomCellText(
  collectionOrBundle: Partial<Avo.Collection.Collection>,
  columnId: CollectionOrBundleMarcomOverviewTableCols,
  info: {
    isCollection: boolean;
    allQualityLabels: QualityLabel[];
    editStatuses: Avo.Share.EditStatusResponse;
    commonUser: Avo.User.CommonUser | null;
  },
): string {
  switch (columnId) {
    case 'title': {
      return collectionOrBundle.title || '';
    }

    case ACTIONS_TABLE_COLUMN_ID:
      return '';

    default:
      return renderCollectionCellText(collectionOrBundle, columnId, info);
  }
}

export function renderCollectionCellReact(
  collection: Partial<Avo.Collection.Collection>,
  columnId: CollectionTableColumns,
  info: {
    isCollection: boolean;
    allQualityLabels: QualityLabel[];
    editStatuses: Avo.Share.EditStatusResponse;
    commonUser: Avo.User.CommonUser | null;
  },
): ReactNode {
  switch (columnId) {
    case 'owner_profile_id': {
      const user: Avo.User.User | undefined =
        collection?.profile?.user || collection?.owner;
      return user ? truncateTableValue((user as any).full_name) : '-';
    }

    case 'author_user_group':
      return (
        getUserGroupLabel(
          (collection?.profile || collection?.owner) as
            | Avo.User.Profile
            | { profile: Avo.User.Profile }
            | undefined,
        ) || '-'
      );

    case 'last_updated_by_profile': {
      // Multiple options because we are processing multiple views: collections, actualisation, quality_check and marcom
      return (
        collection?.updated_by?.fullName ||
        (collection as any)?.last_editor?.full_name ||
        (collection as any)?.last_editor_name ||
        '-'
      );
    }

    case 'is_public':
    case 'is_managed':
      return collection[columnId]
        ? tText(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___ja',
          )
        : tText(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___nee',
          );

    case 'views':
      return collection?.counts?.views || '0';

    case 'bookmarks':
      return collection?.counts?.bookmarks || '0';

    case 'copies':
      return collection?.counts?.copies || '0';

    case 'in_bundle':
      return collection?.counts?.in_collection || '0';

    case 'in_assignment':
      return collection?.counts?.in_assignment || '0';

    case 'quick_lane_links':
      return collection?.counts?.quick_lane_links || '0';

    case 'contributors':
      return collection?.counts?.contributors || '0';

    case 'created_at':
    case 'updated_at':
      return collection[columnId]
        ? formatDate(new Date(collection[columnId] as string))
        : '-';

    case 'collection_labels': {
      const labelObjects: { id: number; label: string }[] =
        collection?.collection_labels || [];

      const tags: TagOption[] = compact(
        labelObjects.map((labelObj: any): TagOption | null => {
          const prettyLabel = info.allQualityLabels.find(
            (collectionLabel) => collectionLabel.value === labelObj.label,
          );

          if (!prettyLabel) {
            return null;
          }

          return { label: prettyLabel.description, id: labelObj.id };
        }),
      );

      if (tags.length) {
        return <TagList tags={tags} swatches={false} />;
      }

      return '-';
    }

    case 'is_copy': {
      const relationObjectId = collection?.relations?.[0]?.object;
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
      const groupedLoms = groupLomLinks(collection.loms);
      return lomsToTagList(groupedLoms.educationLevel) || '-';
    }

    case 'education_degrees': {
      const groupedLoms = groupLomLinks(collection.loms);
      return lomsToTagList(groupedLoms.educationDegree) || '-';
    }

    case 'subjects': {
      const groupedLoms = groupLomLinks(collection.loms);
      return lomsToTagList(groupedLoms.subject) || '-';
    }

    case 'themas': {
      const groupedLoms = groupLomLinks(collection.loms);
      return lomsToTagList(groupedLoms.theme) || '-';
    }

    case 'actualisation_status':
      return (
        getDisplayTextForManagementStatus(
          collection?.management?.current_status as
            | ManagementStatus
            | undefined
            | null,
        ) || '-'
      );
    case 'mgmt_current_status': // TODO replace db view with actualisation_approved_at columns
      return (
        getDisplayTextForManagementStatus(
          (collection as any)?.mgmt_current_status as
            | ManagementStatus
            | undefined
            | null,
        ) || ''
      );

    case 'actualisation_last_actualised_at':
      return formatDate(collection?.management?.updated_at) || '-';
    case 'mgmt_updated_at': // TODO replace db view with actualisation_approved_at columns
      return formatDate((collection as any)?.mgmt_updated_at) || '-';

    case 'actualisation_status_valid_until': {
      const validDate = collection?.management?.status_valid_until;
      const isValid = !validDate || !isBefore(new Date(validDate), new Date());
      return (
        <span className={isValid ? '' : 'a-table-cell__invalid'}>
          {formatDate(validDate) || '-'}
        </span>
      );
    }
    case 'mgmt_status_expires_at': {
      // TODO replace db view with actualisation_approved_at columns
      const validDate = (collection as any)?.mgmt_status_expires_at;
      const isValid = !validDate || !isBefore(new Date(validDate), new Date());
      return (
        <span className={isValid ? '' : 'a-table-cell__invalid'}>
          {formatDate(validDate) || '-'}
        </span>
      );
    }

    case 'actualisation_approved_at':
      return (
        formatDate(collection?.management_final_check?.[0]?.created_at) || '-'
      );
    case 'mgmt_last_eindcheck_date': // TODO replace db view with actualisation_approved_at columns
      return formatDate((collection as any)?.mgmt_last_eindcheck_date) || '-';

    case 'actualisation_manager':
      return collection?.manager?.fullName || '-';

    case 'quality_check_language_check':
      return (
        booleanToOkNok(collection.management_language_check?.[0]?.qc_status) ||
        '-'
      );
    case 'mgmt_language_check': // TODO replace db view with actualisation_approved_at columns
      return booleanToOkNok((collection as any).mgmt_language_check) || '-';

    case 'quality_check_quality_check':
      return (
        booleanToOkNok(collection.management_quality_check?.[0]?.qc_status) ||
        '-'
      );
    case 'mgmt_quality_check': // TODO replace db view with actualisation_approved_at columns
      return booleanToOkNok((collection as any).mgmt_quality_check) || '-';

    case 'quality_check_approved_at':
      return (
        formatDate(collection?.management_quality_check?.[0].created_at) || '-'
      );
    case 'mgmt_eind_check_date': // TODO replace db view with actualisation_approved_at columns
      return formatDate((collection as any)?.mgmt_eind_check_date) || '-';

    case 'marcom_last_communication_channel_type': {
      const channelTypeId = collection?.channel_type || '';
      return truncateTableValue(
        GET_MARCOM_CHANNEL_TYPE_OPTIONS().find(
          (option) => option.value === channelTypeId,
        )?.label,
      );
    }

    case 'marcom_last_communication_channel_name': {
      const channelNameId = collection?.channel_name || '';
      return truncateTableValue(
        GET_MARCOM_CHANNEL_NAME_OPTIONS().find(
          (option) => option.value === channelNameId,
        )?.label,
      );
    }

    case 'marcom_last_communication_at':
      return formatDate(collection?.last_marcom_date) || '-';

    case 'marcom_klascement':
      return collection?.klascement ? 'Ja' : 'Nee';

    case 'organisation':
      return collection?.owner?.profile?.organisation?.name || '-';

    default:
      return truncateTableValue((collection as any)[columnId]);
  }
}

export function renderCollectionCellText(
  collection: Partial<Avo.Collection.Collection>,
  columnId: CollectionTableColumns,
  info: {
    isCollection: boolean;
    allQualityLabels: QualityLabel[];
    editStatuses: Avo.Share.EditStatusResponse;
    commonUser: Avo.User.CommonUser | null;
  },
): string {
  switch (columnId) {
    case 'owner_profile_id': {
      const user: Avo.User.User | undefined =
        collection?.profile?.user || collection?.owner;
      return user ? (user as any).full_name : '';
    }

    case 'author_user_group':
      return (
        getUserGroupLabel(
          (collection?.profile || collection?.owner) as
            | Avo.User.Profile
            | { profile: Avo.User.Profile }
            | undefined,
        ) || ''
      );

    case 'last_updated_by_profile': {
      // Multiple options because we are processing multiple views: collections, actualisation, quality_check and marcom
      return (
        collection?.updated_by?.fullName ||
        (collection as any)?.last_editor?.full_name ||
        (collection as any)?.last_editor_name ||
        ''
      );
    }

    case 'is_public':
    case 'is_managed':
      return collection[columnId]
        ? tText(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___ja',
          )
        : tText(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___nee',
          );

    case 'views':
      return String(collection?.counts?.views || 0);

    case 'bookmarks':
      return String(collection?.counts?.bookmarks || 0);

    case 'copies':
      return String(collection?.counts?.copies || 0);

    case 'in_bundle':
      return String(collection?.counts?.in_collection || 0);

    case 'in_assignment':
      return String(collection?.counts?.in_assignment || 0);

    case 'quick_lane_links':
      return String(collection?.counts?.quick_lane_links || 0);

    case 'contributors':
      return String(collection?.counts?.contributors || 0);

    case 'created_at':
    case 'updated_at':
      return collection[columnId]
        ? formatDate(new Date(collection[columnId] as string))
        : '';

    case 'collection_labels': {
      const labelObjects: { id: number; label: string }[] =
        collection?.collection_labels || [];
      return compact(
        labelObjects.map((labelObj: any): string | null => {
          const prettyLabel = info.allQualityLabels.find(
            (collectionLabel) => collectionLabel.value === labelObj.label,
          );
          return prettyLabel?.description || '';
        }),
      ).join(', ');
    }

    case 'is_copy': {
      const relationObjectId = collection?.relations?.[0]?.object;
      return relationObjectId ? 'Ja' : 'Nee';
    }

    case 'education_levels': {
      const groupedLoms = groupLomLinks(collection.loms);
      return (
        groupedLoms.educationLevel?.map((item) => item.label).join(', ') || ''
      );
    }

    case 'education_degrees': {
      const groupedLoms = groupLomLinks(collection.loms);
      return (
        groupedLoms.educationDegree?.map((item) => item.label).join(', ') || ''
      );
    }

    case 'subjects': {
      const groupedLoms = groupLomLinks(collection.loms);
      return groupedLoms.subject?.map((item) => item.label).join(', ') || '';
    }

    case 'themas': {
      const groupedLoms = groupLomLinks(collection.loms);
      return groupedLoms.theme?.map((item) => item.label).join(', ') || '';
    }

    case 'actualisation_status':
      return (
        getDisplayTextForManagementStatus(
          collection?.management?.current_status as
            | ManagementStatus
            | undefined
            | null,
        ) || ''
      );
    case 'mgmt_current_status': // TODO replace db view with actualisation_approved_at columns
      return (
        getDisplayTextForManagementStatus(
          (collection as any)?.mgmt_current_status as
            | ManagementStatus
            | undefined
            | null,
        ) || ''
      );

    case 'actualisation_last_actualised_at':
      return formatDate(collection?.management?.updated_at) || '-';
    case 'mgmt_updated_at': // TODO replace db view with actualisation_approved_at columns
      return formatDate((collection as any)?.mgmt_updated_at) || '-';

    case 'actualisation_status_valid_until': {
      const validDate = collection?.management?.status_valid_until;
      return formatDate(validDate) || '';
    }
    case 'mgmt_status_expires_at': {
      // TODO replace db view with actualisation_approved_at columns
      const validDate = (collection as any)?.mgmt_status_expires_at;
      return formatDate(validDate) || '';
    }

    case 'actualisation_approved_at':
      return (
        formatDate(collection?.management_final_check?.[0]?.created_at) || '-'
      );
    case 'mgmt_last_eindcheck_date': // TODO replace db view with actualisation_approved_at columns
      return formatDate((collection as any)?.mgmt_last_eindcheck_date) || '-';

    case 'actualisation_manager':
      return collection?.manager?.fullName || '';

    case 'quality_check_language_check':
      return (
        booleanToOkNok(collection.management_language_check?.[0]?.qc_status) ||
        '-'
      );
    case 'mgmt_language_check': // TODO replace db view with actualisation_approved_at columns
      return booleanToOkNok((collection as any).mgmt_language_check) || '-';

    case 'quality_check_quality_check':
      return (
        booleanToOkNok(collection.management_quality_check?.[0]?.qc_status) ||
        '-'
      );
    case 'mgmt_quality_check': // TODO replace db view with actualisation_approved_at columns
      return booleanToOkNok((collection as any).mgmt_quality_check) || '-';

    case 'quality_check_approved_at':
      return (
        formatDate(collection?.management_quality_check?.[0].created_at) || '-'
      );
    case 'mgmt_eind_check_date': // TODO replace db view with actualisation_approved_at columns
      return formatDate((collection as any)?.mgmt_eind_check_date) || '-';

    case 'marcom_last_communication_channel_type': {
      const channelTypeId = collection?.channel_type || '';
      return (
        GET_MARCOM_CHANNEL_TYPE_OPTIONS().find(
          (option) => option.value === channelTypeId,
        )?.label || ''
      );
    }

    case 'marcom_last_communication_channel_name': {
      const channelNameId = collection?.channel_name || '';
      return truncateTableValue(
        GET_MARCOM_CHANNEL_NAME_OPTIONS().find(
          (option) => option.value === channelNameId,
        )?.label,
      );
    }

    case 'marcom_last_communication_at':
      return formatDate(collection?.last_marcom_date) || '';

    case 'marcom_klascement':
      return collection?.klascement ? 'Ja' : 'Nee';

    case 'organisation':
      return collection?.owner?.profile?.organisation?.name || '';

    default:
      return (collection as any)[columnId];
  }
}
