import { BlockHeading, Container } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { BlockList } from '../../collection/components';
import { GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../shared/components';
import { CustomError } from '../../shared/helpers';
import { AssignmentService } from '../assignment.service';
import AssignmentHeading from '../components/AssignmentHeading';
import AssignmentMetadata from '../components/AssignmentMetadata';

type AssignmentPupilCollectionDetailProps = DefaultSecureRouteProps<{
	id: string;
	assignmentId: string;
}>;

const AssignmentPupilCollectionDetail: FunctionComponent<AssignmentPupilCollectionDetailProps> = ({
	match,
	user,
}) => {
	const [t] = useTranslation();
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [assignment, setAssignment] = useState<Avo.Assignment.Assignment_v2 | null>(null);
	const [assignmentResponse, setAssignmentResponse] =
		useState<Avo.Assignment.Response_v2 | null>();

	const fetchAssignmentResponse = useCallback(
		async (tempAssignment: Avo.Assignment.Assignment_v2) => {
			const assignmentResponseId = match.params.id;
			const canViewAssignmentResponses = await PermissionService.hasPermissions(
				[
					PermissionName.EDIT_ANY_ASSIGNMENTS,
					{ name: PermissionName.EDIT_ASSIGNMENTS, obj: tempAssignment },
					{ name: PermissionName.EDIT_OWN_ASSIGNMENTS, obj: tempAssignment },
				],
				user
			);
			if (!canViewAssignmentResponses) {
				setLoadingInfo({
					state: 'error',
					message: t(
						'assignment/views/assignment-pupil-collection-detail___je-hebt-geen-toegang-om-deze-leerlingencollectie-te-bekijken'
					),
				});
				return;
			}

			return AssignmentService.getAssignmentResponseById(assignmentResponseId);
		},
		[setAssignmentResponse, match.params.id]
	);

	const fetchAssignment = useCallback(async () => {
		try {
			const assignmentId = match.params.assignmentId;

			const tempAssignment = await AssignmentService.fetchAssignmentById(assignmentId);

			setAssignmentResponse(await fetchAssignmentResponse(tempAssignment));

			setAssignment(tempAssignment);
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch assignment and response', err, {
					user,
					id: match.params.id,
				})
			);
			setLoadingInfo({
				state: 'error',
				message: t(
					'assignment/views/assignment-pupil-collection-detail___het-ophalen-van-de-leerlingencollectie-is-mislukt'
				),
			});
		}
	}, [setAssignment, setLoadingInfo, match.params.assignmentId, t, user]);

	// Effects

	useEffect(() => {
		fetchAssignment();
	}, [fetchAssignment, user, t]);

	useEffect(() => {
		if (assignment && assignmentResponse) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [assignment, assignmentResponse]);

	// Render

	const renderReadOnlyPupilCollectionBlocks = () => {
		const collectionTitle = (
			<BlockHeading type="h2">{assignmentResponse?.collection_title || ''}</BlockHeading>
		);
		return (
			<>
				<AssignmentHeading
					title={collectionTitle}
					info={
						assignment ? (
							<AssignmentMetadata
								assignment={assignment}
								assignmentResponse={assignmentResponse}
								who={'pupil'}
							/>
						) : null
					}
				/>
				{assignmentResponse?.pupil_collection_blocks?.length ? (
					<Container mode="horizontal">
						<BlockList
							blocks={
								(assignmentResponse?.pupil_collection_blocks ||
									[]) as Avo.Core.BlockItemBase[]
							}
						/>
					</Container>
				) : (
					<ErrorView
						message={t(
							'assignment/views/assignment-pupil-collection-detail___deze-leerlingencollectie-bevat-geen-fragmenten'
						)}
						icon={'search'}
					/>
				)}
			</>
		);
	};

	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						get(
							assignmentResponse,
							'collection_title',
							t(
								'assignment/views/assignment-pupil-collection-detail___leerlingencollectie-detail'
							)
						)
					)}
				</title>
				<meta name="description" content={get(assignment, 'description') || ''} />
			</MetaTags>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				notFoundError={t(
					'assignment/views/assignment-pupil-collection-detail___de-leerlingencollectie-werd-niet-gevonden'
				)}
				dataObject={assignmentResponse}
				render={renderReadOnlyPupilCollectionBlocks}
			/>
		</>
	);
};

export default AssignmentPupilCollectionDetail;
