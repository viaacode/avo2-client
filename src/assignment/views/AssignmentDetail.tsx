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
import { Avo } from '@viaa/avo2-types';
import React, { FC, useCallback, useEffect, useState } from 'react';
import MetaTags from 'react-meta-tags';
import { generatePath } from 'react-router';
import { Link } from 'react-router-dom';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { renderRelatedItems } from '../../collection/collection.helpers';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorNoAccess } from '../../error/components';
import ErrorView, { ErrorViewQueryParams } from '../../error/views/ErrorView';
import { InteractiveTour } from '../../shared/components';
import BlockList from '../../shared/components/BlockList/BlockList';
import { renderAvatar } from '../../shared/helpers';
import { defaultRenderDetailLink } from '../../shared/helpers/default-render-detail-link';
import useTranslation from '../../shared/hooks/useTranslation';
import {
	getRelatedItems,
	ObjectTypes,
	ObjectTypesAll,
} from '../../shared/services/related-items-service';
import { ToastService } from '../../shared/services/toast-service';
import {
	isUserAssignmentContributor,
	isUserAssignmentOwner,
	renderCommonMetadata,
} from '../assignment.helper';
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
	const [relatedAssignments, setRelatedAssignments] = useState<Avo.Search.ResultItem[] | null>(
		null
	);

	const id = match.params.id;

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

			ToastService.danger(
				tHtml(
					'assignment/views/assignment-edit___het-opslaan-van-de-gerelateerde-opdrachten-is-mislukt'
				)
			);
		}
	}, [setRelatedAssignments, id]);

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
				<Spacer margin="left-small">
					<Link
						to={generatePath(APP_PATH.ASSIGNMENT_EDIT.route, {
							id,
						})}
					>
						<Button
							type="primary"
							icon={IconName.edit}
							label={tText('assignment/views/assignment-response-edit___bewerken')}
							title={tText(
								'assignment/views/assignment-response-edit___pas-deze-opdracht-aan'
							)}
						/>
					</Link>
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
						{!!relatedAssignments &&
							renderRelatedItems(relatedAssignments, defaultRenderDetailLink)}
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
