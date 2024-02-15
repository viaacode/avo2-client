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
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { PermissionName } from '@viaa/avo2-types';
import { isAfter, isPast } from 'date-fns';
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
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { matchPath, Redirect } from 'react-router';
import { Link } from 'react-router-dom';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { BlockList } from '../../collection/components';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorNoAccess } from '../../error/components';
import { ErrorView } from '../../error/views';
import { ErrorViewQueryParams } from '../../error/views/ErrorView';
import { InActivityWarningModal, ShareModal } from '../../shared/components';
import { BeforeUnloadPrompt } from '../../shared/components/BeforeUnloadPrompt/BeforeUnloadPrompt';
import { ContributorInfoRight } from '../../shared/components/ShareWithColleagues/ShareWithColleagues.types';
import { StickySaveBar } from '../../shared/components/StickySaveBar/StickySaveBar';
import { buildLink, CustomError, navigate } from '../../shared/helpers';
import {
	getContributorType,
	transformContributorsToSimpleContributors,
} from '../../shared/helpers/contributors';
import { renderMobileDesktop } from '../../shared/helpers/renderMobileDesktop';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import { useDraggableListModal } from '../../shared/hooks/use-draggable-list-modal';
import { useAssignmentPastDeadline } from '../../shared/hooks/useAssignmentPastDeadline';
import useTranslation from '../../shared/hooks/useTranslation';
import { useWarningBeforeUnload } from '../../shared/hooks/useWarningBeforeUnload';
import { NO_RIGHTS_ERROR_MESSAGE } from '../../shared/services/data-service';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { ASSIGNMENT_CREATE_UPDATE_TABS, ASSIGNMENT_FORM_SCHEMA } from '../assignment.const';
import {
	getValidationErrorsForPublishAssignment,
	isUserAssignmentContributor,
	isUserAssignmentOwner,
	setBlockPositionToIndex,
} from '../assignment.helper';
import { AssignmentService } from '../assignment.service';
import AssignmentActions from '../components/AssignmentActions';
import AssignmentAdminFormEditable from '../components/AssignmentAdminFormEditable';
import AssignmentConfirmSave from '../components/AssignmentConfirmSave';
import AssignmentDetailsFormEditable from '../components/AssignmentDetailsFormEditable';
import AssignmentDetailsFormReadonly from '../components/AssignmentDetailsFormReadonly';
import AssignmentHeading from '../components/AssignmentHeading';
import AssignmentMetaDataFormEditable from '../components/AssignmentMetaDataFormEditable';
import AssignmentPupilPreview from '../components/AssignmentPupilPreview';
import AssignmentTeacherTabs from '../components/AssignmentTeacherTabs';
import AssignmentTitle from '../components/AssignmentTitle';
import { endOfAcademicYear } from '../helpers/academic-year';
import {
	onAddNewContributor,
	onDeleteContributor,
	onEditContributor,
} from '../helpers/assignment-share-with-collegue-handlers';
import { buildGlobalSearchLink } from '../helpers/build-search-link';
import { isDeadlineBeforeAvailableAt } from '../helpers/is-deadline-before-available-at';
import { backToOverview, toAssignmentDetail } from '../helpers/links';
import {
	useAssignmentBlockChangeHandler,
	useAssignmentForm,
	useBlockListModals,
	useBlocksList,
	useEditBlocks,
} from '../hooks';
import { AssignmentFields } from '../hooks/assignment-form';
import PublishAssignmentModal from '../modals/PublishAssignmentModal';

import AssignmentResponses from './AssignmentResponses';

import './AssignmentEdit.scss';
import './AssignmentPage.scss';

interface AssignmentEditProps extends DefaultSecureRouteProps<{ id: string; tabId: string }> {
	onUpdate: () => void | Promise<void>;
}

const AssignmentEdit: FunctionComponent<AssignmentEditProps & UserProps> = ({
	onUpdate = noop,
	match,
	user,
	commonUser,
	history,
	location,
}) => {
	const { tText, tHtml } = useTranslation();

	// Data
	const [tab, setTab] = useState<ASSIGNMENT_CREATE_UPDATE_TABS>(
		ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT
	);
	const [originalAssignment, setOriginalAssignment] = useState<Avo.Assignment.Assignment | null>(
		null
	);
	const [assignmentLoading, setAssignmentLoading] = useState(true);
	const [assignmentError, setAssignmentError] = useState<Partial<ErrorViewQueryParams> | null>(
		null
	);
	const [assignment, setAssignment] = useAssignmentForm(undefined);
	const [contributors, setContributors] = useState<Avo.Assignment.Contributor[]>();

	const [assignmentHasPupilBlocks, setAssignmentHasPupilBlocks] = useState<boolean>();
	const [assignmentHasResponses, setAssignmentHasResponses] = useState<boolean>();
	const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
	const [isForcedExit, setIsForcedExit] = useState<boolean>(false);
	const [permissions, setPermissions] = useState<
		Partial<{
			canEdit: boolean;
			canPublish: boolean;
		}>
	>({});
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

	// Computed
	const assignmentId = match.params.id;
	const isPublic = assignment?.is_public || false;

	const fetchContributors = useCallback(async () => {
		if (!assignmentId) {
			return;
		}
		const response = await AssignmentService.fetchContributorsByAssignmentId(assignmentId);
		setContributors((response || []) as Avo.Assignment.Contributor[]);
	}, [assignmentId]);

	const {
		control,
		formState: { isDirty: unsavedChanges },
		handleSubmit,
		reset: resetForm,
		setValue,
		trigger,
	} = useForm<AssignmentFields>({
		defaultValues: useMemo(
			() => (originalAssignment as AssignmentFields) || undefined,
			[originalAssignment]
		),
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
		setAssignmentLoading(true);
		await updateAssignmentEditor();
	}, [setAssignmentLoading]);

	useEffect(() => {
		updateAssignmentEditorWithLoading();
	}, [updateAssignmentEditorWithLoading]);

	useEffect(() => {
		fetchContributors();
	}, [fetchContributors]);

	// UI
	useWarningBeforeUnload({
		when: unsavedChanges && !isForcedExit,
	});

	const [isViewAsPupilEnabled, setIsViewAsPupilEnabled] = useState<boolean>(false);
	const [isConfirmSaveActionModalOpen, setIsConfirmSaveActionModalOpen] =
		useState<boolean>(false);

	const pastDeadline = useAssignmentPastDeadline(originalAssignment);

	// HTTP

	// Get query string variables and fetch the existing object
	const fetchAssignment = useCallback(async () => {
		try {
			setAssignmentLoading(true);
			setAssignmentError(null);
			const id = match.params.id;
			let tempAssignment: Avo.Assignment.Assignment | null = null;

			if (
				!commonUser?.permissions?.includes(PermissionName.EDIT_ANY_ASSIGNMENTS) &&
				!commonUser?.permissions?.includes(PermissionName.EDIT_OWN_ASSIGNMENTS)
			) {
				// User cannot edit assignments => redirect to error
				setAssignmentError({
					message: tHtml(
						'assignment/views/assignment-edit___je-hebt-geen-rechten-om-deze-opdracht-te-bewerken-ben-je-een-leerling-dan-heeft-je-lesgever-de-verkeerde-link-gedeeld'
					),
					icon: IconName.lock,
					actionButtons: ['home'],
				});
			}

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
					setAssignmentLoading(false);
					return;
				}
				setAssignmentError({
					message: tHtml(
						'assignment/views/assignment-edit___het-ophalen-van-de-opdracht-is-mislukt'
					),
					icon: IconName.alertTriangle,
					actionButtons: ['home'],
				});
				setAssignmentLoading(false);
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
				setAssignmentLoading(false);
				return;
			}

			const hasPupilBlocks = await AssignmentService.hasPupilCollectionBlocks(id);

			const checkedPermissions = await PermissionService.checkPermissions(
				{
					canEditAllAssignments: [
						{
							name: PermissionName.EDIT_ANY_ASSIGNMENTS,
						},
					],
					canPublish: [
						{
							name: PermissionName.PUBLISH_OWN_ASSIGNMENTS,
							obj: assignmentId,
						},
						{
							name: PermissionName.PUBLISH_ANY_ASSIGNMENTS,
						},
					],
				},
				user
			);

			const allPermissions = {
				canPublish: checkedPermissions.canPublish,
				canEdit:
					isUserAssignmentOwner(user, tempAssignment) ||
					isUserAssignmentContributor(user, tempAssignment) ||
					checkedPermissions.canEditAllAssignments,
			};

			setPermissions(allPermissions);

			if (!allPermissions.canEdit) {
				setAssignmentError({
					message: tHtml(
						'assignment/views/assignment-edit___je-hebt-geen-rechten-om-deze-opdracht-te-bewerken'
					),
					icon: IconName.lock,
					actionButtons: ['home'],
				});
				setAssignmentLoading(false);
				return;
			}

			setOriginalAssignment(tempAssignment);
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
		setAssignmentLoading(false);
	}, [user, match.params.id, tText, history, setOriginalAssignment, setAssignment]);

	// Events

	const handleOnSave = async () => {
		if (!user.profile?.id || !originalAssignment) {
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

		if (
			assignment?.deadline_at &&
			isAfter(new Date(assignment.deadline_at), endOfAcademicYear())
		) {
			ToastService.danger(
				tHtml('assignment/views/assignment-edit___de-deadline-moet-voor-31-augustus-liggen')
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
			if (!user.profile?.id || !originalAssignment || !assignment) {
				return;
			}

			if (assignment.is_public) {
				const validationErrors = await getValidationErrorsForPublishAssignment(assignment);
				if (validationErrors && validationErrors.length) {
					ToastService.danger(validationErrors);
					return;
				}
			}

			// Deal with the owner changing
			if (originalAssignment?.owner_profile_id !== assignment.owner_profile_id) {
				await AssignmentService.transferAssignmentOwnerShip(
					originalAssignment.id,
					assignment.owner_profile_id as string
				);
			}

			const updated = await AssignmentService.updateAssignment(
				{
					...originalAssignment,
					...assignment,
					id: originalAssignment.id,
				},
				user.profile?.id
			);

			if (updated && assignment?.id) {
				const isAdmin = commonUser.permissions?.includes(
					PermissionName.EDIT_ANY_ASSIGNMENTS
				);
				const contributorType = isAdmin
					? 'ADMIN'
					: getContributorType(
							commonUser?.profileId,
							assignment as Avo.Assignment.Assignment,
							(originalAssignment.contributors || []) as Avo.Assignment.Contributor[]
					  ).toLowerCase();
				trackEvents(
					{
						object: String(assignment.id),
						object_type: 'assignment',
						action: 'edit',
						resource: {
							is_public: assignment.is_public || false,
							role: contributorType,
						},
					},
					user
				);

				// Re-fetch
				await fetchAssignment();
				await fetchContributors();

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
		originalAssignment && setAssignment(originalAssignment as any);
		resetForm();
	}, [resetForm, setAssignment, originalAssignment]);

	const updateAssignmentEditor = async () => {
		try {
			await AssignmentService.updateAssignmentEditor(assignmentId);
		} catch (err) {
			redirectToClientPage(
				buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, { id: assignmentId }),
				history
			);

			if ((err as CustomError)?.innerException?.additionalInfo?.statusCode === 409) {
				ToastService.danger(
					tHtml(
						'assignment/views/assignment-edit___iemand-is-deze-opdracht-reeds-aan-het-bewerken'
					)
				);
			} else if ((err as CustomError).innerException?.additionalInfo?.statusCode === 401) {
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
			if ((err as CustomError)?.innerException?.additionalInfo?.statusCode !== 409) {
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
			if (!user.profile?.id || !originalAssignment) {
				return;
			}

			await AssignmentService.updateAssignment(
				{
					...originalAssignment,
					...assignment,
					id: originalAssignment.id,
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

	const cancelSaveBar = () => {
		reset();
		setHasUnsavedChanges(false);
	};

	// Render

	const renderBlockContent = useEditBlocks(setBlock, buildGlobalSearchLink, undefined, () =>
		setHasUnsavedChanges(true)
	);

	const [renderedModals, confirmSliceModal, addBlockModal] = useBlockListModals(
		assignment?.blocks || [],
		updateBlocksInAssignmentState,
		false,
		{
			confirmSliceConfig: {
				responses: (originalAssignment?.responses || []) as any, // TODO strong types
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
		() => (
			<AssignmentTitle
				control={control}
				setAssignment={setAssignment as any}
				onFocus={() => setHasUnsavedChanges(true)}
			/>
		),
		[tText, control, setAssignment]
	);

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
							onFocus={() => setHasUnsavedChanges(true)}
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
							onFocus={() => setHasUnsavedChanges(true)}
						/>
					</div>
				);

			case ASSIGNMENT_CREATE_UPDATE_TABS.CLICKS:
				return (
					<AssignmentResponses
						history={history}
						match={match}
						user={user}
						commonUser={commonUser}
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
		originalAssignment && reset();
	}, [originalAssignment, reset]);

	const handleTabChange = (tabId: ASSIGNMENT_CREATE_UPDATE_TABS) => {
		setTab(tabId);

		if (assignmentId) {
			navigate(
				history,
				APP_PATH.ASSIGNMENT_EDIT_TAB.route,
				{ id: assignmentId, tabId: tabId },
				undefined,
				'replace'
			);
		}
	};

	// Render

	const shareProps = {
		assignment: originalAssignment || undefined, // Needs to be saved before you can share
		onContentLinkClicked: () => setTab(ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT),
		onDetailLinkClicked: () => setTab(ASSIGNMENT_CREATE_UPDATE_TABS.DETAILS),
		onClickMobile: () => setIsShareModalOpen(true),
		fetchContributors: fetchContributors,
		contributors: contributors || [],
		availableRights: {
			[ContributorInfoRight.CONTRIBUTOR]: PermissionName.SHARE_ASSIGNMENT_WITH_CONTRIBUTOR,
			[ContributorInfoRight.VIEWER]: PermissionName.SHARE_ASSIGNMENT_WITH_VIEWER,
		},
	};

	const renderHeadingActions = (renderLabel: boolean) => {
		return (
			<AssignmentActions
				publish={
					permissions.canPublish
						? {
								title: isPublic
									? tText(
											'assignment/views/assignment-edit___maak-deze-opdracht-prive'
									  )
									: tText(
											'assignment/views/assignment-edit___maak-deze-opdracht-openbaar'
									  ),
								...(renderLabel
									? {
											label: isPublic
												? tText(
														'assignment/views/assignment-edit___maak-prive'
												  )
												: tText(
														'assignment/views/assignment-edit___publiceer'
												  ),
									  }
									: {}),
								ariaLabel: isPublic
									? tText(
											'assignment/views/assignment-edit___maak-deze-opdracht-prive'
									  )
									: tText(
											'assignment/views/assignment-edit___maak-deze-opdracht-openbaar'
									  ),
								icon: isPublic ? IconName.unlock3 : IconName.lock,
								onClick: () => setIsPublishModalOpen(true),
						  }
						: undefined
				}
				duplicate={{
					assignment: originalAssignment || undefined,
					onClick: (_e, duplicated) => {
						duplicated && redirectToClientPage(toAssignmentDetail(duplicated), history);
					},
				}}
				view={{
					label: tText('assignment/views/assignment-edit___bekijk'),
					title: tText(
						'assignment/views/assignment-edit___bekijk-hoe-de-opdracht-er-zal-uit-zien'
					),
					onClick: () =>
						redirectToClientPage(
							buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, {
								id: assignmentId,
							}),
							history
						),
				}}
				preview={{ onClick: () => setIsViewAsPupilEnabled(true) }}
				shareWithColleaguesOrPupilsProps={shareProps}
				remove={{
					assignment: originalAssignment || undefined,
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
		);
	};

	const renderEditAssignmentPage = () => (
		<div className="c-assignment-page c-assignment-page--edit c-sticky-bar__wrapper">
			<div>
				{renderMobileDesktop({
					mobile: (
						<AssignmentHeading
							back={renderBackButton}
							title={renderTitle}
							actions={renderHeadingActions(true)}
							tabs={
								<AssignmentTeacherTabs
									activeTab={tab}
									onTabChange={handleTabChange}
									clicksCount={originalAssignment?.responses?.length ?? 0}
								/>
							}
							tour={null}
						/>
					),
					desktop: (
						<AssignmentHeading
							back={renderBackButton}
							title={renderTitle}
							actions={renderHeadingActions(false)}
							tabs={
								<AssignmentTeacherTabs
									activeTab={tab}
									onTabChange={handleTabChange}
									clicksCount={originalAssignment?.responses?.length ?? 0}
								/>
							}
						/>
					),
				})}

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
			<StickySaveBar
				isVisible={unsavedChanges || hasUnsavedChanges}
				onSave={handleOnSave}
				onCancel={cancelSaveBar}
			/>
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
			!permissions.canEdit
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

	if (matchPath(location.pathname, { path: APP_PATH.ASSIGNMENT_EDIT.route, exact: true })) {
		return (
			<Redirect
				to={buildLink(APP_PATH.ASSIGNMENT_EDIT_TAB.route, {
					id: assignmentId,
					tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT,
				})}
			/>
		);
	}

	return (
		<>
			<Helmet>
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
			</Helmet>

			{renderPageContent()}

			<BeforeUnloadPrompt when={unsavedChanges && !isForcedExit} />

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
				/>
			)}

			{!!originalAssignment &&
				contributors &&
				renderMobileDesktop({
					mobile: (
						<ShareModal
							title={tText(
								'assignment/views/assignment-edit___deel-deze-opdracht-met-collegas'
							)}
							isOpen={isShareModalOpen}
							onClose={() => setIsShareModalOpen(false)}
							contributors={transformContributorsToSimpleContributors(
								originalAssignment?.owner as Avo.User.User,
								(contributors || []) as Avo.Assignment.Contributor[]
							)}
							onDeleteContributor={(contributorInfo) =>
								onDeleteContributor(contributorInfo, shareProps, fetchContributors)
							}
							onEditContributorRights={(contributorInfo, newRights) =>
								onEditContributor(
									contributorInfo,
									newRights,
									shareProps,
									fetchContributors,
									fetchAssignment
								)
							}
							onAddContributor={(info) =>
								onAddNewContributor(info, shareProps, fetchContributors)
							}
							shareWithPupilsProps={shareProps}
							availableRights={{
								[ContributorInfoRight.CONTRIBUTOR]:
									PermissionName.SHARE_ASSIGNMENT_WITH_CONTRIBUTOR,
								[ContributorInfoRight.VIEWER]:
									PermissionName.SHARE_ASSIGNMENT_WITH_VIEWER,
							}}
							isAdmin={
								commonUser?.permissions?.includes(
									PermissionName.EDIT_ANY_ASSIGNMENTS
								) || false
							}
						/>
					),
					desktop: null,
				})}
		</>
	);
};

export default withUser(AssignmentEdit) as FunctionComponent<AssignmentEditProps>;
