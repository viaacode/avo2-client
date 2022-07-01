import {
	Alert,
	BlockHeading,
	Button,
	Container,
	Flex,
	Icon,
	Spacer,
	Spinner,
	Tabs,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { isPast } from 'date-fns/esm';
import React, {
	FunctionComponent,
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { JsonParam, StringParam, UrlUpdateType, useQueryParams } from 'use-query-params';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import BundleDetail from '../../bundle/views/BundleDetail';
import { CollectionDetail } from '../../collection/views';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import ItemDetail from '../../item/views/ItemDetail';
import { SearchFiltersAndResults } from '../../search/components';
import { FilterState } from '../../search/search.types';
import { InteractiveTour } from '../../shared/components';
import { buildLink, formatTimestamp } from '../../shared/helpers';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import { ASSIGNMENTS_ID } from '../../workspace/workspace.const';
import { ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS } from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import { PupilSearchFilterState } from '../assignment.types';
import AssignmentHeading from '../components/AssignmentHeading';
import { useAssignmentPupilTabs } from '../hooks';

import './AssignmentEdit.scss';
import './AssignmentPage.scss';
import './AssignmentResponseEdit.scss';

const AssignmentResponseEdit: FunctionComponent<
	UserProps & DefaultSecureRouteProps<{ id: string }>
> = ({ match, user }) => {
	const [t] = useTranslation();

	// Data
	const [assignment, setAssignment] = useState<Avo.Assignment.Assignment_v2 | null>(null);
	const [assignmentLoading, setAssignmentLoading] = useState<boolean>(false);
	const [assignmentError, setAssignmentError] = useState<any | null>(null);

	// UI
	const queryParamConfig = {
		filters: JsonParam,
		orderProperty: StringParam,
		orderDirection: StringParam,
		tab: StringParam,
		selectedSearchResultId: StringParam,
		selectedSearchResultType: StringParam,
	};
	const [filterState, setFilterState] = useQueryParams(queryParamConfig) as [
		PupilSearchFilterState,
		(FilterState: PupilSearchFilterState, updateType?: UrlUpdateType) => void
	];
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
			setAssignmentLoading(true);
			setAssignmentError(null);
			setAssignment(await AssignmentService.fetchAssignmentById(match.params.id));
		} catch (err) {
			setAssignmentError(err);
		}
		setAssignmentLoading(false);
	}, [match.params.id]);

	// Effects
	useEffect(() => {
		fetchAssignment();
	}, []);

	// Events
	const goToDetailLink = (id: string, type: Avo.Core.ContentType) => {
		setFilterState({
			...(filterState as PupilSearchFilterState),
			selectedSearchResultId: id,
			selectedSearchResultType: type,
		});
	};

	const goToSearchLink = (newFilters: FilterState) => {
		setFilterState({ ...filterState, ...newFilters });
	};

	const renderDetailLink = (
		linkText: string | ReactNode,
		id: string,
		type: Avo.Core.ContentType
	) => {
		return (
			<a href="" onClick={() => goToDetailLink(id, type)}>
				{linkText}
			</a>
		);
	};

	const renderSearchLink = (
		linkText: string | ReactNode,
		newFilters: FilterState,
		className?: string
	) => {
		return (
			<a
				href=""
				className={className}
				onClick={() => setFilterState({ ...filterState, ...newFilters })}
			>
				{linkText}
			</a>
		);
	};

	// Render

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

	const renderTitle = useMemo(
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

	const tabBar = useMemo(() => <Tabs tabs={tabs} onClick={onTabClick} />, [tabs, onTabClick]);

	const renderSearchResultDetailPage = () => {
		// Render detail page
		if (
			filterState.selectedSearchResultType === 'video' ||
			filterState.selectedSearchResultType === 'audio'
		) {
			return (
				<ItemDetail
					id={filterState.selectedSearchResultId}
					renderDetailLink={renderDetailLink}
					renderSearchLink={renderSearchLink}
					goToDetailLink={goToDetailLink}
					goToSearchLink={goToSearchLink}
				/>
			);
		} else if (filterState.selectedSearchResultType === 'collectie') {
			return <CollectionDetail user={user} id={filterState.selectedSearchResultId} />;
		} else {
			return <BundleDetail user={user} id={filterState.selectedSearchResultId} />;
		}
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
										selectedSearchResultId: undefined,
										selectedSearchResultType: undefined,
									});
								}}
							>
								<Icon name="chevron-left" size="small" type="arrows" />
								{t('Zoekresultaten')}
							</Button>
						</Container>
					</Container>
					{renderSearchResultDetailPage()}
				</>
			);
		}
		// This form receives its parent's state because we don't care about rerender performance here
		return (
			<Spacer margin={['top-large', 'bottom-large']}>
				<SearchFiltersAndResults
					enabledFilters={['type', 'serie', 'broadcastDate', 'provider']}
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

	const renderTabContent = useMemo(() => {
		switch (tab) {
			case ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.ASSIGNMENT:
				return 'assignment details';

			case ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.SEARCH:
				return renderSearchContent();

			case ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.MY_COLLECTION:
				// This form receives its parent's state because we don't care about rerender performance here
				return 'collection view';

			default:
				return tab;
		}
	}, [tab, filterState]);

	const renderPageContent = () => {
		if (assignmentLoading) {
			return (
				<Spacer margin="top-extra-large">
					<Flex orientation="horizontal" center>
						<Spinner size="large" />
					</Flex>
				</Spacer>
			);
		}
		if (assignmentError) {
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
					title={renderTitle}
					tabs={tabBar}
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
				{renderTabContent}
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
