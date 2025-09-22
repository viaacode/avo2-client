import { yupResolver } from '@hookform/resolvers/yup';
import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import {
	Alert,
	Box,
	Container,
	Flex,
	Icon,
	IconName,
	Spacer,
	Spinner,
	Tabs,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import { useAtomValue } from 'jotai';
import React, {
	type Dispatch,
	type FC,
	type SetStateAction,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
	JsonParam,
	NumberParam,
	StringParam,
	type UrlUpdateType,
	useQueryParams,
} from 'use-query-params';

import { commonUserAtom } from '../../../authentication/authentication.store';
import { CollectionBlockType } from '../../../collection/collection.const';
import { type FilterState } from '../../../search/search.types';
import { BeforeUnloadPrompt } from '../../../shared/components/BeforeUnloadPrompt/BeforeUnloadPrompt';
import { InteractiveTour } from '../../../shared/components/InteractiveTour/InteractiveTour';
import { StickySaveBar } from '../../../shared/components/StickySaveBar/StickySaveBar';
import { formatTimestamp } from '../../../shared/helpers/formatters';
import { useAssignmentPastDeadline } from '../../../shared/hooks/useAssignmentPastDeadline';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { useWarningBeforeUnload } from '../../../shared/hooks/useWarningBeforeUnload';
import { ToastService } from '../../../shared/services/toast-service';
import {
	ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS,
	PUPIL_COLLECTION_FORM_SCHEMA,
} from '../../assignment.const';
import { reorderBlockPositions } from '../../assignment.helper';
import { AssignmentService } from '../../assignment.service';
import {
	type AssignmentResponseFormState,
	AssignmentType,
	type PupilCollectionFragment,
	type PupilSearchFilterState,
} from '../../assignment.types';
import { AssignmentHeading } from '../../components/AssignmentHeading';
import { AssignmentMetadata } from '../../components/AssignmentMetadata';
import { buildAssignmentSearchLink } from '../../helpers/build-search-link';
import { cleanupTitleAndDescriptions } from '../../helpers/cleanup-title-and-descriptions';
import { backToOverview } from '../../helpers/links';
import { useAssignmentPupilTabs } from '../../hooks/assignment-pupil-tabs';

import { AssignmentResponseAssignmentTab } from './tabs/AssignmentResponseAssignmentTab';
import { AssignmentResponsePupilCollectionTab } from './tabs/AssignmentResponsePupilCollectionTab';
import { AssignmentResponseSearchTab } from './tabs/AssignmentResponseSearchTab';

import '../AssignmentPage.scss';
import './AssignmentResponseEdit.scss';

interface AssignmentResponseEditProps {
	assignment: Avo.Assignment.Assignment;
	assignmentResponse: Omit<Avo.Assignment.Response, 'assignment'> | null;
	setAssignmentResponse: (
		newResponse: Omit<Avo.Assignment.Response, 'assignment'> | null
	) => void;
	showBackButton: boolean;
	isPreview?: boolean;
	onAssignmentChanged: () => Promise<void>;
	onShowPreviewClicked: () => void;
}

export const AssignmentResponseEdit: FC<AssignmentResponseEditProps> = ({
	assignment,
	assignmentResponse,
	onAssignmentChanged,
	setAssignmentResponse,
	showBackButton,
	isPreview = false,
	onShowPreviewClicked,
}) => {
	const { tText, tHtml } = useTranslation();
	const [isSaving, setIsSaving] = useState(false);
	const commonUser = useAtomValue(commonUserAtom);

	// Data
	const [assignmentResponseOriginal, setAssignmentResponseOriginal] = useState<Omit<
		Avo.Assignment.Response,
		'assignment'
	> | null>(assignmentResponse);

	const {
		control,
		formState: { isDirty },
		handleSubmit,
		reset,
		setValue,
		trigger,
	} = useForm<AssignmentResponseFormState>({
		defaultValues: {
			collection_title: assignmentResponseOriginal?.collection_title ?? '',
			pupil_collection_blocks: (assignmentResponseOriginal?.pupil_collection_blocks ||
				[]) as Omit<PupilCollectionFragment, 'item_meta'>[],
		},
		resolver: yupResolver(PUPIL_COLLECTION_FORM_SCHEMA(tText)),
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
		(FilterState: PupilSearchFilterState, updateType?: UrlUpdateType) => void,
	];
	const [tabs, activeTab, setTab, onTabClick, animatePill] = useAssignmentPupilTabs(
		assignment,
		assignmentResponse?.pupil_collection_blocks?.filter(
			(b) => b.type === CollectionBlockType.ITEM
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
				tHtml(
					'assignment/views/assignment-response-edit/assignment-response-edit___je-kan-geen-antwoord-indienen-op-je-eigen-opdracht'
				)
			);
		}
		console.error(args);
	};

	const submit = async (formState: AssignmentResponseFormState) => {
		try {
			setIsSaving(true);
			if (isPreview) {
				ToastService.info(
					tHtml(
						'assignment/views/assignment-response-edit/assignment-response-edit___je-kan-geen-antwoord-indienen-op-je-eigen-opdracht'
					)
				);
				setIsSaving(false);
				return;
			}
			if (!commonUser?.profileId || !assignmentResponse || !assignmentResponseOriginal) {
				setIsSaving(false);
				return;
			}

			const updated = await AssignmentService.updateAssignmentResponse(
				assignmentResponseOriginal as Omit<Avo.Assignment.Response, 'assignment'>,
				{
					collection_title: formState.collection_title || '',
					pupil_collection_blocks: cleanupTitleAndDescriptions(
						formState.pupil_collection_blocks
					) as PupilCollectionFragment[],
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
					tHtml(
						'assignment/views/assignment-response-edit/assignment-response-edit___de-collectie-is-opgeslagen'
					)
				);
				setIsSaving(false);
			}
		} catch (err) {
			setIsSaving(false);
			console.error(err);
			ToastService.danger(
				tHtml(
					'assignment/views/assignment-response-edit/assignment-response-edit___het-opslaan-van-de-collectie-is-mislukt'
				)
			);
		}
	};

	const appendBlockToPupilCollection = (newBlock: Avo.Core.BlockItemBase) => {
		const newBlocks = reorderBlockPositions([
			...(assignmentResponse?.pupil_collection_blocks || []),
			newBlock,
		]);
		setAssignmentResponse({
			...assignmentResponse,
			pupil_collection_blocks: newBlocks as PupilCollectionFragment[],
		} as Omit<Avo.Assignment.Response, 'assignment'>);
		setValue('pupil_collection_blocks', newBlocks as PupilCollectionFragment[], {
			shouldDirty: true,
			shouldTouch: true,
		});
		animatePill();
	};

	// Render

	const renderBackButton = useMemo(
		() => (
			<Link className="c-return" to={backToOverview()}>
				<Icon name={IconName.chevronLeft} size="small" type="arrows" />
				{tText('assignment/views/assignment-edit___mijn-opdrachten')}
			</Link>
		),
		[tText]
	);

	const renderedTitle = useMemo(
		() => (
			<Flex className={clsx({ 'u-spacer-top-l': showBackButton })}>
				<Icon name={IconName.clipboard} size="large" />

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
				if (
					!assignment.lom_learning_resource_type?.includes(AssignmentType.ZOEK) &&
					!assignment.lom_learning_resource_type?.includes(AssignmentType.BOUW)
				) {
					setTab(ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.ASSIGNMENT);
					return null;
				}
				return (
					<AssignmentResponseSearchTab
						assignment={assignment}
						assignmentResponse={assignmentResponse as Avo.Assignment.Response}
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
				if (!assignment.lom_learning_resource_type?.includes(AssignmentType.BOUW)) {
					setTab(ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.ASSIGNMENT);
					return null;
				}
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
						assignmentResponse={assignmentResponse as Avo.Assignment.Response}
						setAssignmentResponse={
							setAssignmentResponse as Dispatch<
								SetStateAction<Avo.Assignment.Response>
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
				return (
					<AssignmentResponseAssignmentTab
						blocks={(assignment as unknown as Avo.Assignment.Assignment)?.blocks || []} // TODO figure out if blocks are available on this assignment, typings suggest they are not
						pastDeadline={pastDeadline}
						setTab={setTab}
						buildSearchLink={buildAssignmentSearchLink(setFilterState)}
					/>
				);

			default:
				setTab(ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.ASSIGNMENT);
				return null;
		}
	};

	const renderAssignmentResponseEditView = () => {
		const deadline = formatTimestamp(assignment?.deadline_at, false);
		return (
			<div className="c-assignment-response-page c-assignment-response-page--edit c-sticky-bar__wrapper">
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
												{tText(
													'assignment/views/assignment-detail___geef-je-antwoorden-in-op'
												)}{' '}
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
									{tText(
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

				{/* Must always be the second and last element inside the c-sticky-bar__wrapper */}
				<StickySaveBar
					isVisible={isDirty}
					onCancel={() => resetForm()}
					onSave={handleSubmit(submit, handleFormErrors)}
					isSaving={isSaving}
				/>
			</div>
		);
	};

	return renderAssignmentResponseEditView();
};
