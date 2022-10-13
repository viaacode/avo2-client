import { Flex, Spacer, Spinner } from '@viaa/avo2-components';
import { isString } from 'lodash-es';
import React, {
	Dispatch,
	FunctionComponent,
	SetStateAction,
	useCallback,
	useEffect,
	useState,
} from 'react';
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
import { ToastService } from '../../../shared/services';
import { getAssignmentErrorObj } from '../../assignment.helper';
import { AssignmentService } from '../../assignment.service';
import {
	Assignment_Response_v2,
	Assignment_v2,
	AssignmentRetrieveError,
	SimplifiedAssignment,
} from '../../assignment.types';
import AssignmentMetadata from '../../components/AssignmentMetadata';
import { PupilCollectionForTeacherPreview } from '../../components/PupilCollectionForTeacherPreview';

import AssignmentResponseEdit from './AssignmentResponseEdit';

import '../AssignmentPage.scss';
import './AssignmentResponseEdit.scss';

const AssignmentResponseAdminEdit: FunctionComponent<
	UserProps & DefaultSecureRouteProps<{ assignmentId: string; responseId: string }>
> = ({ match, user }) => {
	const [t] = useTranslation();

	// Data
	const assignmentId = match.params.assignmentId;
	const assignmentResponseId = match.params.responseId;
	const [assignment, setAssignment] = useState<SimplifiedAssignment | null>(null);
	const [assignmentLoading, setAssignmentLoading] = useState<boolean>(false);
	const [assignmentError, setAssignmentError] = useState<any | null>(null);
	const [assignmentResponse, setAssignmentResponse] = useState<Assignment_Response_v2 | null>(
		null
	);

	// UI

	const [isTeacherPreviewEnabled, setIsTeacherPreviewEnabled] = useState<boolean>(false);

	// HTTP
	const fetchAssignment = useCallback(async () => {
		try {
			setAssignmentLoading(true);

			// Check if the user is a teacher, they do not have permission to create a response for assignments and should see a clear error message
			if (!PermissionService.hasPerm(user, PermissionName.EDIT_ANY_ASSIGNMENT_RESPONSES)) {
				setAssignmentError({
					message: t(
						'assignment/views/assignment-response-edit/assignment-response-admin-edit___enkel-een-admin-kan-leerlingencollecties-bewerken'
					),
					icon: 'user-student',
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

			const assignmentOrError: SimplifiedAssignment | string =
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

			// Create an assignment response if needed
			const response = await AssignmentService.getAssignmentResponseById(
				assignmentResponseId
			);
			if (!response) {
				setAssignmentError({
					message: t(
						'assignment/views/assignment-response-edit/assignment-response-admin-edit___de-leerlingencollectie-kon-niet-opgehaald-worden'
					),
					icon: 'user-student',
				});
				setAssignmentLoading(false);
				return;
			}

			setAssignmentResponse(response);

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
				setAssignmentResponse={
					setAssignmentResponse as Dispatch<SetStateAction<Assignment_Response_v2>>
				}
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

export default compose(withRouter, withUser)(AssignmentResponseAdminEdit) as FunctionComponent;
