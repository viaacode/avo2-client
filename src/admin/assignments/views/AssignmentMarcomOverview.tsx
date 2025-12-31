import { ExportAllToCsvModal, FilterTable, getFilters, } from '@meemoo/admin-core-ui/admin';
import { AvoAssignmentAssignment, AvoSearchOrderDirection, PermissionName, } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import { type FC, type ReactNode, useEffect, useMemo, useState } from 'react';

import { type AssignmentTableColumns } from '../../../assignment/assignment.types';
import { commonUserAtom } from '../../../authentication/authentication.store';
import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { GET_MARCOM_CHANNEL_NAME_OPTIONS, GET_MARCOM_CHANNEL_TYPE_OPTIONS, } from '../../../collection/collection.const';
import { ErrorView } from '../../../error/views/ErrorView';

import { type CheckboxOption } from '../../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner';
import { SeoMetadata } from '../../../shared/components/SeoMetadata/SeoMetadata';
import { CustomError } from '../../../shared/helpers/custom-error';
import { tableColumnListToCsvColumnList } from '../../../shared/helpers/table-column-list-to-csv-column-list';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { useCompaniesWithUsers } from '../../../shared/hooks/useCompanies';
import { useLomEducationLevelsAndDegrees } from '../../../shared/hooks/useLomEducationLevelsAndDegrees';
import { useLomSubjects } from '../../../shared/hooks/useLomSubjects';
import { useQualityLabels } from '../../../shared/hooks/useQualityLabels';
import { ToastService } from '../../../shared/services/toast-service';
import { NULL_FILTER } from '../../shared/helpers/filters';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import { AdminLayoutBody } from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import { useUserGroups } from '../../user-groups/hooks/useUserGroups';
import { AssignmentsAdminService } from '../assignments.admin.service';
import { GET_ASSIGNMENT_MARCOM_COLUMNS, ITEMS_PER_PAGE, } from '../assignments.const';
import { type AssignmentMarcomTableState, AssignmentsBulkAction, type AssignmentSortProps, } from '../assignments.types';
import { renderAssignmentMarcomCellReact, renderAssignmentsMarcomCellText, } from '../helpers/render-assignment-columns';
import { useGetAssignmentsWithMarcomForAdminOverview } from '../hooks/useGetAssignmentsWithMarcomForAdminOverview';

export const AssignmentMarcomOverview: FC = () => {
  const commonUser = useAtomValue(commonUserAtom);

  const [tableState, setTableState] = useState<
    Partial<AssignmentMarcomTableState>
  >({});
  const { data: assignmentsWithMarcom, isLoading: isLoadingAssignments } =
    useGetAssignmentsWithMarcomForAdminOverview(tableState);
  const assignments = assignmentsWithMarcom?.assignments;
  const assignmentCount = assignmentsWithMarcom?.total;
  const [isLoadingAssignmentIds, setIsLoadingAssignmentIds] =
    useState<boolean>(false);

  const [isExportAllToCsvModalOpen, setIsExportAllToCsvModalOpen] =
    useState(false);

  const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<string[]>(
    [],
  );

  const [userGroups] = useUserGroups(false);
  const [subjects] = useLomSubjects();
  const { data: educationLevelsAndDegrees } = useLomEducationLevelsAndDegrees();
  const { data: allQualityLabels } = useQualityLabels();
  const [organisations] = useCompaniesWithUsers();

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
          'admin/assignments/views/assignments-marcom-overview___geen-rol',
        ),
        checked: ((tableState?.author_user_group || []) as string[]).includes(
          NULL_FILTER,
        ),
      },
    ];
  }, [tableState, userGroups]);

  const assignmentLabelOptions = useMemo(
    () => [
      {
        id: NULL_FILTER,
        label: tText(
          'admin/assignments/views/assignments-marcom-overview___geen-label',
        ),
        checked: ((tableState?.assignment_labels || []) as string[]).includes(
          NULL_FILTER,
        ),
      },
      ...(allQualityLabels || []).map(
        (option): CheckboxOption => ({
          id: String(option.value),
          label: option.description,
          checked: ((tableState?.assignment_labels || []) as string[]).includes(
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
          'admin/assignments/views/assignment-or-bundle-actualisation-overview___geen-organisatie',
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

  const channelNameOptions = useMemo(() => {
    const options = GET_MARCOM_CHANNEL_NAME_OPTIONS().map((option) => ({
      id: option.value,
      label: option.label,
      checked: (
        tableState?.marcom_last_communication_channel_name || []
      ).includes(option.value),
    }));
    return [
      {
        id: NULL_FILTER,
        label: tText(
          'admin/assignments/views/assignments-marcom-overview___geen-kanaal',
        ),
        checked: (
          tableState?.marcom_last_communication_channel_name || []
        ).includes(NULL_FILTER),
      },
      ...options,
    ];
  }, [tableState?.marcom_last_communication_channel_name]);

  const channelTypeOptions = useMemo(
    () => [
      ...GET_MARCOM_CHANNEL_TYPE_OPTIONS().map((option) => ({
        id: option.value,
        label: option.label,
        checked: (
          tableState?.marcom_last_communication_channel_type || []
        ).includes(option.value),
      })),
    ],
    [tableState],
  );

  const tableColumns = useMemo(
    () =>
      GET_ASSIGNMENT_MARCOM_COLUMNS(
        userGroupOptions,
        assignmentLabelOptions,
        channelNameOptions,
        subjects,
        educationLevelsAndDegrees || [],
        organisationOptions,
        channelTypeOptions,
      ),
    [
      userGroupOptions,
      assignmentLabelOptions,
      channelNameOptions,
      subjects,
      educationLevelsAndDegrees,
      organisationOptions,
      channelTypeOptions,
    ],
  );

  // methods

  useEffect(() => {
    // Update selected rows to always be a subset of the assignments array
    // In other words, you cannot have something selected that isn't part of the current filtered/paginated results
    const assignmentIds: string[] = (assignments || []).map((coll) => coll.id);
    setSelectedAssignmentIds((currentSelectedAssignmentIds) => {
      return (currentSelectedAssignmentIds || []).filter(
        (collId) => collId && assignmentIds.includes(collId),
      );
    });
  }, [assignments, setSelectedAssignmentIds]);

  const setAllAssignmentsAsSelected = async () => {
    setIsLoadingAssignmentIds(true);
    try {
      const assignmentIds =
        await AssignmentsAdminService.getAssignmentMarcomIds(
          getFilters(tableState),
        );
      ToastService.info(
        tHtml(
          'admin/assignments/views/assignments-marcom-overview___je-hebt-num-of-selected-assignments-geselecteerd',
          {
            numOfSelectedAssignments: assignmentIds.length,
          },
        ),
      );
      setSelectedAssignmentIds(assignmentIds);
    } catch (err) {
      console.error(
        new CustomError(
          'Failed to get all assignment ids that match the selected filter',
          err,
          { tableState },
        ),
      );
      ToastService.danger(
        tHtml(
          'admin/assignments/views/assignments-marcom-overview___het-ophalen-van-de-opdracht-ids-is-mislukt',
        ),
      );
    }
    setIsLoadingAssignmentIds(false);
  };

  const renderNoResults = () => {
    return (
      <ErrorView
        locationId="assignment-marcom-overview--error"
        message={tHtml(
          'admin/assignments/views/assignments-marcom-overview___er-bestaan-nog-geen-opdrachten',
        )}
      >
        <p>
          {tHtml(
            'admin/assignments/views/assignments-marcom-overview___beschrijving-wanneer-er-nog-geen-opdrachten-zijn',
          )}
        </p>
      </ErrorView>
    );
  };

  const renderAssignmentMarcomOverview = () => {
    if (isLoadingAssignments || isLoadingAssignmentIds) {
      return (
        <FullPageSpinner locationId="assignment-marcom-overview--loading" />
      );
    }
    return (
      <>
        <FilterTable
          columns={tableColumns}
          data={assignments || []}
          dataCount={assignmentCount || 0}
          renderCell={(assignment: any, columnId: string) =>
            renderAssignmentMarcomCellReact(
              assignment as Partial<AvoAssignmentAssignment>,
              columnId as AssignmentTableColumns,
              {
                allQualityLabels: allQualityLabels || [],
                editStatuses: {},
                commonUser,
              },
            )
          }
          searchTextPlaceholder={tText(
            'admin/assignments/views/assignments-marcom-overview___zoek-op-titel-beschrijving-auteur',
          )}
          noContentMatchingFiltersMessage={tText(
            'admin/assignments/views/assignments-marcom-overview___er-zijn-geen-opdracht-marcom-items-die-voldoen-aan-de-opgegeven-filters',
          )}
          itemsPerPage={ITEMS_PER_PAGE}
          onTableStateChanged={setTableState}
          renderNoResults={renderNoResults}
          rowKey="id"
          selectedItemIds={selectedAssignmentIds}
          onSelectionChanged={
            setSelectedAssignmentIds as (ids: ReactNode[]) => void
          }
          onSelectAll={setAllAssignmentsAsSelected}
          isLoading={isLoadingAssignmentIds || isLoadingAssignments}
          showCheckboxes={true}
          bulkActions={[
            {
              label: tText(
                'admin/assignments/views/assignments-marcom-overview___exporteer-alles',
              ),
              value: AssignmentsBulkAction.EXPORT_ALL,
            },
          ]}
          onSelectBulkAction={async (action: string) => {
            if (action === AssignmentsBulkAction.EXPORT_ALL) {
              setIsExportAllToCsvModalOpen(true);
            }
          }}
        />
        <ExportAllToCsvModal
          title={tText(
            'admin/assignments/views/assignments-marcom-overview___exporteren-van-alle-opdrachten-naar-csv',
          )}
          isOpen={isExportAllToCsvModalOpen}
          onClose={() => setIsExportAllToCsvModalOpen(false)}
          itemsPerRequest={20}
          fetchingItemsLabel={tText(
            'admin/assignments/views/assignments-marcom-overview___bezig-met-ophalen-van-media-items',
          )}
          generatingCsvLabel={tText(
            'admin/assignments/views/assignments-marcom-overview___bezig-met-genereren-van-de-csv',
          )}
          fetchTotalItems={async () => {
            const response =
              await AssignmentsAdminService.getAssignmentsWithMarcom(
                0,
                0,
                (tableState.sort_column || 'created_at') as AssignmentSortProps,
                tableState.sort_order || AvoSearchOrderDirection.DESC,
                getFilters(tableState),
                false,
              );
            return response.total;
          }}
          fetchMoreItems={async (offset: number, limit: number) => {
            const response =
              await AssignmentsAdminService.getAssignmentsWithMarcom(
                offset,
                limit,
                (tableState.sort_column || 'created_at') as AssignmentSortProps,
                tableState.sort_order || AvoSearchOrderDirection.DESC,
                getFilters(tableState),
                false,
              );
            return response.assignments;
          }}
          renderValue={(value: any, columnId: string) =>
            renderAssignmentsMarcomCellText(
              value as any,
              columnId as AssignmentTableColumns,
              {
                allQualityLabels: allQualityLabels || [],
                editStatuses: {},
                commonUser,
              },
            )
          }
          columns={tableColumnListToCsvColumnList(tableColumns)}
          exportFileName={tText(
            'admin/assignments/views/assignments-marcom-overview___opdrachten-marcom-csv',
          )}
        />
      </>
    );
  };

  return (
    <PermissionGuard permissions={[PermissionName.VIEW_ANY_ASSIGNMENTS]}>
      <AdminLayout
        pageTitle={tText(
          'admin/assignments/views/assignments-marcom-overview___opdrachten-marcom',
        )}
        size="full-width"
      >
        <AdminLayoutBody>
          <SeoMetadata
            title={tText(
              'admin/assignments/views/assignments-marcom-overview___collectie-marcom-beheer-overview-pagina-titel',
            )}
            description={tText(
              'admin/assignments/views/assignments-marcom-overview___collectie-marcom-beheer-overview-pagina-beschrijving',
            )}
          />
          {renderAssignmentMarcomOverview()}
        </AdminLayoutBody>
      </AdminLayout>
    </PermissionGuard>
  );
};

export default AssignmentMarcomOverview;
