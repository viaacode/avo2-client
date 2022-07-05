import { yupResolver } from '@hookform/resolvers/yup';
import {
	Alert,
	BlockHeading,
	Button,
	ButtonToolbar,
	Container,
	Flex,
	FormGroup,
	Icon,
	Spacer,
	Spinner,
	Tabs,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import { isPast } from 'date-fns/esm';
import { intersection, noop } from 'lodash-es';
import React, {
	FunctionComponent,
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'redux';
import {
	JsonParam,
	NumberParam,
	StringParam,
	UrlUpdateType,
	useQueryParams,
} from 'use-query-params';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import { AddToAssignmentModal } from '../../item/components';
import { ItemTrimInfo } from '../../item/item.types';
import ItemDetail from '../../item/views/ItemDetail';
import { SearchFiltersAndResults } from '../../search/components';
import { FilterState } from '../../search/search.types';
import { InteractiveTour } from '../../shared/components';
import { buildLink, formatTimestamp } from '../../shared/helpers';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import { useScrollToId } from '../../shared/hooks/scroll-to-id';
import { ToastService } from '../../shared/services';
import { ASSIGNMENTS_ID } from '../../workspace/workspace.const';
import {
	ASSIGNMENT_FORM_SCHEMA,
	ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS,
	ENABLED_FILTERS_PUPIL_SEARCH,
	ENABLED_TYPE_FILTER_OPTIONS_PUPIL_SEARCH,
} from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import {
	AssignmentResponseFormState,
	PupilCollectionFragment,
	PupilSearchFilterState,
} from '../assignment.types';
import AssignmentHeading from '../components/AssignmentHeading';
import {
	useAssignmentBlockChangeHandler,
	useAssignmentBlocks,
	useAssignmentBlocksList,
	useAssignmentPupilTabs,
} from '../hooks';
import { PupilCollectionService } from '../pupil-collection.service';

import './AssignmentPage.scss';
import './AssignmentResponseEdit.scss';

const AssignmentResponseEdit: FunctionComponent<
	UserProps & DefaultSecureRouteProps<{ id: string }>
> = ({ match, user }) => {
	const [t] = useTranslation();

	// Data
	const assignmentId = match.params.id;
	const [assignmentInfo, setAssignmentInfo] = useState<{
		assignmentBlocks: Avo.Assignment.Block[];
		assignment: Avo.Assignment.Assignment_v2;
	} | null>(null);
	const [assignmentInfoLoading, setAssignmentInfoLoading] = useState<boolean>(false);
	const [assignmentInfoError, setAssignmentInfoError] = useState<any | null>(null);
	const assignment: Avo.Assignment.Assignment_v2 | null = assignmentInfo?.assignment || null;

	const [assignmentResponse, setAssignmentResponse] = useState<Avo.Assignment.Response_v2 | null>(
		null
	);

	const [isAddToAssignmentModalOpen, setIsAddToAssignmentModalOpen] = useState<boolean>(false);
	const [selectedItem, setSelectedItem] = useState<Avo.Item.Item | null>(null);

	const {
		control,
		formState: { isDirty },
		handleSubmit,
		reset: resetForm,
		setValue,
		trigger,
	} = useForm<AssignmentResponseFormState>({
		defaultValues: assignmentResponse || {
			collection_title: '',
			pupil_collection_blocks: [] as PupilCollectionFragment[],
		},
		resolver: yupResolver(ASSIGNMENT_FORM_SCHEMA(t)),
	});

	// UI
	const queryParamConfig = {
		filters: JsonParam,
		orderProperty: StringParam,
		orderDirection: StringParam,
		page: NumberParam,
		tab: StringParam, // Which tab is active: assignment, search or my collection
		selectedSearchResultId: StringParam, // Search result of which the detail page should be shown
		focus: StringParam, // Search result that should be scrolled into view
	};
	const [filterState, setFilterState] = useQueryParams(queryParamConfig) as [
		PupilSearchFilterState,
		(FilterState: PupilSearchFilterState, updateType?: UrlUpdateType) => void
	];
	useScrollToId(filterState.focus || null);
	const [tabs, tab, , onTabClick] = useAssignmentPupilTabs(
		assignment || undefined,
		filterState.tab as ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS,
		(newTab: string) => {
			setFilterState({
				...(filterState as PupilSearchFilterState),
				tab: newTab as ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS,
			});
		}
	);

	const pastDeadline = useMemo(
		() => assignment?.deadline_at && isPast(new Date(assignment.deadline_at)),
		[assignment]
	);

	// HTTP
	const fetchAssignment = useCallback(async () => {
		try {
			setAssignmentInfoLoading(true);

			// Get assignment
			setAssignmentInfoError(null);
			if (!user.profile?.id) {
				ToastService.danger(
					t(
						'assignment/views/assignment-response-edit___het-ophalen-van-de-opdracht-is-mislukt-de-ingelogde-gebruiker-heeft-geen-profiel-id'
					)
				);
				return;
			}

			const tempAssignmentInfo = await AssignmentService.fetchAssignmentAndContent(
				user.profile.id,
				assignmentId
			);

			// Create an assignment response if needed
			setAssignmentResponse(
				await AssignmentService.createAssignmentResponseObject(
					tempAssignmentInfo?.assignment,
					user
				)
			);

			setAssignmentInfo(tempAssignmentInfo);
		} catch (err) {
			setAssignmentInfoError(err);
		}
		setAssignmentInfoLoading(false);
	}, [assignmentId]);

	// Effects

	// Synchronise the React state that triggers renders with the useForm hook
	useEffect(() => {
		if (!assignmentResponse) {
			return;
		}
		setValue('collection_title', assignmentResponse.collection_title);
		setValue('pupil_collection_blocks', (assignmentResponse as any).pupil_collection_blocks);

		trigger();
	}, [assignment, setValue, trigger]);

	useEffect(() => {
		fetchAssignment();
	}, []);

	// Events
	const goToDetailLink = (id: string): void => {
		setFilterState({
			...(filterState as PupilSearchFilterState),
			selectedSearchResultId: id,
		});
	};

	const goToSearchLink = (newFilters: FilterState): void => {
		setFilterState({ ...filterState, ...newFilters });
	};

	const handleAddToPupilCollection = async (item: Avo.Item.Item): Promise<void> => {
		if (!assignment) {
			ToastService.info(
				t(
					'assignment/views/assignment-response-edit___het-laden-van-de-opdracht-is-mislukt'
				)
			);
			return;
		}
		if (AssignmentService.isOwnerOfAssignment(assignment, user)) {
			ToastService.info(
				t(
					'assignment/views/assignment-response-edit___je-kan-geen-antwoord-indienen-op-je-eigen-opdracht'
				)
			);
			return;
		}
		setSelectedItem(item);
		setIsAddToAssignmentModalOpen(true);
	};

	const handleAddToPupilCollectionConfirmed = async (
		itemTrimInfo?: ItemTrimInfo
	): Promise<void> => {
		setIsAddToAssignmentModalOpen(false);
		if (selectedItem && assignmentResponse?.id) {
			await PupilCollectionService.importFragmentToPupilCollection(
				selectedItem,
				assignmentResponse.id,
				itemTrimInfo
			);
			ToastService.success(
				t(
					'assignment/views/assignment-response-edit___het-fragment-is-toegevoegd-aan-je-collectie'
				)
			);
		} else {
			ToastService.danger(
				t(
					'assignment/views/assignment-response-edit___het-toevoegen-van-het-fragment-aan-je-collectie-is-mislukt'
				)
			);
		}
	};

	const updateBlocksInAssignmentResponseState = (newBlocks: PupilCollectionFragment[]) => {
		setAssignmentResponse((prev) => ({ ...prev, pupil_collection_blocks: newBlocks } as any)); // TODO remove cast once pupil_collection_blocks is in typings repo
		setValue('pupil_collection_blocks', newBlocks, { shouldDirty: true });
	};
	const setBlock = useAssignmentBlockChangeHandler(
		(assignmentResponse as any)?.pupil_collection_blocks, // TODO remove cast once BlockItemBase is in typings repo
		updateBlocksInAssignmentResponseState
	);
	const renderBlockContent = useAssignmentBlocks(setBlock);
	const [renderedListSorter] = useAssignmentBlocksList(
		(assignmentResponse as any)?.pupil_collection_blocks,
		(blocks) =>
			setAssignmentResponse((prevState) => {
				if (!prevState) {
					return null;
				}
				return {
					...prevState,
					pupil_collection_blocks: blocks,
				};
			}),
		{
			listSorter: {
				content: (item) => item && renderBlockContent(item),
				divider: (_item) => (
					<Button
						icon="plus"
						type="secondary"
						onClick={() => {
							// TODO
						}}
					/>
				),
			},
			listSorterItem: {
				onSlice: (_item) => {
					// TODO
				},
			},
		}
	);

	// Render

	const renderDetailLink = (linkText: string | ReactNode, id: string) => {
		return (
			<Button
				type="inline-link"
				className="c-button--relative-link"
				onClick={() => goToDetailLink(id)}
			>
				{linkText}
			</Button>
		);
	};

	const renderSearchLink = (
		linkText: string | ReactNode,
		newFilters: FilterState,
		className?: string
	) => {
		// Only render links for the filters that are enabled:
		const filters = Object.keys(newFilters.filters || {});
		if (intersection(ENABLED_FILTERS_PUPIL_SEARCH, filters).length > 0) {
			return (
				<Button
					type="inline-link"
					className={classnames('c-button--relative-link', className)}
					onClick={() =>
						setFilterState({
							...filterState,
							...newFilters,
							selectedSearchResultId: undefined,
						})
					}
				>
					{linkText}
				</Button>
			);
		} else {
			// Just render the text for the filters that are not enabled
			return linkText;
		}
	};

	const renderBackButton = useMemo(
		() => (
			<Link
				className="c-return"
				to={buildLink(APP_PATH.WORKSPACE_TAB.route, {
					tabId: ASSIGNMENTS_ID,
				})}
			>
				<Icon name="chevron-left" size="small" type="arrows" />

				{t('assignment/views/assignment-edit___mijn-opdrachten')}
			</Link>
		),
		[t]
	);

	const renderedTitle = useMemo(
		() => (
			<Flex center className="u-spacer-top-l">
				<Icon name="clipboard" size="large" />

				<BlockHeading className="u-spacer-left" type="h2">
					{assignment?.title}
				</BlockHeading>
			</Flex>
		),
		[assignment]
	);

	const renderMeta = useCallback(() => {
		if (!assignment) {
			return null;
		}
		const teacherName = assignment?.owner?.full_name;
		const deadline = formatTimestamp(assignment?.deadline_at, false);
		const labels = (assignment?.labels || [])
			.filter((label) => label.assignment_label.type === 'LABEL')
			.map((label) => label.assignment_label.label)
			.join(', ');
		const classes = (assignment?.labels || [])
			.filter((label) => label.assignment_label.type === 'CLASS')
			.map((label) => label.assignment_label.label)
			.join(', ');

		return (
			<section className="u-spacer-bottom">
				<Flex>
					{teacherName && (
						<div>
							{t('assignment/views/assignment-response-edit___lesgever')}:{' '}
							<b>{teacherName}</b>
						</div>
					)}

					{deadline && (
						<Spacer margin="left">
							{t('assignment/views/assignment-response-edit___deadline')}:{' '}
							<b>{deadline}</b>
						</Spacer>
					)}

					{labels && (
						<Spacer margin="left">
							{t('assignment/views/assignment-response-edit___label')}:{' '}
							<b>{labels}</b>
						</Spacer>
					)}

					{classes && (
						<Spacer margin="left">
							{t('assignment/views/assignment-response-edit___klas')}:{' '}
							<b>{classes}</b>
						</Spacer>
					)}
				</Flex>
			</section>
		);
	}, [assignment, t]);

	const renderItemDetailActionButton = (item: Avo.Item.Item) => {
		return (
			<Toolbar>
				<ToolbarLeft>
					<ToolbarItem>
						<ButtonToolbar>
							<Button
								type="tertiary"
								icon="collection"
								label={t(
									'assignment/views/assignment-response-edit___voeg-toe-aan-mijn-collectie'
								)}
								title={t(
									'assignment/views/assignment-response-edit___knip-fragment-bij-en-of-voeg-toe-aan-mijn-collectie'
								)}
								ariaLabel={t(
									'assignment/views/assignment-response-edit___knip-fragment-bij-en-of-voeg-toe-aan-mijn-collectie'
								)}
								onClick={() => handleAddToPupilCollection(item)}
							/>
						</ButtonToolbar>
					</ToolbarItem>
				</ToolbarLeft>
			</Toolbar>
		);
	};

	const renderSearchResultDetailPage = () => {
		// Render fragment detail page
		return (
			<ItemDetail
				id={filterState.selectedSearchResultId}
				renderDetailLink={renderDetailLink}
				renderSearchLink={renderSearchLink}
				goToDetailLink={goToDetailLink}
				goToSearchLink={goToSearchLink}
				enabledMetaData={ENABLED_FILTERS_PUPIL_SEARCH}
				renderActionButtons={renderItemDetailActionButton}
			/>
		);
	};

	const renderSearchContent = () => {
		if (filterState.selectedSearchResultId) {
			return (
				<>
					<Container bordered>
						<Container mode="horizontal">
							<Button
								type="link"
								className="c-return--search-results"
								onClick={() => {
									setFilterState({
										...filterState,
										focus: filterState.selectedSearchResultId,
										selectedSearchResultId: undefined,
									});
								}}
							>
								<Icon name="chevron-left" size="small" type="arrows" />
								{t('assignment/views/assignment-response-edit___zoekresultaten')}
							</Button>
						</Container>
					</Container>
					{renderSearchResultDetailPage()}
				</>
			);
		}
		// This form receives its parent's state because we don't care about rerender performance here
		if (!PermissionService.hasPerm(user, PermissionName.SEARCH_IN_ASSIGNMENT)) {
			return (
				<ErrorView
					message={t(
						'assignment/views/assignment-response-edit___je-hebt-geen-rechten-om-te-zoeken-binnen-een-opdracht'
					)}
					actionButtons={['home', 'helpdesk']}
					icon="lock"
				/>
			);
		}
		return (
			<Spacer margin={['top-large', 'bottom-large']}>
				<SearchFiltersAndResults
					enabledFilters={ENABLED_FILTERS_PUPIL_SEARCH}
					enabledTypeOptions={ENABLED_TYPE_FILTER_OPTIONS_PUPIL_SEARCH}
					bookmarks={false}
					filterState={filterState}
					setFilterState={(newFilterState: FilterState) => {
						setFilterState({
							...filterState,
							...newFilterState,
						});
					}}
					renderDetailLink={renderDetailLink}
					renderSearchLink={renderSearchLink}
				/>
			</Spacer>
		);
	};

	const renderCollectionEdit = () => {
		return (
			<Container mode="horizontal">
				<Container mode="vertical">
					<Toolbar size="large">
						<ToolbarLeft>
							<FormGroup
								label={t('Naam resultatenset')}
								className="c-form-group--full-width"
							>
								<TextInput
									type="text"
									value={assignmentResponse?.collection_title || ''}
									onChange={(newCollectionTitle: string) => {
										setAssignmentResponse((prevState) => {
											if (!prevState) {
												return null;
											}
											return {
												...prevState,
												collection_title: newCollectionTitle || '',
											};
										});
									}}
								/>
							</FormGroup>
						</ToolbarLeft>
						<ToolbarRight>
							<Button
								type="primary"
								label={t('Bekijk als lesgever')}
								onClick={noop}
							/>
						</ToolbarRight>
					</Toolbar>
					{renderedListSorter}
				</Container>
			</Container>
		);
	};

	const renderAssignmentBlocks = () => {
		return (
			<Container mode="horizontal">
				{/* TODO Render the assignment blocks in readonly mode */}
				{JSON.stringify(assignment, null, 2)}
			</Container>
		);
	};

	const renderedTabs = useMemo(
		() => <Tabs tabs={tabs} onClick={onTabClick} />,
		[tabs, onTabClick]
	);

	const renderedTabContent = useMemo(() => {
		switch (tab) {
			case ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.ASSIGNMENT:
				return renderAssignmentBlocks();

			case ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.SEARCH:
				return renderSearchContent();

			case ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.MY_COLLECTION:
				return renderCollectionEdit();

			default:
				return tab;
		}
	}, [tab, filterState, assignment, assignmentResponse]);

	const renderPageContent = () => {
		if (assignmentInfoLoading) {
			return (
				<Spacer margin="top-extra-large">
					<Flex orientation="horizontal" center>
						<Spinner size="large" />
					</Flex>
				</Spacer>
			);
		}
		if (assignmentInfoError) {
			return (
				<ErrorView
					message={t(
						'assignment/views/assignment-response-edit___het-ophalen-van-de-opdracht-is-mislukt'
					)}
					icon={'search'}
				/>
			);
		}
		if (!assignment) {
			return (
				<ErrorView
					message={t(
						'assignment/views/assignment-response-edit___de-opdracht-is-niet-gevonden'
					)}
					icon={'search'}
				/>
			);
		}
		return (
			<div className="c-assignment-response-page c-assignment-response-page--edit">
				<AssignmentHeading
					back={renderBackButton}
					title={renderedTitle}
					tabs={renderedTabs}
					info={renderMeta()}
					tour={<InteractiveTour showButton />}
				/>
				<Container mode="horizontal">
					{pastDeadline && (
						<Spacer margin={['top-large']}>
							<Alert type="info">
								{t(
									'assignment/views/assignment-response-edit___deze-opdracht-is-afgelopen-de-deadline-was-deadline',
									{
										deadline: formatTimestamp(assignment?.deadline_at, false),
									}
								)}
							</Alert>
						</Spacer>
					)}
				</Container>
				<Spacer margin={['bottom-large']}>{renderedTabContent}</Spacer>
				{selectedItem && (
					<AddToAssignmentModal
						itemMetaData={selectedItem}
						isOpen={isAddToAssignmentModalOpen}
						onClose={() => setIsAddToAssignmentModalOpen(false)}
						onAddToAssignmentCallback={handleAddToPupilCollectionConfirmed}
					/>
				)}
			</div>
		);
	};

	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						t(
							'assignment/views/assignment-response-edit___maak-opdracht-antwoord-pagina-titel'
						)
					)}
				</title>

				<meta
					name="description"
					content={t(
						'assignment/views/assignment-response-edit___maak-opdracht-antwoord-pagina-beschrijving'
					)}
				/>
			</MetaTags>

			{renderPageContent()}
		</>
	);
};

export default compose(withRouter, withUser)(AssignmentResponseEdit) as FunctionComponent;
