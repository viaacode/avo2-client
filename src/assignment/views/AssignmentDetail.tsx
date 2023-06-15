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
	Spacer,
	Spinner,
} from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { PermissionName } from '@viaa/avo2-types';
import React, { FC, useCallback, useEffect, useState } from 'react';
import MetaTags from 'react-meta-tags';
import { generatePath } from 'react-router';
import { Link } from 'react-router-dom';
import { StringParam, useQueryParams } from 'use-query-params';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { renderRelatedItems } from '../../collection/collection.helpers';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorNoAccess } from '../../error/components';
import ErrorView, { ErrorViewQueryParams } from '../../error/views/ErrorView';
import { InteractiveTour } from '../../shared/components';
import BlockList from '../../shared/components/BlockList/BlockList';
import { StickyBar } from '../../shared/components/StickyBar/StickyBar';
import { Lookup_Enum_Right_Types_Enum } from '../../shared/generated/graphql-db-types';
import { navigate, renderAvatar } from '../../shared/helpers';
import { defaultRenderDetailLink } from '../../shared/helpers/default-render-detail-link';
import useTranslation from '../../shared/hooks/useTranslation';
import {
	getRelatedItems,
	ObjectTypes,
	ObjectTypesAll,
} from '../../shared/services/related-items-service';
import { ToastService } from '../../shared/services/toast-service';
import { ASSIGNMENT_CREATE_UPDATE_TABS } from '../assignment.const';
import { renderCommonMetadata } from '../assignment.helper';
import { AssignmentService } from '../assignment.service';
import PublishAssignmentModal from '../modals/PublishAssignmentModal';

import './AssignmentDetail.scss';

type AssignmentDetailPermissions = Partial<{
	canEditAssignments: boolean;
}>;

const AssignmentDetail: FC<DefaultSecureRouteProps<{ id: string }>> = ({
	match,
	user,
	history,
	location,
}) => {
	const { tText, tHtml } = useTranslation();

	const [assignmentLoading, setAssigmentLoading] = useState(false);
	const [assignmentError, setAssigmentError] = useState<Partial<ErrorViewQueryParams> | null>(
		null
	);
	const [assignment, setAssignment] = useState<Avo.Assignment.Assignment | null>(null);
	const [permissions, setPermissions] = useState<AssignmentDetailPermissions>({
		canEditAssignments: false,
	});
	const [relatedAssignments, setRelatedAssignments] = useState<Avo.Search.ResultItem[] | null>(
		null
	);
	const [isForbidden, setIsforbidden] = useState<boolean>(false);
	const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);

	const [query] = useQueryParams({ inviteToken: StringParam });
	const { inviteToken } = query;
	const id = match.params.id;
	const isPublic = assignment?.is_public || false;

	const getPermissions = useCallback(
		async (
			assignmentId: string,
			user: Avo.User.User | undefined,
			assignment: Avo.Assignment.Assignment
		): Promise<AssignmentDetailPermissions> => {
			if (!user || !assignment) {
				return {};
			}
			const rawPermissions = await Promise.all([
				PermissionService.hasPermissions(
					[
						{ name: PermissionName.EDIT_OWN_ASSIGNMENTS, obj: assignmentId },
						{ name: PermissionName.EDIT_ANY_ASSIGNMENTS },
					],
					user
				),
			]);

			if (assignment.contributors && user.profile && user.profile.id) {
				const contributorInfo = assignment.contributors.find(
					(contributor) => contributor.profile_id === user?.profile?.id
				);

				if (contributorInfo?.rights == Lookup_Enum_Right_Types_Enum.Contributor) {
					return { canEditAssignments: true };
				}
			}

			return {
				canEditAssignments: rawPermissions[0],
			};
		},
		[user, assignment, match.params.id]
	);

	const getRelatedAssignments = useCallback(async () => {
		try {
			if (isUuid(id)) {
				setRelatedAssignments(
					await getRelatedItems(id, ObjectTypes.assignments, ObjectTypesAll.all, 4)
				);
			}
		} catch (err) {
			console.error('Failed to get related items', err, {
				id,
				index: 'assignments',
				limit: 4,
			});

			ToastService.danger('Het ophalen van de gerelateerde opdrachten is mislukt');
		}
	}, [setRelatedAssignments, id]);

	const fetchAssignment = useCallback(async () => {
		try {
			setAssigmentLoading(true);
			setAssigmentError(null);

			let tempAssignment: Avo.Assignment.Assignment | null = null;

			try {
				tempAssignment = await AssignmentService.fetchAssignmentById(id);
			} catch (err: any) {
				if (err.innerException.additionalInfo.statusCode === 403) {
					setIsforbidden(true);
				} else {
					setAssigmentError({
						message:
							err.innerException.additionalInfo.statusCode === 403
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
						'assignment/views/assignment-edit___het-ophalen-van-de-opdracht-is-mislukt'
					),
					icon: IconName.alertTriangle,
					actionButtons: ['home'],
				});
				setAssigmentLoading(false);
				return;
			}

			setAssignment(tempAssignment as any);

			try {
				const permissionObj = await getPermissions(id, user, tempAssignment);
				setPermissions(permissionObj);
			} catch (err) {
				setAssigmentError({
					message: 'Ophalen van permissies is mislukt',
					icon: IconName.alertTriangle,
					actionButtons: ['home'],
				});
				setAssigmentLoading(false);

				return;
			}
		} catch (err) {
			setAssigmentError({
				message: tHtml(
					'assignment/views/assignment-edit___het-ophalen-aanmaken-van-de-opdracht-is-mislukt'
				),
				icon: IconName.alertTriangle,
			});
		}

		setAssigmentLoading(false);
	}, [user, match.params.id, tText, history, setAssignment]);

	// Fetch initial data
	useEffect(() => {
		fetchAssignment();
	}, [fetchAssignment]);

	useEffect(() => {
		getRelatedAssignments();
	}, [getRelatedAssignments]);

	// Render

	const renderHeaderButtons = () => {
		return (
			<ButtonToolbar>
				<Button
					type="secondary"
					title={
						isPublic
							? tText('assignment/views/assignment-detail___maak-deze-opdracht-prive')
							: tText(
									'assignment/views/assignment-detail___maak-deze-opdracht-openbaar'
							  )
					}
					ariaLabel={
						isPublic
							? tText('assignment/views/assignment-detail___maak-deze-opdracht-prive')
							: tText(
									'assignment/views/assignment-detail___maak-deze-opdracht-openbaar'
							  )
					}
					icon={isPublic ? IconName.unlock3 : IconName.lock}
					onClick={() => setIsPublishModalOpen(true)}
				/>

				<Spacer margin="left-small">
					{permissions?.canEditAssignments && (
						<Link
							to={generatePath(APP_PATH.ASSIGNMENT_EDIT_TAB.route, {
								id,
								tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT,
							})}
						>
							<Button
								type="primary"
								icon={IconName.edit}
								label={tText(
									'assignment/views/assignment-response-edit___bewerken'
								)}
								title={tText(
									'assignment/views/assignment-response-edit___pas-deze-opdracht-aan'
								)}
							/>
						</Link>
					)}
				</Spacer>
				<InteractiveTour showButton />
			</ButtonToolbar>
		);
	};

	const renderHeader = () => {
		if (assignment) {
			return (
				<Header title={assignment.title || ''} category="assignment" showMetaData>
					<HeaderButtons>{renderHeaderButtons()}</HeaderButtons>

					<HeaderRow>
						<Spacer margin={'top-small'}>
							{assignment.profile && renderAvatar(assignment.profile, { dark: true })}
						</Spacer>
					</HeaderRow>
				</Header>
			);
		}
	};

	const renderAssignmentBlocks = () => {
		const blocks =
			assignment?.blocks && assignment.blocks.filter((block) => block.type === 'ITEM');

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
					TEXT: {
						title: {
							canClickHeading: false,
						},
					},
					ITEM: {
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
							{!!assignment &&
								renderCommonMetadata(assignment as Avo.Assignment.Assignment)}
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

			navigate(history, match.url);

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
			<Spacer margin={['top-extra-large', 'bottom-extra-large']}>
				{renderAssignmentBlocks()}
			</Spacer>
		);
	};

	return (
		<>
			{assignment && isForbidden ? (
				<ErrorNoAccess
					title={tHtml('assignment/views/assignment-edit___je-hebt-geen-toegang')}
					message={tHtml(
						'assignment/views/assignment-edit___je-hebt-geen-toegang-beschrijving'
					)}
				/>
			) : (
				<div className="c-sticky-bar__wrapper">
					<div>
						<MetaTags>
							<title>
								{GENERATE_SITE_TITLE(
									tText(
										'assignment/views/assignment-edit___bewerk-opdracht-pagina-titel'
									)
								)}
							</title>

							<meta
								name="description"
								content={tText(
									'assignment/views/assignment-edit___bewerk-opdracht-pagina-beschrijving'
								)}
							/>
						</MetaTags>

						{renderHeader()}

						{renderPageContent()}

						{renderMetadata()}
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
		</>
	);
};

export default AssignmentDetail;
