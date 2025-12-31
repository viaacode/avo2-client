import { IconName } from '@viaa/avo2-components';
import { AvoAssignmentAssignment, AvoAssignmentResponse, PermissionName, } from '@viaa/avo2-types';
import { isString, noop } from 'es-toolkit';
import { useAtomValue } from 'jotai';
import { type FC, type ReactNode, useCallback, useEffect, useState, } from 'react';
import { useParams } from 'react-router';

import { commonUserAtom } from '../../../authentication/authentication.store';
import { PermissionService } from '../../../authentication/helpers/permission-service';
import { ErrorView } from '../../../error/views/ErrorView';
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner';
import { trackEvents } from '../../../shared/services/event-logging-service';
import { ToastService } from '../../../shared/services/toast-service';
import { getAssignmentErrorObj } from '../../assignment.helper';
import { AssignmentService } from '../../assignment.service';
import { AssignmentRetrieveError } from '../../assignment.types';
import { AssignmentMetadata } from '../../components/AssignmentMetadata';
import { PupilCollectionForTeacherPreview } from '../../components/PupilCollectionForTeacherPreview';
import { canViewAnAssignment } from '../../helpers/can-view-an-assignment';

import { AssignmentResponseEdit } from './AssignmentResponseEdit';

import '../AssignmentPage.scss';
import './AssignmentResponseEdit.scss';
import { SeoMetadata } from '../../../shared/components/SeoMetadata/SeoMetadata.tsx';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';

export const AssignmentResponseEditPage: FC = () => {
  const { id: assignmentId } = useParams<{ id: string }>();

  const commonUser = useAtomValue(commonUserAtom);
  // Data
  const [assignment, setAssignment] = useState<AvoAssignmentAssignment | null>(
    null,
  );
  const [assignmentLoading, setAssignmentLoading] = useState<boolean>(false);
  const [assignmentError, setAssignmentError] = useState<{
    message: string | ReactNode;
    icon: IconName;
  } | null>(null);
  const [assignmentResponse, setAssignmentResponse] = useState<Omit<
    AvoAssignmentResponse,
    'assignment'
  > | null>(null);

  // UI

  const [isTeacherPreviewEnabled, setIsTeacherPreviewEnabled] =
    useState<boolean>(false);

  // HTTP
  const fetchAssignment = useCallback(async () => {
    try {
      if (!assignmentId) {
        return;
      }
      setAssignmentLoading(true);

      // Check if the user is a teacher, they do not have permission to create a response for assignments and should see a clear error message
      if (
        !PermissionService.hasPerm(
          commonUser,
          PermissionName.CREATE_ASSIGNMENT_RESPONSE,
        ) &&
        PermissionService.hasPerm(commonUser, PermissionName.CREATE_ASSIGNMENTS)
      ) {
        setAssignmentError({
          message: tHtml(
            'assignment/views/assignment-response-edit/assignment-response-edit-page___je-kan-geen-antwoorden-indienen-op-deze-opdracht-aangezien-je-geen-leerling-bent-gebruikt-de-bekijk-als-leerling-knop-om-te-zien-we-je-leerlingen-zien',
          ),
          icon: IconName.userStudent,
        });
        setAssignmentLoading(false);
        return;
      }

      if (!canViewAnAssignment(commonUser)) {
        setAssignmentError({
          message: tHtml(
            'assignment/views/assignment-response-edit/assignment-response-edit-page___je-hebt-geen-rechten-om-deze-opdracht-te-bekijken',
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
            'assignment/views/assignment-response-edit___het-ophalen-van-de-opdracht-is-mislukt-de-ingelogde-gebruiker-heeft-geen-profiel-id',
          ),
        );
        return;
      }

      const assignmentOrError: AvoAssignmentAssignment =
        await AssignmentService.fetchAssignmentAndContent(
          commonUser.profileId,
          assignmentId,
        );

      if (isString(assignmentOrError)) {
        // error
        setAssignmentError(
          getAssignmentErrorObj(assignmentOrError as AssignmentRetrieveError),
        );
        setAssignmentLoading(false);
        return;
      }

      // Assignment is loaded but if there is no deadline set, show 'Not yet available' error to the student
      if (assignmentOrError.deadline_at === null) {
        // error
        setAssignmentError(
          getAssignmentErrorObj(AssignmentRetrieveError.NOT_YET_AVAILABLE),
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
        commonUser,
      );

      // Create an assignment response if needed
      const newOrExistingAssignmentResponse =
        await AssignmentService.createOrFetchAssignmentResponseObject(
          assignmentOrError,
          commonUser,
        );
      setAssignmentResponse(
        newOrExistingAssignmentResponse as Omit<
          AvoAssignmentResponse,
          'assignment'
        >,
      );

      setAssignment(assignmentOrError);
    } catch (err) {
      setAssignmentError({
        message: tHtml(
          'assignment/views/assignment-response-edit/assignment-response-edit-page___het-ophalen-van-de-opdracht-is-mislukt',
        ),
        icon: IconName.userStudent,
      });
    }
    setAssignmentLoading(false);
  }, [assignment?.education_level_id, assignmentId, commonUser]);

  // Effects

  useEffect(() => {
    fetchAssignment().then(noop);
  }, [fetchAssignment]);

  // Events

  // Render

  const renderPageContent = () => {
    if (assignmentLoading) {
      return (
        <FullPageSpinner locationId="assignment-response-edit-page--loading" />
      );
    }
    if (assignmentError) {
      return (
        <ErrorView
          message={
            assignmentError.message ||
            tHtml(
              'assignment/views/assignment-response-edit/assignment-response-edit-page___het-ophalen-van-de-opdracht-is-mislukt',
            )
          }
          icon={assignmentError.icon || 'alert-triangle'}
          locationId="assignment-response-edit-page--error"
        />
      );
    }
    if (!assignment) {
      return (
        <ErrorView
          message={tHtml(
            'assignment/views/assignment-response-edit/assignment-response-edit-page___de-opdracht-is-niet-gevonden',
          )}
          icon={IconName.search}
          locationId="assignment-response-edit-page--error"
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
            'assignment/views/assignment-response-edit/assignment-response-edit-page___de-opdracht-antwoord-entry-kon-niet-worden-aangemaakt',
          )}
          icon={IconName.alertTriangle}
          locationId="assignment-response-edit-page--error"
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
      <SeoMetadata
        title={tText(
          'assignment/views/assignment-response-edit___maak-opdracht-antwoord-pagina-titel',
        )}
        description={tText(
          'assignment/views/assignment-response-edit___maak-opdracht-antwoord-pagina-beschrijving',
        )}
      />

      {renderPageContent()}
    </>
  );
};
