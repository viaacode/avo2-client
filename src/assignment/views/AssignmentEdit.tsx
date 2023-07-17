import { yupResolver } from '@hookform/resolvers/yup';
import {
	Alert,
	Button,
	Container,
	Flex,
	Icon,
	IconName,
	Spacer,
	Spinner,
	Tabs,
} from '@viaa/avo2-components';
import { Avo, PermissionName } from '@viaa/avo2-types';
import { isPast } from 'date-fns';
import { noop } from 'lodash-es';
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
import { PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { BlockList } from '../../collection/components';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorNoAccess } from '../../error/components';
import { ErrorView } from '../../error/views';
import { ErrorViewQueryParams } from '../../error/views/ErrorView';
import { BeforeUnloadPrompt } from '../../shared/components/BeforeUnloadPrompt/BeforeUnloadPrompt';
import { StickySaveBar } from '../../shared/components/StickySaveBar/StickySaveBar';
import { Lookup_Enum_Right_Types_Enum } from '../../shared/generated/graphql-db-types';
import { getContributorType } from '../../shared/helpers/contributors';
import { useDraggableListModal } from '../../shared/hooks/use-draggable-list-modal';
import useTranslation from '../../shared/hooks/useTranslation';
import { useWarningBeforeUnload } from '../../shared/hooks/useWarningBeforeUnload';
import { NO_RIGHTS_ERROR_MESSAGE } from '../../shared/services/data-service';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { ASSIGNMENT_CREATE_UPDATE_TABS, ASSIGNMENT_FORM_SCHEMA } from '../assignment.const';
import { isUserAssignmentContributor, isUserAssignmentOwner } from '../assignment.helper';
import { AssignmentService } from '../assignment.service';
import AssignmentActions from '../components/AssignmentActions';
import AssignmentAdminFormEditable from '../components/AssignmentAdminFormEditable';
import AssignmentConfirmSave from '../components/AssignmentConfirmSave';
import AssignmentDetailsFormEditable from '../components/AssignmentDetailsFormEditable';
import AssignmentDetailsFormReadonly from '../components/AssignmentDetailsFormReadonly';
import AssignmentHeading from '../components/AssignmentHeading';
import AssignmentMetaDataFormEditable from '../components/AssignmentMetaDataFormEditable';
import AssignmentPupilPreview from '../components/AssignmentPupilPreview';
import AssignmentTitle from '../components/AssignmentTitle';
import { buildGlobalSearchLink } from '../helpers/build-search-link';
import { isDeadlineBeforeAvailableAt } from '../helpers/is-deadline-before-available-at';
import { backToOverview, toAssignmentDetail } from '../helpers/links';
import {
	useAssignmentBlockChangeHandler,
	useAssignmentForm,
	useAssignmentTeacherTabs,
	useBlockListModals,
	useBlocksList,
	useEditBlocks,
} from '../hooks';
import { AssignmentFields } from '../hooks/assignment-form';
import { useAssignmentPastDeadline } from '../hooks/assignment-past-deadline';
import PublishAssignmentModal from '../modals/PublishAssignmentModal';

import AssignmentResponses from './AssignmentResponses';

import './AssignmentEdit.scss';
import './AssignmentPage.scss';
import { buildLink, CustomError } from '../../shared/helpers';
import { InActivityWarningModal } from '../../shared/components';

interface AssignmentEditProps extends DefaultSecureRouteProps<{ id: string; tabId: string }> {
	onUpdate: () => void | Promise<void>;
}

const AssignmentEdit: FunctionComponent<AssignmentEditProps> = ({
	onUpdate = noop,
	match,
	user,
	history,
	location,
}) => {
	const { tText, tHtml } = useTranslation();

	// Data
	const [original, setOriginal] = useState<Avo.Assignment.Assignment | null>(null);
	const [assignmentLoading, setAssigmentLoading] = useState(true);
	const [assignmentError, setAssignmentError] = useState<Partial<ErrorViewQueryParams> | null>(
		null
	);
	const [assignment, setAssignment] = useAssignmentForm(undefined);

	const [assignmentHasPupilBlocks, setAssignmentHasPupilBlocks] = useState<boolean>();
	const [assignmentHasResponses, setAssignmentHasResponses] = useState<boolean>();
	const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
	const [isForcedExit, setIsForcedExit] = useState<boolean>(false);

	// Computed
	const assignmentId = match.params.id;
	const isPublic = assignment?.is_public || false;
	const canEditAllAssignments = PermissionService.hasPerm(
		user,
		PermissionName.EDIT_ANY_ASSIGNMENTS
	);

	const {
		control,
		formState: { isDirty },
		handleSubmit,
		reset: resetForm,
		setValue,
		trigger,
	} = useForm<AssignmentFields>({
		defaultValues: useMemo(() => (original as AssignmentFields) || undefined, [original]),
		resolver: yupResolver(ASSIGNMENT_FORM_SCHEMA(tText)),
	});

	const updateBlocksInAssignmentState = (newBlocks: Avo.Core.BlockItemBase[]) => {
		setAssignment((prev) => ({ ...prev, blocks: newBlocks as Avo.Assignment.Block[] }));
		(setValue as any)('blocks', newBlocks as Avo.Assignment.Block[], { shouldDirty: true });
	};

	const setBlock = useAssignmentBlockChangeHandler(
		assignment?.blocks || [],
		updateBlocksInAssignmentState
	);

	const updateAssignmentEditorWithLoading = useCallback(async () => {
		setAssigmentLoading(true);
		await updateAssignmentEditor();
	}, [setAssigmentLoading]);

	useEffect(() => {
		updateAssignmentEditorWithLoading();
	}, [updateAssignmentEditorWithLoading]);

	useEffect(() => {
		const param = match.params.tabId;
		param && setTab(param as ASSIGNMENT_CREATE_UPDATE_TABS);
	}, [match.params.tabId]);

	// UI
	useWarningBeforeUnload({
		when: isDirty && !isForcedExit,
	});

	const [tabs, tab, setTab, onTabClick] = useAssignmentTeacherTabs(
		history,
		match.params.id as string
	);
	const [isViewAsPupilEnabled, setIsViewAsPupilEnabled] = useState<boolean>(false);
	const [isConfirmSaveActionModalOpen, setIsConfirmSaveActionModalOpen] =
		useState<boolean>(false);

	const pastDeadline = useAssignmentPastDeadline(original);

	// HTTP

	// Get query string variables and fetch the existing object
	const fetchAssignment = useCallback(async () => {
		try {
			setAssigmentLoading(true);
			setAssignmentError(null);
			const id = match.params.id;
			let tempAssignment: Avo.Assignment.Assignment | null = null;

			try {
				tempAssignment = await AssignmentService.fetchAssignmentById(id);
			} catch (err) {
				if (JSON.stringify(err).includes(NO_RIGHTS_ERROR_MESSAGE)) {
					setAssignmentError({
						message: tHtml(
							'assignment/views/assignment-edit___je-hebt-geen-rechten-om-deze-opdracht-te-bewerken'
						),
						icon: IconName.lock,
						actionButtons: ['home'],
					});
					setAssigmentLoading(false);
					return;
				}
				setAssignmentError({
					message: tHtml(
						'assignment/views/assignment-edit___het-ophalen-van-de-opdracht-is-mislukt'
					),
					icon: IconName.alertTriangle,
					actionButtons: ['home'],
				});
				setAssigmentLoading(false);
				return;
			}

			if (!tempAssignment) {
				setAssignmentError({
					message: tHtml(
						'assignment/views/assignment-edit___het-ophalen-van-de-opdracht-is-mislukt'
					),
					icon: IconName.alertTriangle,
					actionButtons: ['home'],
				});
				setAssigmentLoading(false);
				return;
			}

			if (tempAssignment.contributors && user && user?.profile?.id) {
				const contributorInfo = tempAssignment.contributors.find(
					(contributor) => contributor.profile_id === user?.profile?.id
				);
				const isOwner = tempAssignment.owner_profile_id === user.profile.id;

				if (
					(!contributorInfo && !isOwner && !canEditAllAssignments) ||
					(contributorInfo?.rights === Lookup_Enum_Right_Types_Enum.Viewer &&
						!canEditAllAssignments)
				) {
					setAssignmentError({
						message: tHtml(
							'assignment/views/assignment-edit___je-hebt-geen-rechten-om-deze-opdracht-te-bewerken'
						),
						icon: IconName.lock,
						actionButtons: ['home'],
					});
					setAssigmentLoading(false);
					return;
				}
			}

			const hasPupilBlocks = await AssignmentService.hasPupilCollectionBlocks(id);

			setOriginal(tempAssignment);
			setAssignment(tempAssignment as any);
			setAssignmentHasResponses((tempAssignment.responses?.length || 0) > 0);
			setAssignmentHasPupilBlocks(hasPupilBlocks);
		} catch (err) {
			setAssignmentError({
				message: tHtml(
					'assignment/views/assignment-edit___het-ophalen-aanmaken-van-de-opdracht-is-mislukt'
				),
				icon: IconName.alertTriangle,
			});
		}
		setAssigmentLoading(false);
	}, [user, match.params.id, tText, history, setOriginal, setAssignment]);

	// Events

	const handleOnSave = async () => {
		if (!user.profile?.id || !original) {
			return;
		}

		if (assignment?.deadline_at && isPast(new Date(assignment?.deadline_at))) {
			ToastService.danger(
				tHtml(
					'assignment/views/assignment-edit___de-deadline-mag-niet-in-het-verleden-liggen'
				)
			);
			return;
		}

		if (isDeadlineBeforeAvailableAt(assignment?.available_at, assignment?.deadline_at)) {
			ToastService.danger(
				tHtml(
					'assignment/views/assignment-edit___de-beschikbaar-vanaf-datum-moet-voor-de-deadline-liggen-anders-zullen-je-leerlingen-geen-toegang-hebben-tot-deze-opdracht'
				)
			);
			return;
		}

		if (assignmentHasResponses) {
			setIsConfirmSaveActionModalOpen(true);
			return;
		}

		await handleSubmit(submit, (...args) => console.error(args))();
	};

	const submit = async () => {
		try {
			if (!user.profile?.id || !original) {
				return;
			}

			const updated = await AssignmentService.updateAssignment(
				{
					...original,
					...assignment,
					id: original.id,
				},
				user.profile?.id
			);

			if (updated && assignment?.id) {
				trackEvents(
					{
						object: String(assignment.id),
						object_type: 'assignment',
						action: 'edit',
						resource: {
							is_public: assignment.is_public || false,
							role: getContributorType(
								user,
								assignment as Avo.Assignment.Assignment,
								(original.contributors || []) as Avo.Assignment.Contributor[]
							).toLowerCase(),
						},
					},
					user
				);

				// Re-fetch
				await fetchAssignment();

				ToastService.success(
					tHtml('assignment/views/assignment-edit___de-opdracht-is-succesvol-aangepast')
				);
			}
		} catch (err) {
			console.error(err);
			ToastService.danger(
				tHtml('assignment/views/assignment-edit___het-opslaan-van-de-opdracht-is-mislukt')
			);
		}
	};

	const reset = useCallback(() => {
		original && setAssignment(original as any);
		resetForm();
	}, [resetForm, setAssignment, original]);

	const updateAssignmentEditor = async () => {
		try {
			await AssignmentService.updateAssignmentEditor(assignmentId);
		} catch (err) {
			redirectToClientPage(
				buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, { id: assignmentId }),
				history
			);

			if ((err as CustomError)?.innerException?.additionalInfo.statusCode === 409) {
				ToastService.danger(
					tHtml(
						'assignment/views/assignment-edit___iemand-is-deze-opdracht-reeds-aan-het-bewerken'
					)
				);
			} else if ((err as CustomError).innerException?.additionalInfo.statusCode === 401) {
				return; // User has no rights to edit the assignment
			} else {
				await releaseAssignmentEditStatus();
				ToastService.danger(
					tHtml(
						'assignment/views/assignment-edit___verbinding-met-bewerk-server-verloren'
					)
				);
			}
		}
	};

	const releaseAssignmentEditStatus = async () => {
		try {
			await AssignmentService.releaseAssignmentEditStatus(assignmentId);
		} catch (err) {
			if ((err as CustomError)?.innerException?.additionalInfo.statusCode !== 409) {
				ToastService.danger(
					tHtml(
						'assignment/views/assignment-edit___er-liep-iets-fout-met-het-updaten-van-de-opdracht-bewerk-status'
					)
				);
			}
		}
	};

	const onForcedExitPage = async () => {
		setIsForcedExit(true);
		try {
			if (!user.profile?.id || !original) {
				return;
			}

			await AssignmentService.updateAssignment(
				{
					...original,
					...assignment,
					id: original.id,
				},
				user.profile?.id
			);

			ToastService.success(
				tHtml(
					'assignment/views/assignment-edit___je-was-meer-dan-15-minuten-inactief-je-aanpassingen-zijn-opgeslagen'
				),
				{
					autoClose: false,
				}
			);
		} catch (err) {
			ToastService.danger(
				tHtml(
					'assignment/views/assignment-edit___je-was-meer-dan-15-minuten-inactief-het-opslaan-van-je-aanpassingen-is-mislukt'
				),
				{
					autoClose: false,
				}
			);
		}

		releaseAssignmentEditStatus();

		redirectToClientPage(
			buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, {
				id: assignmentId,
			}),
			history
		);
	};

	// Render

	const renderBlockContent = useEditBlocks(setBlock, buildGlobalSearchLink);

	const [renderedModals, confirmSliceModal, addBlockModal] = useBlockListModals(
		assignment?.blocks || [],
		updateBlocksInAssignmentState,
		{
			confirmSliceConfig: {
				responses: (original?.responses || []) as any, // TODO strong types
			},
			addCollectionConfig: {
				addCollectionCallback: (id) => {
					// Track import collection into assignment event
					trackEvents(
						{
							object: `${assignment?.id}`,
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
			items: assignment?.blocks,
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
				content: (item) => {
					if (item) {
						return renderBlockContent(item);
					}
					return null;
				},
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

	const renderedTabContent = useMemo(() => {
		switch (tab) {
			case ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT:
				if (pastDeadline) {
					return <BlockList blocks={assignment?.blocks || []} />;
				}
				return (
					<div className="c-assignment-contents-tab">
						{(assignment?.blocks?.length || 0) > 0 && !pastDeadline && (
							<Spacer
								margin={['bottom-large']}
								className="c-assignment-page__reorder-container"
							>
								{draggableListButton}
							</Spacer>
						)}
						{renderedListSorter}
					</div>
				);

			case ASSIGNMENT_CREATE_UPDATE_TABS.DETAILS:
				if (pastDeadline) {
					if (!assignment) {
						if (!assignment) {
							return (
								<Spacer margin="top-extra-large">
									<Flex orientation="horizontal" center>
										<Spinner size="large" />
									</Flex>
								</Spacer>
							);
						}
					}
					return (
						<div className="c-assignment-details-tab">
							<AssignmentDetailsFormReadonly
								assignment={assignment as Avo.Assignment.Assignment}
							/>
						</div>
					);
				}
				return (
					<div className="c-assignment-details-tab">
						<AssignmentDetailsFormEditable
							assignment={assignment || {}}
							setAssignment={setAssignment as any}
							setValue={setValue}
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

			case ASSIGNMENT_CREATE_UPDATE_TABS.CLICKS:
				return (
					<AssignmentResponses
						history={history}
						match={match}
						user={user}
						onUpdate={onUpdate}
					/>
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

	// Fetch initial data
	useEffect(() => {
		fetchAssignment();
	}, [fetchAssignment]);

	// Synchronise the React state that triggers renders with the useForm hook
	useEffect(() => {
		Object.keys(assignment || {}).forEach((key) => {
			const cast = key as keyof AssignmentFields;
			(setValue as any)(cast, assignment?.[cast]);
		});

		trigger();
	}, [assignment as any, setValue, trigger]);

	// Reset the form when the original changes
	useEffect(() => {
		original && reset();
	}, [original, reset]);

	// Render

	const renderEditAssignmentPage = () => (
		<div className="c-assignment-page c-assignment-page--edit c-sticky-bar__wrapper">
			<div>
				<AssignmentHeading
					back={renderBackButton}
					title={renderTitle}
					actions={
						<AssignmentActions
							publish={{
								title: isPublic
									? tText(
											'assignment/views/assignment-edit___maak-deze-opdracht-prive'
									  )
									: tText(
											'assignment/views/assignment-edit___maak-deze-opdracht-openbaar'
									  ),
								label: isPublic ? tText('Maak privé') : tText('Publiceer'),
								ariaLabel: isPublic
									? tText(
											'assignment/views/assignment-edit___maak-deze-opdracht-prive'
									  )
									: tText(
											'assignment/views/assignment-edit___maak-deze-opdracht-openbaar'
									  ),
								icon: isPublic ? IconName.unlock3 : IconName.lock,
								onClick: () => setIsPublishModalOpen(true),
							}}
							duplicate={{
								assignment: original || undefined,
								onClick: (_e, duplicated) => {
									duplicated &&
										redirectToClientPage(
											toAssignmentDetail(duplicated),
											history
										);
								},
							}}
							preview={{ onClick: () => setIsViewAsPupilEnabled(true) }}
							shareWithPupilsProps={{
								assignment: original || undefined, // Needs to be saved before you can share
								onContentLinkClicked: () =>
									setTab(ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT),
								onDetailLinkClicked: () =>
									setTab(ASSIGNMENT_CREATE_UPDATE_TABS.DETAILS),
							}}
							remove={{
								assignment: original || undefined,
								modal: {
									confirmCallback: () => {
										reset();
										redirectToClientPage(backToOverview(), history);
									},
								},
							}}
							refetchAssignment={async () => await fetchAssignment()}
							route={location.pathname}
						/>
					}
					tabs={renderTabs}
				/>

				<Container mode="horizontal">
					{pastDeadline && (
						<Spacer margin={['top-large']}>
							<Alert type="info">
								{tText(
									'assignment/views/assignment-edit___deze-opdracht-is-afgelopen-en-kan-niet-langer-aangepast-worden-maak-een-duplicaat-aan-om-dit-opnieuw-te-delen-met-leerlingen'
								)}
							</Alert>
						</Spacer>
					)}

					<Spacer margin={['top-large', 'bottom-extra-large']}>
						{renderedTabContent}
					</Spacer>

					{renderedModals}
					{draggableListModal}

					<AssignmentConfirmSave
						hasBlocks={assignmentHasPupilBlocks}
						hasResponses={assignmentHasResponses}
						modal={{
							isOpen: isConfirmSaveActionModalOpen,
							onClose: () => setIsConfirmSaveActionModalOpen(false),
							confirmCallback: () => {
								setIsConfirmSaveActionModalOpen(false);
								handleSubmit(submit, (...args) => console.error(args))();
							},
						}}
					/>

					<InActivityWarningModal
						onActivity={updateAssignmentEditor}
						onExit={releaseAssignmentEditStatus}
						warningMessage={tHtml(
							'assignment/views/assignment-edit___door-inactiviteit-zal-de-opdracht-zichzelf-sluiten'
						)}
						currentPath={history.location.pathname}
						editPath={APP_PATH.ASSIGNMENT_EDIT_TAB.route}
						onForcedExit={onForcedExitPage}
					/>
				</Container>
			</div>

			{/* Must always be the second and last element inside the c-sticky-bar__wrapper */}
			<StickySaveBar isVisible={isDirty} onSave={handleOnSave} onCancel={() => reset()} />
		</div>
	);

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
			return <ErrorView {...assignmentError} />;
		}

		if (
			assignment?.id &&
			!isUserAssignmentOwner(user, assignment) &&
			!isUserAssignmentContributor(user, assignment) &&
			!canEditAllAssignments
		) {
			return (
				<ErrorNoAccess
					title={tHtml('assignment/views/assignment-edit___je-hebt-geen-toegang')}
					message={tHtml(
						'assignment/views/assignment-edit___je-hebt-geen-toegang-beschrijving'
					)}
				/>
			);
		}

		if (isViewAsPupilEnabled && assignment) {
			return (
				<AssignmentPupilPreview
					assignment={assignment}
					onClose={() => setIsViewAsPupilEnabled(false)}
					isPreview
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
						tText('assignment/views/assignment-edit___bewerk-opdracht-pagina-titel')
					)}
				</title>

				<meta
					name="description"
					content={tText(
						'assignment/views/assignment-edit___bewerk-opdracht-pagina-beschrijving'
					)}
				/>
			</MetaTags>

			{renderPageContent()}

			<BeforeUnloadPrompt when={isDirty && !isForcedExit} />

			{!!assignment && !!user && (
				<PublishAssignmentModal
					onClose={(newAssignment: Avo.Assignment.Assignment | undefined) => {
						setIsPublishModalOpen(false);
						if (newAssignment) {
							setAssignment(newAssignment as any);
						}
					}}
					isOpen={isPublishModalOpen}
					assignment={assignment as Avo.Assignment.Assignment}
					history={history}
					location={location}
					match={match}
					user={user}
				/>
			)}
		</>
	);
};

export default AssignmentEdit;
