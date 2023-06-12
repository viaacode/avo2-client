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
} from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { get, noop } from 'lodash-es';
import React, {
	FunctionComponent,
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Link } from 'react-router-dom';

import { APP_PATH } from '../../constants';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../shared/components';
import {
	buildLink,
	CustomError,
	formatDate,
	isMobileWidth,
	renderAvatar,
} from '../../shared/helpers';
import { truncateTableValue } from '../../shared/helpers/truncate';
import { useTableSort } from '../../shared/hooks';
import useTranslation from '../../shared/hooks/useTranslation';
import { ToastService } from '../../shared/services/toast-service';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import {
	ASSIGNMENT_CREATE_UPDATE_TABS,
	GET_ASSIGNMENT_OVERVIEW_COLUMNS_FOR_MODAL,
} from '../assignment.const';
import { AssignmentHelper } from '../assignment.helper';
import { AssignmentService } from '../assignment.service';
import {
	Assignment_v2,
	Assignment_v2_With_Labels,
	AssignmentOverviewTableColumns,
} from '../assignment.types';
import AssignmentDeadline from '../components/AssignmentDeadline';

import './AddItemsModals.scss';

interface ImportToAssignmentModalProps {
	user: Avo.User.User;
	isOpen: boolean;
	onClose?: () => void;
	importToAssignmentCallback: (assignmentId: string, createWithDescription: boolean) => void;
	showToggle: boolean;
	translations: {
		title: string | ReactNode;
		primaryButton: string;
		secondaryButton: string;
	};
}

const ImportToAssignmentModal: FunctionComponent<ImportToAssignmentModalProps> = ({
	user,
	isOpen,
	onClose,
	importToAssignmentCallback,
	showToggle,
	translations,
}) => {
	const { tText, tHtml } = useTranslation();

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [createWithDescription, setCreateWithDescription] = useState<boolean>(false);
	const [assignments, setAssignments] = useState<Partial<Assignment_v2>[] | null>(null);
	const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>();
	const [sortColumn, sortOrder, handleColumnClick] =
		useTableSort<AssignmentOverviewTableColumns>('updated_at');
	const [filterString, setFilterString] = useState<string>('');

	const tableColumns = useMemo(() => GET_ASSIGNMENT_OVERVIEW_COLUMNS_FOR_MODAL(true), []);

	const fetchAssignments = useCallback(async () => {
		try {
			const column = tableColumns.find(
				(tableColumn: any) => tableColumn.id || '' === (sortColumn as any)
			);
			const columnDataType = (column?.dataType ||
				TableColumnDataType.string) as TableColumnDataType;
			const assignmentData = await AssignmentService.fetchAssignments(
				true, // canEditAssignments,
				user,
				false, // not past deadline
				sortColumn,
				sortOrder,
				columnDataType,
				0, // page
				filterString, // filter,
				[],
				[],
				[],
				null // limit: no limit
			);
			setAssignments(assignmentData.assignments);
		} catch (err) {
			console.error(new CustomError('Failed to get assignments', err));
			setLoadingInfo({
				state: 'error',
				message: tText(
					'assignment/modals/import-to-assignment-modal___het-ophalen-van-bestaande-opdrachten-is-mislukt'
				),
			});
		}
	}, [tableColumns, user, filterString, sortColumn, sortOrder, tText]);

	useEffect(() => {
		if (assignments) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [assignments, setLoadingInfo]);

	useEffect(() => {
		if (isOpen) {
			fetchAssignments();
		}
	}, [isOpen, fetchAssignments]);

	const handleImportToAssignment = () => {
		if (!selectedAssignmentId) {
			ToastService.danger(
				tHtml(
					'assignment/modals/import-to-assignment-modal___gelieve-een-opdracht-te-selecteren'
				)
			);
			return;
		}
		importToAssignmentCallback(selectedAssignmentId, createWithDescription);
		(onClose || noop)();
	};

	const handleSelectedAssignmentChanged = (selectedIds: (string | number)[]) => {
		setSelectedAssignmentId((selectedIds[0] as string) || undefined);
	};

	// very similar to table in assignment overview, but with differences
	const renderCell = (assignment: Assignment_v2, colKey: AssignmentOverviewTableColumns) => {
		const cellData: any = (assignment as any)[colKey];

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
				);

				return isMobileWidth() ? (
					<Spacer margin="bottom-small">{renderTitle()}</Spacer>
				) : (
					renderTitle()
				);
			}
			case 'labels':
				return AssignmentHelper.getLabels(assignment as Assignment_v2_With_Labels, 'LABEL')
					.map((labelLink: any) => labelLink.assignment_label.label)
					.join(', ');

			case 'class_room':
				return AssignmentHelper.getLabels(assignment as Assignment_v2_With_Labels, 'CLASS')
					.map((label: any) => label.assignment_label.label)
					.join(', ');

			case 'author': {
				const profile = get(assignment, 'profile', null);
				const avatarOptions = {
					dark: true,
					abbreviatedName: true,
					small: isMobileWidth(),
				};

				return isMobileWidth() ? (
					<Spacer margin="bottom-small">{renderAvatar(profile, avatarOptions)}</Spacer>
				) : (
					renderAvatar(profile, avatarOptions)
				);
			}
			case 'deadline_at':
				return <AssignmentDeadline deadline={cellData} />;

			case 'updated_at':
				return formatDate(cellData);

			case 'responses':
				return (cellData || []).length === 0 ? (
					'0'
				) : (
					<Link
						to={buildLink(APP_PATH.ASSIGNMENT_EDIT_TAB.route, {
							id: assignment.id,
							tabId: ASSIGNMENT_CREATE_UPDATE_TABS.KLIKS,
						})}
					>
						{(cellData || []).length}
					</Link>
				);

			default:
				return cellData;
		}
	};

	const renderModalBody = () => {
		return (
			<>
				<Container mode="horizontal">
					<Form type="inline">
						<FormGroup inlineMode="grow">
							<TextInput
								className="c-assignment-overview__search-input"
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
										'assignment/views/assignment-overview___er-zijn-geen-opdrachten-die-voldoen-aan-de-zoekopdracht'
								  )
								: tText(
										'assignment/views/assignment-overview___er-zijn-nog-geen-opdrachten-aangemaakt'
								  )
						}
						renderCell={(rowData: Assignment_v2, colKey: string) =>
							renderCell(rowData, colKey as AssignmentOverviewTableColumns)
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
		);
	};

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
									'assignment/modals/import-to-assignment-modal___importeer-fragmenten-met-beschrijving'
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
	);
};

export default ImportToAssignmentModal;
