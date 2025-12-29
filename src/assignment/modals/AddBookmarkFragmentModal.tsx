import {
  Button,
  ButtonToolbar,
  Container,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  IconName,
  Modal,
  ModalBody,
  ModalFooterRight,
  Spacer,
  Table,
  type TableColumn,
  TextInput,
  Thumbnail,
} from '@viaa/avo2-components';

import { noop } from 'es-toolkit';
import { useAtomValue } from 'jotai';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

import { commonUserAtom } from '../../authentication/authentication.store';
import {
  LoadingErrorLoadedComponent,
  type LoadingInfo,
} from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { CustomError } from '../../shared/helpers/custom-error';
import { formatDate } from '../../shared/helpers/formatters/date';
import { getOrderObject } from '../../shared/helpers/generate-order-gql-query';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';
import { truncateTableValue } from '../../shared/helpers/truncate';
import { useTableSort } from '../../shared/hooks/useTableSort';
import { BookmarksViewsPlaysService } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service';
import { type BookmarkInfo } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { ToastService } from '../../shared/services/toast-service';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';

import './AddItemsModals.scss';
import { AvoSearchOrderDirection } from '@viaa/avo2-types';

// Column definitions
enum AddBookmarkFragmentColumn {
  contentTitle = 'contentTitle',
  contentDuration = 'contentDuration',
  createdAt = 'createdAt',
}

const GET_ADD_BOOKMARK_FRAGMENT_COLUMNS = (): TableColumn[] => [
  {
    id: AddBookmarkFragmentColumn.contentTitle,
    label: tText('assignment/modals/add-bookmark-fragment-modal___titel'),
    sortable: true,
    dataType: 'string',
  },
  {
    id: AddBookmarkFragmentColumn.contentDuration,
    label: tText('assignment/modals/add-bookmark-fragment-modal___speelduur'),
    sortable: true,
    dataType: 'string',
  },
  {
    id: AddBookmarkFragmentColumn.createdAt,
    label: tText(
      'assignment/modals/add-bookmark-fragment-modal___laatst-toegevoegd',
    ),
    sortable: true,
    dataType: 'dateTime',
  },
];

const TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<{
  [columnId in AddBookmarkFragmentColumn]: (
    order: AvoSearchOrderDirection,
  ) => any;
}> = {
  contentTitle: (order: AvoSearchOrderDirection) => ({
    bookmarkedItem: {
      title: order,
    },
  }),
  contentDuration: (order: AvoSearchOrderDirection) => ({
    bookmarkedItem: {
      duration: order,
    },
  }),
  createdAt: (order: AvoSearchOrderDirection) => ({
    created_at: order,
  }),
};

export interface AddBookmarkFragmentModalProps {
  isOpen: boolean;
  onClose?: () => void;
  addFragmentCallback?: (fragmentId: string) => void;
}

export const AddBookmarkFragmentModal: FC<AddBookmarkFragmentModalProps> = ({
  isOpen,
  onClose,
  addFragmentCallback = () => {
    return;
  },
}) => {
  const commonUser = useAtomValue(commonUserAtom);

  const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({
    state: 'loading',
  });
  const [bookmarks, setBookmarks] = useState<BookmarkInfo[] | null>(null);
  const [selectedBookmarkId, setSelectedBookmarkId] = useState<string>();
  const [sortColumn, sortOrder, handleColumnClick] =
    useTableSort<AddBookmarkFragmentColumn>(
      AddBookmarkFragmentColumn.createdAt,
    );
  const [filterString, setFilterString] = useState<string>('');

  const tableColumns = useMemo(() => GET_ADD_BOOKMARK_FRAGMENT_COLUMNS(), []);

  const fetchBookmarks = useCallback(async () => {
    try {
      if (!commonUser) {
        throw new CustomError('Could not determine authenticated user.');
      }

      const column = tableColumns.find(
        (tableColumn: any) => tableColumn.id || '' === (sortColumn as any),
      );
      const columnDataType: TableColumnDataType = (column?.dataType ||
        TableColumnDataType.string) as TableColumnDataType;

      const bookmarkInfos =
        await BookmarksViewsPlaysService.getItemBookmarksForUser(
          commonUser,
          filterString,
          getOrderObject(
            sortColumn,
            sortOrder,
            columnDataType,
            TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
          ),
        );
      setBookmarks(bookmarkInfos);
    } catch (err) {
      console.error(new CustomError('Failed to get bookmarks', err));
      setLoadingInfo({
        state: 'error',
        message: tHtml(
          'assignment/modals/add-bookmark-fragment-modal___het-ophalen-van-bladwijzers-is-mislukt',
        ),
      });
    }
  }, [tableColumns, commonUser, filterString, sortColumn, sortOrder]);

  useEffect(() => {
    if (bookmarks) {
      setLoadingInfo({
        state: 'loaded',
      });
    }
  }, [bookmarks, setLoadingInfo]);

  useEffect(() => {
    if (isOpen) {
      fetchBookmarks();
    }
  }, [isOpen, fetchBookmarks]);

  const handleImportToAssignment = () => {
    if (!selectedBookmarkId) {
      ToastService.danger(
        tHtml(
          'assignment/modals/add-bookmark-fragment-modal___gelieve-een-fragment-te-selecteren',
        ),
      );
      return;
    }
    addFragmentCallback(selectedBookmarkId);
    (onClose || noop)();
  };

  const handleSelectedBookmarkItemChanged = (
    selectedIds: (string | number)[],
  ) => {
    setSelectedBookmarkId((selectedIds[0] as string) || undefined);
  };

  const renderCell = (
    bookmark: BookmarkInfo,
    colKey: AddBookmarkFragmentColumn,
  ) => {
    switch (colKey) {
      case AddBookmarkFragmentColumn.contentTitle: {
        const renderTitle = () => (
          <div className="c-content-header c-content-header--small">
            <Flex orientation="horizontal">
              <Thumbnail
                alt="thumbnail"
                category={bookmark.contentType}
                className="m-collection-overview-thumbnail"
                src={bookmark.contentThumbnailPath || undefined}
                showCategoryIcon
              />
              <Flex orientation="vertical" center>
                <FlexItem>
                  <h3 className="c-content-header__header u-m-0">
                    {truncateTableValue(bookmark.contentTitle)}
                  </h3>
                  <span>{bookmark.contentOrganisation || ''}</span>
                </FlexItem>
              </Flex>
            </Flex>
          </div>
        );

        return isMobileWidth() ? (
          <Spacer margin="bottom-small">{renderTitle()}</Spacer>
        ) : (
          renderTitle()
        );
      }

      case AddBookmarkFragmentColumn.createdAt:
        return formatDate(new Date(bookmark.createdAt));

      // duration does not require specific rendering

      default:
        return (bookmark as any)[colKey];
    }
  };

  const renderModalBody = () => {
    return (
      <>
        <Container mode="horizontal">
          <Form type="inline">
            <FormGroup inlineMode="grow">
              <TextInput
                className="c-add-fragment-modal__search-input"
                icon={IconName.filter}
                value={filterString}
                onChange={setFilterString}
                disabled={!bookmarks}
              />
            </FormGroup>
          </Form>
        </Container>

        <div className="c-add-fragment-modal__table-wrapper">
          <Table
            columns={tableColumns}
            data={bookmarks || undefined}
            emptyStateMessage={
              filterString
                ? tText(
                    'workspace/assignments/create___er-zijn-geen-bladwijzers-die-voldoen-aan-de-zoekopdracht',
                  )
                : tText(
                    'workspace/assignments/create___geen-bladwijzers-aangemaakt',
                  )
            }
            renderCell={(rowData: BookmarkInfo, colKey: string) =>
              renderCell(rowData, colKey as AddBookmarkFragmentColumn)
            }
            rowKey="contentLinkId"
            variant="styled"
            onColumnClick={handleColumnClick as any}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            showRadioButtons
            selectedItemIds={selectedBookmarkId ? [selectedBookmarkId] : []}
            onSelectionChanged={handleSelectedBookmarkItemChanged}
            onRowClick={(bookmark) => {
              setSelectedBookmarkId(bookmark.contentLinkId);
            }}
          />
        </div>
      </>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      title={tHtml(
        'assignment/modals/add-bookmark-fragment-modal___fragment-toevoegen-uit-bladwijzers',
      )}
      size="large"
      onClose={onClose}
      scrollable
      className="c-content c-add-fragment-modal"
    >
      <ModalBody>
        <LoadingErrorLoadedComponent
          loadingInfo={loadingInfo}
          dataObject={bookmarks}
          render={renderModalBody}
          locationId="add-bookmark-fragment-modal"
        />
      </ModalBody>

      <ModalFooterRight>
        <ButtonToolbar>
          <Button
            type="secondary"
            label={tText(
              'assignment/modals/add-bookmark-fragment-modal___annuleer',
            )}
            onClick={onClose}
          />
          <Button
            type="primary"
            label={tText(
              'assignment/modals/add-bookmark-fragment-modal___voeg-toe',
            )}
            onClick={handleImportToAssignment}
          />
        </ButtonToolbar>
      </ModalFooterRight>
    </Modal>
  );
};
