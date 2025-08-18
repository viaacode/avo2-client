import { Flex, IconName, Spacer, Spinner } from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { isString, noop } from 'lodash-es';
import React, { type FC, type ReactNode, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { PermissionService } from '../../../authentication/helpers/permission-service';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import withUser, { type UserProps } from '../../../shared/hocs/withUser';
import useTranslation from '../../../shared/hooks/useTranslation';
import { trackEvents } from '../../../shared/services/event-logging-service';
import { ToastService } from '../../../shared/services/toast-service';
import { getAssignmentErrorObj } from '../../assignment.helper';
import { AssignmentService } from '../../assignment.service';
import { AssignmentRetrieveError } from '../../assignment.types';
import AssignmentMetadata from '../../components/AssignmentMetadata';
import { PupilCollectionForTeacherPreview } from '../../components/PupilCollectionForTeacherPreview';
import { canViewAnAssignment } from '../../helpers/can-view-an-assignment';

import AssignmentResponseEdit from './AssignmentResponseEdit';

import '../AssignmentPage.scss';
import './AssignmentResponseEdit.scss';

const AssignmentResponseEditPage: FC<UserProps & DefaultSecureRouteProps<{ id: string }>> = ({
	match,
	commonUser,
}) => {
	const { tText, tHtml } = useTranslation();

	// Data
	const assignmentId = match.params.id;
	const [assignment, setAssignment] = useState<Avo.Assignment.Assignment | null>(null);
	const [assignmentLoading, setAssignmentLoading] = useState<boolean>(false);
	const [assignmentError, setAssignmentError] = useState<{
		message: string | ReactNode;
		icon: IconName;
	} | null>(null);
	const [assignmentResponse, setAssignmentResponse] = useState<Omit<
		Avo.Assignment.Response,
		'assignment'
	> | null>(null);

	// UI

	const [isTeacherPreviewEnabled, setIsTeacherPreviewEnabled] = useState<boolean>(false);

	// HTTP
	const fetchAssignment = useCallback(async () => {
		try {
			setAssignmentLoading(true);

			// Check if the user is a teacher, they do not have permission to create a response for assignments and should see a clear error message
			if (
				!PermissionService.hasPerm(commonUser, PermissionName.CREATE_ASSIGNMENT_RESPONSE) &&
				PermissionService.hasPerm(commonUser, PermissionName.CREATE_ASSIGNMENTS)
			) {
				setAssignmentError({
					message: tHtml(
						'assignment/views/assignment-response-edit/assignment-response-edit-page___je-kan-geen-antwoorden-indienen-op-deze-opdracht-aangezien-je-geen-leerling-bent-gebruikt-de-bekijk-als-leerling-knop-om-te-zien-we-je-leerlingen-zien'
					),
					icon: IconName.userStudent,
				});
				setAssignmentLoading(false);
				return;
			}

			if (!canViewAnAssignment(commonUser)) {
				setAssignmentError({
					message: tHtml(
						'assignment/views/assignment-response-edit/assignment-response-edit-page___je-hebt-geen-rechten-om-deze-opdracht-te-bekijken'
					),
					icon: IconName.lock,
				});
				setAssignmentLoading(false);
				return;
			}

			// Get assignment
			setAssignmentError(null);
			if (!commonUser?.profileId) {
				ToastService.danger(
					tHtml(
						'assignment/views/assignment-response-edit___het-ophalen-van-de-opdracht-is-mislukt-de-ingelogde-gebruiker-heeft-geen-profiel-id'
					)
				);
				return;
			}

			const assignmentOrError: Avo.Assignment.Assignment =
				await AssignmentService.fetchAssignmentAndContent(
					commonUser.profileId,
					assignmentId
				);

			if (isString(assignmentOrError)) {
				// error
				setAssignmentError(
					getAssignmentErrorObj(assignmentOrError as AssignmentRetrieveError)
				);
				setAssignmentLoading(false);
				return;
			}

			// Assignment is loaded but if there is no deadline set, show 'Not yet available' error to the student
			if (assignmentOrError.deadline_at === null) {
				// error
				setAssignmentError(
					getAssignmentErrorObj(AssignmentRetrieveError.NOT_YET_AVAILABLE)
				);
				setAssignmentLoading(false);
				return;
			}

			// Track assignment view
			AssignmentService.increaseViewCount(assignmentOrError.id).then(noop); // Not waiting for view events increment
			trackEvents(
				{
					object: assignmentOrError.id,
					object_type: 'assignment',
					action: 'view',
					resource: {
						education_level: String(assignment?.education_level_id),
					},
				},
				commonUser
			);

			// Create an assignment response if needed
			const newOrExistingAssignmentResponse =
				await AssignmentService.createOrFetchAssignmentResponseObject(
					assignmentOrError,
					commonUser
				);
			setAssignmentResponse(newOrExistingAssignmentResponse);

			setAssignment(assignmentOrError);
		} catch (err) {
			setAssignmentError({
				message: tHtml(
					'assignment/views/assignment-response-edit/assignment-response-edit-page___het-ophalen-van-de-opdracht-is-mislukt'
				),
				icon: IconName.userStudent,
			});
		}
		setAssignmentLoading(false);
	}, [assignment?.education_level_id, assignmentId, commonUser, tHtml]);

	// Effects

	useEffect(() => {
		fetchAssignment().then(noop);
	}, []);

	// Events

	// Render

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
			return (
				<ErrorView
					message={
						assignmentError.message ||
						tHtml(
							'assignment/views/assignment-response-edit___het-ophalen-van-de-opdracht-is-mislukt'
						)
					}
					icon={assignmentError.icon || 'alert-triangle'}
				/>
			);
		}
		if (!assignment) {
			return (
				<ErrorView
					message={tHtml(
						'assignment/views/assignment-response-edit___de-opdracht-is-niet-gevonden'
					)}
					icon={IconName.search}
				/>
			);
		}

		if (isTeacherPreviewEnabled) {
			return (
				assignmentResponse && (
					<div className="c-assignment-response-page c-assignment-response-page--edit">
						<PupilCollectionForTeacherPreview
							assignmentResponse={assignmentResponse}
							metadata={
								<AssignmentMetadata
									assignment={assignment}
									assignmentResponse={assignmentResponse}
									who={'pupil'}
								/>
							}
							onClose={() => setIsTeacherPreviewEnabled(false)}
						/>
					</div>
				)
			);
		}

		if (!assignmentResponse) {
			return (
				<ErrorView
					message={tHtml(
						'assignment/views/assignment-response-edit/assignment-response-edit-page___de-opdracht-antwoord-entry-kon-niet-worden-aangemaakt'
					)}
					icon={IconName.alertTriangle}
				/>
			);
		}

		return (
			<AssignmentResponseEdit
				assignment={assignment}
				assignmentResponse={assignmentResponse}
				setAssignmentResponse={setAssignmentResponse}
				showBackButton
				onShowPreviewClicked={() => {
					setIsTeacherPreviewEnabled(true);
				}}
				onAssignmentChanged={fetchAssignment}
			/>
		);
	};

	return (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						tText(
							'assignment/views/assignment-response-edit___maak-opdracht-antwoord-pagina-titel'
						)
					)}
				</title>

				<meta
					name="description"
					content={tText(
						'assignment/views/assignment-response-edit___maak-opdracht-antwoord-pagina-beschrijving'
					)}
				/>
			</Helmet>

			{renderPageContent()}
		</>
	);
};

export default compose(withRouter, withUser)(AssignmentResponseEditPage) as FC;
