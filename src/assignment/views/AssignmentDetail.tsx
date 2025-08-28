import './AssignmentDetail.scss';
import { OrderDirection } from '@meemoo/react-components';
import {
	Button,
	ButtonToolbar,
	Column,
	Container,
	Flex,
	Grid,
	Header,
	HeaderBottomRowLeft,
	HeaderBottomRowRight,
	HeaderMiddleRowRight,
	HeaderTopRowLeft,
	Icon,
	IconName,
	isUuid,
	MetaData,
	MetaDataItem,
	MoreOptionsDropdown,
	Spacer,
	Spinner,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { noop } from 'lodash-es';
import React, { type FC, type ReactText, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { generatePath } from 'react-router';
import { Link } from 'react-router-dom';
import { BooleanParam, StringParam, useQueryParam, useQueryParams } from 'use-query-params';

import { type DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects/redirect-to-client-page';
import { renderRelatedItems } from '../../collection/collection.helpers';
import { CollectionFragmentType, type Relation } from '../../collection/collection.types';
import AddToBundleModal from '../../collection/components/modals/AddToBundleModal';
import {
	BundleSortProp,
	useGetCollectionsOrBundlesContainingFragment,
} from '../../collection/hooks/useGetCollectionsOrBundlesContainingFragment';
import { QUERY_PARAM_SHOW_PUBLISH_MODAL } from '../../collection/views/CollectionDetail.const';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorNoAccess } from '../../error/components';
import ErrorView, { type ErrorViewQueryParams } from '../../error/views/ErrorView';
import { ALL_SEARCH_FILTERS, type SearchFilter } from '../../search/search.const';
import BlockList from '../../shared/components/BlockList/BlockList';
import CommonMetaData from '../../shared/components/CommonMetaData/CommonMetaData';
import EditButton from '../../shared/components/EditButton/EditButton';
import HeaderOwnerAndContributors from '../../shared/components/HeaderOwnerAndContributors/HeaderOwnerAndContributors';
import InteractiveTour from '../../shared/components/InteractiveTour/InteractiveTour';
import MoreOptionsDropdownWrapper from '../../shared/components/MoreOptionsDropdownWrapper/MoreOptionsDropdownWrapper';
import ShareDropdown from '../../shared/components/ShareDropdown/ShareDropdown';
import ShareModal from '../../shared/components/ShareModal/ShareModal';
import { ContributorInfoRight } from '../../shared/components/ShareWithColleagues/ShareWithColleagues.types';
import { type ShareWithPupilsProps } from '../../shared/components/ShareWithPupils/ShareWithPupils';
import { StickyBar } from '../../shared/components/StickyBar/StickyBar';
import { EDIT_STATUS_REFETCH_TIME, getMoreOptionsLabel } from '../../shared/constants';
import { buildLink } from '../../shared/helpers/build-link';
import { transformContributorsToSimpleContributors } from '../../shared/helpers/contributors';
import { CustomError } from '../../shared/helpers/custom-error';
import { defaultRenderBookmarkButton } from '../../shared/helpers/default-render-bookmark-button';
import { defaultRenderDetailLink } from '../../shared/helpers/default-render-detail-link';
import { defaultRenderSearchLink } from '../../shared/helpers/default-render-search-link';
import { createDropdownMenuItem } from '../../shared/helpers/dropdown';
import { navigate } from '../../shared/helpers/link';
import { type EducationLevelId } from '../../shared/helpers/lom';
import { isMobileWidth } from '../../shared/helpers/media-query';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import {
	BookmarksViewsPlaysService,
	DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS,
} from '../../shared/services/bookmarks-views-plays-service';
import { type BookmarkViewPlayCounts } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { trackEvents } from '../../shared/services/event-logging-service';
import {
	getRelatedItems,
	ObjectTypes,
	ObjectTypesAll,
} from '../../shared/services/related-items-service';
import { ToastService } from '../../shared/services/toast-service';
import {
	ASSIGNMENT_CREATE_UPDATE_TABS,
	GET_EDUCATION_LEVEL_DICT,
	GET_EDUCATION_LEVEL_TOOLTIP_DICT,
} from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import { AssignmentAction, AssignmentType } from '../assignment.types';
import {
	onAddNewContributor,
	onDeleteContributor,
	onEditContributor,
} from '../helpers/assignment-share-with-collegue-handlers';
import { deleteAssignment, deleteSelfFromAssignment } from '../helpers/delete-assignment';
import { duplicateAssignment } from '../helpers/duplicate-assignment';
import { toAssignmentDetail } from '../helpers/links';
import { useGetAssignmentsEditStatuses } from '../hooks/useGetAssignmentsEditStatuses';
import DeleteAssignmentModal from '../modals/DeleteAssignmentModal';
import PublishAssignmentModal from '../modals/PublishAssignmentModal';

type AssignmentDetailPermissions = Partial<{
	canCreateAssignments: boolean;
	canEditAssignments: boolean;
	canPublishAssignments: boolean;
	canDeleteAnyAssignments: boolean;
	canEditBundles: boolean;
}>;

type AssignmentDetailProps = {
	id?: string; // Item id when component needs to be used inside another component and the id cannot come from the url (match.params.id)
	enabledMetaData: SearchFilter[];
};

const AssignmentDetail: FC<
	AssignmentDetailProps & DefaultSecureRouteProps<{ id: string }> & UserProps
> = ({ match, commonUser, history, enabledMetaData = ALL_SEARCH_FILTERS }) => {
	const { tText, tHtml } = useTranslation();
	const assignmentId = match.params.id;

	// Data
	const [assignment, setAssignment] = useState<Avo.Assignment.Assignment | null>(null);
	const [permissions, setPermissions] = useState<AssignmentDetailPermissions | null>(null);
	const [relatedAssignments, setRelatedAssignments] = useState<Avo.Search.ResultItem[] | null>(
		null
	);
	const [bookmarkViewCounts, setBookmarkViewCounts] = useState<BookmarkViewPlayCounts>(
		DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS
	);
	const { data: editStatuses } = useGetAssignmentsEditStatuses([assignmentId], {
		enabled: !!permissions?.canEditAssignments,
		refetchInterval: EDIT_STATUS_REFETCH_TIME,
		refetchIntervalInBackground: true,
	});

	const { data: bundlesContainingAssignment, refetch: refetchBundlesContainingAssignment } =
		useGetCollectionsOrBundlesContainingFragment(
			assignmentId,
			BundleSortProp.title,
			OrderDirection.asc,
			{ enabled: !!assignment }
		);

	// Errors
	const [isForbidden, setIsForbidden] = useState<boolean>(false);
	const [assignmentLoading, setAssignmentLoading] = useState(false);
	const [assignmentError, setAssignmentError] = useState<Partial<ErrorViewQueryParams> | null>(
		null
	);

	// Modals
	const [isPublishModalOpen, setIsPublishModalOpen] = useQueryParam(
		QUERY_PARAM_SHOW_PUBLISH_MODAL,
		BooleanParam
	);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
	const [isAddToBundleModalOpen, setIsAddToBundleModalOpen] = useState<boolean>(false);

	const [query, setQuery] = useQueryParams({ inviteToken: StringParam });
	const { inviteToken } = query;

	// Computed
	const isPublic = assignment?.is_public || false;
	const isContributor = !!assignment?.contributors?.find(
		(contributor) => contributor.profile_id && contributor.profile_id === commonUser?.profileId
	);
	const isEditContributor = !!assignment?.contributors?.find(
		(contributor) =>
			contributor.profile_id &&
			contributor.profile_id === commonUser?.profileId &&
			contributor.rights === (ContributorInfoRight.CONTRIBUTOR as Avo.Share.Rights)
	);
	const isOwner =
		!!assignment?.owner_profile_id && assignment?.owner_profile_id === commonUser?.profileId;
	const hasDeleteRightsForAllAssignments =
		commonUser?.permissions?.includes(PermissionName.DELETE_ANY_ASSIGNMENTS) || false;
	const shouldDeleteSelfFromAssignment = isContributor && !hasDeleteRightsForAllAssignments;

	const isBeingEdited =
		editStatuses &&
		!!editStatuses[assignmentId] &&
		editStatuses[assignmentId]?.editingUserId !== commonUser?.profileId;

	const shareWithPupilsProps: ShareWithPupilsProps = {
		assignment: assignment || undefined, // Needs to be saved before you can share
		onContentLinkClicked: () =>
			navigate(history, APP_PATH.ASSIGNMENT_EDIT_TAB.route, {
				id: assignmentId,
				tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT,
			}),
		onDetailLinkClicked: () =>
			navigate(history, APP_PATH.ASSIGNMENT_EDIT_TAB.route, {
				id: assignmentId,
				tabId: ASSIGNMENT_CREATE_UPDATE_TABS.DETAILS,
			}),
	};

	const getPermissions = useCallback(
		async (
			commonUser: Avo.User.CommonUser | undefined,
			assignment: Avo.Assignment.Assignment
		): Promise<AssignmentDetailPermissions> => {
			if (!commonUser || !assignment) {
				return {};
			}

			// Fetch all permissions in parallel
			return await PermissionService.checkPermissions(
				{
					canCreateAssignments: [{ name: PermissionName.CREATE_ASSIGNMENTS }],

					canEditAssignments: [
						{ name: PermissionName.EDIT_OWN_ASSIGNMENTS, obj: assignment },
						{ name: PermissionName.EDIT_ANY_ASSIGNMENTS },
					],
					canPublishAssignments: [
						{ name: PermissionName.PUBLISH_OWN_ASSIGNMENTS, obj: assignment },
						{ name: PermissionName.PUBLISH_ANY_ASSIGNMENTS },
					],

					canDeleteAnyAssignments: [{ name: PermissionName.DELETE_ANY_ASSIGNMENTS }],
					canEditBundles: [
						{ name: PermissionName.EDIT_OWN_BUNDLES },
						{ name: PermissionName.EDIT_ANY_BUNDLES },
					],
				},
				commonUser
			);
		},
		[]
	);

	const getRelatedAssignments = useCallback(async () => {
		try {
			if (isUuid(assignmentId)) {
				setRelatedAssignments(
					await getRelatedItems(
						assignmentId,
						ObjectTypes.assignments,
						ObjectTypesAll.all,
						4
					)
				);
			}
		} catch (err) {
			console.error('Failed to get related items', err, {
				id: assignmentId,
				index: 'assignments',
				limit: 4,
			});

			ToastService.danger(
				tHtml(
					'assignment/views/assignment-detail___het-ophalen-van-de-gerelateerde-opdrachten-is-mislukt'
				)
			);
		}
	}, [assignmentId, tHtml]);

	const fetchAssignment = useCallback(async () => {
		try {
			setAssignmentLoading(true);
			setAssignmentError(null);

			if (
				!commonUser?.permissions?.includes(PermissionName.VIEW_ANY_PUBLISHED_ASSIGNMENTS) &&
				!commonUser?.permissions?.includes(PermissionName.VIEW_ANY_UNPUBLISHED_ASSIGNMENTS)
			) {
				// User cannot edit assignments => redirect to error
				setAssignmentError({
					message: tHtml(
						'assignment/views/assignment-detail___je-hebt-geen-rechten-om-deze-opdracht-te-bekijken-ben-je-een-leerling-dan-heeft-je-lesgever-de-verkeerde-link-gedeeld'
					),
					icon: IconName.lock,
					actionButtons: ['home'],
				});
			}

			let tempAssignment: Avo.Assignment.Assignment | null = null;

			try {
				tempAssignment = await AssignmentService.fetchAssignmentById(
					assignmentId,
					inviteToken || undefined
				);
			} catch (err: any) {
				if (err.innerException.additionalInfo?.statusCode === 403) {
					setIsForbidden(true);
				} else {
					setAssignmentError({
						message:
							err.innerException.additionalInfo?.statusCode === 403
								? tHtml(
										'assignment/views/assignment-detail___je-hebt-geen-rechten-om-deze-pagina-te'
								  )
								: tHtml(
										'assignment/views/assignment-edit___het-ophalen-van-de-opdracht-is-mislukt'
								  ),
						icon: IconName.alertTriangle,
						actionButtons: ['home'],
					});
				}

				setAssignmentLoading(false);
				return;
			}

			if (!tempAssignment) {
				setAssignmentError({
					message: tHtml(
						'assignment/views/assignment-detail___het-ophalen-van-de-opdracht-is-mislukt'
					),
					icon: IconName.alertTriangle,
					actionButtons: ['home'],
				});
				setAssignmentLoading(false);
				return;
			}

			setAssignment(tempAssignment as any);

			await getRelatedAssignments();

			try {
				const permissionObj = await getPermissions(commonUser, tempAssignment);
				setPermissions(permissionObj);
			} catch (err) {
				setAssignmentError({
					message: tHtml(
						'assignment/views/assignment-detail___ophalen-van-permissies-is-mislukt'
					),
					icon: IconName.alertTriangle,
					actionButtons: ['home'],
				});
				setAssignmentLoading(false);

				return;
			}
		} catch (err) {
			setAssignmentError({
				message: tHtml(
					'assignment/views/assignment-detail___het-ophalen-van-de-opdracht-is-mislukt'
				),
				icon: IconName.alertTriangle,
			});
		}

		setAssignmentLoading(false);
	}, [commonUser, getRelatedAssignments, tHtml, assignmentId, inviteToken, getPermissions]);

	const fetchContributors = useCallback(async () => {
		if (!assignmentId || !assignment) {
			return;
		}
		const response = await AssignmentService.fetchContributorsByAssignmentId(assignmentId);

		setAssignment({
			...assignment,
			contributors: (response || []) as Avo.Assignment.Contributor[],
		});
	}, [assignment, assignmentId]);

	const triggerEvents = useCallback(async () => {
		// Do not trigger events when a search engine loads this page
		if (!assignment || !commonUser) {
			return;
		}

		BookmarksViewsPlaysService.action('view', 'assignment', assignment.id, commonUser).then(
			noop
		);
		trackEvents(
			{
				object: assignment?.id,
				object_type: 'avo_assignment',
				action: 'view',
				resource: {
					is_public: assignment?.is_public || false,
					education_level: String(assignment?.education_level_id),
				},
			},
			commonUser
		);

		if (
			PermissionService.hasAtLeastOnePerm(commonUser, [
				PermissionName.VIEW_ANY_PUBLISHED_ASSIGNMENTS,
				PermissionName.VIEW_ANY_UNPUBLISHED_ASSIGNMENTS,
				PermissionName.EDIT_OWN_ASSIGNMENTS,
				PermissionName.EDIT_ANY_ASSIGNMENTS,
			])
		) {
			try {
				setBookmarkViewCounts(
					await BookmarksViewsPlaysService.getAssignmentCounts(assignment?.id, commonUser)
				);
			} catch (err) {
				console.error(
					new CustomError('Failed to get getAssignmentCounts', err, {
						uuid: assignment?.id,
					})
				);
				ToastService.danger(
					tHtml(
						'assignment/views/assignment-detail___het-ophalen-van-het-aantal-keer-bekeken-gebookmarked-is-mislukt'
					)
				);
			}
		}
	}, [tHtml, assignment, commonUser]);

	// Fetch initial data
	useEffect(() => {
		fetchAssignment().then(noop);
	}, [fetchAssignment]);

	useEffect(() => {
		if (assignment && permissions) {
			triggerEvents().then(noop);
		}
	}, [assignment, permissions, triggerEvents]);

	const toggleBookmark = async () => {
		try {
			if (!commonUser) {
				ToastService.danger(
					tHtml(
						'collection/views/collection-detail___er-was-een-probleem-met-het-controleren-van-de-ingelogde-gebruiker-log-opnieuw-in-en-probeer-opnieuw'
					)
				);
				return;
			}

			if (!assignment) {
				ToastService.danger(
					tHtml(
						'assignment/views/assignment-detail___er-ging-iets-mis-met-het-ophalen-van-de-ophalen-van-de-opdracht'
					)
				);
				return;
			}

			await BookmarksViewsPlaysService.toggleBookmark(
				assignment?.id as string,
				commonUser,
				'assignment',
				bookmarkViewCounts.isBookmarked
			);
			setBookmarkViewCounts({
				...bookmarkViewCounts,
				isBookmarked: !bookmarkViewCounts.isBookmarked,
			});
			ToastService.success(
				bookmarkViewCounts.isBookmarked
					? tHtml('assignment/views/assignment-detail___de-bladwijzer-is-verwijderd')
					: tHtml('assignment/views/assignment-detail___de-bladwijzer-is-aangemaakt')
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to toggle bookmark', err, {
					assignment,
					commonUser,
					type: 'collection',
					isBookmarked: bookmarkViewCounts.isBookmarked,
				})
			);
			ToastService.danger(
				bookmarkViewCounts.isBookmarked
					? tHtml(
							'assignment/views/assignment-detail___het-verwijderen-van-de-bladwijzer-is-mislukt'
					  )
					: tHtml(
							'assignment/views/assignment-detail___het-aanmaken-van-de-bladwijzer-is-mislukt'
					  )
			);
		}
	};

	const onEditAssignment = () => {
		history.push(
			generatePath(APP_PATH.ASSIGNMENT_EDIT_TAB.route, {
				id: assignmentId,
				tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT,
			})
		);
	};

	const onDuplicateAssignment = async (): Promise<void> => {
		const duplicatedAssignment = await duplicateAssignment(assignment, commonUser);
		if (duplicatedAssignment) {
			redirectToClientPage(toAssignmentDetail(duplicatedAssignment), history);
		}
	};

	const onDeleteAssignment = async (): Promise<void> => {
		if (!assignment) return;
		await deleteAssignment(assignment, commonUser, () =>
			history.push(APP_PATH.WORKSPACE_ASSIGNMENTS.route)
		);
	};

	const onDeleteSelfFromAssignment = async (): Promise<void> => {
		await deleteSelfFromAssignment(assignmentId, commonUser, () =>
			history.push(APP_PATH.WORKSPACE_ASSIGNMENTS.route)
		);
	};

	const executeAction = async (item: ReactText) => {
		setIsOptionsMenuOpen(false);
		switch (item) {
			case AssignmentAction.addToBundle:
				await setIsAddToBundleModalOpen(true);
				break;
			case AssignmentAction.duplicate:
				await onDuplicateAssignment();
				break;
			case AssignmentAction.delete:
				setIsDeleteModalOpen(true);
				break;
			case AssignmentAction.openPublishCollectionModal:
			case AssignmentAction.publish:
				setIsPublishModalOpen(true, 'replaceIn');
				break;
			case AssignmentAction.toggleBookmark:
				await toggleBookmark();
				break;
			case AssignmentAction.edit:
				onEditAssignment();
				break;
			case AssignmentAction.share:
				setIsShareModalOpen(true);
				break;

			default:
				console.warn(`An unhandled action "${item}" was executed without a binding.`);
				return null;
		}
	};

	// Render

	const renderAssignmentDropdownOptions = () => {
		const ASSIGNMENT_DROPDOWN_ITEMS = [
			...createDropdownMenuItem(
				assignmentId,
				AssignmentAction.addToBundle,
				tText('assignment/views/assignment-detail___voeg-toe-aan-bundel'),
				IconName.plus,
				!!(
					permissions?.canEditBundles &&
					commonUser.permissions?.includes(PermissionName.ADD_ASSIGNMENT_TO_BUNDLE)
				)
			),
			...createDropdownMenuItem(
				assignmentId,
				AssignmentAction.duplicate,
				tText('collection/views/collection-detail___dupliceer'),
				IconName.copy,
				permissions?.canCreateAssignments || false
			),
			...createDropdownMenuItem(
				assignmentId,
				AssignmentAction.delete,
				permissions?.canDeleteAnyAssignments || isOwner
					? tText('assignment/views/assignment-detail___verwijderen')
					: tText('assignment/views/assignment-detail___verwijder-mij-van-deze-opdracht'),
				undefined,
				permissions?.canDeleteAnyAssignments || isOwner || isContributor || false
			),
		];

		return (
			<MoreOptionsDropdownWrapper
				isOpen={isOptionsMenuOpen}
				onOpen={() => setIsOptionsMenuOpen(true)}
				onClose={() => setIsOptionsMenuOpen(false)}
				label={getMoreOptionsLabel()}
				menuItems={ASSIGNMENT_DROPDOWN_ITEMS}
				onOptionClicked={executeAction}
			/>
		);
	};

	const renderHeaderButtons = () => {
		return (
			<ButtonToolbar>
				{(isOwner || isEditContributor || permissions?.canEditAssignments) &&
					!inviteToken && (
						<ShareDropdown
							contributors={transformContributorsToSimpleContributors(
								shareWithPupilsProps?.assignment?.owner as Avo.User.User,
								(assignment?.contributors || []) as Avo.Assignment.Contributor[]
							)}
							onDeleteContributor={(contributorInfo) =>
								onDeleteContributor(
									contributorInfo,
									shareWithPupilsProps,
									fetchContributors
								)
							}
							onEditContributorRights={(contributorInfo, newRights) =>
								onEditContributor(
									contributorInfo,
									newRights,
									shareWithPupilsProps,
									fetchContributors,
									fetchAssignment
								)
							}
							onAddContributor={(info) =>
								onAddNewContributor(
									info,
									shareWithPupilsProps,
									fetchContributors,
									commonUser
								)
							}
							dropdownProps={{
								placement: 'bottom-end',
							}}
							buttonProps={{
								className: 'c-assignment-heading__hide-on-mobile',
								type: 'secondary',
								title: tText(
									'assignment/components/share-dropdown___deel-de-opdracht-met-leerlingen-of-collegas'
								),
								ariaLabel: tText(
									'assignment/components/share-dropdown___deel-de-opdracht-met-leerlingen-of-collegas'
								),
							}}
							shareWithPupilsProps={shareWithPupilsProps}
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
							assignment={assignment || undefined}
						/>
					)}
				{permissions?.canPublishAssignments && !inviteToken && (
					<Button
						type="secondary"
						title={
							isPublic
								? tText(
										'assignment/views/assignment-detail___maak-deze-opdracht-prive'
								  )
								: tText(
										'assignment/views/assignment-detail___maak-deze-opdracht-openbaar'
								  )
						}
						ariaLabel={
							isPublic
								? tText(
										'assignment/views/assignment-detail___maak-deze-opdracht-prive'
								  )
								: tText(
										'assignment/views/assignment-detail___maak-deze-opdracht-openbaar'
								  )
						}
						icon={isPublic ? IconName.unlock3 : IconName.lock}
						onClick={() => executeAction(AssignmentAction.openPublishCollectionModal)}
					/>
				)}

				{!isOwner &&
					!isContributor &&
					!inviteToken &&
					defaultRenderBookmarkButton({
						active: bookmarkViewCounts.isBookmarked,
						ariaLabel: tText('assignment/views/assignment-detail___bladwijzer'),
						title: tText('assignment/views/assignment-detail___bladwijzer'),
						onClick: () => executeAction(AssignmentAction.toggleBookmark),
						type: 'secondary',
					})}

				{!inviteToken && renderAssignmentDropdownOptions()}

				<Spacer margin="left-small">
					{permissions?.canEditAssignments && !inviteToken && (
						<EditButton
							type="primary"
							label={tText('assignment/views/assignment-response-edit___bewerken')}
							title={tText(
								'assignment/views/assignment-response-edit___pas-deze-opdracht-aan'
							)}
							onClick={() => executeAction(AssignmentAction.edit)}
							disabled={isBeingEdited}
							toolTipContent={tHtml(
								'assignment/views/assignment-detail___deze-opdracht-wordt-momenteel-bewerkt-door-een-andere-gebruiker-het-is-niet-mogelijk-met-met-meer-dan-1-gebruiker-simultaan-te-bewerken'
							)}
						/>
					)}
				</Spacer>
			</ButtonToolbar>
		);
	};

	const renderHeaderButtonsMobile = () => {
		const ASSIGNMENT_DROPDOWN_ITEMS_MOBILE = [
			...createDropdownMenuItem(
				assignmentId,
				AssignmentAction.edit,
				tText('assignment/views/assignment-detail___bewerken'),
				IconName.edit2,
				permissions?.canEditAssignments || isOwner || false
			),
			...createDropdownMenuItem(
				assignmentId,
				AssignmentAction.addToBundle,
				tText('assignment/views/assignment-detail___voeg-toe-aan-bundel'),
				IconName.plus,
				permissions?.canEditBundles || false
			),
			...createDropdownMenuItem(
				assignmentId,
				AssignmentAction.duplicate,
				tText('collection/views/collection-detail___dupliceer'),
				IconName.copy,
				permissions?.canCreateAssignments || false
			),
			...createDropdownMenuItem(
				assignmentId,
				AssignmentAction.toggleBookmark,
				tText('assignment/views/assignment-detail___bladwijzer'),
				IconName.bookmark,
				!isOwner && !isContributor
			),
			...createDropdownMenuItem(
				assignmentId,
				AssignmentAction.publish,
				isPublic
					? tText('assignment/views/assignment-detail___maak-prive')
					: tText('assignment/views/assignment-detail___publiceer'),
				isPublic ? IconName.unlock3 : IconName.lock,
				permissions?.canPublishAssignments || false
			),
			...createDropdownMenuItem(
				assignmentId,
				AssignmentAction.share,
				tText('assignment/views/assignment-detail___deel-opdracht'),
				IconName.userGroup,
				isOwner || isEditContributor || permissions?.canEditAssignments || false
			),
			...createDropdownMenuItem(
				assignmentId,
				AssignmentAction.delete,
				permissions?.canDeleteAnyAssignments || isOwner
					? tText('assignment/views/assignment-detail___verwijderen')
					: tText('assignment/views/assignment-detail___verwijder-mij-van-deze-opdracht'),
				undefined,
				permissions?.canDeleteAnyAssignments || isOwner || isContributor || false
			),
		];

		return (
			<ButtonToolbar>
				<MoreOptionsDropdown
					isOpen={isOptionsMenuOpen}
					onOpen={() => setIsOptionsMenuOpen(true)}
					onClose={() => setIsOptionsMenuOpen(false)}
					label={getMoreOptionsLabel()}
					menuItems={ASSIGNMENT_DROPDOWN_ITEMS_MOBILE}
					onOptionClicked={executeAction}
				/>
			</ButtonToolbar>
		);
	};

	const renderHeaderEducationLevel = () => {
		const contributor = assignment?.contributors?.find(
			(c) => c.profile_id === commonUser?.profileId
		);
		if (
			!permissions?.canEditAssignments ||
			contributor?.rights === ContributorInfoRight.VIEWER
		) {
			// No assignment edit rights, no contributor and no owner
			return null;
		}

		const label =
			GET_EDUCATION_LEVEL_DICT()[assignment?.education_level_id as EducationLevelId];
		const tooltip =
			GET_EDUCATION_LEVEL_TOOLTIP_DICT()[assignment?.education_level_id as EducationLevelId];

		return (
			<MetaData category="assignment">
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
	};

	const renderHeader = () => {
		if (assignment) {
			return (
				<Header
					title={assignment.title || ''}
					category="assignment"
					showMetaData={true}
					bookmarks={String(bookmarkViewCounts.bookmarkCount || 0)}
					views={String(bookmarkViewCounts.viewCount || 0)}
				>
					<HeaderTopRowLeft>{renderHeaderEducationLevel()}</HeaderTopRowLeft>
					<HeaderMiddleRowRight>
						{isMobileWidth() ? renderHeaderButtonsMobile() : renderHeaderButtons()}
					</HeaderMiddleRowRight>
					<HeaderBottomRowLeft>
						<HeaderOwnerAndContributors subject={assignment} commonUser={commonUser} />
					</HeaderBottomRowLeft>
					<HeaderBottomRowRight>
						<InteractiveTour showButton />
					</HeaderBottomRowRight>
				</Header>
			);
		}
	};

	const renderAssignmentBlocks = () => {
		const blocks = assignment?.blocks;

		if ((blocks?.length || 0) === 0) {
			return (
				<ErrorView
					message={tHtml(
						'assignment/views/assignment-response-edit___deze-opdracht-heeft-nog-geen-inhoud'
					)}
					icon={IconName.search}
				/>
			);
		}

		return (
			<BlockList
				blocks={(blocks || []) as Avo.Core.BlockItemBase[]}
				config={{
					ITEM: {
						title: {
							canClickHeading: true,
						},
						flowPlayer: {
							canPlay: true,
							trackPlayEvent: true,
						},
					},
					ZOEK: {
						educationLevelId: assignment?.education_level_id as EducationLevelId,
					},
				}}
			/>
		);
	};

	const renderBundlesContainingThisAssignment = (hasParentBundles: boolean) => {
		if (!hasParentBundles) {
			return null;
		}
		return (
			<p className="c-body-1">
				{(bundlesContainingAssignment || []).length === 1
					? tText('assignment/views/assignment-detail___deze-opdracht-zit-in-bundel')
					: tText(
							'assignment/views/assignment-detail___deze-opdracht-zit-in-bundels'
					  )}{' '}
				{bundlesContainingAssignment?.map((bundle, index) => (
					<>
						{index !== 0 && ', '}
						<Link
							to={buildLink(APP_PATH.BUNDLE_DETAIL.route, {
								id: bundle.id,
							})}
						>
							{bundle.title}
						</Link>
					</>
				)) || null}
			</p>
		);
	};

	const renderIsCopyOf = (hasCopies: boolean) => {
		if (!hasCopies) {
			return null;
		}
		return (
			<p className="c-body-1">
				{`${tText('assignment/views/assignment-detail___deze-opdracht-is-een-kopie-van')} `}
				{((assignment?.relations ?? []) as Relation[]).map((relation: Relation) => (
					<Link
						key={`copy-of-link-${relation.object_meta.id}`}
						to={buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, {
							id: relation.object_meta.id,
						})}
					>
						{relation.object_meta.title}
					</Link>
				))}
			</p>
		);
	};

	const renderMetadata = () => {
		const hasCopies = (assignment?.relations || []).length > 0;
		const hasParentBundles = !!bundlesContainingAssignment?.length;

		return (
			<Container mode="vertical" className="c-assignment-detail--metadata">
				<Container mode="horizontal">
					<div className="c-assignment-detail--metadata__inner-container">
						<h3 className="c-h3">
							{tText('assignment/views/assignment-edit___over-deze-opdracht')}
						</h3>
						<Grid>
							{!!assignment && (
								<CommonMetaData
									subject={assignment}
									enabledMetaData={enabledMetaData}
									renderSearchLink={defaultRenderSearchLink}
								/>
							)}
						</Grid>
						{(hasCopies || hasParentBundles) && (
							<Grid>
								<Column size="12">
									<p className="u-text-bold">
										{tHtml(
											'assignment/views/assignment-detail___extra-informatie'
										)}
									</p>

									{renderIsCopyOf(hasCopies)}
									{renderBundlesContainingThisAssignment(hasParentBundles)}
								</Column>
							</Grid>
						)}
						{!!relatedAssignments &&
							renderRelatedItems(relatedAssignments, defaultRenderDetailLink)}
					</div>
				</Container>
			</Container>
		);
	};

	const onAcceptShareAssignment = async () => {
		if (!assignment || !inviteToken) {
			return;
		}

		try {
			const res = await AssignmentService.acceptSharedAssignment(
				assignment?.id as string,
				inviteToken
			);

			setQuery({
				...query,
				inviteToken: undefined,
			});

			await fetchAssignment();

			ToastService.success(
				res.rights === 'CONTRIBUTOR'
					? tText('assignment/views/assignment-detail___je-kan-nu-deze-opdracht-bewerken')
					: tText('assignment/views/assignment-detail___je-kan-nu-deze-opdracht-bekijken')
			);
		} catch (err) {
			ToastService.danger(
				tText(
					'assignment/views/assignment-detail___er-liep-iets-fout-bij-het-accepteren-van-de-uitnodiging'
				)
			);
		}
	};

	const onDeclineShareAssignment = async () => {
		if (!assignment || !inviteToken) {
			return;
		}

		try {
			await AssignmentService.declineSharedAssignment(assignment?.id as string, inviteToken);

			navigate(history, APP_PATH.WORKSPACE_ASSIGNMENTS.route);

			ToastService.success(
				tText('assignment/views/assignment-detail___de-uitnodiging-werd-afgewezen')
			);
		} catch (err) {
			ToastService.danger(
				tText(
					'assignment/views/assignment-detail___er-liep-iets-fout-bij-het-afwijzen-van-de-uitnodiging'
				)
			);
		}
	};

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

		return (
			<>
				{renderHeader()}
				{renderAssignmentBlocks()}
				{renderMetadata()}
			</>
		);
	};

	const pageTitle = GENERATE_SITE_TITLE(
		assignment?.title ||
			tText('assignment/views/assignment-detail___opdracht-detail-pagina-titel')
	);
	return (
		<>
			{!assignment && !assignmentLoading && !assignmentError && isForbidden ? (
				<ErrorNoAccess
					title={tHtml('assignment/views/assignment-detail___je-hebt-geen-toegang')}
					message={tHtml(
						'assignment/views/assignment-detail___je-hebt-geen-toegang-om-deze-opdracht-te-bekijken'
					)}
				/>
			) : (
				<div className="c-sticky-bar__wrapper">
					<div>
						<Helmet>
							<title>{pageTitle}</title>

							<meta
								name="description"
								content={tText(
									'assignment/views/assignment-detail___opdracht-detail-pagina-beschrijving'
								)}
							/>
						</Helmet>

						{renderPageContent()}
					</div>

					{!assignmentError && (
						<StickyBar
							title={tHtml(
								'assignment/views/assignment-detail___wil-je-de-opdracht-title-toevoegen-aan-je-werkruimte',
								{
									title: assignment?.title,
								}
							)}
							isVisible={!!inviteToken}
							actionButtonProps={{
								label: tText('assignment/views/assignment-detail___toevoegen'),
								onClick: onAcceptShareAssignment,
								type: 'tertiary',
							}}
							cancelButtonProps={{
								label: tText('assignment/views/assignment-detail___weigeren'),
								onClick: onDeclineShareAssignment,
								type: 'tertiary',
							}}
						/>
					)}
				</div>
			)}

			{!!assignment && !!commonUser && (
				<PublishAssignmentModal
					onClose={(newAssignment: Avo.Assignment.Assignment | undefined) => {
						setIsPublishModalOpen(undefined, 'replaceIn');
						if (newAssignment) {
							setAssignment(newAssignment);
						}
					}}
					isOpen={!!isPublishModalOpen}
					assignment={assignment as Avo.Assignment.Assignment}
					parentBundles={bundlesContainingAssignment}
				/>
			)}

			{assignment && isMobileWidth() && (
				<ShareModal
					title={tText(
						'assignment/views/assignment-detail___deel-deze-opdracht-met-collegas'
					)}
					isOpen={isShareModalOpen}
					onClose={() => setIsShareModalOpen(false)}
					contributors={transformContributorsToSimpleContributors(
						shareWithPupilsProps?.assignment?.owner as Avo.User.User,
						(assignment?.contributors || []) as Avo.Assignment.Contributor[]
					)}
					onDeleteContributor={(contributorInfo) =>
						onDeleteContributor(
							contributorInfo,
							shareWithPupilsProps,
							fetchContributors
						)
					}
					onEditContributorRights={(contributorInfo, newRights) =>
						onEditContributor(
							contributorInfo,
							newRights,
							shareWithPupilsProps,
							fetchContributors,
							fetchAssignment
						)
					}
					onAddContributor={(info) =>
						onAddNewContributor(
							info,
							shareWithPupilsProps,
							fetchContributors,
							commonUser
						)
					}
					shareWithPupilsProps={shareWithPupilsProps}
					availableRights={{
						[ContributorInfoRight.CONTRIBUTOR]:
							PermissionName.SHARE_ASSIGNMENT_WITH_CONTRIBUTOR,
						[ContributorInfoRight.VIEWER]: PermissionName.SHARE_ASSIGNMENT_WITH_VIEWER,
					}}
					isAdmin={
						commonUser?.permissions?.includes(PermissionName.EDIT_ANY_ASSIGNMENTS) ||
						false
					}
					assignment={assignment}
				/>
			)}

			{!!assignment?.id && permissions?.canEditBundles && (
				<AddToBundleModal
					fragmentId={assignment.id}
					fragmentInfo={assignment}
					fragmentType={CollectionFragmentType.ASSIGNMENT}
					isOpen={isAddToBundleModalOpen}
					onClose={async () => {
						setIsAddToBundleModalOpen(false);
						await refetchBundlesContainingAssignment();
					}}
				/>
			)}

			<DeleteAssignmentModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				deleteAssignmentCallback={onDeleteAssignment}
				deleteSelfFromAssignmentCallback={onDeleteSelfFromAssignment}
				contributorCount={assignment?.contributors?.length || 0}
				shouldDeleteSelfFromAssignment={shouldDeleteSelfFromAssignment}
				hasPupilResponses={!!assignment?.responses?.length}
				hasPupilResponseCollections={
					!!assignment?.blocks?.find((block) => block.type === AssignmentType.BOUW)
				}
			/>
		</>
	);
};

export default withUser(AssignmentDetail) as FC<AssignmentDetailProps>;
