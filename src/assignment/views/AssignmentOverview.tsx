import './AssignmentOverview.scss';

import { cleanupFilterTableState, toggleSortOrder } from '@meemoo/admin-core-ui/dist/admin.mjs';
import { PaginationBar } from '@meemoo/react-components';
import {
	Button,
	ButtonGroup,
	ButtonToolbar,
	Flex,
	Form,
	FormGroup,
	Icon,
	IconName,
	MoreOptionsDropdown,
	Select,
	Spacer,
	Spinner,
	Table,
	TagList,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	useKeyPress,
} from '@viaa/avo2-components';
import { type Avo, PermissionName, ShareWithColleagueTypeEnum } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import { useAtomValue } from 'jotai';
import { cloneDeep, compact, isArray, isNil, noop } from 'lodash-es';
import React, {
	type FC,
	type KeyboardEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import {
	ArrayParam,
	DelimitedArrayParam,
	NumberParam,
	StringParam,
	useQueryParams,
	withDefault,
} from 'use-query-params';

import { GET_DEFAULT_PAGINATION_BAR_PROPS } from '../../admin/shared/components/PaginationBar/PaginationBar.consts';
import { commonUserAtom } from '../../authentication/authentication.store';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects/redirect-to-client-page';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import { OrderDirection } from '../../search/search.const';
import {
	CheckboxDropdownModal,
	type CheckboxOption,
} from '../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import { ContributorInfoRight } from '../../shared/components/ShareWithColleagues/ShareWithColleagues.types';
import {
	ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS,
	getMoreOptionsLabel,
} from '../../shared/constants';
import { buildLink } from '../../shared/helpers/build-link';
import { getContributorType } from '../../shared/helpers/contributors';
import { createDropdownMenuItem } from '../../shared/helpers/dropdown';
import { formatDate, renderAvatar } from '../../shared/helpers/formatters';
import { navigate } from '../../shared/helpers/link';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { renderMobileDesktop } from '../../shared/helpers/renderMobileDesktop';
import { createShareIconTableOverview } from '../../shared/helpers/share-icon-table-overview';
import { ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { truncateTableValue } from '../../shared/helpers/truncate';
import { useTranslation } from '../../shared/hooks/useTranslation';
import { AssignmentLabelsService } from '../../shared/services/assignment-labels-service';
import { ToastService } from '../../shared/services/toast-service';
import { KeyCode } from '../../shared/types';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { ITEMS_PER_PAGE } from '../../workspace/workspace.const';
import {
	ASSIGNMENT_CREATE_UPDATE_TABS,
	ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS,
	GET_ASSIGNMENT_OVERVIEW_COLUMNS,
} from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import {
	AssignmentAction,
	type AssignmentTableColumns,
	AssignmentType,
	AssignmentView,
} from '../assignment.types';
import { AssignmentDeadline } from '../components/AssignmentDeadline';
import { deleteAssignment, deleteSelfFromAssignment } from '../helpers/delete-assignment';
import { duplicateAssignment } from '../helpers/duplicate-assignment';
import { useGetAssignments } from '../hooks/useGetAssignments';
import { DeleteAssignmentModal } from '../modals/DeleteAssignmentModal';

interface AssignmentOverviewProps {
	onUpdate: () => void | Promise<void>;
}

const DEFAULT_SORT_COLUMN = 'updated_at';
const DEFAULT_SORT_ORDER = OrderDirection.desc;

const defaultFiltersAndSort = {
	selectedAssignmentLabelIds: [],
	selectedClassLabelsIds: [],
	filter: undefined,
	view: undefined,
	page: 0,
	sort_column: DEFAULT_SORT_COLUMN,
	sort_order: DEFAULT_SORT_ORDER,
};

export const AssignmentOverview: FC<AssignmentOverviewProps> = ({ onUpdate = noop }) => {
	const { tText, tHtml } = useTranslation();
	const navigateFunc = useNavigate();
	const commonUser = useAtomValue(commonUserAtom);

	const [allAssignmentLabels, setAllAssignmentLabels] = useState<Avo.Assignment.Label[]>([]);
	const [filterString, setFilterString] = useState<string | undefined>(undefined);
	const [dropdownOpenForAssignmentId, setDropdownOpenForAssignmentId] = useState<string | null>(
		null
	);
	const [isDeleteAssignmentModalOpen, setDeleteAssignmentModalOpen] = useState<boolean>(false);
	const [markedAssignment, setMarkedAssignment] = useState<Avo.Assignment.Assignment | null>(
		null
	);
	const canEditAssignments = useMemo(
		() =>
			PermissionService.hasPerm(commonUser, PermissionName.EDIT_ANY_ASSIGNMENTS) ||
			PermissionService.hasPerm(commonUser, PermissionName.EDIT_OWN_ASSIGNMENTS),
		[commonUser]
	);
	const showPublicState = useMemo(
		() =>
			PermissionService.hasPerm(commonUser, PermissionName.PUBLISH_ANY_ASSIGNMENTS) ||
			PermissionService.hasPerm(commonUser, PermissionName.PUBLISH_OWN_ASSIGNMENTS),
		[commonUser]
	);

	const isOwner =
		markedAssignment?.share_type === ShareWithColleagueTypeEnum.GEDEELD_MET_ANDERE ||
		markedAssignment?.share_type === ShareWithColleagueTypeEnum.NIET_GEDEELD;
	const isContributor =
		markedAssignment?.share_type === ShareWithColleagueTypeEnum.GEDEELD_MET_MIJ;
	const isContributorWithContributeRights = !!markedAssignment?.contributors?.find(
		(c) =>
			c.profile_id === commonUser?.profileId && c.rights === ContributorInfoRight.CONTRIBUTOR
	);
	const hasEditRightsForAllAssignments =
		commonUser?.permissions?.includes(PermissionName.EDIT_ANY_ASSIGNMENTS) || false;
	const hasDeleteRightsForAllAssignments =
		commonUser?.permissions?.includes(PermissionName.DELETE_ANY_ASSIGNMENTS) || false;
	const shouldDeleteSelfFromAssignment = isContributor && !hasDeleteRightsForAllAssignments;

	const tableColumns = useMemo(
		() => GET_ASSIGNMENT_OVERVIEW_COLUMNS(canEditAssignments, showPublicState),
		[canEditAssignments, showPublicState]
	);

	const [query, setQuery] = useQueryParams({
		selectedAssignmentLabelIds: DelimitedArrayParam,
		selectedClassLabelIds: DelimitedArrayParam,
		selectedShareTypeLabelIds: ArrayParam,
		filter: StringParam,
		view: withDefault(StringParam, AssignmentView.ACTIVE),
		page: NumberParam,
		sortColumn: StringParam,
		sortOrder: StringParam,
	});

	const getColumnDataType = useCallback((): TableColumnDataType => {
		const column = tableColumns.find(
			(tableColumn: any) => (tableColumn.id || '') === query.sortColumn
		);
		return (column?.dataType || TableColumnDataType.string) as TableColumnDataType;
	}, [query.sortColumn, tableColumns]);

	const {
		data: assignmentResponse,
		isLoading: isLoadingAssignments,
		refetch: refetchAssignments,
	} = useGetAssignments(
		{
			pastDeadline: query.view === AssignmentView.FINISHED, // true === past deadline
			sortColumn: (query.sortColumn || DEFAULT_SORT_COLUMN) as AssignmentTableColumns,
			sortOrder: (query.sortOrder || DEFAULT_SORT_ORDER) as Avo.Search.OrderDirection,
			tableColumnDataType: getColumnDataType(),
			offset: query.page || 0,
			limit: ITEMS_PER_PAGE,
			filterString: query.filter || '',
			labelIds: (query.selectedAssignmentLabelIds as string[]) || [],
			classIds: (query.selectedClassLabelIds as string[]) || [],
			shareTypeIds: (query.selectedShareTypeLabelIds as string[]) || [],
		},
		{
			enabled: !!commonUser,
		}
	);
	const assignments = useMemo(() => assignmentResponse?.assignments || [], [assignmentResponse]);
	const assignmentCount = assignmentResponse?.count || 0;

	useEffect(() => {
		localStorage.setItem(ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS, JSON.stringify(query));
	}, [query]);

	const handleQueryChanged = (value: string | string[] | number | undefined, id: string) => {
		let newQuery: any = cloneDeep(query);
		let newValue = value;

		// Show both shareTypes for 'mijn opdrachten' option
		if (isArray(value) && value.includes(ShareWithColleagueTypeEnum.NIET_GEDEELD)) {
			newValue = [...value, ShareWithColleagueTypeEnum.GEDEELD_MET_ANDERE];
		}

		newQuery = {
			...newQuery,
			[id]: newValue,
			...(id !== 'page' ? { page: 0 } : {}), // Reset the page to 0, when any filter or sort order change is made
		};

		setQuery(newQuery, 'pushIn');
	};

	const copySearchTermsToQueryState = () => {
		handleQueryChanged(filterString, 'filter');
	};

	useKeyPress('Enter', copySearchTermsToQueryState);

	const handleSortOrderChange = (columnId: string) => {
		let newQuery: any = cloneDeep(query);

		newQuery = cleanupFilterTableState({
			...newQuery,
			sortColumn: columnId,
			sortOrder: toggleSortOrder(query.sortOrder),
		});

		setQuery(newQuery, 'pushIn');
	};

	const resetFiltersAndSort = () => {
		setFilterString('');
		setQuery({ ...query, sortColumn: DEFAULT_SORT_COLUMN, sortOrder: DEFAULT_SORT_ORDER });

		setQuery(defaultFiltersAndSort);
	};

	const updateAndReset = async () => {
		onUpdate();
		await refetchAssignments();
		resetFiltersAndSort();
	};

	const fetchAssignmentLabels = useCallback(async () => {
		if (commonUser?.profileId) {
			// Fetch all labels for the current user
			const labels = await AssignmentLabelsService.getLabelsForProfile(commonUser.profileId);
			setAllAssignmentLabels(labels);
		}
	}, [commonUser, setAllAssignmentLabels]);

	useEffect(() => {
		if (!isNil(canEditAssignments)) {
			refetchAssignments();
			fetchAssignmentLabels();
		}
	}, [canEditAssignments, refetchAssignments, fetchAssignmentLabels]);

	const handleSearchFieldKeyUp = (evt: KeyboardEvent<HTMLInputElement>) => {
		if (evt.keyCode === KeyCode.Enter) {
			copySearchTermsToQueryState();
		}
	};

	const handleExtraOptionsItemClicked = async (
		actionId: AssignmentAction,
		assignmentRow: Avo.Assignment.Assignment
	) => {
		setDropdownOpenForAssignmentId(null);
		if (!assignmentRow.id) {
			ToastService.danger(
				tHtml(
					'assignment/views/assignment-overview___het-opdracht-id-van-de-geselecteerde-rij-is-niet-ingesteld'
				)
			);
			return;
		}

		setMarkedAssignment(assignmentRow);
		switch (actionId) {
			case AssignmentAction.edit:
				navigate(navigateFunc, APP_PATH.ASSIGNMENT_EDIT_TAB.route, {
					id: assignmentRow.id,
					tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT,
				});
				break;
			case AssignmentAction.duplicate:
				try {
					if (!commonUser?.profileId) {
						ToastService.danger(
							tHtml(
								'assignment/views/assignment-overview___je-moet-ingelogd-zijn-om-een-opdracht-te-kunnen-dupliceren'
							)
						);
						return;
					}
					const latest: Avo.Assignment.Assignment =
						await AssignmentService.fetchAssignmentById(
							assignmentRow.id as unknown as string
						);

					await duplicateAssignment(latest, commonUser);
					await updateAndReset();
				} catch (err) {
					console.error('Failed to duplicate assignment', err, {
						assignmentId: assignmentRow.id,
					});
					ToastService.danger(
						tHtml(
							'assignment/views/assignment-overview___het-ophalen-van-de-details-van-de-opdracht-is-mislukt'
						)
					);
				}

				break;

			case AssignmentAction.delete:
				setDeleteAssignmentModalOpen(true);
				break;
			default:
				return null;
		}
	};

	const handleDeleteModalClose = () => {
		setDeleteAssignmentModalOpen(false);
		setMarkedAssignment(null);
	};

	const handleDeleteAssignmentConfirm = async () => {
		if (!markedAssignment) return;
		await deleteAssignment(markedAssignment, commonUser, updateAndReset);
		handleDeleteModalClose();
	};

	const handleDeleteSelfFromAssignmentConfirm = async () => {
		await deleteSelfFromAssignment(markedAssignment?.id, commonUser, updateAndReset);
		handleDeleteModalClose();
	};

	const renderActions = (assignmentRow: Avo.Assignment.Assignment) => {
		const handleOptionClicked = async (actionId: AssignmentAction) => {
			await handleExtraOptionsItemClicked(actionId as AssignmentAction, assignmentRow);
		};

		return (
			<ButtonToolbar className="c-assignment-overview__actions">
				{canEditAssignments && (
					<MoreOptionsDropdown
						isOpen={dropdownOpenForAssignmentId === assignmentRow.id}
						onOpen={() => {
							setMarkedAssignment(assignmentRow);
							setDropdownOpenForAssignmentId(null);
							// Let close menu render first and then open the other menu, otherwise both close
							setTimeout(() => setDropdownOpenForAssignmentId(assignmentRow.id), 10);
						}}
						onClose={() => {
							setDropdownOpenForAssignmentId(null);
						}}
						label={getMoreOptionsLabel()}
						menuItems={[
							...createDropdownMenuItem(
								assignmentRow.id,
								AssignmentAction.edit,
								tText('assignment/views/assignment-overview___bewerk'),
								IconName.edit2,
								query.view !== AssignmentView.FINISHED &&
									(isOwner ||
										isContributorWithContributeRights ||
										hasEditRightsForAllAssignments)
							),
							...createDropdownMenuItem(
								assignmentRow.id,
								AssignmentAction.duplicate,
								tText('assignment/views/assignment-overview___dupliceer'),
								IconName.copy,
								true
							),
							...createDropdownMenuItem(
								assignmentRow.id,
								AssignmentAction.delete,
								tText('assignment/views/assignment-overview___verwijderen'),
								IconName.delete,
								hasDeleteRightsForAllAssignments || isOwner
							),
							...createDropdownMenuItem(
								assignmentRow.id,
								AssignmentAction.delete,
								tText(
									'assignment/views/assignment-overview___verwijder-mij-van-deze-opdracht'
								),
								IconName.delete,
								!hasDeleteRightsForAllAssignments && !isOwner
							),
						]}
						onOptionClicked={(action) =>
							handleOptionClicked(action as AssignmentAction)
						}
					/>
				)}
			</ButtonToolbar>
		);
	};

	const renderLabels = (labels: { assignment_label: Avo.Assignment.Label }[], label: string) => {
		if (labels.length === 0) {
			return '-';
		}
		return renderMobileDesktop({
			mobile: renderDataCell(
				labels.map((label) => label.assignment_label.label).join(', '),
				label,
				'm-assignment-overview__table__data-cell--labels'
			),
			desktop: (
				<TagList
					tags={labels.map(({ assignment_label: item }: any) => ({
						id: item.id,
						label: item.label || '',
						color: item.color_override || item.enum_color?.label || 'hotpink',
					}))}
					swatches
					closable={false}
				/>
			),
		});
	};

	const renderDataCell = (value: ReactNode, label?: ReactNode, className?: string) =>
		renderMobileDesktop({
			mobile: (
				<div className={clsx('m-assignment-overview__table__data-cell', className)}>
					<div className="m-assignment-overview__table__data-cell__label">{label}</div>
					<div className="m-assignment-overview__table__data-cell__value">
						{value || '-'}
					</div>
				</div>
			),
			desktop: <span className={className}>{value || '-'}</span>,
		});

	const renderResponsesCell = (cellData: any, assignment: Avo.Assignment.Assignment) => {
		const responsesCount = (cellData || []).length;

		const userRole = getContributorType(
			commonUser?.profileId,
			assignment,
			assignment.contributors || []
		);

		if (responsesCount === 0 || userRole === 'VIEWER') {
			return renderDataCell(
				<span
					title={tText(
						'assignment/views/assignment-overview___aantal-leerlingen-dat-de-opdracht-heeft-aangeklikt'
					)}
				>
					-
				</span>,
				tText('assignment/views/assignment-overview___responses')
			);
		}

		return renderDataCell(
			<Link
				to={buildLink(APP_PATH.ASSIGNMENT_EDIT_TAB.route, {
					id: assignment.id,
					tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CLICKS,
				})}
			>
				<span
					title={tText(
						'assignment/views/assignment-overview___aantal-leerlingen-dat-de-opdracht-heeft-aangeklikt'
					)}
				>
					{responsesCount}
				</span>
			</Link>,
			tText('assignment/views/assignment-overview___responses')
		);
	};

	const renderCell = (assignment: Avo.Assignment.Assignment, colKey: AssignmentTableColumns) => {
		const cellData: any = (assignment as any)[colKey];
		const detailLink = canEditAssignments
			? buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, { id: assignment.id })
			: buildLink(
					APP_PATH.ASSIGNMENT_RESPONSE_DETAIL.route,
					{
						id: assignment.id,
					},
					{ tab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.ASSIGNMENT }
			  );

		const labels = (assignment.labels || []).filter(
			({ assignment_label: item }) => item.type === 'LABEL'
		);

		switch (colKey) {
			case 'title': {
				const renderTitle = () => (
					<Flex>
						<Spacer margin="right">
							<Icon name={IconName.clipboard} subtle />
						</Spacer>
						<div className="c-content-header c-content-header--small">
							<h3 className="c-content-header__header u-m-0">
								<Link to={detailLink}>{truncateTableValue(assignment.title)}</Link>
							</h3>
						</div>
					</Flex>
				);

				return renderMobileDesktop({
					mobile: <Spacer margin="bottom-small">{renderTitle()}</Spacer>,
					desktop: renderTitle(),
				});
			}

			case 'labels':
				return renderLabels(labels, tText('assignment/views/assignment-overview___labels'));

			case 'class_room':
				return renderLabels(
					(assignment.labels || []).filter(
						({ assignment_label: item }) => item.type === 'CLASS'
					),
					tText('assignment/views/assignment-overview___klas')
				);

			case 'author': {
				const profile = assignment?.profile || null;
				const avatarOptions = {
					dark: true,
					abbreviatedName: true,
					small: false,
				};

				return renderMobileDesktop({
					mobile: null,
					desktop: renderAvatar(profile, avatarOptions),
				});
			}

			case 'deadline_at':
				return renderDataCell(
					<AssignmentDeadline deadline={assignment.deadline_at} />,
					tText('assignment/views/assignment-overview___deadline')
				);

			case 'updated_at':
				return (
					<span className="c-assignment-overview__updated-at">
						{formatDate(cellData)}
					</span>
				);

			case 'share_type':
				return createShareIconTableOverview(
					assignment.share_type as ShareWithColleagueTypeEnum,
					assignment.contributors,
					'assignment',
					'c-assignment-overview__shared'
				);

			case 'is_public':
				return renderMobileDesktop({
					mobile: null,
					desktop: (
						<div
							title={
								assignment.is_public
									? tText(
											'collection/components/collection-or-bundle-overview___publiek'
									  )
									: tText(
											'collection/components/collection-or-bundle-overview___niet-publiek'
									  )
							}
						>
							<Icon name={assignment.is_public ? IconName.unlock3 : IconName.lock} />
						</div>
					),
				});

			case 'responses':
				return renderResponsesCell(cellData, assignment);

			case ACTIONS_TABLE_COLUMN_ID:
				return (
					<div className="c-assignment-overview__actions">
						{renderActions(assignment)}
					</div>
				);

			default:
				return JSON.stringify(cellData);
		}
	};

	const getLabelOptions = (labelType: Avo.Assignment.LabelType): CheckboxOption[] => {
		return compact(
			allAssignmentLabels
				.filter((labelObj: Avo.Assignment.Label) => labelObj.type === labelType)
				.map((labelObj: Avo.Assignment.Label): CheckboxOption | null => {
					if (!labelObj.label) {
						return null;
					}
					return {
						label: labelObj.label,
						id: labelObj.id,
						checked: [
							...(query.selectedAssignmentLabelIds || []),
							...(query.selectedClassLabelIds || []),
						].includes(labelObj.id),
					};
				})
		);
	};

	const getShareTypeLabels = (): CheckboxOption[] => {
		return compact([
			{
				label: tText('assignment/views/assignment-overview___gedeeld-met-mij'),
				id: ShareWithColleagueTypeEnum.GEDEELD_MET_MIJ,
				checked: [...(query.selectedShareTypeLabelIds || [])].includes(
					ShareWithColleagueTypeEnum.GEDEELD_MET_MIJ
				),
			},
			{
				label: tText('assignment/views/assignment-overview___mijn-opdrachten'),
				id: ShareWithColleagueTypeEnum.NIET_GEDEELD,
				checked: [...(query.selectedShareTypeLabelIds || [])].includes(
					ShareWithColleagueTypeEnum.NIET_GEDEELD
				),
			},
		]);
	};

	const renderHeader = () => {
		return (
			<Toolbar className="m-assignment-overview__header-toolbar">
				<ToolbarLeft>
					<ToolbarItem>
						<ButtonToolbar>
							{renderMobileDesktop({
								mobile: (
									<Select
										options={[
											{
												label: tText(
													'assignment/views/assignment-overview___actieve-opdrachten'
												),
												value: 'assignments',
											},
											{
												label: tText(
													'assignment/views/assignment-overview___afgelopen-opdrachten'
												),
												value: 'finished_assignments',
											},
										]}
										value={query.view}
										onChange={(activeViewId: string) =>
											handleQueryChanged(
												activeViewId as Avo.Assignment.View,
												'view'
											)
										}
										className="c-assignment-overview__archive-select"
										isSearchable={false}
									/>
								),
								desktop: (
									<ButtonGroup className="c-assignment-overview__archive-buttons">
										<Button
											type="secondary"
											label={tText(
												'assignment/views/assignment-overview___actieve-opdrachten'
											)}
											title={tText(
												'assignment/views/assignment-overview___filter-op-actieve-opdrachten'
											)}
											active={query.view === AssignmentView.ACTIVE}
											onClick={() =>
												handleQueryChanged(AssignmentView.ACTIVE, 'view')
											}
										/>
										<Button
											type="secondary"
											label={tText(
												'assignment/views/assignment-overview___afgelopen-opdrachten'
											)}
											title={tText(
												'assignment/views/assignment-overview___filter-op-afgelopen-opdrachten'
											)}
											active={query.view === AssignmentView.FINISHED}
											onClick={() =>
												handleQueryChanged(AssignmentView.FINISHED, 'view')
											}
										/>
									</ButtonGroup>
								),
							})}
							{canEditAssignments && (
								<>
									<CheckboxDropdownModal
										label={tText(
											'assignment/views/assignment-overview___soort'
										)}
										id="Soort"
										options={getShareTypeLabels()}
										onChange={(selectedLabels) =>
											handleQueryChanged(
												selectedLabels,
												'selectedShareTypeLabelIds'
											)
										}
									/>
									<CheckboxDropdownModal
										label={tText('assignment/views/assignment-overview___klas')}
										id="Klas"
										options={getLabelOptions('CLASS')}
										onChange={(selectedClasses) =>
											handleQueryChanged(
												selectedClasses,
												'selectedClassLabelIds'
											)
										}
									/>
									<CheckboxDropdownModal
										label={tText(
											'assignment/views/assignment-overview___label'
										)}
										id="Label"
										options={getLabelOptions('LABEL')}
										onChange={(selectedLabels) =>
											handleQueryChanged(
												selectedLabels,
												'selectedAssignmentLabelIds'
											)
										}
									/>
								</>
							)}
						</ButtonToolbar>
					</ToolbarItem>
				</ToolbarLeft>
				<ToolbarRight>
					<ToolbarItem>
						<Form type="inline">
							<FormGroup inlineMode="grow">
								<TextInput
									className="m-assignment-overview__search-input"
									icon={IconName.filter}
									value={filterString}
									onChange={setFilterString}
									onKeyUp={handleSearchFieldKeyUp}
									disabled={!assignments}
								/>
							</FormGroup>
						</Form>
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
		);
	};

	const onClickCreate = () =>
		redirectToClientPage(buildLink(APP_PATH.ASSIGNMENT_CREATE.route), navigateFunc);

	const getEmptyFallbackTitle = () => {
		const hasFilters: boolean =
			!!query.filter?.length ||
			!!query.selectedAssignmentLabelIds?.length ||
			!!query.selectedClassLabelIds?.length;
		if (canEditAssignments) {
			// Teacher
			if (query.view === AssignmentView.ACTIVE) {
				if (hasFilters) {
					return tHtml(
						'assignment/views/assignment-overview___er-zijn-geen-actieve-opdrachten-die-voldoen-aan-je-zoekterm'
					);
				}
				return tHtml(
					'assignment/views/assignment-overview___je-hebt-nog-geen-opdrachten-aangemaakt'
				);
			}
			if (hasFilters) {
				return tHtml(
					'assignment/views/assignment-overview___er-zijn-geen-verlopen-opdrachten-die-voldoen-aan-je-zoekterm'
				);
			}
			return tHtml(
				'assignment/views/assignment-overview___je-hebt-nog-geen-verlopen-opdrachten'
			);
		}
		// Pupil
		if (query.view === AssignmentView.ACTIVE) {
			if (hasFilters) {
				return tHtml(
					'assignment/views/assignment-overview___er-zijn-geen-actieve-opdrachten-die-voldoen-aan-je-zoekterm'
				);
			}
			return tHtml(
				'assignment/views/assignment-overview___je-hebt-nog-geen-opdrachten-ontvangen-van-je-leerkracht'
			);
		}
		if (hasFilters) {
			return tHtml(
				'assignment/views/assignment-overview___er-zijn-geen-verlopen-opdrachten-die-voldoen-aan-je-zoekterm'
			);
		}
		return tHtml('assignment/views/assignment-overview___er-zijn-nog-geen-opdrachten-verlopen');
	};

	const getEmptyFallbackDescription = () => {
		if (canEditAssignments) {
			// Teacher
			if (query.view === AssignmentView.ACTIVE) {
				return tHtml(
					'assignment/views/assignment-overview___beschrijving-hoe-een-opdracht-aan-te-maken'
				);
			}
			return tText(
				'assignment/views/assignment-overview___beschrijving-verlopen-opdrachten-in-werkruimte'
			);
		}
		// Pupil
		if (query.view === AssignmentView.ACTIVE) {
			return tText(
				'assignment/views/assignment-overview___beschrijving-opdrachten-in-werkruimte-voor-leerling'
			);
		}
		return tText(
			'assignment/views/assignment-overview___beschrijving-verlopen-opdrachten-in-werkruimte-voor-leerling'
		);
	};

	const getEmptyFallbackIcon = (): IconName => {
		if (canEditAssignments) {
			// Teacher
			if (query.view === AssignmentView.ACTIVE) {
				return IconName.clipboard;
			}
			return IconName.archive;
		}
		// Pupil
		if (query.view === AssignmentView.ACTIVE) {
			return IconName.clipboard;
		}
		return IconName.clock;
	};

	const renderEmptyFallback = () => (
		<>
			{renderHeader()}
			<ErrorView icon={getEmptyFallbackIcon()} message={getEmptyFallbackTitle()}>
				<p>{getEmptyFallbackDescription()}</p>
				{canEditAssignments && (
					<Spacer margin="top">
						<Button
							type="primary"
							icon={IconName.search}
							label={tText(
								'assignment/views/assignment-overview___zoek-een-fragment-of-collectie-en-maak-je-eerste-opdracht'
							)}
							onClick={onClickCreate}
						/>
					</Spacer>
				)}
			</ErrorView>
		</>
	);

	const renderTable = () => {
		return (
			<Table
				className="m-assignment-overview__table"
				columns={tableColumns}
				data={assignments as Avo.Assignment.Assignment[]}
				emptyStateMessage={
					query.filter
						? tText(
								'assignment/views/assignment-overview___er-zijn-geen-opdrachten-die-voldoen-aan-de-zoekopdracht'
						  )
						: query.view === AssignmentView.FINISHED
						? tText(
								'assignment/views/assignment-overview___er-zijn-nog-geen-opdrachten-gearchiveerd'
						  )
						: tText(
								'assignment/views/assignment-overview___er-zijn-nog-geen-opdrachten-aangemaakt'
						  )
				}
				renderCell={(rowData: Avo.Assignment.Assignment, colKey: string) =>
					renderCell(rowData, colKey as AssignmentTableColumns)
				}
				rowKey="id"
				variant="styled"
				onColumnClick={handleSortOrderChange}
				sortColumn={query.sortColumn as AssignmentTableColumns}
				sortOrder={query.sortOrder as OrderDirection}
				useCards={isMobileWidth()}
			/>
		);
	};

	const renderAssignmentsView = () => {
		if (isLoadingAssignments) {
			return (
				<Flex orientation="horizontal" center>
					<Spinner size="large" />
				</Flex>
			);
		}
		if (!assignments.length) {
			return renderEmptyFallback();
		}
		return (
			<>
				{renderHeader()}
				{renderTable()}
				<Spacer margin="top-large">
					<PaginationBar
						{...GET_DEFAULT_PAGINATION_BAR_PROPS()}
						startItem={(query.page || 0) * ITEMS_PER_PAGE}
						itemsPerPage={ITEMS_PER_PAGE}
						totalItems={assignmentCount}
						onPageChange={(newPage: number) => handleQueryChanged(newPage, 'page')}
					/>
				</Spacer>

				<DeleteAssignmentModal
					isOpen={isDeleteAssignmentModalOpen}
					onClose={handleDeleteModalClose}
					deleteAssignmentCallback={handleDeleteAssignmentConfirm}
					deleteSelfFromAssignmentCallback={handleDeleteSelfFromAssignmentConfirm}
					contributorCount={markedAssignment?.contributors?.length || 0}
					hasPupilResponses={!!markedAssignment?.responses?.length}
					hasPupilResponseCollections={
						markedAssignment?.lom_learning_resource_type?.includes(
							AssignmentType.BOUW
						) || false
					}
					shouldDeleteSelfFromAssignment={shouldDeleteSelfFromAssignment}
				/>
			</>
		);
	};

	return <div className="m-assignment-overview">{renderAssignmentsView()}</div>;
};
