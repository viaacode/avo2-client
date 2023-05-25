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
	Spacer,
	Spinner,
} from '@viaa/avo2-components';
import { Avo, PermissionName } from '@viaa/avo2-types';
import React, { FC, useCallback, useEffect, useState } from 'react';
import MetaTags from 'react-meta-tags';
import { generatePath } from 'react-router';
import { Link } from 'react-router-dom';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorNoAccess } from '../../error/components';
import ErrorView, { ErrorViewQueryParams } from '../../error/views/ErrorView';
import { InteractiveTour } from '../../shared/components';
import BlockList from '../../shared/components/BlockList/BlockList';
import { renderAvatar } from '../../shared/helpers';
import useTranslation from '../../shared/hooks/useTranslation';
import {
	isUserAssignmentContributor,
	isUserAssignmentOwner,
	renderCommonMetadata,
} from '../assignment.helper';
import { AssignmentService } from '../assignment.service';
import { Assignment_v2_With_Blocks, BaseBlockWithMeta } from '../assignment.types';
import { useAssignmentForm } from '../hooks';

import './AssignmentDetail.scss';

type AssignmentDetailPermissions = Partial<{
	canEditAssignments: boolean;
}>;

const AssignmentDetail: FC<DefaultSecureRouteProps<{ id: string }>> = ({
	match,
	user,
	history,
}) => {
	const { tText, tHtml } = useTranslation();

	const [assignmentLoading, setAssigmentLoading] = useState(false);
	const [assignmentError, setAssigmentError] = useState<Partial<ErrorViewQueryParams> | null>(
		null
	);
	const [assignment, setAssignment] = useAssignmentForm(undefined);
	const [permissions, setPermissions] = useState<AssignmentDetailPermissions>({
		canEditAssignments: false,
	});

	const id = match.params.id;

	const getPermissions = useCallback(
		async (
			assignmentId: string,
			user: Avo.User.User | undefined
		): Promise<AssignmentDetailPermissions> => {
			if (!user) {
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

			return {
				canEditAssignments: rawPermissions[0],
			};
		},
		[user, match.params.id]
	);

	const fetchAssignment = useCallback(async () => {
		try {
			setAssigmentLoading(true);
			setAssigmentError(null);

			let tempAssignment: Assignment_v2_With_Blocks | null = null;

			try {
				tempAssignment = await AssignmentService.fetchAssignmentById(id);
			} catch (err) {
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

			setAssignment(tempAssignment);
		} catch (err) {
			setAssigmentError({
				message: tHtml(
					'assignment/views/assignment-edit___het-ophalen-aanmaken-van-de-opdracht-is-mislukt'
				),
				icon: IconName.alertTriangle,
			});
		}

		try {
			const permissionObj = await getPermissions(id, user);
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
		setAssigmentLoading(false);
	}, [user, match.params.id, tText, history, setAssignment]);

	// Fetch initial data
	useEffect(() => {
		fetchAssignment();
		getPermissions(id, user);
	}, [fetchAssignment]);

	// Render

	const renderHeaderButtons = () => {
		return (
			<ButtonToolbar>
				<Spacer margin="left-small">
					{permissions?.canEditAssignments && (
						<Link
							to={generatePath(APP_PATH.ASSIGNMENT_EDIT.route, {
								id,
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
				blocks={(blocks || []) as BaseBlockWithMeta[]}
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
								renderCommonMetadata(assignment as Assignment_v2_With_Blocks)}
						</Grid>
						{/* TODO: Insert related items here */}
					</div>
				</Container>
			</Container>
		);
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

		if (
			assignment &&
			!isUserAssignmentOwner(user, assignment) &&
			!isUserAssignmentContributor(user, assignment)
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

		return (
			<Spacer margin={['top-extra-large', 'bottom-extra-large']}>
				{renderAssignmentBlocks()}
			</Spacer>
		);
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
			{renderHeader()}
			{renderPageContent()}
			{renderMetadata()}
		</>
	);
};

export default AssignmentDetail;
