import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Container, Icon, IconName, Spacer, Tabs } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
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
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../shared/components';
import { BeforeUnloadPrompt } from '../../shared/components/BeforeUnloadPrompt/BeforeUnloadPrompt';
import EmptyStateMessage from '../../shared/components/EmptyStateMessage/EmptyStateMessage';
import { StickySaveBar } from '../../shared/components/StickySaveBar/StickySaveBar';
import { navigate } from '../../shared/helpers';
import { useDraggableListModal } from '../../shared/hooks/use-draggable-list-modal';
import useTranslation from '../../shared/hooks/useTranslation';
import { useWarningBeforeUnload } from '../../shared/hooks/useWarningBeforeUnload';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { ASSIGNMENT_CREATE_UPDATE_TABS, ASSIGNMENT_FORM_SCHEMA } from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import AssignmentActions from '../components/AssignmentActions';
import AssignmentAdminFormEditable from '../components/AssignmentAdminFormEditable';
import AssignmentDetailsFormEditable from '../components/AssignmentDetailsFormEditable';
import AssignmentHeading from '../components/AssignmentHeading';
import AssignmentMetaDataFormEditable from '../components/AssignmentMetaDataFormEditable';
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
import { AssignmentFields } from '../hooks/assignment-form';

import './AssignmentCreate.scss';
import './AssignmentPage.scss';

const AssignmentCreate: FunctionComponent<DefaultSecureRouteProps> = ({
	user,
	history,
	location,
}) => {
	const { tText, tHtml } = useTranslation();
	// Data
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
	} = form;

	const updateBlocksInAssignmentState = (newBlocks: Avo.Core.BlockItemBase[]) => {
		setAssignment((prev) => ({ ...prev, blocks: newBlocks as Avo.Assignment.Block[] }));
		(setValue as any)('blocks', newBlocks as Avo.Assignment.Block[], { shouldDirty: true });
	};
	const setBlock = useAssignmentBlockChangeHandler(
		assignment?.blocks || [],
		updateBlocksInAssignmentState
	);

	// Events

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

	// UI
	useWarningBeforeUnload({
		when: isDirty,
	});
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tabs, tab, , onTabClick] = useAssignmentTeacherTabs(history, user);
	const [isViewAsPupilEnabled, setIsViewAsPupilEnabled] = useState<boolean>();

	// Render

	const renderBlockContent = useEditBlocks(setBlock, buildGlobalSearchLink);

	const [renderedModals, confirmSliceModal, addBlockModal] = useBlockListModals(
		assignment?.blocks || [],
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
			items: assignment?.blocks || [],
			onClose: (update?: Avo.Assignment.Block[]) => {
				if (update) {
					const blocks = update.map((item, i) => ({
						...item,
						position: assignment?.blocks?.[i]?.position || 0,
					}));

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
			},
			listSorterItem: {
				onSlice: (item) => {
					confirmSliceModal.setEntity(item);
					confirmSliceModal.setOpen(true);
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
		[tText, backToOverview]
	);

	const renderTitle = useMemo(
		() => <AssignmentTitle control={control} setAssignment={setAssignment as any} />,
		[tText, control, setAssignment]
	);

	const renderTabs = useMemo(() => <Tabs tabs={tabs} onClick={onTabClick} />, [tabs, onTabClick]);

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
		Object.keys(assignment || {}).forEach((key) => {
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
			{/* Must always be the second and last element inside the c-sticky-bar__wrapper */}
			<StickySaveBar
				isVisible={true}
				onSave={handleSubmit(submit, (...args) => console.error(args))}
				onCancel={() => reset()}
			/>
		</div>
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
			<MetaTags>
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
			</MetaTags>

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

export default AssignmentCreate;
