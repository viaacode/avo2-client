import { ExportAllToCsvModal, FilterTable, getFilters, } from '@meemoo/admin-core-ui/admin';
import { type TagInfo } from '@viaa/avo2-components';
import {
  AvoCollectionCollection,
  AvoCoreContentPickerType,
  AvoSearchOrderDirection,
  AvoShareEditStatus,
  PermissionName,
} from '@viaa/avo2-types';
import { compact, noop, partition } from 'es-toolkit';
import { useAtomValue } from 'jotai';
import { type FC, type ReactNode, useCallback, useEffect, useMemo, useState, } from 'react';
import { useLocation } from 'react-router-dom';

import { commonUserAtom } from '../../../authentication/authentication.store';
import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { CollectionService } from '../../../collection/collection.service';
import { useGetCollectionsEditStatuses } from '../../../collection/hooks/useGetCollectionsEditStatuses';
import { APP_PATH } from '../../../constants';
import { ErrorView } from '../../../error/views/ErrorView';
import { type CheckboxOption } from '../../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import {
  LoadingErrorLoadedComponent,
  type LoadingInfo,
} from '../../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { SeoMetadata } from '../../../shared/components/SeoMetadata/SeoMetadata.tsx';
import { EDIT_STATUS_REFETCH_TIME } from '../../../shared/constants';
import { CustomError } from '../../../shared/helpers/custom-error';
import { getFullNameCommonUser } from '../../../shared/helpers/formatters/avatar';
import { tableColumnListToCsvColumnList } from '../../../shared/helpers/table-column-list-to-csv-column-list';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { useCompaniesWithUsers } from '../../../shared/hooks/useCompanies';
import { useLomEducationLevelsAndDegrees } from '../../../shared/hooks/useLomEducationLevelsAndDegrees';
import { useLomSubjects } from '../../../shared/hooks/useLomSubjects';
import { useQualityLabels } from '../../../shared/hooks/useQualityLabels';
import { ToastService } from '../../../shared/services/toast-service';
import {
  type AddOrRemove,
  AddOrRemoveLinkedElementsModal,
} from '../../shared/components/AddOrRemoveLinkedElementsModal/AddOrRemoveLinkedElementsModal';
import { ChangeAuthorModal } from '../../shared/components/ChangeAuthorModal/ChangeAuthorModal';
import { SubjectsBeingEditedWarningModal } from '../../shared/components/SubjectsBeingEditedWarningModal/SubjectsBeingEditedWarningModal';
import { NULL_FILTER } from '../../shared/helpers/filters';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import { AdminLayoutBody } from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import type { PickerItem } from '../../shared/types/content-picker';
import { useUserGroups } from '../../user-groups/hooks/useUserGroups';
import { GET_COLLECTION_BULK_ACTIONS, GET_COLLECTIONS_COLUMNS, ITEMS_PER_PAGE, } from '../collections-or-bundles.const';
import { COLLECTIONS_OR_BUNDLES_PATH } from '../collections-or-bundles.routes.ts';
import { CollectionsOrBundlesService } from '../collections-or-bundles.service';
import {
  CollectionBulkAction,
  type CollectionsOrBundlesOverviewTableCols,
  type CollectionsOrBundlesTableState,
  type CollectionSortProps,
} from '../collections-or-bundles.types';
import {
  renderCollectionsOrBundlesOverviewCellReact,
  renderCollectionsOrBundlesOverviewCellText,
} from '../helpers/render-collection-columns';

export const CollectionsOrBundlesOverview: FC = () => {
  const location = useLocation();
  const commonUser = useAtomValue(commonUserAtom);

  const [collections, setCollections] = useState<
    AvoCollectionCollection[] | null
  >(null);
  const [collectionCount, setCollectionCount] = useState<number>(0);
  const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({
    state: 'loading',
  });
  const [tableState, setTableState] = useState<
    Partial<CollectionsOrBundlesTableState>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExportAllToCsvModalOpen, setIsExportAllToCsvModalOpen] =
    useState(false);
  const { data: editStatuses } = useGetCollectionsEditStatuses(
    collections?.map((coll) => coll.id) || [],
    {
      enabled: !!collections?.length,
      refetchInterval: EDIT_STATUS_REFETCH_TIME,
      refetchIntervalInBackground: true,
    },
  );

  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    [],
  );

  const [changeAuthorModalOpen, setChangeAuthorModalOpen] =
    useState<boolean>(false);

  const [changeLabelsModalOpen, setAddLabelModalOpen] =
    useState<boolean>(false);

  const [userGroups] = useUserGroups(false);
  const [subjects] = useLomSubjects();
  const { data: educationLevelsAndDegrees } = useLomEducationLevelsAndDegrees();
  const { data: allQualityLabels } = useQualityLabels();
  const [organisations] = useCompaniesWithUsers();
  const [collectionsBeingEdited, setCollectionsBeingEdited] = useState<
    AvoShareEditStatus[]
  >([]);
  const [selectedBulkAction, setSelectedBulkAction] =
    useState<CollectionBulkAction | null>(null);

  // computed

  const userGroupOptions = useMemo(() => {
    return [
      ...userGroups.map(
        (option): CheckboxOption => ({
          id: String(option.id),
          label: option.label as string,
          checked: (tableState?.author_user_group || ([] as string[])).includes(
            String(option.id),
          ),
        }),
      ),
      {
        id: NULL_FILTER,
        label: tText(
          'admin/collections-or-bundles/views/collection-or-bundle___geen-rol',
        ),
        checked: ((tableState?.author_user_group || []) as string[]).includes(
          NULL_FILTER,
        ),
      },
    ];
  }, [tableState, userGroups]);

  const collectionLabelOptions = useMemo(
    () => [
      {
        id: NULL_FILTER,
        label: tText(
          'admin/collections-or-bundles/views/collections-or-bundles-overview___geen-label',
        ),
        checked: ((tableState?.collection_labels || []) as string[]).includes(
          NULL_FILTER,
        ),
      },
      ...(allQualityLabels || []).map(
        (option): CheckboxOption => ({
          id: String(option.value),
          label: option.description,
          checked: ((tableState?.collection_labels || []) as string[]).includes(
            String(option.value),
          ),
        }),
      ),
    ],
    [allQualityLabels, tableState],
  );

  const organisationOptions = useMemo(
    () => [
      {
        id: NULL_FILTER,
        label: tText(
          'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___geen-organisatie',
        ),
        checked: ((tableState?.organisation || []) as string[]).includes(
          NULL_FILTER,
        ),
      },
      ...organisations.map(
        (option): CheckboxOption => ({
          id: String(option.or_id),
          label: option.name,
          checked: ((tableState?.organisation || []) as string[]).includes(
            String(option.or_id),
          ),
        }),
      ),
    ],
    [organisations, tableState],
  );

  const isCollection =
    location.pathname === COLLECTIONS_OR_BUNDLES_PATH.COLLECTIONS_OVERVIEW;
  const tableColumns = useMemo(
    () =>
      GET_COLLECTIONS_COLUMNS(
        isCollection,
        userGroupOptions,
        collectionLabelOptions,
        subjects,
        educationLevelsAndDegrees || [],
        organisationOptions,
      ),
    [
      collectionLabelOptions,
      educationLevelsAndDegrees,
      isCollection,
      subjects,
      userGroupOptions,
      organisationOptions,
    ],
  );

  // methods
  const fetchCollectionsOrBundles = useCallback(async () => {
    setIsLoading(true);

    try {
      const { collections: collectionsTemp, total: collectionsCountTemp } =
        await CollectionsOrBundlesService.getCollections(
          (tableState.page || 0) * ITEMS_PER_PAGE,
          ITEMS_PER_PAGE,
          (tableState.sort_column || 'created_at') as CollectionSortProps,
          tableState.sort_order || AvoSearchOrderDirection.DESC,
          getFilters(tableState),
          isCollection,
          true,
        );

      setCollections(collectionsTemp);
      setCollectionCount(collectionsCountTemp);
    } catch (err) {
      console.error(
        new CustomError('Failed to get collections from the database', err, {
          tableState,
        }),
      );

      setLoadingInfo({
        state: 'error',
        message: isCollection
          ? tText(
              'admin/collections-or-bundles/views/collections-or-bundles-overview___het-ophalen-van-de-collecties-is-mislukt',
            )
          : tText(
              'admin/collections-or-bundles/views/collections-or-bundles-overview___het-ophalen-van-de-bundels-is-mislukt',
            ),
      });
    }

    setIsLoading(false);
  }, [tableState, isCollection]);

  useEffect(() => {
    if (commonUser && educationLevelsAndDegrees?.length) {
      fetchCollectionsOrBundles().then(noop);
    }
  }, [fetchCollectionsOrBundles, commonUser, educationLevelsAndDegrees]);

  useEffect(() => {
    if (collections) {
      setLoadingInfo({
        state: 'loaded',
      });
    }

    // Update selected rows to always be a subset of the collections array
    // In other words, you cannot have something selected that isn't part of the current filtered/paginated results
    const collectionIds: string[] = (collections || []).map((coll) => coll.id);

    setSelectedCollectionIds((currentSelectedCollectionIds) => {
      return (currentSelectedCollectionIds || []).filter(
        (collId) => collId && collectionIds.includes(collId),
      );
    });
  }, [setLoadingInfo, collections, setSelectedCollectionIds]);

  const setAllCollectionsAsSelected = async () => {
    setIsLoading(true);

    try {
      const collectionIds = await CollectionsOrBundlesService.getCollectionIds(
        getFilters(tableState),
        isCollection,
      );
      ToastService.info(
        tHtml(
          'admin/collections-or-bundles/views/collections-or-bundles-overview___je-hebt-num-of-selected-collections-collecties-geselecteerd',
          {
            numOfSelectedCollections: collectionIds.length,
          },
        ),
      );

      setSelectedCollectionIds(collectionIds);
    } catch (err) {
      console.error(
        new CustomError(
          'Failed to get all collection ids that match the selected filter',
          err,
          { tableState },
        ),
      );

      ToastService.danger(
        tHtml(
          'admin/collections-or-bundles/views/collections-or-bundles-overview___het-ophalen-van-de-collectie-ids-is-mislukt',
        ),
      );
    }

    setIsLoading(false);
  };

  const handleBulkAction = async (
    action: CollectionBulkAction,
  ): Promise<void> => {
    if (action === CollectionBulkAction.EXPORT_ALL) {
      // No selection of rows needed since we export all rows
      // Also, we don't need to check any edit statuses since we're not editing/deleting anything
      setIsExportAllToCsvModalOpen(true);
      return;
    }

    let selectedCollectionsThatAreBeingEdited: AvoShareEditStatus[] = [];
    let selectedCollectionIdsThatAreNotBeingEdited = selectedCollectionIds;
    if (isCollection) {
      const selectedCollectionEditStatuses =
        await CollectionService.getCollectionsEditStatuses(
          selectedCollectionIds,
        );
      const partitionedCollectionIds = partition(
        Object.entries(selectedCollectionEditStatuses),
        (entry) => !!entry[1],
      );
      selectedCollectionsThatAreBeingEdited = compact(
        partitionedCollectionIds[0].map((entry) => entry[1]),
      );
      selectedCollectionIdsThatAreNotBeingEdited =
        partitionedCollectionIds[1].map((entry) => entry[0]);
    }

    if (selectedCollectionsThatAreBeingEdited.length > 0) {
      // open warning modal first
      setSelectedCollectionIds(selectedCollectionIdsThatAreNotBeingEdited);
      setSelectedBulkAction(action);
      setCollectionsBeingEdited(selectedCollectionsThatAreBeingEdited);
    } else {
      // execute action straight away
      setCollectionsBeingEdited([]);
      setSelectedBulkAction(null);

      const hasSelectedRows = selectedCollectionIds.length > 0;

      switch (action) {
        case CollectionBulkAction.PUBLISH:
          if (!hasSelectedRows) return;
          await bulkChangePublishStateForSelectedCollections(true);
          return;

        case CollectionBulkAction.DEPUBLISH:
          if (!hasSelectedRows) return;
          await bulkChangePublishStateForSelectedCollections(false);
          return;

        case CollectionBulkAction.DELETE:
          if (!hasSelectedRows) return;
          await bulkDeleteSelectedCollections();
          return;

        case CollectionBulkAction.CHANGE_AUTHOR:
          if (!hasSelectedRows) return;
          setChangeAuthorModalOpen(true);
          return;

        case CollectionBulkAction.CHANGE_LABELS:
          if (!hasSelectedRows) return;
          setAddLabelModalOpen(true);
          return;
      }
    }
  };

  const bulkChangePublishStateForSelectedCollections = async (
    isPublic: boolean,
  ) => {
    try {
      if (
        !selectedCollectionIds ||
        !selectedCollectionIds.length ||
        !commonUser?.profileId
      ) {
        return;
      }

      await CollectionsOrBundlesService.bulkChangePublicStateForCollections(
        isPublic,
        compact(selectedCollectionIds),
        commonUser?.profileId,
      );

      ToastService.success(
        isPublic
          ? tHtml(
              'admin/collections-or-bundles/views/collections-or-bundles-overview___de-geselecteerde-collecties-zijn-gepubliceerd',
            )
          : tHtml(
              'admin/collections-or-bundles/views/collections-or-bundles-overview___de-geselecteerde-collecties-zijn-gedepubliceerd',
            ),
      );

      await fetchCollectionsOrBundles();
    } catch (err) {
      console.error(
        new CustomError('Failed to toggle publish state for collections', err, {
          isPublic,
          selectedRows: selectedCollectionIds,
        }),
      );

      ToastService.danger(
        isPublic
          ? tHtml(
              'admin/collections-or-bundles/views/collections-or-bundles-overview___het-publiceren-van-de-collecties-is-mislukt',
            )
          : tHtml(
              'admin/collections-or-bundles/views/collections-or-bundles-overview___het-depubliceren-van-de-collecties-is-mislukt',
            ),
      );
    }
  };

  const bulkDeleteSelectedCollections = async () => {
    try {
      if (
        !selectedCollectionIds ||
        !selectedCollectionIds.length ||
        !commonUser?.profileId
      ) {
        return;
      }

      await CollectionsOrBundlesService.bulkDeleteCollections(
        compact(selectedCollectionIds),
        commonUser?.profileId,
      );

      ToastService.success(
        tHtml(
          'admin/collections-or-bundles/views/collections-or-bundles-overview___de-geselecteerde-collecties-zijn-verwijderd',
        ),
      );

      await fetchCollectionsOrBundles();
    } catch (err) {
      console.error(
        new CustomError('Failed to bulk delete collections', err, {
          selectedRows: selectedCollectionIds,
        }),
      );

      ToastService.danger(
        tHtml(
          'admin/collections-or-bundles/views/collections-or-bundles-overview___het-verwijderen-van-de-collecties-is-mislukt',
        ),
      );
    }
  };

  const bulkChangeAuthor = async (authorProfileId: string) => {
    try {
      if (
        !selectedCollectionIds ||
        !selectedCollectionIds.length ||
        !commonUser?.profileId
      ) {
        return;
      }

      await CollectionsOrBundlesService.bulkUpdateAuthorForCollections(
        authorProfileId,
        compact(selectedCollectionIds),
        commonUser?.profileId,
      );

      ToastService.success(
        tHtml(
          'admin/collections-or-bundles/views/collections-or-bundles-overview___de-auteurs-zijn-aangepast-voor-de-geselecteerde-collecties',
        ),
      );

      await fetchCollectionsOrBundles();
    } catch (err) {
      console.error(
        new CustomError('Failed to bulk update author for collections', err, {
          authorProfileId,
        }),
      );

      ToastService.danger(
        tHtml(
          'admin/collections-or-bundles/views/collections-or-bundles-overview___het-aanpassen-van-de-auteurs-is-mislukt',
        ),
      );
    }
  };

  const bulkChangeLabels = async (
    addOrRemove: AddOrRemove,
    labels: string[],
  ) => {
    try {
      if (
        !selectedCollectionIds ||
        !selectedCollectionIds.length ||
        !commonUser?.profileId
      ) {
        return;
      }

      if (addOrRemove === 'add') {
        await CollectionsOrBundlesService.bulkAddLabelsToCollections(
          labels,
          compact(selectedCollectionIds),
          commonUser?.profileId,
        );

        ToastService.success(
          tHtml(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___de-labels-zijn-toegevoegd-aan-de-geselecteerde-collecties',
          ),
        );
      } else {
        // remove
        await CollectionsOrBundlesService.bulkRemoveLabelsFromCollections(
          labels,
          compact(selectedCollectionIds),
          commonUser?.profileId,
        );
        ToastService.success(
          tHtml(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___de-labels-zijn-verwijderd-van-de-geselecteerde-collecties',
          ),
        );
      }

      await fetchCollectionsOrBundles();
    } catch (err) {
      console.error(
        new CustomError('Failed to bulk update labels of collections', err, {
          addOrRemove,
          labels,
        }),
      );

      ToastService.danger(
        tHtml(
          'admin/collections-or-bundles/views/collections-or-bundles-overview___het-aanpassen-van-de-labels-is-mislukt',
        ),
      );
    }
  };

  const renderNoResults = () => {
    return (
      <ErrorView
        locationId="collections-or-bundles-overview--error"
        message={tHtml(
          'admin/collections-or-bundles/views/collections-or-bundles-overview___er-bestaan-nog-geen-collecties',
        )}
      >
        <p>
          {tHtml(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___beschrijving-wanneer-er-nog-geen-collecties-zijn',
          )}
        </p>
      </ErrorView>
    );
  };

  const renderCollectionsOrBundlesOverview = () => {
    if (!collections) {
      return null;
    }

    return (
      <>
        <FilterTable
          columns={tableColumns}
          data={collections}
          dataCount={collectionCount}
          renderCell={(collection: any, columnId: string) =>
            renderCollectionsOrBundlesOverviewCellReact(
              collection as AvoCollectionCollection,
              columnId as CollectionsOrBundlesOverviewTableCols,
              {
                isCollection,
                allQualityLabels: allQualityLabels || [],
                editStatuses: editStatuses || {},
                commonUser,
              },
            )
          }
          searchTextPlaceholder={tText(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___zoek-op-titel-beschrijving-auteur',
          )}
          noContentMatchingFiltersMessage={
            isCollection
              ? tText(
                  'admin/collections-or-bundles/views/collections-or-bundles-overview___er-zijn-geen-collecties-doe-voldoen-aan-de-opgegeven-filters',
                )
              : tText(
                  'admin/collections-or-bundles/views/collections-or-bundles-overview___er-zijn-geen-bundels-doe-voldoen-aan-de-opgegeven-filters',
                )
          }
          itemsPerPage={ITEMS_PER_PAGE}
          onTableStateChanged={setTableState}
          renderNoResults={renderNoResults}
          rowKey="id"
          showCheckboxes={true}
          bulkActions={GET_COLLECTION_BULK_ACTIONS(
            selectedCollectionIds.length > 0,
          )}
          onSelectBulkAction={handleBulkAction as any}
          selectedItemIds={selectedCollectionIds}
          onSelectionChanged={
            setSelectedCollectionIds as (ids: ReactNode[]) => void
          }
          onSelectAll={setAllCollectionsAsSelected}
          isLoading={isLoading}
        />
        <SubjectsBeingEditedWarningModal
          isOpen={collectionsBeingEdited?.length > 0}
          onClose={() => {
            setCollectionsBeingEdited([]);
            setSelectedBulkAction(null);
          }}
          confirmCallback={async () => {
            setCollectionsBeingEdited([]);
            if (selectedCollectionIds.length > 0) {
              await handleBulkAction(
                selectedBulkAction as CollectionBulkAction,
              );
            } else {
              ToastService.info(
                tHtml(
                  'admin/collections-or-bundles/views/collections-or-bundles-overview___alle-geselecteerde-collecties-worden-bewerkt-dus-de-actie-kan-niet-worden-uitgevoerd',
                ),
              );
            }
          }}
          title={tHtml(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___enkele-collecties-worden-bewerkt',
          )}
          editWarningSection1={tHtml(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___deze-collecties-worden-momenteel-bewerkt',
          )}
          editWarningSection2={tHtml(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___je-kan-doorgaan-met-je-actie-maar-deze-collecties-zullen-niet-behandeld-worden',
          )}
          subjects={collectionsBeingEdited}
          route={APP_PATH.COLLECTION_DETAIL.route}
        />
        <ChangeAuthorModal
          isOpen={changeAuthorModalOpen}
          onClose={() => setChangeAuthorModalOpen(false)}
          callback={(newAuthor: PickerItem) =>
            bulkChangeAuthor(newAuthor.value)
          }
          initialAuthor={
            commonUser?.profileId
              ? {
                  label: getFullNameCommonUser(commonUser, true, false) || '',
                  value: commonUser?.profileId,
                  type: AvoCoreContentPickerType.PROFILE,
                }
              : undefined
          }
        />
        <AddOrRemoveLinkedElementsModal
          title={tHtml(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___labels-aanpassen',
          )}
          addOrRemoveLabel={tText(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___labels-toevoegen-of-verwijderen',
          )}
          contentLabel={tText(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___labels',
          )}
          isOpen={changeLabelsModalOpen}
          onClose={() => setAddLabelModalOpen(false)}
          labels={(allQualityLabels || []).map((labelObj) => ({
            label: labelObj.description,
            value: labelObj.value,
          }))}
          callback={(addOrRemove: AddOrRemove, labels: TagInfo[]) =>
            bulkChangeLabels(
              addOrRemove,
              labels.map((labelObj) => labelObj.value.toString()),
            )
          }
        />
        <ExportAllToCsvModal
          title={
            isCollection
              ? tText(
                  'admin/collections-or-bundles/views/collections-or-bundles-overview___exporteren-van-alle-collecties-naar-csv',
                )
              : tText(
                  'admin/collections-or-bundles/views/collections-or-bundles-overview___exporteren-van-alle-bundels-naar-csv',
                )
          }
          isOpen={isExportAllToCsvModalOpen}
          onClose={() => setIsExportAllToCsvModalOpen(false)}
          itemsPerRequest={20}
          fetchingItemsLabel={tText(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___bezig-met-ophalen-van-media-items',
          )}
          generatingCsvLabel={tText(
            'admin/collections-or-bundles/views/collections-or-bundles-overview___bezig-met-genereren-van-de-csv',
          )}
          fetchTotalItems={async () => {
            const response = await CollectionsOrBundlesService.getCollections(
              0,
              0,
              (tableState.sort_column || 'created_at') as CollectionSortProps,
              tableState.sort_order || AvoSearchOrderDirection.DESC,
              getFilters(tableState),
              isCollection,
              false,
            );
            return response.total;
          }}
          fetchMoreItems={async (offset: number, limit: number) => {
            const response = await CollectionsOrBundlesService.getCollections(
              offset,
              limit,
              (tableState.sort_column || 'created_at') as CollectionSortProps,
              tableState.sort_order || AvoSearchOrderDirection.DESC,
              getFilters(tableState),
              isCollection,
              false,
            );
            return response.collections;
          }}
          renderValue={(value: any, columnId: string) =>
            renderCollectionsOrBundlesOverviewCellText(
              value as any,
              columnId as CollectionsOrBundlesOverviewTableCols,
              {
                isCollection,
                allQualityLabels: allQualityLabels || [],
                editStatuses: editStatuses || {},
                commonUser,
              },
            )
          }
          columns={tableColumnListToCsvColumnList(tableColumns)}
          exportFileName={
            isCollection
              ? tText(
                  'admin/collections-or-bundles/views/collections-or-bundles-overview___collecties-csv',
                )
              : tText(
                  'admin/collections-or-bundles/views/collections-or-bundles-overview___bundels-csv',
                )
          }
        />
      </>
    );
  };

  return (
    <PermissionGuard
      permissions={[
        PermissionName.VIEW_COLLECTIONS_OVERVIEW,
        PermissionName.VIEW_ANY_PUBLISHED_COLLECTIONS,
        PermissionName.VIEW_ANY_UNPUBLISHED_COLLECTIONS,

        PermissionName.VIEW_BUNDLES_OVERVIEW,
        PermissionName.VIEW_ANY_PUBLISHED_BUNDLES,
        PermissionName.VIEW_ANY_UNPUBLISHED_BUNDLES,
      ]}
    >
      <AdminLayout
        pageTitle={
          isCollection
            ? tText(
                'admin/collections-or-bundles/views/collections-or-bundles-overview___collecties',
              )
            : tText(
                'admin/collections-or-bundles/views/collections-or-bundles-overview___bundels',
              )
        }
        size="full-width"
      >
        <AdminLayoutBody>
          <SeoMetadata
            title={
              isCollection
                ? tText(
                    'admin/collections-or-bundles/views/collections-or-bundles-overview___collectie-beheer-overview-pagina-titel',
                  )
                : tText(
                    'admin/collections-or-bundles/views/collections-or-bundles-overview___bundel-beheer-overview-pagina-titel',
                  )
            }
            description={
              isCollection
                ? tText(
                    'admin/collections-or-bundles/views/collections-or-bundles-overview___collectie-beheer-overview-pagina-beschrijving',
                  )
                : tText(
                    'admin/collections-or-bundles/views/collections-or-bundles-overview___bundel-beheer-overview-pagina-beschrijving',
                  )
            }
          />
          <LoadingErrorLoadedComponent
            loadingInfo={loadingInfo}
            dataObject={collections}
            render={renderCollectionsOrBundlesOverview}
            locationId="collections-or-bundles-overview"
          />
        </AdminLayoutBody>
      </AdminLayout>
    </PermissionGuard>
  );
};

export default CollectionsOrBundlesOverview;
