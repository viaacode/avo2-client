import { BlockHeading } from '@meemoo/admin-core-ui/client';
import { Container, Icon, IconName } from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { noop } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { type DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { BlockList } from '../../collection/components';
import { GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { CustomError } from '../../shared/helpers/custom-error';
import withUser from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { AssignmentService } from '../assignment.service';
import AssignmentHeading from '../components/AssignmentHeading';
import AssignmentMetadata from '../components/AssignmentMetadata';
import { buildGlobalSearchLink } from '../helpers/build-search-link';
import { toAssignmentResponsesOverview } from '../helpers/links';

type AssignmentPupilCollectionDetailProps = DefaultSecureRouteProps<{
	responseId: string;
	assignmentId: string;
}>;

const AssignmentPupilCollectionDetail: FC<AssignmentPupilCollectionDetailProps> = ({
	match,
	commonUser,
}) => {
	const { tText, tHtml } = useTranslation();
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [assignment, setAssignment] = useState<Avo.Assignment.Assignment | null>(null);
	const [assignmentResponse, setAssignmentResponse] = useState<Avo.Assignment.Response | null>();
	const assignmentId = match.params.assignmentId;
	const assignmentResponseId = match.params.responseId;

	const fetchAssignmentResponse = useCallback(
		async (
			tempAssignment: Avo.Assignment.Assignment
		): Promise<Avo.Assignment.Response | null> => {
			const canViewAssignmentResponses = await PermissionService.hasPermissions(
				[
					PermissionName.EDIT_ANY_ASSIGNMENTS,
					{ name: PermissionName.EDIT_OWN_ASSIGNMENTS, obj: tempAssignment },
				],
				commonUser
			);
			if (!canViewAssignmentResponses) {
				setLoadingInfo({
					state: 'error',
					message: tHtml(
						'assignment/views/assignment-pupil-collection-detail___je-hebt-geen-toegang-om-deze-leerlingencollectie-te-bekijken'
					),
				});
				return null;
			}

			return AssignmentService.getAssignmentResponseById(assignmentResponseId);
		},
		[setAssignmentResponse, assignmentResponseId, tHtml]
	);

	const fetchAssignment = useCallback(async () => {
		try {
			const tempAssignment: Avo.Assignment.Assignment =
				await AssignmentService.fetchAssignmentById(assignmentId);

			setAssignmentResponse(await fetchAssignmentResponse(tempAssignment));

			setAssignment(tempAssignment);
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch assignment and response', err, {
					commonUser,
					id: assignmentResponseId,
				})
			);
			setLoadingInfo({
				state: 'error',
				message: tHtml(
					'assignment/views/assignment-pupil-collection-detail___het-ophalen-van-de-leerlingencollectie-is-mislukt'
				),
			});
		}
	}, [setAssignment, setLoadingInfo, assignmentResponseId, tText, commonUser, tHtml]);

	// Effects

	useEffect(() => {
		fetchAssignment().then(noop);
	}, [fetchAssignment, commonUser, tText]);

	useEffect(() => {
		if (assignment && assignmentResponse) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [assignment, assignmentResponse]);

	// Render

	const renderBackButton = useMemo(
		() =>
			assignment && (
				<Link className="c-return" to={toAssignmentResponsesOverview(assignment)}>
					<Icon name={IconName.chevronLeft} size="small" type="arrows" />
					{tText('assignment/views/assignment-pupil-collection-detail___alle-responsen')}
				</Link>
			),
		[tText, assignment]
	);

	const renderReadOnlyPupilCollectionBlocks = () => {
		const collectionTitle = (
			<BlockHeading className="u-spacer-top-l" type="h2">
				{assignmentResponse?.collection_title || ''}
			</BlockHeading>
		);
		return (
			<>
				<AssignmentHeading
					back={renderBackButton}
					title={collectionTitle}
					info={
						assignment ? (
							<AssignmentMetadata
								assignment={assignment as Avo.Assignment.Assignment}
								assignmentResponse={assignmentResponse}
								who={'pupil'}
							/>
						) : null
					}
					tour={null}
				/>
				{assignmentResponse?.pupil_collection_blocks?.length ? (
					<Container mode="horizontal">
						<BlockList
							blocks={
								(assignmentResponse?.pupil_collection_blocks ||
									[]) as Avo.Core.BlockItemBase[]
							}
							config={{
								ITEM: {
									title: {
										canClickHeading: PermissionService.hasPerm(
											commonUser,
											PermissionName.VIEW_ANY_PUBLISHED_ITEMS
										),
									},
									buildSeriesLink: (serie) =>
										buildGlobalSearchLink({ filters: { serie: [serie] } }),
									canOpenOriginal: true,
								},
							}}
						/>
					</Container>
				) : (
					<ErrorView
						message={tText(
							'assignment/views/assignment-pupil-collection-detail___deze-leerlingencollectie-bevat-geen-fragmenten'
						)}
						icon={IconName.search}
					/>
				)}
			</>
		);
	};

	return (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						assignmentResponse?.collection_title ||
							tText(
								'assignment/views/assignment-pupil-collection-detail___leerlingencollectie-detail'
							)
					)}
				</title>
				<meta name="description" content={assignment?.description || ''} />
			</Helmet>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				notFoundError={tText(
					'assignment/views/assignment-pupil-collection-detail___de-leerlingencollectie-werd-niet-gevonden'
				)}
				dataObject={assignmentResponse}
				render={renderReadOnlyPupilCollectionBlocks}
			/>
		</>
	);
};

export default withUser(
	AssignmentPupilCollectionDetail
) as FC<AssignmentPupilCollectionDetailProps>;
