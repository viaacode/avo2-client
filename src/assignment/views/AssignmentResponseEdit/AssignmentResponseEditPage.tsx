import { BlockHeading, Button, Container, Flex, Spacer, Spinner } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { isString } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { InteractiveTour } from '../../../shared/components';
import AlertBar from '../../../shared/components/AlertBar/AlertBar';
import BlockList from '../../../shared/components/BlockList/BlockList';
import { isMobileWidth } from '../../../shared/helpers';
import withUser, { UserProps } from '../../../shared/hocs/withUser';
import { ToastService } from '../../../shared/services';
import { getAssignmentErrorObj } from '../../assignment.helper';
import { AssignmentService } from '../../assignment.service';
import { AssignmentRetrieveError } from '../../assignment.types';
import AssignmentHeading from '../../components/AssignmentHeading';
import AssignmentMetadata from '../../components/AssignmentMetadata';

import AssignmentResponseEdit from './AssignmentResponseEdit';

import '../AssignmentPage.scss';
import './AssignmentResponseEdit.scss';
import { trackEvents } from '../../../shared/services/event-logging-service';

const AssignmentResponseEditPage: FunctionComponent<
	UserProps & DefaultSecureRouteProps<{ id: string }>
> = ({ match, user }) => {
	const [t] = useTranslation();

	// Data
	const assignmentId = match.params.id;
	const [assignment, setAssignment] = useState<Avo.Assignment.Assignment_v2 | null>(null);
	const [assignmentLoading, setAssignmentLoading] = useState<boolean>(false);
	const [assignmentError, setAssignmentError] = useState<any | null>(null);
	const [assignmentResponse, setAssignmentResponse] = useState<Avo.Assignment.Response_v2 | null>(
		null
	);

	// UI

	const [isTeacherPreviewEnabled, setIsTeacherPreviewEnabled] = useState<boolean>(false);

	// HTTP
	const fetchAssignment = useCallback(async () => {
		try {
			setAssignmentLoading(true);

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

			const assignmentOrError: Avo.Assignment.Assignment_v2 | string =
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

	const renderPupilCollectionForTeacherPreview = () => {
		const closePreviewButton = (
			<Button
				icon="close"
				label={
					isMobileWidth()
						? undefined
						: t(
								'assignment/views/assignment-response-edit/assignment-response-edit-page___sluit-preview'
						  )
				}
				ariaLabel={t(
					'assignment/views/assignment-response-edit/assignment-response-edit-page___sluit-preview'
				)}
				type="borderless-i"
				onClick={() => setIsTeacherPreviewEnabled(false)}
			/>
		);
		const collectionTitle = (
			<BlockHeading className="u-spacer-left" type="h2">
				{assignmentResponse?.collection_title || ''}
			</BlockHeading>
		);
		return (
			<>
				<AlertBar
					icon="alert-circle"
					textLeft={t(
						'assignment/views/assignment-response-edit/assignment-response-edit-page___je-bent-aan-het-kijken-als-lesgever'
					)}
					contentRight={closePreviewButton}
				/>
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
					tour={<InteractiveTour showButton />}
				/>
				<Container mode="horizontal">
					<BlockList
						blocks={
							(assignmentResponse?.pupil_collection_blocks ||
								[]) as Avo.Core.BlockItemBase[]
						}
					/>
				</Container>
			</>
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
				<div className="c-assignment-response-page c-assignment-response-page--edit">
					{renderPupilCollectionForTeacherPreview()}
				</div>
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
