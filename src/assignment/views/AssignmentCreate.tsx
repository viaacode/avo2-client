import './AssignmentCreate.scss';
import './AssignmentPage.scss';

import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Container, Icon, IconName, Spacer } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, {
	type Dispatch,
	type FunctionComponent,
	type SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { type DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import {
	ListSorterColor,
	ListSorterPosition,
	ListSorterSlice,
	LoadingErrorLoadedComponent,
	type LoadingInfo,
	SelectEducationLevelModal,
} from '../../shared/components';
import { BeforeUnloadPrompt } from '../../shared/components/BeforeUnloadPrompt/BeforeUnloadPrompt';
import EmptyStateMessage from '../../shared/components/EmptyStateMessage/EmptyStateMessage';
import { StickySaveBar } from '../../shared/components/StickySaveBar/StickySaveBar';
import { navigate } from '../../shared/helpers';
import withUser from '../../shared/hocs/withUser';
import { useDraggableListModal } from '../../shared/hooks/use-draggable-list-modal';
import useTranslation from '../../shared/hooks/useTranslation';
import { useWarningBeforeUnload } from '../../shared/hooks/useWarningBeforeUnload';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { ASSIGNMENT_CREATE_UPDATE_TABS, ASSIGNMENT_FORM_SCHEMA } from '../assignment.const';
import { setBlockPositionToIndex } from '../assignment.helper';
import { AssignmentService } from '../assignment.service';
import AssignmentActions from '../components/AssignmentActions';
import AssignmentAdminFormEditable from '../components/AssignmentAdminFormEditable';
import AssignmentDetailsFormEditable from '../components/AssignmentDetailsFormEditable';
import AssignmentHeading from '../components/AssignmentHeading';
import AssignmentMetaDataFormEditable from '../components/AssignmentMetaDataFormEditable';
import AssignmentPupilPreview from '../components/AssignmentPupilPreview';
import AssignmentTeacherTabs from '../components/AssignmentTeacherTabs';
import AssignmentTitle from '../components/AssignmentTitle';
import { buildGlobalSearchLink } from '../helpers/build-search-link';
import { cleanupTitleAndDescriptions } from '../helpers/cleanup-title-and-descriptions';
import { backToOverview } from '../helpers/links';
import {
	useAssignmentBlockChangeHandler,
	useAssignmentForm,
	useBlockListModals,
	useBlocksList,
	useEditBlocks,
} from '../hooks';
import { type AssignmentFields } from '../hooks/assignment-form';
import { useEducationLevelModal } from '../hooks/use-education-level-modal';

const AssignmentCreate: FunctionComponent<DefaultSecureRouteProps> = ({
	commonUser,
	history,
	location,
	user,
}) => {
	const { tText, tHtml } = useTranslation();

	// Data

	const [tab, setTab] = useState<ASSIGNMENT_CREATE_UPDATE_TABS>(
		ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT
	);
	const [assignment, setAssignment, defaultValues] = useAssignmentForm();

	const form = useForm<Avo.Assignment.Assignment>({
		defaultValues,
		resolver: yupResolver(ASSIGNMENT_FORM_SCHEMA(tText)),
	});

	const {
		control,
		handleSubmit,
		reset: resetForm,
		setValue,
		trigger,
		formState: { isDirty },
		watch,
	} = form;

	const [isSelectEducationLevelModalOpen, setSelectEducationLevelModalOpen] =
		useEducationLevelModal(commonUser, assignment);

	// Events

	const updateBlocksInAssignmentState = (newBlocks: Avo.Core.BlockItemBase[]) => {
		setAssignment((prev) => ({ ...prev, blocks: newBlocks as Avo.Assignment.Block[] }));
		(setValue as any)('blocks', newBlocks as Avo.Assignment.Block[], { shouldDirty: true });
	};

	const setBlock = useAssignmentBlockChangeHandler(
		assignment?.blocks || [],
		updateBlocksInAssignmentState
	);

	const submit = async () => {
		try {
			if (!user.profile?.id) {
				ToastService.danger(
					tText(
						'assignment/views/assignment-create___je-moet-ingelogd-zijn-om-een-opdracht-te-kunnen-aanmaken'
					)
				);
				return;
			}
			const created = await AssignmentService.insertAssignment(
				{
					...assignment,
					blocks: cleanupTitleAndDescriptions(
						assignment?.blocks || []
					) as Avo.Assignment.Block[],
					owner_profile_id: user.profile?.id,
				} as Partial<Avo.Assignment.Assignment>,
				user.profile?.id
			);

			if (created) {
				trackEvents(
					{
						object: String(created.id),
						object_type: 'assignment',
						action: 'create',
						resource: {
							education_level: created.education_level_id,
						},
					},
					user
				);

				ToastService.success(
					tHtml(
						'assignment/views/assignment-create___de-opdracht-is-succesvol-aangemaakt-je-vindt-deze-in-je-werkruimte'
					)
				);

				resetForm();

				// Delay navigation, until isDirty state becomes false, otherwise the "unsaved changes" modal will popup
				setTimeout(() => {
					navigate(history, APP_PATH.ASSIGNMENT_DETAIL.route, { id: created.id });
				}, 100);
			}
		} catch (err) {
			console.error(err);
			ToastService.danger(
				tHtml(
					'assignment/views/assignment-create___het-opslaan-van-de-opdracht-is-mislukt-contacteer-ons-via-de-feedback-knop-mocht-dit-probleem-zich-blijven-voordoen'
				)
			);
		}
	};

	const reset = useCallback(() => {
		setAssignment(defaultValues);
		resetForm();
	}, [resetForm, setAssignment, defaultValues]);

	const selectEducationLevel = useCallback(
		(lom: Avo.Lom.LomField) => {
			if (!assignment) return;
			setSelectEducationLevelModalOpen(false);
			setValue('education_level_id', lom.id);
		},
		[assignment as any, setSelectEducationLevelModalOpen, setValue]
	);

	// UI

	useWarningBeforeUnload({ when: isDirty });
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [isViewAsPupilEnabled, setIsViewAsPupilEnabled] = useState<boolean>();

	// Render

	const renderBlockContent = useEditBlocks(setBlock, buildGlobalSearchLink);

	const [renderedModals, confirmSliceModal, addBlockModal] = useBlockListModals(
		assignment?.blocks || [],
		updateBlocksInAssignmentState,
		false,
		{
			confirmSliceConfig: {
				responses: [],
			},
			addCollectionConfig: {
				addCollectionCallback: (id) => {
					// Track import collection into assignment event
					trackEvents(
						{
							object: '', // Create assignment => does not have an id yet, but this event is still valuable, since we know which the collection was used to build an assignment
							object_type: 'avo_assignment',
							action: 'add',
							resource: {
								id,
								type: 'collection',
								education_level: String(assignment?.education_level_id),
							},
						},
						user
					);
				},
			},
		}
	);

	const [draggableListButton, draggableListModal] = useDraggableListModal({
		modal: {
			items: assignment?.blocks || [],
			onClose: (reorderedBlocks?: Avo.Assignment.Block[]) => {
				if (reorderedBlocks) {
					const blocks = setBlockPositionToIndex(
						reorderedBlocks
					) as Avo.Assignment.Block[];

					setAssignment((prev) => ({
						...prev,
						blocks,
					}));

					(setValue as any)('blocks', blocks, { shouldDirty: true });
				}
			},
		},
	});

	const [renderedListSorter] = useBlocksList(
		assignment?.blocks || [],
		updateBlocksInAssignmentState,
		{
			listSorter: {
				content: (item) => item && renderBlockContent(item),
				divider: (position: number) => (
					<Button
						icon={IconName.plus}
						type="secondary"
						onClick={() => {
							addBlockModal.setEntity(position);
							addBlockModal.setOpen(true);
						}}
					/>
				),
				// Only assignments get to pick colors
				actions: (item, index) =>
					item && (
						<>
							<ListSorterColor item={item} />
							<ListSorterPosition item={item} i={index} />
							<ListSorterSlice item={item} />
						</>
					),
			},
			listSorterItem: {
				onSlice: (item) => {
					confirmSliceModal.setEntity(item);
					confirmSliceModal.setOpen(true);
				},
				onBackgroundChange: (item, color) => {
					if (!assignment) return;

					setAssignment({
						...assignment,
						blocks: (assignment.blocks || []).map((block) => {
							if (block.id === item.id) {
								return { ...block, color };
							}

							return block;
						}),
					});
				},
			},
		}
	);

	const renderBackButton = useMemo(
		() => (
			<Link className="c-return" to={backToOverview()}>
				<Icon name={IconName.chevronLeft} size="small" type="arrows" />
				{tText('assignment/views/assignment-edit___mijn-opdrachten')}
			</Link>
		),
		[tText]
	);

	const renderTitle = useMemo(
		() => <AssignmentTitle control={control} setAssignment={setAssignment as any} />,
		[control, setAssignment]
	);

	const renderTabContent = useMemo(() => {
		switch (tab) {
			case ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT: // TODO remove warning
				return (
					<div className="c-assignment-contents-tab">
						{(assignment?.blocks?.length || 0) > 0 && (
							<Spacer
								margin={['bottom-large']}
								className="c-assignment-page__reorder-container"
							>
								{draggableListButton}
							</Spacer>
						)}

						{renderedListSorter}

						<EmptyStateMessage
							title={tText(
								'assignment/views/assignment-create___hulp-nodig-bij-het-maken-van-opdrachten-titel'
							)}
							message={
								<>
									<strong>
										{tHtml(
											'assignment/views/assignment-create___hulp-nodig-bij-het-maken-van-opdrachten-beschrijving'
										)}
									</strong>
								</>
							}
						/>
					</div>
				);

			case ASSIGNMENT_CREATE_UPDATE_TABS.DETAILS:
				return (
					<div className="c-assignment-details-tab">
						<AssignmentDetailsFormEditable
							assignment={assignment as AssignmentFields}
							setAssignment={setAssignment as any}
							setValue={setValue as any}
						/>
					</div>
				);

			case ASSIGNMENT_CREATE_UPDATE_TABS.PUBLISH:
				return (
					<div className="c-assignment-details-tab">
						<AssignmentMetaDataFormEditable
							assignment={assignment as Avo.Assignment.Assignment}
							setAssignment={
								setAssignment as Dispatch<SetStateAction<Avo.Assignment.Assignment>>
							}
							setValue={setValue as any}
						/>
					</div>
				);

			case ASSIGNMENT_CREATE_UPDATE_TABS.ADMIN:
				return (
					<AssignmentAdminFormEditable
						assignment={assignment as Avo.Assignment.Assignment}
						setAssignment={
							setAssignment as Dispatch<SetStateAction<Avo.Assignment.Assignment>>
						}
						setValue={setValue as any}
					/>
				);

			default:
				return tab;
		}
	}, [tab, renderedListSorter]);

	// Effects

	// Synchronise the React state that triggers renders with the useForm hook
	useEffect(() => {
		Object.keys((assignment || {}) as any).forEach((key) => {
			const cast = key as keyof AssignmentFields;
			(setValue as any)(cast, assignment?.[cast]);
		});

		trigger();
	}, [assignment as any, setValue, trigger]);

	// Set the loading state when the form is ready
	useEffect(() => {
		if (loadingInfo.state !== 'loaded' && assignment) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [assignment, loadingInfo, setLoadingInfo]);

	// Render
	const renderEditAssignmentPage = () => (
		<>
			<div className="c-assignment-page c-assignment-page--create c-sticky-bar__wrapper">
				<div>
					<AssignmentHeading
						back={renderBackButton}
						title={renderTitle}
						actions={
							<AssignmentActions
								duplicate={{ disabled: true }}
								preview={{ onClick: () => setIsViewAsPupilEnabled(true) }}
								remove={{ button: { disabled: true } }}
								route={location.pathname}
								assignment={assignment}
							/>
						}
						tabs={
							<AssignmentTeacherTabs
								activeTab={tab}
								onTabChange={setTab}
								clicksCount={0}
							/>
						}
						// Disable tour before education level is chosen
						{...(isSelectEducationLevelModalOpen ? { tour: null } : {})}
					/>

					<Container mode="horizontal">
						<Spacer margin={['top-large', 'bottom-extra-large']}>
							{renderTabContent}
						</Spacer>

						{renderedModals}
						{draggableListModal}
					</Container>
				</div>

				{/* Always show on create */}
				{/* Must always be the second and last element inside the c-sticky-bar__wrapper */}
				<StickySaveBar
					isVisible={true}
					onSave={handleSubmit(submit, (...args) => console.error(args))}
					onCancel={() => reset()}
				/>
			</div>

			{!!user && (
				<SelectEducationLevelModal
					isOpen={isSelectEducationLevelModalOpen}
					onConfirm={selectEducationLevel}
				/>
			)}
		</>
	);

	const renderPageContent = () => {
		if (isViewAsPupilEnabled && assignment) {
			return (
				<AssignmentPupilPreview
					assignment={assignment}
					onClose={() => setIsViewAsPupilEnabled(false)}
				/>
			);
		}
		return renderEditAssignmentPage();
	};

	return (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						tText('assignment/views/assignment-create___maak-opdracht-pagina-titel')
					)}
				</title>

				<meta
					name="description"
					content={tText(
						'assignment/views/assignment-create___maak-opdracht-pagina-beschrijving'
					)}
				/>
			</Helmet>

			<LoadingErrorLoadedComponent
				dataObject={assignment}
				render={renderPageContent}
				loadingInfo={loadingInfo}
				notFoundError={tText(
					'assignment/views/assignment-edit___de-opdracht-is-niet-gevonden'
				)}
			/>

			<BeforeUnloadPrompt when={isDirty} />
		</>
	);
};

export default withUser(AssignmentCreate) as FunctionComponent<DefaultSecureRouteProps>;
