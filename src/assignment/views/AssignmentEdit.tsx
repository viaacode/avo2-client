import './AssignmentEdit.scss';
import './AssignmentPage.scss';
import { OrderDirection } from '@meemoo/react-components';
import {
	Alert,
	Button,
	Container,
	Flex,
	HeaderContentType,
	Icon,
	IconName,
	MetaData,
	MetaDataItem,
	Spacer,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { isAfter, isPast } from 'date-fns';
import { useAtomValue } from 'jotai';
import { noop } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { matchPath, Navigate, useNavigate, useParams } from 'react-router';
import { Link, useLocation } from 'react-router-dom';

import { commonUserAtom } from '../../authentication/authentication.store';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects/redirect-to-client-page';
import type { MarcomNoteInfo } from '../../collection/components/CollectionOrBundleEdit.types';
import {
	BundleSortProp,
	useGetCollectionsOrBundlesContainingFragment,
} from '../../collection/hooks/useGetCollectionsOrBundlesContainingFragment';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorNoAccess } from '../../error/components/ErrorNoAccess';
import { ErrorView, type ErrorViewQueryParams } from '../../error/views/ErrorView';
import { BeforeUnloadPrompt } from '../../shared/components/BeforeUnloadPrompt/BeforeUnloadPrompt';
import { BlockList } from '../../shared/components/BlockList/BlockList';
import { EmptyStateMessage } from '../../shared/components/EmptyStateMessage/EmptyStateMessage';
import { FullPageSpinner } from '../../shared/components/FullPageSpinner/FullPageSpinner';
import { HeaderOwnerAndContributors } from '../../shared/components/HeaderOwnerAndContributors/HeaderOwnerAndContributors';
import { InActivityWarningModal } from '../../shared/components/InActivityWarningModal/InActivityWarningModal';
import {
	ListSorterColor,
	ListSorterPosition,
	ListSorterSlice,
} from '../../shared/components/ListSorter';
import { SelectEducationLevelModal } from '../../shared/components/SelectEducationLevelModal/SelectEducationLevelModal';
import { ShareModal } from '../../shared/components/ShareModal/ShareModal';
import { ContributorInfoRight } from '../../shared/components/ShareWithColleagues/ShareWithColleagues.types';
import { StickySaveBar } from '../../shared/components/StickySaveBar/StickySaveBar';
import { buildLink } from '../../shared/helpers/build-link';
import {
	getContributorType,
	transformContributorsToSimpleContributors,
} from '../../shared/helpers/contributors';
import { CustomError } from '../../shared/helpers/custom-error';
import { navigate } from '../../shared/helpers/link';
import { type EducationLevelId } from '../../shared/helpers/lom';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { renderMobileDesktop } from '../../shared/helpers/renderMobileDesktop';
import { useBlocksList } from '../../shared/hooks/use-blocks-list';
import { useDraggableListModal } from '../../shared/hooks/use-draggable-list-modal';
import { useAssignmentPastDeadline } from '../../shared/hooks/useAssignmentPastDeadline';
import { useTranslation } from '../../shared/hooks/useTranslation';
import { useWarningBeforeUnload } from '../../shared/hooks/useWarningBeforeUnload';
import {
	BookmarksViewsPlaysService,
	DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS,
} from '../../shared/services/bookmarks-views-plays-service';
import { type BookmarkViewPlayCounts } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { NO_RIGHTS_ERROR_MESSAGE } from '../../shared/services/data-service';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import {
	ASSIGNMENT_CREATE_UPDATE_TABS,
	ASSIGNMENT_FORM_DEFAULT,
	GET_EDUCATION_LEVEL_DICT,
	GET_EDUCATION_LEVEL_TOOLTIP_DICT,
} from '../assignment.const';
import {
	getValidationErrorsForPublishAssignment,
	isUserAssignmentContributor,
	isUserAssignmentOwner,
	setBlockPositionToIndex,
} from '../assignment.helper';
import { AssignmentService } from '../assignment.service';
import { AssignmentActions } from '../components/AssignmentActions';
import { AssignmentAdminFormEditable } from '../components/AssignmentAdminFormEditable';
import { AssignmentConfirmSave } from '../components/AssignmentConfirmSave';
import { AssignmentDetailsFormEditable } from '../components/AssignmentDetailsFormEditable';
import { AssignmentDetailsFormReadonly } from '../components/AssignmentDetailsFormReadonly';
import { AssignmentHeading } from '../components/AssignmentHeading';
import { AssignmentMetaDataFormEditable } from '../components/AssignmentMetaDataFormEditable';
import { AssignmentPupilPreview } from '../components/AssignmentPupilPreview';
import { AssignmentTeacherTabs } from '../components/AssignmentTeacherTabs';
import { AssignmentTitle } from '../components/AssignmentTitle';
import { endOfAcademicYear } from '../helpers/academic-year';
import {
	onAddNewContributor,
	onDeleteContributor,
	onEditContributor,
} from '../helpers/assignment-share-with-collegue-handlers';
import { buildGlobalSearchLink } from '../helpers/build-search-link';
import { cleanupTitleAndDescriptions } from '../helpers/cleanup-title-and-descriptions';
import { duplicateAssignment } from '../helpers/duplicate-assignment';
import { isDeadlineBeforeAvailableAt } from '../helpers/is-deadline-before-available-at';
import { backToOverview } from '../helpers/links';
import { useAssignmentBlockChangeHandler } from '../hooks/assignment-block-change-handler';
import { useBlockListModals } from '../hooks/assignment-content-modals';
import { type AssignmentFields } from '../hooks/assignment-form';
import { useEditBlocks } from '../hooks/use-edit-blocks';
import { useEducationLevelModal } from '../hooks/use-education-level-modal';
import { PublishAssignmentModal } from '../modals/PublishAssignmentModal';

import { AssignmentEditMarcom } from './AssignmentEditMarcom';
import { AssignmentResponses } from './AssignmentResponses';

interface AssignmentEditProps {
	onUpdate?: () => void | Promise<void>;
}

export const AssignmentEdit: FC<AssignmentEditProps> = ({ onUpdate = noop }) => {
	const { tText, tHtml } = useTranslation();
	const location = useLocation();
	const navigateFunc = useNavigate();

	const { id: assignmentId, tabId } = useParams<{ id: string; tabId: string }>();

	const commonUser = useAtomValue(commonUserAtom);

	// Data
	const [tab, setTab] = useState<ASSIGNMENT_CREATE_UPDATE_TABS>(
		ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT
	);
	const [originalAssignment, setOriginalAssignment] = useState<Avo.Assignment.Assignment | null>(
		null
	);
	const [isAssignmentLoading, setIsAssignmentLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [assignmentError, setAssignmentError] = useState<Partial<ErrorViewQueryParams> | null>(
		null
	);
	const [assignmentFormValues, setAssignmentFormValues] =
		useState<Partial<AssignmentFields> | null>(null);
	const [formErrors, setFormErrors] = useState<Partial<Record<keyof AssignmentFields, string>>>(
		{}
	);

	const [contributors, setContributors] = useState<Avo.Assignment.Contributor[]>();
	const [bookmarkViewCounts, setBookmarkViewCounts] = useState<BookmarkViewPlayCounts>(
		DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS
	);

	const assignment = assignmentFormValues as unknown as Avo.Assignment.Assignment & {
		marcom_note?: MarcomNoteInfo;
	};

	const [assignmentHasResponses, setAssignmentHasResponses] = useState<boolean>();
	const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
	const [isSelectEducationLevelModalOpen, setSelectEducationLevelModalOpen] =
		useEducationLevelModal(commonUser, assignment, isAssignmentLoading);
	const [isForcedExit, setIsForcedExit] = useState<boolean>(false);
	const [permissions, setPermissions] = useState<
		Partial<{
			canEdit: boolean;
			canPublish: boolean;
			canFetchBookmarkAndViewCounts: boolean;
		}>
	>({});
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
	const { data: bundlesContainingAssignment } = useGetCollectionsOrBundlesContainingFragment(
		assignmentId as string,
		BundleSortProp.title,
		OrderDirection.asc,
		{ enabled: !!assignmentId && !!assignment }
	);

	// Computed
	const isCreatingAssignment = !assignmentId;
	const isPublic = assignment?.is_public || false;

	const fetchContributors = useCallback(async () => {
		if (!assignmentId) {
			return;
		}
		const response = await AssignmentService.fetchContributorsByAssignmentId(assignmentId);
		setContributors((response || []) as Avo.Assignment.Contributor[]);
	}, [assignmentId]);

	const updateBlocksInAssignmentState = (newBlocks: Avo.Core.BlockItemBase[]) => {
		setAssignmentFormValues({
			...assignmentFormValues,
			blocks: newBlocks as Avo.Assignment.Block[],
		});
		setHasUnsavedChanges(true);
	};

	const setBlock = useAssignmentBlockChangeHandler(
		assignment?.blocks || [],
		updateBlocksInAssignmentState
	);

	const resetForm = useCallback(() => {
		if (!originalAssignment) {
			return;
		}
		setFormErrors({});
		setAssignmentFormValues(originalAssignment as any);
		setHasUnsavedChanges(false);
	}, [originalAssignment]);

	const releaseAssignmentEditStatus = useCallback(async () => {
		try {
			if (!assignmentId) {
				return;
			}
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
	}, [assignmentId, tHtml]);

	const updateAssignmentEditor = useCallback(async () => {
		try {
			if (!assignmentId) {
				return;
			}
			await AssignmentService.updateAssignmentEditor(assignmentId);
		} catch (err) {
			redirectToClientPage(
				buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, { id: assignmentId }),
				navigateFunc
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
	}, [assignmentId, releaseAssignmentEditStatus, tHtml, navigateFunc]);

	const updateAssignmentEditorWithLoading = useCallback(async () => {
		setIsAssignmentLoading(true);
		await updateAssignmentEditor();
	}, [updateAssignmentEditor]);

	useEffect(() => {
		if (tabId) {
			setTab(tabId as ASSIGNMENT_CREATE_UPDATE_TABS);
		}
	}, [tabId]);

	useEffect(() => {
		if (!isCreatingAssignment) {
			updateAssignmentEditorWithLoading();
		}
	}, [isCreatingAssignment, updateAssignmentEditorWithLoading]);

	useEffect(() => {
		if (!isCreatingAssignment) {
			fetchContributors();
		}
	}, [fetchContributors, isCreatingAssignment]);

	// UI
	useWarningBeforeUnload({
		when: hasUnsavedChanges && !isForcedExit,
	});

	const [isViewAsPupilEnabled, setIsViewAsPupilEnabled] = useState<boolean>(false);
	const [isConfirmSaveActionModalOpen, setIsConfirmSaveActionModalOpen] =
		useState<boolean>(false);

	const pastDeadline = useAssignmentPastDeadline(originalAssignment);

	// HTTP

	// Get query string variables and fetch the existing object
	const fetchAssignment = useCallback(async () => {
		try {
			if (!assignmentId) {
				return;
			}
			setIsAssignmentLoading(true);
			setAssignmentError(null);
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
				tempAssignment = await AssignmentService.fetchAssignmentById(assignmentId);
			} catch (err) {
				if (JSON.stringify(err).includes(NO_RIGHTS_ERROR_MESSAGE)) {
					setAssignmentError({
						message: tHtml(
							'assignment/views/assignment-edit___je-hebt-geen-rechten-om-deze-opdracht-te-bewerken'
						),
						icon: IconName.lock,
						actionButtons: ['home'],
					});
					setIsAssignmentLoading(false);
					return;
				}
				setAssignmentError({
					message: tHtml(
						'assignment/views/assignment-edit___het-ophalen-van-de-opdracht-is-mislukt'
					),
					icon: IconName.alertTriangle,
					actionButtons: ['home'],
				});
				setIsAssignmentLoading(false);
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
				setIsAssignmentLoading(false);
				return;
			}

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
					canFetchBookmarkAndViewCounts: [
						PermissionName.VIEW_ANY_PUBLISHED_ASSIGNMENTS,
						PermissionName.VIEW_ANY_UNPUBLISHED_ASSIGNMENTS,
						PermissionName.EDIT_OWN_ASSIGNMENTS,
						PermissionName.EDIT_ANY_ASSIGNMENTS,
					],
				},
				commonUser
			);

			const allPermissions = {
				canPublish: checkedPermissions.canPublish,
				canEdit:
					isUserAssignmentOwner(commonUser, tempAssignment) ||
					isUserAssignmentContributor(commonUser, tempAssignment) ||
					checkedPermissions.canEditAllAssignments,
				canFetchBookmarkAndViewCounts: checkedPermissions.canFetchBookmarkAndViewCounts,
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
				setIsAssignmentLoading(false);
				return;
			}

			if (checkedPermissions?.canFetchBookmarkAndViewCounts && !!assignment) {
				try {
					setBookmarkViewCounts(
						await BookmarksViewsPlaysService.getAssignmentCounts(
							assignmentId,
							commonUser
						)
					);
				} catch (err) {
					console.error(
						new CustomError('Failed to get getAssignmentCounts', err, {
							uuid: assignmentId,
						})
					);
					ToastService.danger(
						tHtml(
							'assignment/views/assignment-detail___het-ophalen-van-het-aantal-keer-bekeken-gebookmarked-is-mislukt'
						)
					);
				}
			}

			setOriginalAssignment(tempAssignment);
			setAssignmentFormValues(tempAssignment as any);
			setAssignmentHasResponses((tempAssignment.responses?.length || 0) > 0);
			setHasUnsavedChanges(false);
		} catch (err) {
			setAssignmentError({
				message: tHtml(
					'assignment/views/assignment-edit___het-ophalen-aanmaken-van-de-opdracht-is-mislukt'
				),
				icon: IconName.alertTriangle,
			});
		}
		setIsAssignmentLoading(false);
	}, [assignmentId, commonUser, setAssignmentFormValues, tHtml]);

	// Events

	const handleOnSave = async () => {
		if (!commonUser?.profileId || (!originalAssignment && !isCreatingAssignment)) {
			return;
		}
		setIsSaving(true);

		if (assignment?.deadline_at && isPast(new Date(assignment?.deadline_at))) {
			ToastService.danger(
				tHtml(
					'assignment/views/assignment-edit___de-deadline-mag-niet-in-het-verleden-liggen'
				)
			);
			setIsSaving(false);
			return;
		}

		if (isDeadlineBeforeAvailableAt(assignment?.available_at, assignment?.deadline_at)) {
			ToastService.danger(
				tHtml(
					'assignment/views/assignment-edit___de-beschikbaar-vanaf-datum-moet-voor-de-deadline-liggen-anders-zullen-je-leerlingen-geen-toegang-hebben-tot-deze-opdracht'
				)
			);
			setIsSaving(false);
			return;
		}

		if (
			assignment?.deadline_at &&
			isAfter(new Date(assignment.deadline_at), endOfAcademicYear())
		) {
			ToastService.danger(
				tHtml('assignment/views/assignment-edit___de-deadline-moet-voor-31-augustus-liggen')
			);
			setIsSaving(false);
			return;
		}

		if (assignmentHasResponses) {
			setIsConfirmSaveActionModalOpen(true);
			setIsSaving(false);
			return;
		}

		if ((assignment?.description?.length || 0) > 300) {
			ToastService.danger(
				tHtml(
					'assignment/views/assignment-edit___de-korte-beschrijving-in-de-publicatie-details-mag-niet-langer-zijn-dan-300-tekens'
				)
			);
			setIsSaving(false);
			return;
		}

		await saveAssignment();
		setIsSaving(false);
	};

	const saveAssignment = async () => {
		try {
			if (!assignmentId) {
				return;
			}
			setIsSaving(true);
			if (isCreatingAssignment) {
				// Create assignment
				if (!commonUser?.profileId) {
					ToastService.danger(
						tText(
							'assignment/views/assignment-create___je-moet-ingelogd-zijn-om-een-opdracht-te-kunnen-aanmaken'
						)
					);
					setIsSaving(false);
					return;
				}

				const marcomNote = ((assignment as any).marcom_note || '') as string;
				delete (assignment as any).marcom_note;
				AssignmentService.insertOrUpdateMarcomNote(assignmentId, marcomNote); // Do not wait for note to be updated

				const created = await AssignmentService.insertAssignment(
					{
						...assignment,
						blocks: cleanupTitleAndDescriptions(
							assignment?.blocks || []
						) as Avo.Assignment.Block[],
						owner_profile_id: commonUser?.profileId,
					} as Partial<Avo.Assignment.Assignment>,
					commonUser
				);

				if (created) {
					trackEvents(
						{
							object: String(created.id),
							object_type: 'assignment',
							action: 'create',
							resource: created.education_level_id
								? {
										education_level: created.education_level_id,
								  }
								: {},
						},
						commonUser
					);

					ToastService.success(
						tHtml(
							'assignment/views/assignment-create___de-opdracht-is-succesvol-aangemaakt-je-vindt-deze-in-je-werkruimte'
						)
					);

					resetForm();
					setIsSaving(false);
					setHasUnsavedChanges(false);

					// Delay navigation, until isDirty state becomes false, otherwise the "unsaved changes" modal will popup
					setTimeout(() => {
						navigate(navigateFunc, APP_PATH.ASSIGNMENT_DETAIL.route, {
							id: created.id,
						});
					}, 100);
				}
			} else {
				// Update assignment
				if (!commonUser?.profileId || !originalAssignment || !assignment) {
					setIsSaving(false);
					return;
				}

				if (assignment.is_public) {
					const validationErrors =
						await getValidationErrorsForPublishAssignment(assignment);
					if (validationErrors && validationErrors.length) {
						ToastService.danger(validationErrors);
						setIsSaving(false);
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
					commonUser?.profileId
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
								(originalAssignment.contributors ||
									[]) as Avo.Assignment.Contributor[]
						  ).toLowerCase();
					trackEvents(
						{
							object: String(assignment.id),
							object_type: 'assignment',
							action: 'edit',
							resource: {
								is_public: assignment.is_public || false,
								role: contributorType,
								education_level: String(assignment?.education_level_id),
							},
						},
						commonUser
					);

					// Re-fetch
					await fetchAssignment();
					await fetchContributors();

					ToastService.success(
						tHtml(
							'assignment/views/assignment-edit___de-opdracht-is-succesvol-aangepast'
						)
					);

					setHasUnsavedChanges(false);
				}

				setIsSaving(false);
			}
		} catch (err) {
			console.error(err);
			ToastService.danger(
				tHtml('assignment/views/assignment-edit___het-opslaan-van-de-opdracht-is-mislukt')
			);
		}
	};

	const reset = useCallback(() => {
		originalAssignment && setAssignmentFormValues(originalAssignment as any);
		resetForm();
	}, [resetForm, setAssignmentFormValues, originalAssignment]);

	const selectEducationLevel = useCallback(
		(lom: Avo.Lom.LomField) => {
			if (!assignment) return;
			setSelectEducationLevelModalOpen(false);
			setHasUnsavedChanges(true);
			assignment.education_level_id = lom.id;
		},
		[assignment, setSelectEducationLevelModalOpen]
	);

	const handleAssignmentFieldUpdate = useCallback(
		(newAssignment: Partial<Avo.Assignment.Assignment> | Partial<AssignmentFields>) => {
			setAssignmentFormValues(newAssignment as unknown as Partial<AssignmentFields>);
			setHasUnsavedChanges(true);
		},
		[setAssignmentFormValues]
	);

	const onForcedExitPage = async () => {
		setIsForcedExit(true);
		try {
			if (!commonUser?.profileId || !originalAssignment) {
				return;
			}

			await AssignmentService.updateAssignment(
				{
					...originalAssignment,
					...assignment,
					id: originalAssignment.id,
				},
				commonUser?.profileId
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
			navigateFunc
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
				responses: originalAssignment?.responses || [],
			},
			addCollectionConfig: {
				addCollectionCallback: (id: string) => {
					// Track import collection into assignment event
					trackEvents(
						{
							object: assignment?.id || '',
							object_type: 'assignment',
							action: 'add',
							resource: {
								id,
								type: 'collection',
								education_level: String(assignment?.education_level_id),
							},
						},
						commonUser
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

					handleAssignmentFieldUpdate({
						...assignmentFormValues,
						blocks,
					});
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

					handleAssignmentFieldUpdate({
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

	const renderContributors = useMemo(() => {
		if (!assignment) {
			return null;
		}
		if (isCreatingAssignment) {
			return null;
		}
		return (
			<Flex align="start">
				<HeaderOwnerAndContributors subject={assignment} />
			</Flex>
		);
	}, [assignment]);

	const renderMeta = useMemo(() => {
		const bookmarks = String(bookmarkViewCounts.bookmarkCount || 0);
		const views = String(bookmarkViewCounts.viewCount || 0);
		const label =
			GET_EDUCATION_LEVEL_DICT()[assignment?.education_level_id as EducationLevelId];
		const tooltip =
			GET_EDUCATION_LEVEL_TOOLTIP_DICT()[assignment?.education_level_id as EducationLevelId];

		return (
			<MetaData spaced={true} category="assignment">
				<MetaDataItem>
					<HeaderContentType
						category="assignment"
						label={tText('admin/shared/constants/index___opdracht')}
					/>
				</MetaDataItem>
				{views && <MetaDataItem icon={IconName.eye} label={views} />}
				{bookmarks && <MetaDataItem icon={IconName.bookmark} label={bookmarks} />}
				<Tooltip position="top">
					<TooltipTrigger>
						<MetaDataItem icon={IconName.userStudent}>
							<Icon name={IconName.userStudent} />

							{label}
						</MetaDataItem>
					</TooltipTrigger>

					<TooltipContent>{tooltip}</TooltipContent>
				</Tooltip>
			</MetaData>
		);
	}, [bookmarkViewCounts, tText, assignment]);

	const renderAssignmentBlocks = () => {
		if (!assignment?.blocks?.length) {
			return (
				<>
					{renderedListSorter}
					<EmptyStateMessage
						title={tText(
							'assignment/views/assignment-edit___hulp-nodig-bij-het-maken-van-opdrachten-titel'
						)}
						message={tHtml(
							'assignment/views/assignment-edit___hulp-nodig-bij-het-maken-van-opdrachten-beschrijving'
						)}
					/>
				</>
			);
		}

		return (
			<>
				{!pastDeadline && (
					<Spacer
						margin={['bottom-large']}
						className="c-assignment-page__reorder-container"
					>
						{draggableListButton}
					</Spacer>
				)}
				{renderedListSorter}
			</>
		);
	};

	const renderedTabContent = useMemo(() => {
		switch (tab) {
			case ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT:
				if (pastDeadline) {
					return <BlockList blocks={assignment?.blocks || []} />;
				}
				return <div className="c-assignment-contents-tab">{renderAssignmentBlocks()}</div>;

			case ASSIGNMENT_CREATE_UPDATE_TABS.DETAILS:
				if (pastDeadline) {
					if (!assignment) {
						if (!assignment) {
							return <FullPageSpinner />;
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
							assignment={assignmentFormValues || {}}
							setAssignment={handleAssignmentFieldUpdate}
						/>
					</div>
				);

			case ASSIGNMENT_CREATE_UPDATE_TABS.PUBLISH:
				return (
					<div className="c-assignment-details-tab">
						<AssignmentMetaDataFormEditable
							assignment={assignment as Avo.Assignment.Assignment}
							setAssignment={handleAssignmentFieldUpdate}
							onFocus={() => setHasUnsavedChanges(true)}
						/>
					</div>
				);

			case ASSIGNMENT_CREATE_UPDATE_TABS.CLICKS:
				return <AssignmentResponses onUpdate={onUpdate} />;

			case ASSIGNMENT_CREATE_UPDATE_TABS.ADMIN:
				return (
					<AssignmentAdminFormEditable
						assignment={assignment}
						setAssignment={handleAssignmentFieldUpdate}
					/>
				);

			case ASSIGNMENT_CREATE_UPDATE_TABS.MARCOM:
				return (
					<AssignmentEditMarcom
						assignment={assignment}
						setAssignment={handleAssignmentFieldUpdate}
					/>
				);

			default:
				return tab;
		}
	}, [
		tab,
		renderedListSorter,
		draggableListButton,
		assignment,
		pastDeadline,
		onUpdate,
		handleAssignmentFieldUpdate,
		assignmentFormValues,
	]);

	// Effects

	// Fetch initial data
	useEffect(() => {
		if (isCreatingAssignment) {
			setAssignmentFormValues(ASSIGNMENT_FORM_DEFAULT());
			setIsAssignmentLoading(false);
		} else {
			fetchAssignment();
		}
	}, [fetchAssignment, isCreatingAssignment]);

	// Reset the form when the original changes
	useEffect(() => {
		originalAssignment && reset();
	}, [originalAssignment, reset]);

	useEffect(() => {
		resetForm();
	}, [originalAssignment, resetForm]);

	const handleTabChange = (tabId: ASSIGNMENT_CREATE_UPDATE_TABS) => {
		setTab(tabId);

		if (assignmentId) {
			navigate(
				navigateFunc,
				APP_PATH.ASSIGNMENT_EDIT_TAB.route,
				{ id: assignmentId, tabId: tabId },
				undefined,
				'replace'
			);
		}
	};

	const handleDuplicateAssignment = async () => {
		const duplicatedAssignment = await duplicateAssignment(originalAssignment, commonUser);
		if (duplicatedAssignment) {
			navigate(navigateFunc, APP_PATH.ASSIGNMENT_DETAIL.route, {
				id: duplicatedAssignment.id,
				tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT,
			});
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
				isCreating={isCreatingAssignment}
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
				onDuplicate={handleDuplicateAssignment}
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
							navigateFunc
						),
				}}
				preview={{ onClick: () => setIsViewAsPupilEnabled(true) }}
				shareWithColleaguesOrPupilsProps={shareProps}
				remove={{
					assignment: originalAssignment || undefined,
					modal: {
						confirmCallback: () => {
							reset();
							redirectToClientPage(backToOverview(), navigateFunc);
						},
					},
				}}
				refetchAssignment={async () => await fetchAssignment()}
				route={location.pathname}
				assignment={assignment}
			/>
		);
	};

	const renderEditAssignmentPage = () => (
		<>
			<div className="c-assignment-page c-assignment-page--edit c-sticky-bar__wrapper">
				<div>
					<AssignmentHeading
						back={renderBackButton}
						title={
							<div className="u-spacer-top-l">
								{renderMeta}
								<div className="u-spacer-top-s">
									<AssignmentTitle
										value={assignmentFormValues?.title || ''}
										error={formErrors.title || null}
										onChange={(newTitle: string) => {
											handleAssignmentFieldUpdate({
												...assignmentFormValues,
												title: newTitle,
											});
										}}
									/>
								</div>
							</div>
						}
						actions={renderHeadingActions(false)}
						info={renderContributors}
						tabs={
							<AssignmentTeacherTabs
								activeTab={tab}
								onTabChange={handleTabChange}
								clicksCount={originalAssignment?.responses?.length ?? 0}
								isManaged={(assignment as any)?.is_managed || false} // TODO remove any after update typings to v3.0.20
							/>
						}
						{...(isSelectEducationLevelModalOpen || isMobileWidth()
							? { tour: null }
							: {})}
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
							hasResponses={assignmentHasResponses}
							modal={{
								isOpen: isConfirmSaveActionModalOpen,
								onClose: () => setIsConfirmSaveActionModalOpen(false),
								confirmCallback: async () => {
									setIsConfirmSaveActionModalOpen(false);
									await saveAssignment();
								},
							}}
						/>

						{!isCreatingAssignment && (
							<InActivityWarningModal
								onActivity={updateAssignmentEditor}
								onExit={releaseAssignmentEditStatus}
								warningMessage={tHtml(
									'assignment/views/assignment-edit___door-inactiviteit-zal-de-opdracht-zichzelf-sluiten'
								)}
								currentPath={location.pathname}
								editPath={APP_PATH.ASSIGNMENT_EDIT_TAB.route}
								onForcedExit={onForcedExitPage}
							/>
						)}
					</Container>
				</div>

				{/* Must always be the second and last element inside the c-sticky-bar__wrapper */}
				<StickySaveBar
					isVisible={hasUnsavedChanges}
					onSave={handleOnSave}
					onCancel={cancelSaveBar}
					isSaving={isSaving}
				/>
			</div>
			{!!commonUser && (
				<SelectEducationLevelModal
					isOpen={isSelectEducationLevelModalOpen}
					onConfirm={selectEducationLevel}
					className="c-select-education-level--edit"
				/>
			)}
		</>
	);

	const renderPageContent = () => {
		if (isAssignmentLoading && !originalAssignment) {
			return <FullPageSpinner />;
		}
		if (assignmentError) {
			return <ErrorView {...assignmentError} />;
		}

		if (
			assignment?.id &&
			!isUserAssignmentOwner(commonUser, assignment) &&
			!isUserAssignmentContributor(commonUser, assignment) &&
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

	if (matchPath(location.pathname, APP_PATH.ASSIGNMENT_EDIT.route)) {
		return (
			<Navigate
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
					{isCreatingAssignment
						? GENERATE_SITE_TITLE(
								tText(
									'assignment/views/assignment-create___maak-opdracht-pagina-titel'
								)
						  )
						: GENERATE_SITE_TITLE(
								tText(
									'assignment/views/assignment-edit___bewerk-opdracht-pagina-titel'
								)
						  )}
				</title>

				<meta
					name="description"
					content={
						isCreatingAssignment
							? tText(
									'assignment/views/assignment-create___maak-opdracht-pagina-beschrijving'
							  )
							: tText(
									'assignment/views/assignment-edit___bewerk-opdracht-pagina-beschrijving'
							  )
					}
				/>
			</Helmet>

			{renderPageContent()}

			<BeforeUnloadPrompt when={hasUnsavedChanges && !isForcedExit} />

			{!!assignment && !!commonUser && (
				<PublishAssignmentModal
					onClose={(newAssignment: Avo.Assignment.Assignment | undefined) => {
						setIsPublishModalOpen(false);
						if (newAssignment) {
							setAssignmentFormValues(newAssignment as any);
						}
					}}
					isOpen={isPublishModalOpen}
					assignment={assignment as Avo.Assignment.Assignment}
					parentBundles={bundlesContainingAssignment}
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
								onAddNewContributor(info, shareProps, fetchContributors, commonUser)
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
							assignment={assignment}
						/>
					),
					desktop: null,
				})}
		</>
	);
};
