import { toggleSortOrder } from '@meemoo/admin-core-ui/admin';
import { SanitizePreset, sanitizeHtml } from '@meemoo/admin-core-ui/client';
import { type RichEditorState } from '@meemoo/react-components';
import {
  Button,
  ButtonToolbar,
  Container,
  Flex,
  FormGroup,
  Icon,
  IconName,
  Pill,
  PillVariants,
  Spinner,
  Table,
  Tabs,
  Toolbar,
  ToolbarRight,
} from '@viaa/avo2-components';
import {
  AvoFileUploadAssetType,
  AvoSearchOrderDirection,
  PermissionName,
} from '@viaa/avo2-types';
import { compact, noop } from 'es-toolkit';
import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';

import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { redirectToClientPage } from '../../../authentication/helpers/redirects/redirects';
import { APP_PATH } from '../../../constants';
import { EmbedCodeFilterTableCell } from '../../../embed-code/components/EmbedCodeFilterTableCell';
import { type EmbedCode } from '../../../embed-code/embed-code.types';
import { toEmbedCodeDetail } from '../../../embed-code/helpers/links';
import { ConfirmModal } from '../../../shared/components/ConfirmModal/ConfirmModal';
import { FileUpload } from '../../../shared/components/FileUpload/FileUpload.tsx';
import { QuickLaneFilterTableCell } from '../../../shared/components/QuickLaneFilterTableCell/QuickLaneFilterTableCell';
import { RICH_TEXT_EDITOR_OPTIONS_FULL } from '../../../shared/components/RichTextEditorWrapper/RichTextEditor.consts';
import { RichTextEditorWrapper } from '../../../shared/components/RichTextEditorWrapper/RichTextEditorWrapper';
import { SeoMetadata } from '../../../shared/components/SeoMetadata/SeoMetadata.tsx';
import { Lookup_Enum_Relation_Types_Enum } from '../../../shared/generated/graphql-db-types';
import { buildLink } from '../../../shared/helpers/build-link';
import { CustomError } from '../../../shared/helpers/custom-error';
import {
  formatDate,
  formatTimestamp,
} from '../../../shared/helpers/formatters/date';
import { getSubtitles } from '../../../shared/helpers/get-subtitles';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import {
  StringParam,
  useQueryParams,
} from '../../../shared/helpers/routing/use-query-params-ssr';
import { ACTIONS_TABLE_COLUMN_ID } from '../../../shared/helpers/table-column-list-to-csv-column-list';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import { useTabs } from '../../../shared/hooks/useTabs';
import { RelationService } from '../../../shared/services/relation-service/relation.service';
import { ToastService } from '../../../shared/services/toast-service';
import { ADMIN_PATH } from '../../admin.const';
import {
  renderDateDetailRows,
  renderDetailRow,
  renderSimpleDetailRows,
} from '../../shared/helpers/render-detail-fields';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import {
  AdminLayoutBody,
  AdminLayoutHeader,
  AdminLayoutTopBarRight,
} from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import { DepublishItemModal } from '../components/DepublishItemModal/DepublishItemModal';
import { mapItemUsedByToQuickLane } from '../helpers/map-item-used-by-to-quick-lane';
import { useGetItemUsedBy } from '../hooks/useGetItemUsedBy';
import { useGetItemWithRelations } from '../hooks/useGetItemWithRelations';
import {
  GET_ITEM_USED_BY_COLLECTIONS_AND_ASSIGNMENTS_COLUMNS,
  GET_ITEM_USED_BY_EMBED_CODES,
  GET_ITEM_USED_BY_QUICK_LANES,
  GET_TABS,
  ITEMS_TABS,
} from '../items.const';
import { ItemsService } from '../items.service';
import { type ItemUsedByColumnId, type ItemUsedByEntry } from '../items.types';

import './ItemDetailAdmin.scss';

export const ItemDetailAdmin: FC = () => {
  const navigateFunc = useNavigate();

  const { id: itemUuid } = useParams<{ id: string }>();

  // Hooks
  const [queryParams, setQueryParams] = useQueryParams({
    sortProp: StringParam,
    sortDirection: StringParam,
  });
  const {
    data: item,
    isLoading: itemIsLoading,
    refetch: refetchItem,
  } = useGetItemWithRelations(itemUuid as string, { enabled: !!itemUuid });
  const { data: itemUsedBy, isError: itemUsedByIsError } = useGetItemUsedBy(
    {
      itemUuid: itemUuid as string,
      sortProp: queryParams.sortProp || undefined,
      sortDirection: queryParams.sortDirection || undefined,
    },
    { enabled: !!itemUuid },
  );

  const [isConfirmPublishModalOpen, setIsConfirmPublishModalOpen] =
    useState<boolean>(false);
  const [isDepublishItemModalOpen, setDepublishItemModalOpen] =
    useState<boolean>(false);

  const [itemSeoImagePath, setItemSeoImagePath] = useState<string | null>();
  const [noteEditorState, setNoteEditorState] = useState<RichEditorState>();

  const [activeTab, setActiveTab, tabs] = useTabs(
    GET_TABS(),
    ITEMS_TABS.GENERAL,
  );

  /**
   * Set editable SEO image path when item is loaded
   */
  useEffect(() => {
    if (item) {
      setItemSeoImagePath(item.seo_image_path || null);
    }
  }, [item]);

  const getTabCount = (tab: string | number) => {
    switch (tab) {
      case ITEMS_TABS.COLLECTIONS:
        return itemUsedBy?.collections.length;
      case ITEMS_TABS.ASSIGNMENTS:
        return itemUsedBy?.assignments.length;
      case ITEMS_TABS.QUICK_LANE:
        return itemUsedBy?.quickLanes.length;
      case ITEMS_TABS.EMBEDS:
        return itemUsedBy?.embedCodes.length;
      case ITEMS_TABS.GENERAL:
      default:
        return 0;
    }
  };

  const getNavTabs = useCallback(() => {
    return compact(
      tabs.map((tab) => {
        const isTabActive = activeTab === tab.id;
        const tabCount = getTabCount(tab.id);
        return {
          ...tab,
          active: isTabActive,
          label: tabCount ? (
            <>
              {tab.label}
              <Pill variants={isTabActive ? [PillVariants.active] : []}>
                {tabCount}
              </Pill>
            </>
          ) : (
            tab.label
          ),
        };
      }),
    );
  }, [activeTab, getTabCount]);

  const toggleItemPublishedState = async () => {
    try {
      setIsConfirmPublishModalOpen(false);
      if (!item) {
        throw new CustomError('The item has not been loaded yet', null, {
          item,
        });
      }
      if (!item.is_published) {
        await ItemsService.setItemPublishedState(item.uid, !item.is_published);
        await RelationService.deleteRelationsBySubject(
          'item',
          item.uid,
          Lookup_Enum_Relation_Types_Enum.IsReplacedBy,
        );
        await ItemsService.setItemDepublishReason(item.uid, null);

        await refetchItem();
        ToastService.success(
          tHtml('admin/items/views/item-detail___het-item-is-gepubliceerd'),
        );
      } else {
        setDepublishItemModalOpen(true);
      }
    } catch (err) {
      console.error(
        new CustomError('Failed to toggle is_published state for item', err, {
          item,
        }),
      );
      ToastService.danger(
        tHtml(
          'admin/items/views/item-detail___het-de-publiceren-van-het-item-is-mislukt',
        ),
      );
    }
  };

  const navigateToItemDetail = () => {
    if (!item) {
      ToastService.danger(
        tHtml('admin/items/views/item-detail___dit-item-heeft-geen-geldig-pid'),
      );
      return;
    }
    const link = buildLink(APP_PATH.ITEM_DETAIL.route, {
      id: item.external_id,
    });
    redirectToClientPage(link, navigateFunc);
  };

  const navigateToCollectionDetail = (id: string) => {
    const link = buildLink(APP_PATH.COLLECTION_DETAIL.route, { id });
    redirectToClientPage(link, navigateFunc);
  };

  const navigateToAssignmentDetail = (id: string) => {
    const link = buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, { id });
    redirectToClientPage(link, navigateFunc);
  };

  const handleColumnClick = (columnId: string) => {
    setQueryParams({
      sortProp: columnId,
      sortDirection: toggleSortOrder(queryParams.sortDirection),
    });
  };

  const saveItemFields = async () => {
    try {
      if (!item) {
        return;
      }
      const note =
        sanitizeHtml(
          (noteEditorState ? noteEditorState.toHTML() : (item as any).note) ||
            '',
          SanitizePreset.link,
        ) || null;
      await ItemsService.updateItemByUuid(
        item.uid,
        note,
        itemSeoImagePath || null,
      );
      ToastService.success(
        tHtml('admin/items/views/item-detail-admin___opgeslagen'),
      );
    } catch (err) {
      console.error(
        new CustomError('Failed to save item note/seo image url', err, {
          item,
        }),
      );
      ToastService.danger(
        tHtml(
          'admin/items/views/item-detail-admin___het-opslaan-van-de-opmerkingen-seo-afbeelding-is-mislukt',
        ),
      );
    }
  };

  const renderCell = (
    rowData: ItemUsedByEntry,
    columnId: ItemUsedByColumnId & 'actions',
  ): ReactNode => {
    switch (columnId) {
      case 'createdAt': {
        switch (rowData.type) {
          case 'QUICK_LANE': {
            return (
              <QuickLaneFilterTableCell
                id="created_at"
                data={mapItemUsedByToQuickLane(rowData)}
              />
            );
          }
          case 'EMBED_CODE': {
            const date = rowData.createdAt;
            return (
              <span title={formatTimestamp(date)}>{formatDate(date)}</span>
            );
          }

          default:
            return rowData[columnId];
        }
      }

      case 'title': {
        switch (rowData.type) {
          case 'QUICK_LANE': {
            return (
              <QuickLaneFilterTableCell
                id={columnId}
                data={mapItemUsedByToQuickLane(rowData)}
              />
            );
          }
          case 'EMBED_CODE': {
            const href = toEmbedCodeDetail(rowData.id);
            return (
              <a
                href={href}
                rel="noopener noreferrer"
                target="_blank"
                title={rowData.title}
              >
                {rowData.title}
              </a>
            );
          }

          default:
            return rowData[columnId];
        }
      }

      case 'owner': {
        return truncateTableValue(rowData.owner || '-');
      }

      case 'organisation':
        return rowData.organisation || '-';

      case 'isPublic':
        return (
          <div
            title={
              rowData.isPublic
                ? tText(
                    'collection/components/collection-or-bundle-overview___publiek',
                  )
                : tText(
                    'collection/components/collection-or-bundle-overview___niet-publiek',
                  )
            }
          >
            <Icon name={rowData.isPublic ? IconName.unlock3 : IconName.lock} />
          </div>
        );

      case 'externalWebsite': {
        return (
          <EmbedCodeFilterTableCell
            id={columnId}
            data={
              {
                ...rowData,
                contentId: rowData.id,
              } as unknown as Partial<EmbedCode>
            }
            onNameClick={noop}
          />
        );
      }

      case ACTIONS_TABLE_COLUMN_ID: {
        if (rowData.type === 'QUICK_LANE') {
          return null; // quick lanes do not have a detail page
        }
        const label =
          rowData.type === 'COLLECTION'
            ? tText(
                'admin/items/views/item-detail___ga-naar-de-collectie-detail-pagina',
              )
            : tText(
                'admin/items/views/item-detail___ga-naar-de-opdracht-detail-pagina',
              );
        return (
          <Button
            type="borderless"
            icon={IconName.eye}
            title={label}
            ariaLabel={label}
            onClick={(evt) => {
              evt.stopPropagation();
              if (rowData.type === 'COLLECTION') {
                navigateToCollectionDetail(rowData.id as string);
              } else {
                navigateToAssignmentDetail(rowData.id as string);
              }
            }}
          />
        );
      }

      default:
        return rowData[columnId];
    }
  };

  const renderGeneralInfoTable = () => {
    const itemMeta = item?.relations?.[0]?.object_meta;
    const replacementTitle = itemMeta?.title;
    const replacementExternalId = itemMeta?.external_id;
    const replacementUuid = itemMeta?.uid;

    const subtitles = getSubtitles(item);

    return (
      <div className="m-item-detail-admin__general-info">
        <Table horizontal variant="invisible" className="c-table_detail-page">
          <tbody>
            {renderSimpleDetailRows(item, [
              ['uid', tText('admin/items/views/item-detail___av-o-uuid')],
              ['external_id', tText('admin/items/views/item-detail___pid')],
              ['is_published', tText('admin/items/views/item-detail___pubiek')],
              [
                'is_deleted',
                tText('admin/items/views/item-detail___verwijderd'),
              ],
            ])}
            {renderDateDetailRows(item, [
              [
                'created_at',
                tText('admin/items/views/item-detail___aangemaakt-op'),
              ],
              [
                'updated_at',
                tText('admin/items/views/item-detail___aangepast-op'),
              ],
              [
                'issued',
                tText('admin/items/views/item-detail___uitgegeven-op'),
              ],
              [
                'published_at',
                tText('admin/items/views/item-detail___gepubliceert-op'),
              ],
              [
                'publish_at',
                tText('admin/items/views/item-detail___te-publiceren-op'),
              ],
              [
                'depublish_at',
                tText('admin/items/views/item-detail___te-depubliceren-op'),
              ],
            ])}
            {renderSimpleDetailRows(item, [
              [
                'depublish_reason',
                tText('admin/items/views/item-detail___reden-tot-depubliceren'),
              ],
            ])}
            {renderDetailRow(
              replacementUuid ? (
                <Link
                  to={buildLink(ADMIN_PATH.ITEM_DETAIL, {
                    id: replacementUuid,
                  })}
                >{`${replacementTitle} (${replacementExternalId})`}</Link>
              ) : (
                '-'
              ),
              tText('admin/items/views/item-detail___vervangen-door'),
            )}
            {renderSimpleDetailRows(item, [
              [
                'view_count.count',
                tText('admin/items/views/item-detail___views'),
              ],
            ])}
            {renderDetailRow(
              subtitles
                ? subtitles.map((subtitle) => (
                    <a key={subtitle.id} href={subtitle.src}>
                      {subtitle.label}
                    </a>
                  ))
                : '-',
              tText('admin/items/views/item-detail___ondertitels'),
            )}
          </tbody>
        </Table>
        <FormGroup label={tText('admin/items/views/item-detail___opmerkingen')}>
          <div style={{ backgroundColor: '#ffffff' }}>
            <RichTextEditorWrapper
              id="note"
              controls={RICH_TEXT_EDITOR_OPTIONS_FULL}
              fileType={AvoFileUploadAssetType.ITEM_NOTE_IMAGE}
              initialHtml={item?.note || undefined}
              state={noteEditorState}
              onChange={setNoteEditorState}
            />
          </div>
        </FormGroup>
        {!!item && (
          <FormGroup
            label={tText(
              'admin/items/views/item-detail-admin___afbeelding-voor-seo-fb',
            )}
            labelFor="ogImageId"
          >
            <FileUpload
              label={tText(
                'collection/components/collection-or-bundle-edit-publication-details___upload-een-og-afbeelding',
              )}
              urls={compact([itemSeoImagePath])}
              allowMulti={false}
              assetType={AvoFileUploadAssetType.ITEM_OG_IMAGE}
              ownerId={item?.external_id}
              onChange={(urls) => setItemSeoImagePath(urls[0] || null)}
            />
          </FormGroup>
        )}
        <Toolbar>
          <ToolbarRight>
            <Button
              label={tText('admin/items/views/item-detail-admin___opslaan')}
              onClick={saveItemFields}
            />
          </ToolbarRight>
        </Toolbar>
      </div>
    );
  };

  const renderContainingCollectionTable = () => {
    if (itemUsedByIsError) {
      return tText(
        'admin/items/views/item-detail___het-ophalen-van-de-collecties-opdrachten-en-sneldeel-links-die-dit-item-gebruiken-is-mislukt',
      );
    }

    return (
      <>
        {itemUsedBy?.collections?.length ? (
          <Table
            columns={GET_ITEM_USED_BY_COLLECTIONS_AND_ASSIGNMENTS_COLUMNS()}
            data={itemUsedBy.collections}
            onColumnClick={handleColumnClick as any}
            onRowClick={(coll) => navigateToCollectionDetail(coll.id)}
            renderCell={renderCell as any}
            sortColumn={queryParams.sortProp || undefined}
            sortOrder={
              queryParams.sortDirection as AvoSearchOrderDirection | undefined
            }
            variant="styled"
            rowKey="id"
          />
        ) : (
          tText(
            'admin/items/views/item-detail___dit-item-is-in-geen-enkele-collectie-opgenomen',
          )
        )}
      </>
    );
  };

  const renderContainingAssignmentTable = () => (
    <>
      {itemUsedBy?.assignments?.length ? (
        <Table
          columns={GET_ITEM_USED_BY_COLLECTIONS_AND_ASSIGNMENTS_COLUMNS()}
          data={itemUsedBy.assignments}
          onColumnClick={handleColumnClick as any}
          onRowClick={(coll) => navigateToAssignmentDetail(coll.id)}
          renderCell={renderCell as any}
          sortColumn={queryParams.sortProp || undefined}
          sortOrder={
            queryParams.sortDirection as AvoSearchOrderDirection | undefined
          }
          variant="styled"
          rowKey="id"
        />
      ) : (
        tText(
          'admin/items/views/item-detail___dit-item-is-in-geen-enkele-opdracht-opgenomen',
        )
      )}
    </>
  );

  const renderAssociatedQuickLaneTable = () => (
    <>
      {itemUsedBy?.quickLanes?.length ? (
        <>
          <Table
            columns={GET_ITEM_USED_BY_QUICK_LANES()}
            data={itemUsedBy.quickLanes}
            onColumnClick={handleColumnClick}
            renderCell={renderCell as any}
            sortColumn={queryParams.sortProp || undefined}
            sortOrder={
              queryParams.sortDirection as AvoSearchOrderDirection | undefined
            }
            variant="styled"
            rowKey="id"
          />
        </>
      ) : (
        tText(
          'admin/items/views/item-detail___dit-fragment-is-nog-niet-gedeeld',
        )
      )}
    </>
  );

  const renderAssociatedEmbedCodesTable = () => (
    <>
      {itemUsedBy?.embedCodes?.length ? (
        <>
          <Table
            columns={GET_ITEM_USED_BY_EMBED_CODES()}
            data={itemUsedBy.embedCodes}
            onColumnClick={handleColumnClick}
            renderCell={renderCell as any}
            sortColumn={queryParams.sortProp || undefined}
            sortOrder={
              queryParams.sortDirection as AvoSearchOrderDirection | undefined
            }
            variant="styled"
            rowKey="id"
          />
        </>
      ) : (
        tText(
          'admin/items/views/item-detail___dit-fragment-werd-nog-niets-gedeeld-op-smartschool-of-bookwidgets',
        )
      )}
    </>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case ITEMS_TABS.GENERAL:
        return renderGeneralInfoTable();
      case ITEMS_TABS.COLLECTIONS:
        return renderContainingCollectionTable();
      case ITEMS_TABS.ASSIGNMENTS:
        return renderContainingAssignmentTable();
      case ITEMS_TABS.QUICK_LANE:
        return renderAssociatedQuickLaneTable();
      case ITEMS_TABS.EMBEDS:
        return renderAssociatedEmbedCodesTable();
      default:
        return <></>;
    }
  };

  const renderItemDetail = () => {
    if (!item) {
      console.error(
        new CustomError(
          'Failed to load item because render function is called before item was fetched',
        ),
      );
      return;
    }

    return (
      <>
        {renderTabContent()}
        <ConfirmModal
          title={
            item.is_published
              ? tText('admin/items/views/item-detail___depubliceren')
              : tText('admin/items/views/item-detail___publiceren')
          }
          body={
            item.is_published
              ? tText(
                  'admin/items/views/item-detail___weet-je-zeker-dat-je-dit-item-wil-depubliceren',
                )
              : tText(
                  'admin/items/views/item-detail___weet-je-zeker-dat-je-dit-item-wil-publiceren',
                )
          }
          confirmLabel={
            item.is_published
              ? tText('admin/items/views/item-detail___depubliceren')
              : 'Publiceren'
          }
          isOpen={isConfirmPublishModalOpen}
          onClose={() => setIsConfirmPublishModalOpen(false)}
          confirmCallback={toggleItemPublishedState}
        />
        <DepublishItemModal
          item={item}
          isOpen={isDepublishItemModalOpen}
          onClose={async () => {
            setDepublishItemModalOpen(false);
            await refetchItem();
          }}
        />
      </>
    );
  };

  const renderItemDetailPage = () => {
    if (itemIsLoading) {
      return (
        <Container mode="vertical">
          <Flex orientation="horizontal" center>
            <Spinner size="large" />
          </Flex>
        </Container>
      );
    }
    if (!item) {
      return null;
    }
    return (
      <AdminLayout
        onClickBackButton={() =>
          goBrowserBackWithFallback(ADMIN_PATH.ITEMS_OVERVIEW, navigateFunc)
        }
        pageTitle={`${tText('admin/items/views/item-detail___item-details')}: ${
          item.title
        }`}
        size="full-width"
      >
        <AdminLayoutTopBarRight>
          {!!item && (
            <ButtonToolbar>
              <Button
                type={item.is_published ? 'danger' : 'primary'}
                label={
                  item.is_published
                    ? tText('admin/items/views/item-detail___depubliceren')
                    : tText('admin/items/views/item-detail___publiceren')
                }
                ariaLabel={
                  item.is_published
                    ? tText(
                        'admin/items/views/item-detail___depubliceer-dit-item',
                      )
                    : tText(
                        'admin/items/views/item-detail___publiceer-dit-item',
                      )
                }
                title={
                  item.is_published
                    ? tText(
                        'admin/items/views/item-detail___depubliceer-dit-item',
                      )
                    : tText(
                        'admin/items/views/item-detail___publiceer-dit-item',
                      )
                }
                onClick={() => {
                  if (item.is_published) {
                    setIsConfirmPublishModalOpen(true);
                  } else {
                    toggleItemPublishedState();
                  }
                }}
              />
              <Button
                label={tText(
                  'admin/items/views/item-detail___bekijk-item-in-de-website',
                )}
                onClick={navigateToItemDetail}
              />
            </ButtonToolbar>
          )}
        </AdminLayoutTopBarRight>
        <AdminLayoutHeader>
          <div className="u-bg-gray-50">
            <Container mode="horizontal" size="full-width">
              <Tabs tabs={getNavTabs()} onClick={(id) => setActiveTab(id)} />
            </Container>
          </div>
        </AdminLayoutHeader>
        <AdminLayoutBody>{renderItemDetail()}</AdminLayoutBody>
      </AdminLayout>
    );
  };

  return (
    <>
      <PermissionGuard permissions={[PermissionName.VIEW_ITEMS_OVERVIEW]}>
        <SeoMetadata
          title={
            (item?.title,
            tText(
              'admin/items/views/item-detail___item-beheer-detail-pagina-titel',
            ))
          }
          description={item?.description || ''}
        />
        {renderItemDetailPage()}
      </PermissionGuard>
    </>
  );
};

export default ItemDetailAdmin;
