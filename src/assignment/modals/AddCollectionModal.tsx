import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Container,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Icon,
  IconName,
  Modal,
  ModalBody,
  ModalFooterLeft,
  ModalFooterRight,
  Select,
  Spacer,
  Table,
  type TableColumn,
  TextInput,
  Toggle,
  Toolbar,
  ToolbarItem,
  ToolbarLeft,
  ToolbarRight,
} from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import { useAtomValue } from 'jotai'
import { noop } from 'es-toolkit'
import React, {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { commonUserAtom } from '../../authentication/authentication.store.js'
import { CollectionService } from '../../collection/collection.service.js'
import {
  type Collection,
  ContentTypeNumber,
} from '../../collection/collection.types.js'
import { OrderDirection } from '../../search/search.const.js'
import {
  LoadingErrorLoadedComponent,
  type LoadingInfo,
} from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent.js'
import { CustomError } from '../../shared/helpers/custom-error.js'
import {
  formatDate,
  formatTimestamp,
} from '../../shared/helpers/formatters/date.js'
import { getOrderObject } from '../../shared/helpers/generate-order-gql-query.js'
import { tText } from '../../shared/helpers/translate-text.js'
import { truncateTableValue } from '../../shared/helpers/truncate.js'
import { useTableSort } from '../../shared/hooks/useTableSort.js'
import { ToastService } from '../../shared/services/toast-service.js'
import { TableColumnDataType } from '../../shared/types/table-column-data-type.js'
import { type AssignmentTableColumns } from '../assignment.types.js'

import './AddItemsModals.scss'
import { tHtml } from '../../shared/helpers/translate-html.js'

// Column definitions
const GET_ADD_COLLECTION_COLUMNS = (): TableColumn[] => [
  {
    id: 'title',
    label: tText('assignment/modals/add-collection-modal___titel'),
    sortable: true,
    dataType: TableColumnDataType.string,
  },
  {
    id: 'updated_at',
    label: tText('assignment/modals/add-collection-modal___laatst-bewerkt'),
    sortable: true,
    dataType: TableColumnDataType.dateTime,
  },
  {
    id: 'is_public',
    label: tText('assignment/modals/add-collection-modal___is-publiek'),
    sortable: true,
    dataType: TableColumnDataType.boolean,
  },
]

const OWN_COLLECTIONS_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<{
  [columnId in keyof Avo.Collection.Collection]: (
    order: Avo.Search.OrderDirection,
  ) => any
}> = {
  title: (order: Avo.Search.OrderDirection) => ({
    title: order,
  }),
  updated_at: (order: Avo.Search.OrderDirection) => ({
    updated_at: order,
  }),
  is_public: (order: Avo.Search.OrderDirection) => ({
    is_public: order,
  }),
}

const BOOKMARKED_COLLECTION_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<{
  [columnId in keyof Avo.Collection.Collection]: (
    order: Avo.Search.OrderDirection,
  ) => any
}> = {
  title: (order: Avo.Search.OrderDirection) => ({
    bookmarkedCollection: { title: order },
  }),
  updated_at: (order: Avo.Search.OrderDirection) => ({
    bookmarkedCollection: { updated_at: order },
  }),
  is_public: (order: Avo.Search.OrderDirection) => ({
    bookmarkedCollection: { is_public: order },
  }),
}

export type AddCollectionModalProps = {
  isOpen: boolean
  onClose?: () => void
  addCollectionCallback?: (fragmentId: string, withDescription: boolean) => void
}

enum AddCollectionTab {
  myCollections = 'mycollections',
  bookmarkedCollections = 'bookmarkedcollections',
}

export const AddCollectionModal: FC<AddCollectionModalProps> = ({
  isOpen,
  onClose = noop,
  addCollectionCallback,
}) => {
  const commonUser = useAtomValue(commonUserAtom)

  const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({
    state: 'loading',
  })
  const [createWithDescription, setCreateWithDescription] =
    useState<boolean>(false)
  const [collections, setCollections] = useState<Collection[] | null>(null)
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null)
  const [activeView, setActiveView] = useState<AddCollectionTab>(
    AddCollectionTab.myCollections,
  )
  const [
    sortColumn,
    sortOrder,
    handleColumnClick,
    setSortColumn,
    setSortOrder,
  ] = useTableSort<AssignmentTableColumns>('updated_at')
  const [filterString, setFilterString] = useState<string>('')

  const tableColumns = useMemo(() => GET_ADD_COLLECTION_COLUMNS(), [])

  const fetchCollections = useCallback(async () => {
    try {
      if (!commonUser) {
        throw new CustomError('Could not determine authenticated user.')
      }

      const column = tableColumns.find(
        (tableColumn: any) => tableColumn.id || '' === (sortColumn as any),
      )
      const columnDataType: TableColumnDataType = (column?.dataType ||
        TableColumnDataType.string) as TableColumnDataType

      let collections: Partial<Avo.Collection.Collection>[]
      if (activeView === AddCollectionTab.myCollections) {
        collections =
          await CollectionService.fetchCollectionsByOwnerOrContributorProfileId(
            commonUser,
            0,
            null,
            getOrderObject(
              sortColumn,
              sortOrder,
              columnDataType,
              OWN_COLLECTIONS_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
            ),
            ContentTypeNumber.collection,
            filterString,
            undefined,
          )
      } else {
        collections = await CollectionService.fetchBookmarkedCollectionsByOwner(
          commonUser,
          0,
          null,
          getOrderObject(
            sortColumn,
            sortOrder,
            columnDataType,
            BOOKMARKED_COLLECTION_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
          ),
          filterString,
        )
      }
      setCollections(collections as unknown as Collection[])
    } catch (err) {
      console.error(new CustomError('Failed to get collections', err))
      setLoadingInfo({
        state: 'error',
        message: tHtml(
          'assignment/modals/add-collection-modal___het-ophalen-van-bestaande-collecties-is-mislukt',
        ),
      })
    }
  }, [
    commonUser,
    tableColumns,
    activeView,
    sortColumn,
    sortOrder,
    filterString,
  ])

  useEffect(() => {
    if (collections) {
      setLoadingInfo({
        state: 'loaded',
      })
    }
  }, [collections, setLoadingInfo])

  useEffect(() => {
    if (isOpen) {
      fetchCollections().then(noop)
    }
  }, [isOpen, fetchCollections])

  const resetStateAndCallOnClose = () => {
    setLoadingInfo({ state: 'loading' })
    setCreateWithDescription(false)
    setCollections(null)
    setSelectedCollectionId(null)
    setActiveView(AddCollectionTab.myCollections)
    setSortColumn('updated_at')
    setSortOrder(Avo.Search.OrderDirection.DESC)
    setFilterString('')

    onClose()
  }

  const handleImportToAssignment = () => {
    if (!selectedCollectionId) {
      ToastService.danger(
        tHtml(
          'assignment/modals/add-collection-modal___gelieve-een-collectie-te-selecteren',
        ),
      )
      return
    }
    addCollectionCallback?.(selectedCollectionId, createWithDescription)
    resetStateAndCallOnClose()
  }

  const handleSelectedCollectionChanged = (
    selectedIds: (string | number)[],
  ) => {
    setSelectedCollectionId((selectedIds[0] as string) || null)
  }

  const renderCell = (
    collection: Avo.Collection.Collection,
    colKey: keyof Avo.Collection.Collection,
  ) => {
    const cellData: any = (collection as any)[colKey]

    switch (colKey) {
      case 'title': {
        return truncateTableValue(collection.title)
      }

      case 'is_public':
        return (
          <div
            title={
              collection.is_public
                ? tText('assignment/modals/add-collection-modal___publiek')
                : tText('assignment/modals/add-collection-modal___niet-publiek')
            }
          >
            {/* TODO make this a helper function to render lock or unlock everywhere */}
            <Icon
              name={collection.is_public ? IconName.unlock3 : IconName.lock}
            />
          </div>
        )

      case 'updated_at':
        return (
          <span title={formatTimestamp(cellData)}>{formatDate(cellData)}</span>
        )

      default:
        return cellData
    }
  }

  const renderModalBody = () => {
    return (
      <>
        <Container mode="horizontal">
          <Toolbar>
            <ToolbarLeft>
              <ToolbarItem>
                <ButtonToolbar className="c-add-collection-modal__tab-buttons">
                  <ButtonGroup>
                    <Button
                      type="secondary"
                      label={tText(
                        'assignment/modals/add-collection-modal___mijn-collecties',
                      )}
                      title={tText(
                        'assignment/modals/add-collection-modal___filter-op-mijn-collecties',
                      )}
                      active={activeView === AddCollectionTab.myCollections}
                      onClick={() =>
                        setActiveView(AddCollectionTab.myCollections)
                      }
                    />
                    <Button
                      type="secondary"
                      label={tText(
                        'assignment/modals/add-collection-modal___bladwijzer-collecties',
                      )}
                      title={tText(
                        'assignment/modals/add-collection-modal___filter-op-mijn-collecties',
                      )}
                      active={
                        activeView === AddCollectionTab.bookmarkedCollections
                      }
                      onClick={() =>
                        setActiveView(AddCollectionTab.bookmarkedCollections)
                      }
                    />
                  </ButtonGroup>
                </ButtonToolbar>

                <Select
                  className={'c-add-collection-modal__tab-select'}
                  isSearchable={false}
                  value={activeView}
                  options={[
                    {
                      label: tText(
                        'assignment/modals/add-collection-modal___mijn-collecties',
                      ),
                      value: AddCollectionTab.myCollections,
                    },
                    {
                      label: tText(
                        'assignment/modals/add-collection-modal___bladwijzer-collecties',
                      ),
                      value: AddCollectionTab.bookmarkedCollections,
                    },
                  ]}
                  onChange={(value) => setActiveView(value as AddCollectionTab)}
                />
              </ToolbarItem>
            </ToolbarLeft>
            <ToolbarRight>
              <ToolbarItem>
                <Form type="inline">
                  <FormGroup inlineMode="grow">
                    <TextInput
                      className="c-add-collection-modal__search-input"
                      icon={IconName.filter}
                      value={filterString}
                      onChange={setFilterString}
                      disabled={!collections}
                    />
                  </FormGroup>
                </Form>
              </ToolbarItem>
            </ToolbarRight>
          </Toolbar>
        </Container>

        <div className="c-add-collection-modal__table-wrapper">
          <Table
            columns={tableColumns}
            data={collections || undefined}
            emptyStateMessage={
              filterString
                ? tText(
                    'assignment/modals/add-collection-modal___er-zijn-geen-collecties-die-voldoen-aan-de-zoekopdracht',
                  )
                : tText(
                    'assignment/modals/add-collection-modal___er-zijn-nog-geen-collecties-aangemaakt',
                  )
            }
            renderCell={(rowData: Avo.Collection.Collection, colKey: string) =>
              renderCell(rowData, colKey as keyof Avo.Collection.Collection)
            }
            rowKey="id"
            variant="styled"
            onColumnClick={handleColumnClick as any}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            showRadioButtons
            selectedItemIds={selectedCollectionId ? [selectedCollectionId] : []}
            onSelectionChanged={handleSelectedCollectionChanged}
            onRowClick={(collection) => setSelectedCollectionId(collection.id)}
          />
        </div>
      </>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      title={tHtml(
        'assignment/modals/add-collection-modal___importeer-collectie',
      )}
      size="large"
      onClose={resetStateAndCallOnClose}
      scrollable
      className="c-content c-add-collection-modal"
    >
      <ModalBody>
        <LoadingErrorLoadedComponent
          loadingInfo={loadingInfo}
          dataObject={collections}
          render={renderModalBody}
        />
      </ModalBody>

      <ModalFooterLeft>
        <Flex>
          <Toggle
            checked={createWithDescription}
            onChange={(checked) => setCreateWithDescription(checked)}
          />
          <Spacer margin="left">
            <FlexItem>
              {tText(
                'assignment/modals/add-collection-modal___importeer-fragmenten-met-beschrijving',
              )}
            </FlexItem>
          </Spacer>
        </Flex>
      </ModalFooterLeft>

      <ModalFooterRight>
        <ButtonToolbar>
          <Button
            type="secondary"
            label={tText('assignment/modals/add-collection-modal___annuleer')}
            onClick={resetStateAndCallOnClose}
          />
          <Button
            type="primary"
            label={tText('assignment/modals/add-collection-modal___importeer')}
            onClick={handleImportToAssignment}
          />
        </ButtonToolbar>
      </ModalFooterRight>
    </Modal>
  )
}
