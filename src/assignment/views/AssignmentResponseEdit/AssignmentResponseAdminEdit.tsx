import { Flex, IconName, Spacer, Spinner } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { PermissionName } from '@viaa/avo2-types';
import React, {
	Dispatch,
	FunctionComponent,
	ReactNode,
	SetStateAction,
	useCallback,
	useEffect,
	useState,
} from 'react';
import MetaTags from 'react-meta-tags';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { PermissionService } from '../../../authentication/helpers/permission-service';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import withUser, { UserProps } from '../../../shared/hocs/withUser';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { AssignmentService } from '../../assignment.service';
import AssignmentMetadata from '../../components/AssignmentMetadata';
import { PupilCollectionForTeacherPreview } from '../../components/PupilCollectionForTeacherPreview';

import AssignmentResponseEdit from './AssignmentResponseEdit';

import '../AssignmentPage.scss';
import './AssignmentResponseEdit.scss';

const AssignmentResponseAdminEdit: FunctionComponent<
	UserProps & DefaultSecureRouteProps<{ assignmentId: string; responseId: string }>
> = ({ match, user }) => {
	const { tText, tHtml } = useTranslation();

	// Data
	const assignmentId = match.params.assignmentId;
	const assignmentResponseId = match.params.responseId;
	const [assignment, setAssignment] = useState<Avo.Assignment.Assignment | null>(null);
	const [assignmentLoading, setAssignmentLoading] = useState<boolean>(false);
	const [assignmentError, setAssignmentError] = useState<{
		message: string | ReactNode;
		icon?: IconName;
	} | null>(null);
	const [assignmentResponse, setAssignmentResponse] = useState<Avo.Assignment.Response | null>(
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
					message: tHtml(
						'assignment/views/assignment-response-edit/assignment-response-admin-edit___enkel-een-admin-kan-leerlingencollecties-bewerken'
					),
					icon: IconName.userStudent,
				});
				setAssignmentLoading(false);
				return;
			}

			// Get assignment
			setAssignmentError(null);
			if (!user.profile?.id) {
				ToastService.danger(
					tHtml(
						'assignment/views/assignment-response-edit___het-ophalen-van-de-opdracht-is-mislukt-de-ingelogde-gebruiker-heeft-geen-profiel-id'
					)
				);
				return;
			}

			const assignment = await AssignmentService.fetchAssignmentAndContent(
				user.profile.id,
				assignmentId
			);

			// Create an assignment response if needed
			const response = await AssignmentService.getAssignmentResponseById(
				assignmentResponseId
			);
			if (!response) {
				setAssignmentError({
					message: tText(
						'assignment/views/assignment-response-edit/assignment-response-admin-edit___de-leerlingencollectie-kon-niet-opgehaald-worden'
					),
					icon: IconName.userStudent,
				});
				setAssignmentLoading(false);
				return;
			}

			setAssignmentResponse(response);

			setAssignment(assignment);
		} catch (err) {
			console.error(err);
			setAssignmentError({
				message: tHtml(
					'assignment/views/assignment-response-edit/assignment-response-admin-edit___het-ophalen-van-de-opdracht-antwoord-is-mislukt'
				),
				icon: IconName.alertTriangle,
			});
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
						tHtml(
							'assignment/views/assignment-response-edit___het-ophalen-van-de-opdracht-is-mislukt'
						)
					}
					icon={assignmentError.icon || IconName.alertTriangle}
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
				setAssignmentResponse={
					setAssignmentResponse as Dispatch<
						SetStateAction<
							| (Omit<Avo.Assignment.Response, 'assignment' | 'id'> & {
									id: string | undefined;
							  })
							| null
						>
					>
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
			</MetaTags>

			{renderPageContent()}
		</>
	);
};

export default compose(withRouter, withUser)(AssignmentResponseAdminEdit) as FunctionComponent;
