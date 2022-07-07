import { yupResolver } from '@hookform/resolvers/yup';
import {
	Alert,
	BlockHeading,
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
	Dispatch,
	FunctionComponent,
	SetStateAction,
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

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { InteractiveTour } from '../../../shared/components';
import { StickySaveBar } from '../../../shared/components/StickySaveBar/StickySaveBar';
import { buildLink, formatTimestamp } from '../../../shared/helpers';
import withUser, { UserProps } from '../../../shared/hocs/withUser';
import { ToastService } from '../../../shared/services';
import { ASSIGNMENTS_ID } from '../../../workspace/workspace.const';
import {
	ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS,
	PUPIL_COLLECTION_FORM_SCHEMA,
} from '../../assignment.const';
import { AssignmentService } from '../../assignment.service';
import {
	AssignmentResponseFormState,
	PupilCollectionFragment,
	PupilSearchFilterState,
} from '../../assignment.types';
import AssignmentHeading from '../../components/AssignmentHeading';
import { useAssignmentPupilTabs } from '../../hooks';

import '../AssignmentPage.scss';
import './AssignmentResponseEdit.scss';
import AssignmentResponseAssignmentTab from './tabs/AssignmentResponseAssignmentTab';
import AssignmentResponsePupilCollectionTab from './tabs/AssignmentResponsePupilCollectionTab';
import AssignmentResponseSearchTab from './tabs/AssignmentResponseSearchTab';

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

	const {
		control,
		formState: { isDirty },
		handleSubmit,
		reset,
		setValue,
		trigger,
	} = useForm<AssignmentResponseFormState>({
		defaultValues: assignmentResponse || {
			collection_title: '',
			pupil_collection_blocks: [] as PupilCollectionFragment[],
		},
		resolver: yupResolver(PUPIL_COLLECTION_FORM_SCHEMA(t)),
		mode: 'onChange',
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
				await AssignmentService.createOrFetchAssignmentResponseObject(
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
		setValue('collection_title', assignmentResponse.collection_title || '');
		setValue('pupil_collection_blocks', (assignmentResponse as any).pupil_collection_blocks);

		trigger();
	}, [assignmentResponse, setValue, trigger]);

	useEffect(() => {
		fetchAssignment();
	}, []);

	// Events

	const submit = async (formState: AssignmentResponseFormState) => {
		try {
			if (!user.profile?.id || !assignmentResponse) {
				return;
			}

			const updated = await AssignmentService.updateAssignmentResponse(
				{
					...assignmentResponse,
				},
				{
					collection_title: formState.collection_title,
					pupil_collection_blocks: formState.pupil_collection_blocks,
				}
			);

			if (updated) {
				// TODO check if tracking of pupil collection edit is needed + extend object_type in events database
				// trackEvents(
				// 	{
				// 		object: String(assignmentResponse.id),
				// 		object_type: 'assignment_response',
				// 		action: 'edit',
				// 	},
				// 	user
				// );

				// Re-fetch
				await fetchAssignment();

				ToastService.success(
					t(
						'assignment/views/assignment-response-edit/assignment-response-edit___de-collectie-is-opgeslagen'
					)
				);
			}
		} catch (err) {
			console.error(err);
			ToastService.danger(
				t(
					'assignment/views/assignment-response-edit/assignment-response-edit___het-opslaan-van-de-collectie-is-mislukt'
				)
			);
		}
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

	const renderTabs = () => <Tabs tabs={tabs} onClick={onTabClick} />;

	const renderTabContent = () => {
		switch (tab) {
			case ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.ASSIGNMENT:
				return (
					<AssignmentResponseAssignmentTab
						assignmentInfo={assignmentInfo}
						assignmentInfoLoading={assignmentInfoLoading}
						assignmentInfoError={assignmentInfoError}
					/>
				);

			case ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.SEARCH:
				return (
					<AssignmentResponseSearchTab
						assignment={assignment}
						assignmentResponse={assignmentResponse}
						filterState={filterState}
						setFilterState={setFilterState}
					/>
				);

			case ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.MY_COLLECTION:
				if (!assignmentResponse) {
					return <Spinner size="large" />;
				}
				return (
					<AssignmentResponsePupilCollectionTab
						assignmentResponse={assignmentResponse}
						setAssignmentResponse={
							setAssignmentResponse as Dispatch<
								SetStateAction<Avo.Assignment.Response_v2>
							>
						}
						setValue={setValue}
						control={control}
					/>
				);

			default:
				return tab;
		}
	};

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
					tabs={renderTabs()}
					info={renderMeta()}
					tour={<InteractiveTour showButton />}
				/>
				<Container mode="horizontal" className="c-container--sticky-save-bar-wrapper">
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

					<Spacer margin={['bottom-large']}>{renderTabContent()}</Spacer>
					<StickySaveBar
						isVisible={isDirty}
						onCancel={() => reset()}
						onSave={handleSubmit(submit, (...args) => console.error(args))}
					/>
				</Container>
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
