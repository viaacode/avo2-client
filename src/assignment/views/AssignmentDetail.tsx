import {
	Button,
	ButtonToolbar,
	Container,
	Flex,
	Grid,
	Header,
	HeaderButtons,
	HeaderRow,
	IconName,
	isUuid,
	MoreOptionsDropdown,
	Spacer,
	Spinner,
	ToggleButton,
} from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { PermissionName, ShareWithColleagueTypeEnum } from '@viaa/avo2-types';
import React, { FC, ReactText, useCallback, useEffect, useState } from 'react';
import MetaTags from 'react-meta-tags';
import { generatePath } from 'react-router';
import { StringParam, useQueryParams } from 'use-query-params';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { renderRelatedItems } from '../../collection/collection.helpers';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorNoAccess } from '../../error/components';
import ErrorView, { ErrorViewQueryParams } from '../../error/views/ErrorView';
import { ALL_SEARCH_FILTERS, SearchFilter } from '../../search/search.const';
import {
	CommonMetaData,
	EditButton,
	HeaderOwnerAndContributors,
	InteractiveTour,
	ShareDropdown,
	ShareModal,
	ShareWithPupilsProps,
} from '../../shared/components';
import BlockList from '../../shared/components/BlockList/BlockList';
import { ContributorInfoRights } from '../../shared/components/ShareWithColleagues/ShareWithColleagues.types';
import { StickyBar } from '../../shared/components/StickyBar/StickyBar';
import { EDIT_STATUS_REFETCH_TIME, getMoreOptionsLabel } from '../../shared/constants';
import { createDropdownMenuItem, CustomError, isMobileWidth, navigate } from '../../shared/helpers';
import { transformContributorsToSimpleContributors } from '../../shared/helpers/contributors';
import { defaultRenderDetailLink } from '../../shared/helpers/default-render-detail-link';
import { defaultRenderSearchLink } from '../../shared/helpers/default-render-search-link';
import useTranslation from '../../shared/hooks/useTranslation';
import {
	BookmarksViewsPlaysService,
	DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS,
} from '../../shared/services/bookmarks-views-plays-service';
import { BookmarkViewPlayCounts } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import {
	getRelatedItems,
	ObjectTypes,
	ObjectTypesAll,
} from '../../shared/services/related-items-service';
import { ToastService } from '../../shared/services/toast-service';
import { ASSIGNMENT_CREATE_UPDATE_TABS } from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import { AssignmentAction } from '../assignment.types';
import {
	onAddNewContributor,
	onDeleteContributor,
	onEditContributor,
} from '../helpers/assignment-share-with-collegue-handlers';
import { duplicateAssignment } from '../helpers/duplicate-assignment';
import { useGetAssignmentsEditStatuses } from '../hooks/useGetAssignmentsEditStatuses';
import DeleteAssignmentModal from '../modals/DeleteAssignmentModal';
import PublishAssignmentModal from '../modals/PublishAssignmentModal';

import './AssignmentDetail.scss';

type AssignmentDetailPermissions = Partial<{
	canCreateAssignments: boolean;
	canEditAssignments: boolean;
	canPublishAssignments: boolean;
	canDeleteAnyAssignments: boolean;
	canFetchBookmarkAndViewCounts: boolean;
}>;

type AssignmentDetailProps = {
	id?: string; // Item id when component needs to be used inside another component and the id cannot come from the url (match.params.id)
	enabledMetaData: SearchFilter[];
};

const AssignmentDetail: FC<AssignmentDetailProps & DefaultSecureRouteProps<{ id: string }>> = ({
	match,
	user,
	history,
	location,
	enabledMetaData = ALL_SEARCH_FILTERS,
}) => {
	const { tText, tHtml } = useTranslation();
	const assignmentId = match.params.id;

	// Data
	const [assignment, setAssignment] = useState<Avo.Assignment.Assignment | null>(null);
	const [permissions, setPermissions] = useState<AssignmentDetailPermissions>({
		canCreateAssignments: false,
		canEditAssignments: false,
		canPublishAssignments: false,
		canDeleteAnyAssignments: false,
		canFetchBookmarkAndViewCounts: false,
	});
	const [relatedAssignments, setRelatedAssignments] = useState<Avo.Search.ResultItem[] | null>(
		null
	);
	const [bookmarkViewCounts, setBookmarkViewCounts] = useState<BookmarkViewPlayCounts>(
		DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS
	);
	const { data: editStatuses } = useGetAssignmentsEditStatuses([assignmentId], {
		enabled: !!permissions.canEditAssignments,
		refetchInterval: EDIT_STATUS_REFETCH_TIME,
		refetchIntervalInBackground: true,
	});

	// Errors
	const [isForbidden, setIsForbidden] = useState<boolean>(false);
	const [assignmentLoading, setAssigmentLoading] = useState(false);
	const [assignmentError, setAssigmentError] = useState<Partial<ErrorViewQueryParams> | null>(
		null
	);

	// Modals
	const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

	const [query, setQuery] = useQueryParams({ inviteToken: StringParam });
	const { inviteToken } = query;

	// Computed
	const isPublic = assignment?.is_public || false;
	const isContributor = !!assignment?.contributors?.find(
		(contributor) => contributor.profile_id && contributor.profile_id === user?.profile?.id
	);
	const isEditContributor = !!assignment?.contributors?.find(
		(contributor) =>
			contributor.profile_id &&
			contributor.profile_id === user?.profile?.id &&
			contributor.rights === (ContributorInfoRights.CONTRIBUTOR as Avo.Share.Rights)
	);
	const isOwner =
		!!assignment?.owner_profile_id && assignment?.owner_profile_id === user?.profile?.id;
	const isSharedWithOthers =
		assignment?.share_type === ShareWithColleagueTypeEnum.GEDEELD_MET_ANDERE;

	const isBeingEdited =
		editStatuses &&
		!!editStatuses[assignmentId] &&
		editStatuses[assignmentId]?.editingUserId !== user?.profile?.id;

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
			user: Avo.User.User | undefined,
			assignment: Avo.Assignment.Assignment
		): Promise<AssignmentDetailPermissions> => {
			if (!user || !assignment) {
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
					canFetchBookmarkAndViewCounts: [
						PermissionName.VIEW_ANY_PUBLISHED_ASSIGNMENTS,
						PermissionName.VIEW_ANY_UNPUBLISHED_ASSIGNMENTS,
						PermissionName.EDIT_OWN_ASSIGNMENTS,
						PermissionName.EDIT_ANY_ASSIGNMENTS,
					],
				},
				user
			);
		},
		[user, assignment, match.params.id]
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
	}, [setRelatedAssignments, assignmentId]);

	const fetchAssignment = useCallback(async () => {
		try {
			setAssigmentLoading(true);
			setAssigmentError(null);

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
					setAssigmentError({
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

				setAssigmentLoading(false);
				return;
			}

			if (!tempAssignment) {
				setAssigmentError({
					message: tHtml(
						'assignment/views/assignment-detail___het-ophalen-van-de-opdracht-is-mislukt'
					),
					icon: IconName.alertTriangle,
					actionButtons: ['home'],
				});
				setAssigmentLoading(false);
				return;
			}

			setAssignment(tempAssignment as any);

			try {
				const permissionObj = await getPermissions(user, tempAssignment);
				setPermissions(permissionObj);

				if (permissionObj.canFetchBookmarkAndViewCounts) {
					setBookmarkViewCounts(
						await BookmarksViewsPlaysService.getAssignmentCounts(
							tempAssignment.id as string,
							user
						)
					);
				}
			} catch (err) {
				setAssigmentError({
					message: tHtml(
						'assignment/views/assignment-detail___ophalen-van-permissies-is-mislukt'
					),
					icon: IconName.alertTriangle,
					actionButtons: ['home'],
				});
				setAssigmentLoading(false);

				return;
			}
		} catch (err) {
			setAssigmentError({
				message: tHtml(
					'assignment/views/assignment-detail___het-ophalen-van-de-opdracht-is-mislukt'
				),
				icon: IconName.alertTriangle,
			});
		}

		setAssigmentLoading(false);
	}, [user, match.params.id, tText, history, setAssignment]);

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

	// Fetch initial data
	useEffect(() => {
		fetchAssignment();
	}, [fetchAssignment]);

	useEffect(() => {
		getRelatedAssignments();
	}, [getRelatedAssignments]);

	const toggleBookmark = async () => {
		try {
			if (!user) {
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
				user,
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
					user,
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
		try {
			if (!assignment) {
				ToastService.danger(
					tHtml(
						'assignment/views/assignment-detail___de-opdracht-kan-niet-gekopieerd-worden-omdat-deze-nog-niet-is-opgehaald-van-de-database'
					)
				);
				return;
			}

			if (!user.profile) {
				ToastService.danger(
					tHtml(
						'assignment/views/assignment-detail___er-was-een-probleem-met-het-controleren-van-de-ingelogde-gebruiker-log-opnieuw-in-en-probeer-opnieuw'
					)
				);
				return;
			}

			const duplicate = await duplicateAssignment(assignment, user.profile.id);
			if (duplicate) {
				history.push(
					generatePath(APP_PATH.ASSIGNMENT_DETAIL.route, {
						id: duplicate.id,
					})
				);
				setAssignment(duplicate as Avo.Assignment.Assignment);
			}

			ToastService.success(
				tHtml(
					'assignment/views/assignment-detail___de-opdracht-is-gekopieerd-je-kijkt-nu-naar-de-kopie'
				)
			);
		} catch (err) {
			console.error('Failed to copy assignment', err, {
				originalAssignment: assignment,
			});

			ToastService.danger(
				tHtml(
					'assignment/views/assignment-detail___het-kopieren-van-de-opdracht-is-mislukt'
				)
			);
		}
	};

	const onDeleteAssignment = async (): Promise<void> => {
		try {
			if (!assignment) {
				ToastService.danger(
					tHtml(
						'assignment/views/assignment-detail___de-opdracht-kan-niet-verwijderd-worden-omdat-deze-nog-niet-is-opgehaald-van-de-database'
					)
				);
				return;
			}

			if (isOwner) {
				await AssignmentService.deleteAssignment(assignmentId);
			} else {
				await AssignmentService.deleteContributor(
					assignmentId,
					undefined,
					user.profile?.id
				);
			}

			history.push(APP_PATH.WORKSPACE_ASSIGNMENTS.route);

			ToastService.success(
				tHtml('assignment/views/assignment-detail___de-opdracht-werd-verwijderd')
			);
		} catch (err) {
			ToastService.danger(
				tHtml(
					'assignment/views/assignment-detail___het-verwijderen-van-de-opdracht-is-mislukt'
				)
			);
		}
	};

	const executeAction = async (item: ReactText) => {
		setIsOptionsMenuOpen(false);
		switch (item) {
			case AssignmentAction.duplicate:
				await onDuplicateAssignment();
				break;
			case AssignmentAction.delete:
				setIsDeleteModalOpen(true);
				break;
			case AssignmentAction.openPublishCollectionModal:
				setIsPublishModalOpen(true);
				break;
			case AssignmentAction.toggleBookmark:
				await toggleBookmark();
				break;
			case AssignmentAction.editAssignment:
				onEditAssignment();
				break;
			case AssignmentAction.share:
				setIsShareModalOpen(true);
				break;
			case AssignmentAction.publish:
				setIsPublishModalOpen(true);
				break;

			default:
				console.warn(`An unhandled action "${item}" was executed without a binding.`);
				return null;
		}
	};

	// Render

	const renderHeaderButtons = () => {
		const COLLECTION_DROPDOWN_ITEMS = [
			...createDropdownMenuItem(
				AssignmentAction.duplicate,
				tText('collection/views/collection-detail___dupliceer'),
				IconName.copy,
				permissions.canCreateAssignments || false
			),
			...createDropdownMenuItem(
				AssignmentAction.delete,
				permissions.canDeleteAnyAssignments || isOwner
					? tText('assignment/views/assignment-detail___verwijderen')
					: tText('assignment/views/assignment-detail___verwijder-mij-van-deze-opdracht'),
				undefined,
				permissions.canDeleteAnyAssignments || isOwner || isContributor || false
			),
		];

		return (
			<ButtonToolbar>
				{(isOwner || isEditContributor || permissions.canEditAssignments) &&
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
								onAddNewContributor(info, shareWithPupilsProps, fetchContributors)
							}
							dropdownProps={{
								placement: 'bottom-end',
							}}
							buttonProps={{
								className: 'c-assignment-heading__hide-on-mobile',
								type: 'secondary',
							}}
							shareWithPupilsProps={shareWithPupilsProps}
							availableRights={{
								[ContributorInfoRights.CONTRIBUTOR]:
									PermissionName.SHARE_ASSIGNMENT_WITH_CONTRIBUTOR,
								[ContributorInfoRights.VIEWER]:
									PermissionName.SHARE_ASSIGNMENT_WITH_VIEWER,
							}}
						/>
					)}
				{permissions.canPublishAssignments && !inviteToken && (
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

				{!isOwner && !isContributor && !inviteToken && (
					<ToggleButton
						title={tText('assignment/views/assignment-detail___bladwijzer')}
						type="secondary"
						icon={IconName.bookmark}
						active={bookmarkViewCounts.isBookmarked}
						ariaLabel={tText('assignment/views/assignment-detail___bladwijzer')}
						onClick={() => executeAction(AssignmentAction.toggleBookmark)}
					/>
				)}

				{!inviteToken && (
					<MoreOptionsDropdown
						isOpen={isOptionsMenuOpen}
						onOpen={() => setIsOptionsMenuOpen(true)}
						onClose={() => setIsOptionsMenuOpen(false)}
						label={getMoreOptionsLabel()}
						menuItems={COLLECTION_DROPDOWN_ITEMS}
						onOptionClicked={executeAction}
					/>
				)}

				<Spacer margin="left-small">
					{permissions?.canEditAssignments && !inviteToken && (
						<EditButton
							type="primary"
							label={tText('assignment/views/assignment-response-edit___bewerken')}
							title={tText(
								'assignment/views/assignment-response-edit___pas-deze-opdracht-aan'
							)}
							onClick={() => executeAction(AssignmentAction.editAssignment)}
							disabled={isBeingEdited}
							toolTipContent={tHtml(
								'assignment/views/assignment-detail___deze-opdracht-wordt-momenteel-bewerkt-door-een-andere-gebruiker-het-is-niet-mogelijk-met-met-meer-dan-1-gebruiker-simultaan-te-bewerken'
							)}
						/>
					)}
				</Spacer>
				<InteractiveTour showButton />
			</ButtonToolbar>
		);
	};

	const renderHeaderButtonsMobile = () => {
		const COLLECTION_DROPDOWN_ITEMS_MOBILE = [
			...createDropdownMenuItem(
				AssignmentAction.editAssignment,
				tText('assignment/views/assignment-detail___bewerken'),
				IconName.edit2,
				permissions.canEditAssignments || isOwner || false
			),
			...createDropdownMenuItem(
				AssignmentAction.duplicate,
				tText('collection/views/collection-detail___dupliceer'),
				IconName.copy,
				permissions.canCreateAssignments || false
			),
			...createDropdownMenuItem(
				AssignmentAction.toggleBookmark,
				tText('assignment/views/assignment-detail___bladwijzer'),
				IconName.bookmark,
				!isOwner && !isContributor
			),
			...createDropdownMenuItem(
				AssignmentAction.publish,
				isPublic
					? tText('assignment/views/assignment-detail___maak-prive')
					: tText('assignment/views/assignment-detail___publiceer'),
				isPublic ? IconName.unlock3 : IconName.lock,
				permissions.canPublishAssignments || false
			),
			...createDropdownMenuItem(
				AssignmentAction.share,
				tText('assignment/views/assignment-detail___deel-opdracht'),
				IconName.userGroup,
				isOwner || isEditContributor || permissions.canEditAssignments || false
			),
			...createDropdownMenuItem(
				AssignmentAction.delete,
				permissions.canDeleteAnyAssignments || isOwner
					? tText('assignment/views/assignment-detail___verwijderen')
					: tText('assignment/views/assignment-detail___verwijder-mij-van-deze-opdracht'),
				undefined,
				permissions.canDeleteAnyAssignments || isOwner || isContributor || false
			),
		];

		return (
			<ButtonToolbar>
				<MoreOptionsDropdown
					isOpen={isOptionsMenuOpen}
					onOpen={() => setIsOptionsMenuOpen(true)}
					onClose={() => setIsOptionsMenuOpen(false)}
					label={getMoreOptionsLabel()}
					menuItems={COLLECTION_DROPDOWN_ITEMS_MOBILE}
					onOptionClicked={executeAction}
				/>
			</ButtonToolbar>
		);
	};

	const renderHeader = () => {
		if (assignment) {
			return (
				<Header title={assignment.title || ''} category="assignment" showMetaData>
					<HeaderButtons>
						{isMobileWidth() ? renderHeaderButtonsMobile() : renderHeaderButtons()}
					</HeaderButtons>
					<HeaderRow>
						<HeaderOwnerAndContributors subject={assignment} user={user} />
					</HeaderRow>
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
						},
					},
				}}
			/>
		);
	};

	const renderMetadata = () => {
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
				<Spacer margin={['top-extra-large', 'bottom-extra-large']}>
					{renderAssignmentBlocks()}
				</Spacer>
				{renderMetadata()}
			</>
		);
	};

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
						<MetaTags>
							<title>
								{GENERATE_SITE_TITLE(
									tText(
										'assignment/views/assignment-detail___opdracht-detail-pagina-titel'
									)
								)}
							</title>

							<meta
								name="description"
								content={tText(
									'assignment/views/assignment-detail___opdracht-detail-pagina-beschrijving'
								)}
							/>
						</MetaTags>

						{renderPageContent()}
					</div>

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
				</div>
			)}

			{!!assignment && !!user && (
				<PublishAssignmentModal
					onClose={(newAssignment: Avo.Assignment.Assignment | undefined) => {
						setIsPublishModalOpen(false);
						if (newAssignment) {
							setAssignment(newAssignment);
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
						onAddNewContributor(info, shareWithPupilsProps, fetchContributors)
					}
					shareWithPupilsProps={shareWithPupilsProps}
					availableRights={{
						[ContributorInfoRights.CONTRIBUTOR]:
							PermissionName.SHARE_ASSIGNMENT_WITH_CONTRIBUTOR,
						[ContributorInfoRights.VIEWER]: PermissionName.SHARE_ASSIGNMENT_WITH_VIEWER,
					}}
				/>
			)}
			<DeleteAssignmentModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				deleteObjectCallback={onDeleteAssignment}
				isContributor={isContributor}
				isSharedWithOthers={isSharedWithOthers}
				contributorCount={assignment?.contributors?.length || 0}
			/>
		</>
	);
};

export default AssignmentDetail;
