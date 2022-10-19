import { Flex, Spacer, Spinner } from '@viaa/avo2-components';
import { isString } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import {
	PermissionName,
	PermissionService,
} from '../../../authentication/helpers/permission-service';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import withUser, { UserProps } from '../../../shared/hocs/withUser';
import { trackEvents } from '../../../shared/services/event-logging-service';
import { ToastService } from '../../../shared/services/toast-service';
import { getAssignmentErrorObj } from '../../assignment.helper';
import { AssignmentService } from '../../assignment.service';
import {
	Assignment_v2_With_Labels,
	Assignment_v2_With_Responses,
	AssignmentResponseInfo,
	AssignmentRetrieveError,
} from '../../assignment.types';
import AssignmentMetadata from '../../components/AssignmentMetadata';
import { PupilCollectionForTeacherPreview } from '../../components/PupilCollectionForTeacherPreview';
import { canViewAnAssignment } from '../../helpers/can-view-an-assignment';

import AssignmentResponseEdit from './AssignmentResponseEdit';

import '../AssignmentPage.scss';
import './AssignmentResponseEdit.scss';

const AssignmentResponseEditPage: FunctionComponent<
	UserProps & DefaultSecureRouteProps<{ id: string }>
> = ({ match, user }) => {
	const [t] = useTranslation();

	// Data
	const assignmentId = match.params.id;
	const [assignment, setAssignment] = useState<
		(Assignment_v2_With_Labels & Assignment_v2_With_Responses) | null
	>(null);
	const [assignmentLoading, setAssignmentLoading] = useState<boolean>(false);
	const [assignmentError, setAssignmentError] = useState<any | null>(null);
	const [assignmentResponse, setAssignmentResponse] = useState<Omit<
		AssignmentResponseInfo,
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
				!PermissionService.hasPerm(user, PermissionName.CREATE_ASSIGNMENT_RESPONSE) &&
				PermissionService.hasPerm(user, PermissionName.CREATE_ASSIGNMENTS)
			) {
				setAssignmentError({
					message: t(
						'assignment/views/assignment-response-edit/assignment-response-edit-page___je-kan-geen-antwoorden-indienen-op-deze-opdracht-aangezien-je-geen-leerling-bent-gebruikt-de-bekijk-als-leerling-knop-om-te-zien-we-je-leerlingen-zien'
					),
					icon: 'user-student',
				});
				setAssignmentLoading(false);
				return;
			}

			if (!canViewAnAssignment(user)) {
				setAssignmentError({
					message: t(
						'assignment/views/assignment-response-edit/assignment-response-edit-page___je-hebt-geen-rechten-om-deze-opdracht-te-bekijken'
					),
					icon: 'lock',
				});
				setAssignmentLoading(false);
				return;
			}

			// Get assignment
			setAssignmentError(null);
			if (!user.profile?.id) {
				ToastService.danger(
					t(
						'assignment/views/assignment-response-edit___het-ophalen-van-de-opdracht-is-mislukt-de-ingelogde-gebruiker-heeft-geen-profiel-id'
					)
				);
				return;
			}

			const assignmentOrError: Assignment_v2_With_Labels & Assignment_v2_With_Responses =
				await AssignmentService.fetchAssignmentAndContent(user.profile.id, assignmentId);

			if (isString(assignmentOrError)) {
				// error
				setAssignmentError({
					state: 'error',
					...getAssignmentErrorObj(assignmentOrError as AssignmentRetrieveError),
				});
				setAssignmentLoading(false);
				return;
			}

			// Assignment is loaded but if there is no deadline set, show 'Not yet available' error to the student
			if (assignmentOrError.deadline_at === null) {
				// error
				setAssignmentError({
					state: 'error',
					...getAssignmentErrorObj(AssignmentRetrieveError.NOT_YET_AVAILABLE),
				});
				setAssignmentLoading(false);
				return;
			}

			// Track assignment view
			AssignmentService.increaseViewCount(assignmentOrError.id); // Not waiting for view events increment
			trackEvents(
				{
					object: assignmentOrError.id,
					object_type: 'avo_assignment',
					action: 'view',
				},
				user
			);

			// Create an assignment response if needed
			const newOrExistingAssignmentResponse =
				await AssignmentService.createOrFetchAssignmentResponseObject(
					assignmentOrError,
					user
				);
			setAssignmentResponse(newOrExistingAssignmentResponse);

			setAssignment(assignmentOrError);
		} catch (err) {
			setAssignmentError(err);
		}
		setAssignmentLoading(false);
	}, [assignmentId]);

	// Effects

	useEffect(() => {
		fetchAssignment();
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
						t(
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
					message={t(
						'assignment/views/assignment-response-edit___de-opdracht-is-niet-gevonden'
					)}
					icon={'search'}
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
					message={t(
						'assignment/views/assignment-response-edit/assignment-response-edit-page___de-opdracht-antwoord-entry-kon-niet-worden-aangemaakt'
					)}
					icon="alert-triangle"
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
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						t(
							'assignment/views/assignment-response-edit___maak-opdracht-antwoord-pagina-titel'
						)
					)}
				</title>

				<meta
					name="description"
					content={t(
						'assignment/views/assignment-response-edit___maak-opdracht-antwoord-pagina-beschrijving'
					)}
				/>
			</MetaTags>

			{renderPageContent()}
		</>
	);
};

export default compose(withRouter, withUser)(AssignmentResponseEditPage) as FunctionComponent;
