import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Container, Icon, Spacer, Tabs } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
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
import { Link } from 'react-router-dom';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../shared/components';
import { BeforeUnloadPrompt } from '../../shared/components/BeforeUnloadPrompt/BeforeUnloadPrompt';
import EmptyStateMessage from '../../shared/components/EmptyStateMessage/EmptyStateMessage';
import Html from '../../shared/components/Html/Html';
import { StickySaveBar } from '../../shared/components/StickySaveBar/StickySaveBar';
import { navigate } from '../../shared/helpers';
import { useDraggableListModal } from '../../shared/hooks/use-draggable-list-modal';
import { useWarningBeforeUnload } from '../../shared/hooks/useWarningBeforeUnload';
import { ToastService } from '../../shared/services';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ASSIGNMENT_CREATE_UPDATE_TABS, ASSIGNMENT_FORM_SCHEMA } from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import { AssignmentFormState } from '../assignment.types';
import AssignmentActions from '../components/AssignmentActions';
import AssignmentDetailsFormEditable from '../components/AssignmentDetailsFormEditable';
import AssignmentHeading from '../components/AssignmentHeading';
import AssignmentPupilPreview from '../components/AssignmentPupilPreview';
import AssignmentTitle from '../components/AssignmentTitle';
import { buildGlobalSearchLink } from '../helpers/build-search-link';
import { cleanupTitleAndDescriptions } from '../helpers/cleanup-title-and-descriptions';
import { backToOverview } from '../helpers/links';
import {
	useAssignmentBlockChangeHandler,
	useAssignmentForm,
	useAssignmentTeacherTabs,
	useBlockListModals,
	useBlocksList,
	useEditBlocks,
} from '../hooks';

import './AssignmentCreate.scss';
import './AssignmentPage.scss';

const AssignmentCreate: FunctionComponent<DefaultSecureRouteProps> = ({ user, history }) => {
	const [t] = useTranslation();

	// Data
	const [assignment, setAssignment, defaultValues] = useAssignmentForm();

	const form = useForm<AssignmentFormState>({
		defaultValues,
		resolver: yupResolver(ASSIGNMENT_FORM_SCHEMA(t)),
	});
	const {
		control,
		handleSubmit,
		reset: resetForm,
		setValue,
		trigger,
		formState: { isDirty },
	} = form;

	const updateBlocksInAssignmentState = (newBlocks: BaseBlockWithMeta[]) => {
		setAssignment((prev) => ({ ...prev, blocks: newBlocks as AssignmentBlock[] }));
		setValue('blocks', newBlocks as AssignmentBlock[], { shouldDirty: true });
	};
	const setBlock = useAssignmentBlockChangeHandler(
		assignment.blocks,
		updateBlocksInAssignmentState
	);

	// Events

	const submit = async () => {
		try {
			const created = await AssignmentService.insertAssignment(
				{
					...assignment,
					blocks: cleanupTitleAndDescriptions(assignment.blocks) as AssignmentBlock[],
					owner_profile_id: user.profile?.id,
					labels: [],
				},
				assignment.labels
			);

			if (created) {
				trackEvents(
					{
						object: String(created.id),
						object_type: 'assignment',
						action: 'create',
					},
					user
				);

				ToastService.success(
					t(
						'assignment/views/assignment-create___de-opdracht-is-succesvol-aangemaakt-je-vindt-deze-in-je-werkruimte'
					)
				);

				resetForm();

				// Delay navigation, until isDirty state becomes false, otherwise the "unsaved changes" modal will popup
				setTimeout(() => {
					navigate(history, APP_PATH.ASSIGNMENT_EDIT.route, { id: created.id });
				}, 100);
			}
		} catch (err) {
			console.error(err);
			ToastService.danger(
				t(
					'assignment/views/assignment-create___het-opslaan-van-de-opdracht-is-mislukt-contacteer-ons-via-de-feedback-knop-mocht-dit-probleem-zich-blijven-voordoen'
				)
			);
		}
	};

	const reset = useCallback(() => {
		setAssignment(defaultValues);
		resetForm();
	}, [resetForm, setAssignment, defaultValues]);

	// UI
	useWarningBeforeUnload({
		when: isDirty,
	});
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tabs, tab, , onTabClick] = useAssignmentTeacherTabs();
	const [isViewAsPupilEnabled, setIsViewAsPupilEnabled] = useState<boolean>();

	// Render

	const renderBlockContent = useEditBlocks(setBlock, buildGlobalSearchLink);

	const [renderedModals, confirmSliceModal, addBlockModal] = useBlockListModals(
		assignment.blocks,
		updateBlocksInAssignmentState,
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
			items: assignment.blocks,
			onClose: (update?: AssignmentBlock[]) => {
				if (update) {
					const blocks = update.map((item, i) => ({
						...item,
						position: assignment.blocks[i].position,
					}));

					setAssignment((prev) => ({
						...prev,
						blocks,
					}));

					setValue('blocks', blocks, { shouldDirty: true });
				}
			},
		},
	});

	const [renderedListSorter] = useBlocksList(assignment?.blocks, updateBlocksInAssignmentState, {
		listSorter: {
			content: (item) => item && renderBlockContent(item),
			divider: (position: number) => (
				<Button
					icon="plus"
					type="secondary"
					onClick={() => {
						addBlockModal.setEntity(position);
						addBlockModal.setOpen(true);
					}}
				/>
			),
		},
		listSorterItem: {
			onSlice: (item) => {
				confirmSliceModal.setEntity(item);
				confirmSliceModal.setOpen(true);
			},
		},
	});

	const renderBackButton = useMemo(
		() => (
			<Link className="c-return" to={backToOverview()}>
				<Icon name="chevron-left" size="small" type="arrows" />
				{t('assignment/views/assignment-edit___mijn-opdrachten')}
			</Link>
		),
		[t, backToOverview]
	);

	const renderTitle = useMemo(
		() => <AssignmentTitle control={control} setAssignment={setAssignment} />,
		[t, control, setAssignment]
	);

	const renderTabs = useMemo(() => <Tabs tabs={tabs} onClick={onTabClick} />, [tabs, onTabClick]);

	const renderTabContent = useMemo(() => {
		switch (tab) {
			case ASSIGNMENT_CREATE_UPDATE_TABS.Inhoud: // TODO remove warning
				return (
					<div className="c-assignment-contents-tab">
						{assignment.blocks.length > 0 && (
							<Spacer
								margin={['bottom-large']}
								className="c-assignment-page__reorder-container"
							>
								{draggableListButton}
							</Spacer>
						)}

						{renderedListSorter}

						<EmptyStateMessage
							title={t(
								'assignment/views/assignment-create___hulp-nodig-bij-het-maken-van-opdrachten-titel'
							)}
							message={
								<>
									<strong>
										<Html
											content={t(
												'assignment/views/assignment-create___hulp-nodig-bij-het-maken-van-opdrachten-beschrijving'
											)}
										/>
									</strong>
								</>
							}
						/>
					</div>
				);

			case ASSIGNMENT_CREATE_UPDATE_TABS.Details:
				return (
					<div className="c-assignment-details-tab">
						<AssignmentDetailsFormEditable
							assignment={assignment as Assignment_v2}
							setAssignment={setAssignment as Dispatch<SetStateAction<Assignment_v2>>}
							setValue={setValue}
						/>
					</div>
				);

			default:
				return tab;
		}
	}, [tab, renderedListSorter]);

	// Effects

	// Synchronise the React state that triggers renders with the useForm hook
	useEffect(() => {
		Object.keys(assignment).forEach((key) => {
			const cast = key as keyof AssignmentFormState;
			setValue(cast, assignment[cast]);
		});

		trigger();
	}, [assignment, setValue, trigger]);

	// Set the loading state when the form is ready
	useEffect(() => {
		if (loadingInfo.state !== 'loaded' && assignment) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [assignment, loadingInfo, setLoadingInfo]);

	// Render

	const renderEditAssignmentPage = () => (
		<div className="c-assignment-page c-assignment-page--create c-sticky-save-bar__wrapper">
			<div>
				<AssignmentHeading
					back={renderBackButton}
					title={renderTitle}
					actions={
						<AssignmentActions
							duplicate={{ disabled: true }}
							preview={{ onClick: () => setIsViewAsPupilEnabled(true) }}
							remove={{ button: { disabled: true } }}
						/>
					}
					tabs={renderTabs}
				/>

				<Container mode="horizontal">
					<Spacer margin={['top-large', 'bottom-extra-large']}>{renderTabContent}</Spacer>

					{renderedModals}
					{draggableListModal}
				</Container>
			</div>

			{/* Always show on create */}
			{/* Must always be the second and last element inside the c-sticky-save-bar__wrapper */}
			<StickySaveBar
				isVisible={true}
				onSave={handleSubmit(submit, (...args) => console.error(args))}
				onCancel={() => reset()}
			/>
		</div>
	);

	const renderPageContent = () => {
		if (isViewAsPupilEnabled) {
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
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						t('assignment/views/assignment-create___maak-opdracht-pagina-titel')
					)}
				</title>

				<meta
					name="description"
					content={t(
						'assignment/views/assignment-create___maak-opdracht-pagina-beschrijving'
					)}
				/>
			</MetaTags>

			<LoadingErrorLoadedComponent
				dataObject={assignment}
				render={renderPageContent}
				loadingInfo={loadingInfo}
				notFoundError={t('assignment/views/assignment-edit___de-opdracht-is-niet-gevonden')}
			/>

			<BeforeUnloadPrompt when={isDirty} />
		</>
	);
};

export default AssignmentCreate;
