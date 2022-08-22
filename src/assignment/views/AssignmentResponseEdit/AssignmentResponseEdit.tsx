import { yupResolver } from '@hookform/resolvers/yup';
import {
	Alert,
	BlockHeading,
	Box,
	Container,
	Flex,
	Icon,
	Spacer,
	Spinner,
	Tabs,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import React, {
	Dispatch,
	FunctionComponent,
	SetStateAction,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
	JsonParam,
	NumberParam,
	StringParam,
	UrlUpdateType,
	useQueryParams,
} from 'use-query-params';

import { CollectionBlockType } from '../../../collection/collection.const';
import { FilterState } from '../../../search/search.types';
import { InteractiveTour } from '../../../shared/components';
import { BeforeUnloadPrompt } from '../../../shared/components/BeforeUnloadPrompt/BeforeUnloadPrompt';
import { StickySaveBar } from '../../../shared/components/StickySaveBar/StickySaveBar';
import { formatTimestamp } from '../../../shared/helpers';
import withUser, { UserProps } from '../../../shared/hocs/withUser';
import { useWarningBeforeUnload } from '../../../shared/hooks/useWarningBeforeUnload';
import { ToastService } from '../../../shared/services';
import {
	ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS,
	PUPIL_COLLECTION_FORM_SCHEMA,
} from '../../assignment.const';
import { setPositionToIndex } from '../../assignment.helper';
import { AssignmentService } from '../../assignment.service';
import {
	AssignmentResponseFormState,
	PupilCollectionFragment,
	PupilSearchFilterState,
} from '../../assignment.types';
import AssignmentHeading from '../../components/AssignmentHeading';
import AssignmentMetadata from '../../components/AssignmentMetadata';
import { buildAssignmentSearchLink } from '../../helpers/build-search-link';
import { cleanupTitleAndDescriptions } from '../../helpers/cleanup-title-and-descriptions';
import { isItemWithMeta } from '../../helpers/is-item-with-meta';
import { backToOverview } from '../../helpers/links';
import { useAssignmentPupilTabs } from '../../hooks';
import { useAssignmentPastDeadline } from '../../hooks/assignment-past-deadline';

import AssignmentResponseAssignmentTab from './tabs/AssignmentResponseAssignmentTab';
import AssignmentResponsePupilCollectionTab from './tabs/AssignmentResponsePupilCollectionTab';
import AssignmentResponseSearchTab from './tabs/AssignmentResponseSearchTab';

import '../AssignmentPage.scss';
import './AssignmentResponseEdit.scss';

interface AssignmentResponseEditProps {
	assignment: Avo.Assignment.Assignment_v2;
	assignmentResponse: Avo.Assignment.Response_v2;
	setAssignmentResponse: Dispatch<SetStateAction<Avo.Assignment.Response_v2>>;
	showBackButton: boolean;
	isPreview?: boolean;
	onAssignmentChanged: () => Promise<void>;
	onShowPreviewClicked: () => void;
}

const AssignmentResponseEdit: FunctionComponent<AssignmentResponseEditProps & UserProps> = ({
	assignment,
	assignmentResponse,
	onAssignmentChanged,
	setAssignmentResponse,
	showBackButton,
	isPreview = false,
	onShowPreviewClicked,
	user,
}) => {
	const [t] = useTranslation();

	// Data
	const [assignmentResponseOriginal, setAssignmentResponseOriginal] =
		useState<Avo.Assignment.Response_v2>(assignmentResponse);

	const {
		control,
		formState: { isDirty },
		handleSubmit,
		reset,
		setValue,
		trigger,
	} = useForm<AssignmentResponseFormState>({
		defaultValues: assignmentResponseOriginal || {
			collection_title: '',
			pupil_collection_blocks: [] as PupilCollectionFragment[],
		},
		resolver: yupResolver(PUPIL_COLLECTION_FORM_SCHEMA(t)),
		mode: 'onChange',
	});

	// UI
	useWarningBeforeUnload({
		when: isDirty,
	});

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
	const [tabs, activeTab, setTab, onTabClick, animatePill] = useAssignmentPupilTabs(
		assignment,
		assignmentResponse?.pupil_collection_blocks?.filter(
			(b) => b.type === CollectionBlockType.ITEM && isItemWithMeta(b)
		)?.length || 0,
		(filterState.tab as ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS) ||
			ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.ASSIGNMENT,
		(newTab: string) => {
			setFilterState({
				...(filterState as PupilSearchFilterState),
				tab: newTab as ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS,
			});
		}
	);

	const pastDeadline = useAssignmentPastDeadline(assignment);

	// HTTP

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

	// Events

	const resetForm = () => {
		reset({
			collection_title: assignmentResponseOriginal?.collection_title || '',
			pupil_collection_blocks: (assignmentResponseOriginal?.pupil_collection_blocks ||
				[]) as PupilCollectionFragment[],
		});
		setAssignmentResponse(assignmentResponseOriginal);
	};

	const handleFormErrors = (...args: any[]) => {
		if (isPreview) {
			ToastService.info(
				t(
					'assignment/views/assignment-response-edit/assignment-response-edit___je-kan-geen-antwoord-indienen-op-je-eigen-opdracht'
				)
			);
		}
		console.error(args);
	};

	const submit = async (formState: AssignmentResponseFormState) => {
		try {
			if (isPreview) {
				ToastService.info(
					t(
						'assignment/views/assignment-response-edit/assignment-response-edit___je-kan-geen-antwoord-indienen-op-je-eigen-opdracht'
					)
				);
				return;
			}
			if (!user?.profile?.id || !assignmentResponse || !assignmentResponseOriginal) {
				return;
			}

			const updated = await AssignmentService.updateAssignmentResponse(
				assignmentResponseOriginal,
				{
					collection_title: formState.collection_title,
					pupil_collection_blocks: cleanupTitleAndDescriptions(
						formState.pupil_collection_blocks
					),
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

				// Set new original
				setAssignmentResponseOriginal((prev) => {
					return {
						...prev,
						...updated,
					};
				});

				// Reset form state to new original + reset dirty state on form:
				resetForm();

				// Re-fetch
				await onAssignmentChanged();

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

	const appendBlockToPupilCollection = (newBlock: Avo.Core.BlockItemBase) => {
		const newBlocks = setPositionToIndex([
			...(assignmentResponse.pupil_collection_blocks || []),
			newBlock,
		]);
		setAssignmentResponse({
			...assignmentResponse,
			pupil_collection_blocks: newBlocks,
		});
		setValue('pupil_collection_blocks', newBlocks as PupilCollectionFragment[], {
			shouldDirty: true,
			shouldTouch: true,
		});
		animatePill();
	};

	// Render

	const renderBackButton = useMemo(
		() => (
			<Link className="c-return" to={backToOverview}>
				<Icon name="chevron-left" size="small" type="arrows" />
				{t('assignment/views/assignment-edit___mijn-opdrachten')}
			</Link>
		),
		[t, backToOverview]
	);

	const renderedTitle = useMemo(
		() => (
			<Flex center className={classnames({ 'u-spacer-top-l': showBackButton })}>
				<Icon name="clipboard" size="large" />

				<BlockHeading className="u-spacer-left" type="h2">
					{assignment?.title}
				</BlockHeading>
			</Flex>
		),
		[assignment, showBackButton]
	);

	const renderTabs = () => <Tabs tabs={tabs} onClick={onTabClick} />;

	const renderTabContent = () => {
		switch (activeTab) {
			case ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.SEARCH:
				return (
					<AssignmentResponseSearchTab
						assignment={assignment}
						assignmentResponse={assignmentResponse}
						filterState={filterState}
						setFilterState={(
							newFilterState: FilterState,
							urlPushType?: UrlUpdateType
						) => {
							setFilterState(
								{
									...newFilterState,
									tab: activeTab,
								},
								urlPushType
							);
						}}
						appendBlockToPupilCollection={appendBlockToPupilCollection}
					/>
				);

			case ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.MY_COLLECTION:
				if (!assignmentResponse) {
					return (
						<Spacer margin="top-extra-large">
							<Flex orientation="horizontal" center>
								<Spinner size="large" />
							</Flex>
						</Spacer>
					);
				}
				return (
					<AssignmentResponsePupilCollectionTab
						pastDeadline={pastDeadline}
						assignmentResponse={assignmentResponse}
						setAssignmentResponse={
							setAssignmentResponse as Dispatch<
								SetStateAction<Avo.Assignment.Response_v2>
							>
						}
						setValue={setValue}
						control={control}
						onShowPreviewClicked={onShowPreviewClicked}
						setTab={setTab}
						setFilterState={(newState: PupilSearchFilterState) =>
							setFilterState(newState)
						}
					/>
				);

			case ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.ASSIGNMENT:
			default:
				return (
					<AssignmentResponseAssignmentTab
						blocks={assignment?.blocks || []}
						pastDeadline={pastDeadline}
						setTab={setTab}
						buildSearchLink={buildAssignmentSearchLink(setFilterState)}
					/>
				);
		}
	};

	const renderAssignmentResponseEditView = () => {
		const deadline = formatTimestamp(assignment?.deadline_at, false);
		return (
			<div className="c-assignment-response-page c-assignment-response-page--edit c-sticky-save-bar__wrapper">
				<div>
					<AssignmentHeading
						back={showBackButton ? renderBackButton : undefined}
						title={renderedTitle}
						tabs={renderTabs()}
						info={
							assignment ? (
								<>
									<AssignmentMetadata
										assignment={assignment}
										assignmentResponse={assignmentResponse}
										who={'teacher'}
									/>
									{!!assignment.answer_url && (
										<Box backgroundColor="soft-white" condensed>
											<p>
												{t(
													'assignment/views/assignment-detail___geef-je-antwoorden-in-op'
												)}
												<a href={assignment.answer_url}>
													{assignment.answer_url}
												</a>
											</p>
										</Box>
									)}
								</>
							) : null
						}
						tour={<InteractiveTour showButton />}
					/>
					<Container mode="horizontal">
						{pastDeadline && (
							<Spacer margin={['top-large']}>
								<Alert type="info">
									{t(
										'assignment/views/assignment-response-edit___deze-opdracht-is-afgelopen-de-deadline-was-deadline',
										{
											deadline,
										}
									)}
								</Alert>
							</Spacer>
						)}
					</Container>

					{renderTabContent()}

					<Spacer margin={['bottom-large']} />

					<BeforeUnloadPrompt when={isDirty} />
				</div>

				{/* Must always be the second and last element inside the c-sticky-save-bar__wrapper */}
				<StickySaveBar
					isVisible={isDirty}
					onCancel={() => resetForm()}
					onSave={handleSubmit(submit, handleFormErrors)}
				/>
			</div>
		);
	};

	return renderAssignmentResponseEditView();
};

export default withUser(AssignmentResponseEdit) as FunctionComponent<AssignmentResponseEditProps>;
