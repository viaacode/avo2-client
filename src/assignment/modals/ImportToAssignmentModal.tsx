import { get, noop } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
	Button,
	ButtonToolbar,
	Flex,
	FlexItem,
	Form,
	FormGroup,
	Modal,
	ModalBody,
	Spacer,
	Table,
	TextInput,
	Toggle,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { APP_PATH } from '../../constants';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../shared/components';
import {
	buildLink,
	CustomError,
	formatCustomTimestamp,
	formatDate,
	isMobileWidth,
	renderAvatar,
} from '../../shared/helpers';
import { truncateTableValue } from '../../shared/helpers/truncate';
import { useTableSort } from '../../shared/hooks';
import { ToastService } from '../../shared/services';
import { GET_ASSIGNMENT_OVERVIEW_COLUMNS } from '../assignment.const';
import { AssignmentHelper } from '../assignment.helper';
import { AssignmentService } from '../assignment.service';
import { AssignmentOverviewTableColumns } from '../assignment.types';

interface ImportToAssignmentModalProps {
	user: Avo.User.User;
	isOpen: boolean;
	onClose?: () => void;
	importToAssignmentCallback: (assignmentId: string, createWithDescription: boolean) => void;
	showToggle: boolean;
	translations: {
		title: string;
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
	const [t] = useTranslation();

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [createWithDescription, setCreateWithDescription] = useState<boolean>(false);
	const [assignments, setAssignments] = useState<Partial<Avo.Assignment.Assignment_v2>[] | null>(
		null
	);
	const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>();
	const [sortColumn, sortOrder, handleColumnClick] = useTableSort<AssignmentOverviewTableColumns>(
		'updated_at'
	);
	const [filterString, setFilterString] = useState<string>('');

	const tableColumns = useMemo(() => GET_ASSIGNMENT_OVERVIEW_COLUMNS(true), []);

	const fetchAssignments = useCallback(async () => {
		try {
			const column = tableColumns.find(
				(tableColumn: any) => tableColumn.id || '' === (sortColumn as any)
			);
			const columnDataType: string = get(column, 'dataType', '');
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
				null // limit: no limit
			);
			setAssignments(assignmentData.assignments);
		} catch (err) {
			console.error(new CustomError('Failed to get assignments', err));
			setLoadingInfo({
				state: 'error',
				message: t(
					'assignment/modals/import-to-assignment-modal___het-ophalen-van-bestaande-opdrachten-is-mislukt'
				),
			});
		}
	}, [tableColumns, user, filterString, sortColumn, sortOrder, t]);

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
				t(
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

	const renderFooterActions = () => {
		return (
			<Toolbar spaced>
				<ToolbarLeft>
					{showToggle && (
						<Flex>
							<Toggle
								checked={createWithDescription}
								onChange={(checked) => setCreateWithDescription(checked)}
							/>
							<Spacer margin="left">
								<FlexItem>
									{t(
										'assignment/modals/import-to-assignment-modal___importeer-fragmenten-met-beschrijving'
									)}
								</FlexItem>
							</Spacer>
						</Flex>
					)}
				</ToolbarLeft>
				<ToolbarRight>
					<ToolbarItem>
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
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
		);
	};

	// very similar to table in assignment overview, but with differences
	const renderCell = (
		assignment: Avo.Assignment.Assignment_v2,
		colKey: AssignmentOverviewTableColumns
	) => {
		const cellData: any = (assignment as any)[colKey];

		switch (colKey) {
			case 'title':
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

			case 'labels':
				return AssignmentHelper.getLabels(assignment, 'LABEL')
					.map((labelLink: any) => labelLink.assignment_label.label)
					.join(', ');

			case 'class_room':
				return AssignmentHelper.getLabels(assignment, 'CLASS')
					.map((label: any) => label.assignment_label.label)
					.join(', ');

			case 'author':
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

			case 'deadline_at':
				return formatCustomTimestamp(cellData, 'DD MMMM YYYY HH:mm');

			case 'updated_at':
				return formatDate(cellData);

			case 'responses':
				return (cellData || []).length === 0 ? (
					'0'
				) : (
					<Link
						to={buildLink(APP_PATH.ASSIGNMENT_RESPONSES.route, { id: assignment.id })}
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
				<Form type="inline">
					<FormGroup inlineMode="grow">
						<TextInput
							className="c-assignment-overview__search-input"
							icon="filter"
							value={filterString}
							onChange={setFilterString}
							disabled={!assignments}
						/>
					</FormGroup>
				</Form>

				<Table
					columns={tableColumns}
					data={assignments || undefined}
					emptyStateMessage={
						filterString
							? t(
									'assignment/views/assignment-overview___er-zijn-geen-opdrachten-die-voldoen-aan-de-zoekopdracht'
							  )
							: t(
									'assignment/views/assignment-overview___er-zijn-nog-geen-opdrachten-aangemaakt'
							  )
					}
					renderCell={(rowData: Avo.Assignment.Assignment_v2, colKey: string) =>
						renderCell(rowData, colKey as AssignmentOverviewTableColumns)
					}
					rowKey="id"
					variant="styled"
					onColumnClick={handleColumnClick as any}
					sortColumn={sortColumn}
					sortOrder={sortOrder}
					useCards={isMobileWidth()}
					showRadioButtons
					selectedItemIds={selectedAssignmentId ? [selectedAssignmentId] : []}
					onSelectionChanged={handleSelectedAssignmentChanged}
				/>
				{renderFooterActions()}
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
			className="c-content"
		>
			<ModalBody>
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={assignments}
					render={renderModalBody}
				/>
			</ModalBody>
		</Modal>
	);
};

export default ImportToAssignmentModal;
