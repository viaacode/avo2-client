import { ExportAllToCsvModal, FilterTable } from '@meemoo/admin-core-ui/admin';
import { Avo, PermissionName } from '@viaa/avo2-types';

import React, {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Helmet } from 'react-helmet';

import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views/ErrorView';
import { type CheckboxOption } from '../../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import { buildLink } from '../../../shared/helpers/build-link';
import { CustomError } from '../../../shared/helpers/custom-error';
import { tableColumnListToCsvColumnList } from '../../../shared/helpers/table-column-list-to-csv-column-list';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { useCompanies } from '../../../shared/hooks/useCompanies';
import { ToastService } from '../../../shared/services/toast-service';
import { ADMIN_PATH } from '../../admin.const';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import { AdminLayoutBody } from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import {
  renderItemsOverviewTableCell,
  renderItemsOverviewTableCellText,
} from '../helpers/render-item-overview-table-cell';
import { useGetItemsWithFilters } from '../hooks/useGetItemsWithFilters';
import {
  GET_ITEM_OVERVIEW_TABLE_COLS,
  ITEMS_PER_PAGE,
} from '../items.const';
import { ItemsService } from '../items.service';
import {
  type ItemsOverviewTableCols,
  type ItemsTableState,
} from '../items.types';

import { ItemBulkAction } from './ItemsOverview.types';

export const ItemsOverview: FC = () => {
  const [tableState, setTableState] = useState<Partial<ItemsTableState>>({});
  const {
    data: itemsWithFilters,
    isLoading,
    isRefetching,
    isError,
  } = useGetItemsWithFilters(tableState);

  const items = itemsWithFilters?.items;
  const itemCount = itemsWithFilters?.total;

  const [seriesOptions, setSeriesOptions] = useState<CheckboxOption[] | null>(
    null,
  );
  const [companies] = useCompanies(true);
  const [isExportAllToCsvModalOpen, setIsExportAllToCsvModalOpen] =
    useState(false);

  const companyOptions = useMemo(
    () =>
      companies.map(
        (option: Partial<Avo.Organization.Organization>): CheckboxOption => ({
          id: option.or_id as string,
          label: option.name as string,
          checked: ((tableState?.organisation || []) as string[]).includes(
            String(option.or_id),
          ),
        }),
      ),
    [companies, tableState],
  );

  const tableColumns = useMemo(
    () =>
      GET_ITEM_OVERVIEW_TABLE_COLS(seriesOptions || [], companyOptions || []),
    [companyOptions, seriesOptions],
  );

  // methods
  const fetchAllSeries = useCallback(async () => {
    try {
      setSeriesOptions(
        ((await ItemsService.fetchAllSeries()) || []).map(
          (serie: string): CheckboxOption => ({
            id: serie,
            label: serie,
            checked: false,
          }),
        ),
      );
    } catch (err) {
      console.error(
        new CustomError(
          'Failed to load all item series from the database',
          err,
        ),
      );
      ToastService.danger(
        tHtml(
          'admin/items/views/items-overview___het-ophalen-van-de-reeks-opties-is-mislukt',
        ),
      );
    }
  }, []);

  useEffect(() => {
    fetchAllSeries();
  }, [fetchAllSeries]);

  const handleBulkActionClicked = (action: ItemBulkAction) => {
    if (action === ItemBulkAction.EXPORT_ALL) {
      setIsExportAllToCsvModalOpen(true);
    }
  };

  const getItemDetailLink = (externalId: string | undefined) => {
    return buildLink(APP_PATH.ITEM_DETAIL.route, { id: externalId });
  };

  const getItemAdminDetailLink = (uuid: string | undefined) => {
    return buildLink(ADMIN_PATH.ITEM_DETAIL, { id: uuid });
  };

  const renderNoResults = () => {
    return (
      <ErrorView
        message={tHtml(
          'admin/items/views/items-overview___er-bestaan-nog-geen-items',
        )}
      >
        <p>
          {tHtml(
            'admin/items/views/items-overview___beschrijving-wanneer-er-nog-geen-items-zijn',
          )}
        </p>
      </ErrorView>
    );
  };

  const renderItemsOverview = () => {
    return (
      <>
        <FilterTable
          columns={tableColumns}
          data={items || []}
          dataCount={itemCount || 0}
          renderCell={(rowData: Partial<Avo.Item.Item>, columnId: string) =>
            renderItemsOverviewTableCell(
              rowData,
              columnId as ItemsOverviewTableCols,
              {
                getItemDetailLink,
                getItemAdminDetailLink,
              },
            )
          }
          searchTextPlaceholder={tText(
            'admin/items/views/items-overview___zoek-op-pid-titel-beschrijving-organisatie',
          )}
          noContentMatchingFiltersMessage={tText(
            'admin/items/views/items-overview___er-zijn-geen-items-doe-voldoen-aan-de-opgegeven-filters',
          )}
          errorMessage={tHtml(
            'admin/items/views/items-overview___het-ophalen-van-de-items-is-mislukt',
          )}
          isError={isError}
          itemsPerPage={ITEMS_PER_PAGE}
          onTableStateChanged={setTableState}
          renderNoResults={renderNoResults}
          rowKey="uid"
          isLoading={isLoading || isRefetching}
          showCheckboxes={false}
          bulkActions={[
            {
              label: tText(
                'admin/items/views/items-overview___exporteer-alles',
              ),
              value: ItemBulkAction.EXPORT_ALL,
            },
          ]}
          onSelectBulkAction={(action) =>
            handleBulkActionClicked(action as ItemBulkAction)
          }
        />
        <ExportAllToCsvModal
          title={tText(
            'admin/items/views/items-overview___exporteren-van-alle-media-items-naar-csv',
          )}
          isOpen={isExportAllToCsvModalOpen}
          onClose={() => setIsExportAllToCsvModalOpen(false)}
          itemsPerRequest={20}
          fetchingItemsLabel={tText(
            'admin/items/views/items-overview___bezig-met-ophalen-van-media-items',
          )}
          generatingCsvLabel={tText(
            'admin/items/views/items-overview___bezig-met-genereren-van-de-csv',
          )}
          fetchTotalItems={async () => {
            const response = await ItemsService.fetchItemsWithFilters(
              0,
              0,
              (tableState.sort_column ||
                'created_at') as ItemsOverviewTableCols,
              tableState.sort_order || Avo.Search.OrderDirection.DESC,
              {},
            );
            return response.total;
          }}
          fetchMoreItems={async (offset: number, limit: number) => {
            const response = await ItemsService.fetchItemsWithFilters(
              offset,
              limit,
              (tableState.sort_column ||
                'created_at') as ItemsOverviewTableCols,
              tableState.sort_order || Avo.Search.OrderDirection.DESC,
              {},
            );
            return response.items;
          }}
          renderValue={(value: any, columnId: string) =>
            renderItemsOverviewTableCellText(
              value as Partial<Avo.Item.Item>,
              columnId as ItemsOverviewTableCols,
            )
          }
          columns={tableColumnListToCsvColumnList(tableColumns)}
          exportFileName={tText(
            'admin/items/views/items-overview___media-items-csv',
          )}
        />
      </>
    );
  };

  return (
    <PermissionGuard permissions={[PermissionName.VIEW_ITEMS_OVERVIEW]}>
      <AdminLayout
        pageTitle={tText('admin/items/views/items-overview___items')}
        size="full-width"
      >
        <AdminLayoutBody>
          <Helmet>
            <title>
              {GENERATE_SITE_TITLE(
                tText(
                  'admin/items/views/items-overview___item-beheer-overview-pagina-titel',
                ),
              )}
            </title>
            <meta
              name="description"
              content={tText(
                'admin/items/views/items-overview___item-beheer-overview-pagina-beschrijving',
              )}
            />
          </Helmet>
          {renderItemsOverview()}
        </AdminLayoutBody>
      </AdminLayout>
    </PermissionGuard>
  );
};

export default ItemsOverview;
