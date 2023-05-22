import {
	Button,
	ButtonToolbar,
	Container,
	Flex,
	Header,
	HeaderButtons,
	HeaderRow,
	IconName,
	Spacer,
	Spinner,
} from '@viaa/avo2-components';
import { PermissionName } from '@viaa/avo2-types';
import React, { FC, useCallback, useEffect, useState } from 'react';
import MetaTags from 'react-meta-tags';
import { generatePath } from 'react-router';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import ErrorView, { ErrorViewQueryParams } from '../../error/views/ErrorView';
import { InteractiveTour } from '../../shared/components';
import BlockList from '../../shared/components/BlockList/BlockList';
import { renderAvatar } from '../../shared/helpers';
import useTranslation from '../../shared/hooks/useTranslation';
import { NO_RIGHTS_ERROR_MESSAGE } from '../../shared/services/data-service';
import { renderCommonMetadata } from '../assignment.helper';
import { AssignmentService } from '../assignment.service';
import { Assignment_v2_With_Blocks, BaseBlockWithMeta } from '../assignment.types';
import { useAssignmentForm } from '../hooks';

import './AssignmentDetail.scss';

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

	const id = match.params.id;

	const fetchAssignment = useCallback(async () => {
		try {
			setAssigmentLoading(true);
			setAssigmentError(null);

			let tempAssignment: Assignment_v2_With_Blocks | null = null;

			try {
				tempAssignment = await AssignmentService.fetchAssignmentById(id);
			} catch (err) {
				if (JSON.stringify(err).includes(NO_RIGHTS_ERROR_MESSAGE)) {
					setAssigmentError({
						message: tHtml(
							'assignment/views/assignment-edit___je-hebt-geen-rechten-om-deze-opdracht-te-bewerken'
						),
						icon: IconName.lock,
						actionButtons: ['home'],
					});
					setAssigmentLoading(false);
					return;
				}
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

			if (
				!(await PermissionService.hasPermissions(
					[
						PermissionName.EDIT_ANY_ASSIGNMENTS,
						{ name: PermissionName.EDIT_OWN_ASSIGNMENTS, obj: tempAssignment },
					],
					user
				))
			) {
				setAssigmentError({
					message: tHtml(
						'assignment/views/assignment-edit___je-hebt-geen-rechten-om-deze-opdracht-te-bewerken'
					),
					icon: IconName.lock,
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
		setAssigmentLoading(false);
	}, [user, match.params.id, tText, history, setAssignment]);

	// Fetch initial data
	useEffect(() => {
		fetchAssignment();
	}, [fetchAssignment]);

	// Render

	const renderHeaderButtons = () => {
		return (
			<ButtonToolbar>
				<Spacer margin="left-small">
					<Button
						type="primary"
						icon={IconName.edit}
						label={tText('assignment/views/assignment-response-edit___bewerken')}
						title={tText(
							'assignment/views/assignment-response-edit___pas-deze-opdracht-aan'
						)}
						onClick={() =>
							history.replace(
								generatePath(APP_PATH.ASSIGNMENT_EDIT.route, {
									id,
								})
							)
						}
					/>
				</Spacer>
				<InteractiveTour showButton />
			</ButtonToolbar>
		);
	};

	const renderHeader = () => {
		if (assignment) {
			return (
				// TODO: add 'assignment' to Header component in avo2-components
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
						{!!assignment &&
							renderCommonMetadata(assignment as Assignment_v2_With_Blocks)}

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

		return renderAssignmentBlocks();
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
