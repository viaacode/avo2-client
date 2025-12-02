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
  ModalFooterLeft,
  ModalFooterRight,
  Spacer,
  Table,
  TextInput,
  Toggle,
} from '@viaa/avo2-components'
import { Avo } from '@viaa/avo2-types'
import { useAtomValue } from 'jotai'
import { noop } from 'es-toolkit'
import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import { commonUserAtom } from '../../authentication/authentication.store';
import { APP_PATH } from '../../constants';
import {
  LoadingErrorLoadedComponent,
  type LoadingInfo,
} from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { buildLink } from '../../shared/helpers/build-link';
import { CustomError } from '../../shared/helpers/custom-error';
import { renderAvatar } from '../../shared/helpers/formatters/avatar';
import { formatDate } from '../../shared/helpers/formatters/date';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { truncateTableValue } from '../../shared/helpers/truncate';
import { useTableSort } from '../../shared/hooks/useTableSort';
import { ToastService } from '../../shared/services/toast-service';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import {
  ASSIGNMENT_CREATE_UPDATE_TABS,
  GET_ASSIGNMENT_OVERVIEW_COLUMNS_FOR_MODAL,
  ITEMS_PER_PAGE,
} from '../assignment.const';
import { AssignmentHelper } from '../assignment.helper';
import { AssignmentService } from '../assignment.service';
import { type AssignmentTableColumns } from '../assignment.types';
import { AssignmentDeadline } from '../components/AssignmentDeadline';

import './AddItemsModals.scss'
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';

interface ImportToAssignmentModalProps {
  isOpen: boolean
  onClose?: () => void
  importToAssignmentCallback: (
    assignmentId: string,
    createWithDescription: boolean,
  ) => void
  showToggle: boolean
  translations: {
    title: string | ReactNode
    primaryButton: string
    secondaryButton: string
  }
}

export const ImportToAssignmentModal: FC<ImportToAssignmentModalProps> = ({
  isOpen,
  onClose,
  importToAssignmentCallback,
  showToggle,
  translations,
}) => {
  const commonUser = useAtomValue(commonUserAtom)

  const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({
    state: 'loading',
  })
  const [createWithDescription, setCreateWithDescription] =
    useState<boolean>(false)
  const [assignments, setAssignments] = useState<
    Partial<Avo.Assignment.Assignment>[] | null
  >(null)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>()
  const [sortColumn, sortOrder, handleColumnClick] =
    useTableSort<AssignmentTableColumns>('updated_at')
  const [filterString, setFilterString] = useState<string>('')

  const tableColumns = useMemo(
    () => GET_ASSIGNMENT_OVERVIEW_COLUMNS_FOR_MODAL(true),
    [],
  )

  const fetchAssignments = useCallback(async () => {
    try {
      if (!commonUser) {
        ToastService.danger(
          tHtml(
            'assignment/modals/import-to-assignment-modal___er-ging-iets-mis-bij-het-ophalen-van-de-opdrachten-gelieve-de-pagina-te-herladen',
          ),
        )
        return
      }
      const column = tableColumns.find(
        (tableColumn: any) => tableColumn.id || '' === (sortColumn as any),
      )
      const columnDataType = (column?.dataType ||
        TableColumnDataType.string) as TableColumnDataType
      const assignmentData = await AssignmentService.fetchAssignments({
        pastDeadline: false,
        sortColumn,
        sortOrder,
        tableColumnDataType: columnDataType,
        offset: 0,
        limit: ITEMS_PER_PAGE,
        filterString,
      })
      setAssignments(assignmentData.assignments)
    } catch (err) {
      console.error(new CustomError('Failed to get assignments', err))
      setLoadingInfo({
        state: 'error',
        message: tHtml(
          'assignment/modals/import-to-assignment-modal___het-ophalen-van-bestaande-opdrachten-is-mislukt',
        ),
      })
    }
  }, [commonUser, tableColumns, sortColumn, sortOrder, filterString])

  useEffect(() => {
    if (assignments) {
      setLoadingInfo({
        state: 'loaded',
      })
    }
  }, [assignments, setLoadingInfo])

  useEffect(() => {
    if (isOpen) {
      fetchAssignments()
    }
  }, [isOpen, fetchAssignments])

  const handleImportToAssignment = () => {
    if (!selectedAssignmentId) {
      ToastService.danger(
        tHtml(
          'assignment/modals/import-to-assignment-modal___gelieve-een-opdracht-te-selecteren',
        ),
      )
      return
    }
    importToAssignmentCallback(selectedAssignmentId, createWithDescription)
    ;(onClose || noop)()
  }

  const handleSelectedAssignmentChanged = (
    selectedIds: (string | number)[],
  ) => {
    setSelectedAssignmentId((selectedIds[0] as string) || undefined)
  }

  // very similar to table in assignment overview, but with differences
  const renderCell = (
    assignment: Avo.Assignment.Assignment,
    colKey: AssignmentTableColumns,
  ) => {
    const cellData: any = (assignment as any)[colKey]

    switch (
      colKey as any // TODO remove cast once assignment_v2 types are fixed (labels, class_room, author)
    ) {
      case 'title': {
        const renderTitle = () => (
          <div className="c-content-header c-content-header--small">
            <h3 className="c-content-header__header u-m-0">
              {truncateTableValue(assignment.title)}
            </h3>
          </div>
        )

        return isMobileWidth() ? (
          <Spacer margin="bottom-small">{renderTitle()}</Spacer>
        ) : (
          renderTitle()
        )
      }
      case 'labels':
        return AssignmentHelper.getLabels(
          assignment,
          Avo.Assignment.LabelType.LABEL,
        )
          .map((labelLink: any) => labelLink.assignment_label.label)
          .join(', ')

      case 'class_room':
        return AssignmentHelper.getLabels(
          assignment,
          Avo.Assignment.LabelType.CLASS,
        )
          .map((label: any) => label.assignment_label.label)
          .join(', ')

      case 'author': {
        const profile = assignment?.profile || null
        const avatarOptions = {
          dark: true,
          abbreviatedName: true,
          small: isMobileWidth(),
        }

        return isMobileWidth() ? (
          <Spacer margin="bottom-small">
            {renderAvatar(profile, avatarOptions)}
          </Spacer>
        ) : (
          renderAvatar(profile, avatarOptions)
        )
      }
      case 'deadline_at':
        return <AssignmentDeadline deadline={cellData} />

      case 'updated_at':
        return formatDate(cellData)

      case 'responses':
        return (cellData || []).length === 0 ? (
          '0'
        ) : (
          <Link
            to={buildLink(APP_PATH.ASSIGNMENT_EDIT_TAB.route, {
              id: assignment.id,
              tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CLICKS,
            })}
          >
            {(cellData || []).length}
          </Link>
        )

      default:
        return cellData
    }
  }

  const renderModalBody = () => {
    return (
      <>
        <Container mode="horizontal">
          <Form type="inline">
            <FormGroup inlineMode="grow">
              <TextInput
                className="c-import-to-assignment-modal__search-input"
                icon={IconName.filter}
                value={filterString}
                onChange={setFilterString}
                disabled={!assignments}
              />
            </FormGroup>
          </Form>
        </Container>

        <div className="c-import-to-assignment-modal__table-wrapper">
          <Table
            columns={tableColumns}
            data={assignments || undefined}
            emptyStateMessage={
              filterString
                ? tText(
                    'assignment/views/assignment-overview___er-zijn-geen-opdrachten-die-voldoen-aan-de-zoekopdracht',
                  )
                : tText(
                    'assignment/views/assignment-overview___er-zijn-nog-geen-opdrachten-aangemaakt',
                  )
            }
            renderCell={(rowData: Avo.Assignment.Assignment, colKey: string) =>
              renderCell(rowData, colKey as AssignmentTableColumns)
            }
            rowKey="id"
            variant="styled"
            onColumnClick={handleColumnClick as any}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            showRadioButtons
            selectedItemIds={selectedAssignmentId ? [selectedAssignmentId] : []}
            onSelectionChanged={handleSelectedAssignmentChanged}
            onRowClick={(assignment) => setSelectedAssignmentId(assignment.id)}
          />
        </div>
      </>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      title={translations.title}
      size="large"
      onClose={onClose}
      scrollable
      className="c-content c-import-to-assignment-modal"
    >
      <ModalBody>
        <LoadingErrorLoadedComponent
          loadingInfo={loadingInfo}
          dataObject={assignments}
          render={renderModalBody}
        />
      </ModalBody>

      {showToggle && (
        <ModalFooterLeft>
          <Flex>
            <Toggle
              checked={createWithDescription}
              onChange={(checked) => setCreateWithDescription(checked)}
            />
            <Spacer margin="left">
              <FlexItem>
                {tText(
                  'assignment/modals/import-to-assignment-modal___importeer-fragmenten-met-beschrijving',
                )}
              </FlexItem>
            </Spacer>
          </Flex>
        </ModalFooterLeft>
      )}

      <ModalFooterRight>
        <ButtonToolbar>
          <Button
            type="secondary"
            label={translations.secondaryButton}
            onClick={onClose}
          />
          <Button
            type="primary"
            label={translations.primaryButton}
            onClick={handleImportToAssignment}
          />
        </ButtonToolbar>
      </ModalFooterRight>
    </Modal>
  )
}
