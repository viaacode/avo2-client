import { IconName } from '@viaa/avo2-components';
import {
  AvoAssignmentAssignment,
  AvoAssignmentResponse,
  PermissionName,
} from '@viaa/avo2-types';
import { noop } from 'es-toolkit';
import { useAtomValue } from 'jotai';
import {
  type Dispatch,
  type FC,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router';

import { commonUserAtom } from '../../../authentication/authentication.store';
import { PermissionService } from '../../../authentication/helpers/permission-service';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views/ErrorView';
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { ToastService } from '../../../shared/services/toast-service';
import { AssignmentService } from '../../assignment.service';
import { AssignmentMetadata } from '../../components/AssignmentMetadata';
import { PupilCollectionForTeacherPreview } from '../../components/PupilCollectionForTeacherPreview';

import { AssignmentResponseEdit } from './AssignmentResponseEdit';

import '../AssignmentPage.scss';
import './AssignmentResponseEdit.scss';

export const AssignmentResponseAdminEdit: FC = () => {
  const { assignmentId, responseId: assignmentResponseId } = useParams<{
    assignmentId: string;
    responseId: string;
  }>();

  const commonUser = useAtomValue(commonUserAtom);
  // Data
  const [assignment, setAssignment] = useState<AvoAssignmentAssignment | null>(
    null,
  );
  const [assignmentLoading, setAssignmentLoading] = useState<boolean>(false);
  const [assignmentError, setAssignmentError] = useState<{
    message: string | ReactNode;
    icon?: IconName;
  } | null>(null);
  const [assignmentResponse, setAssignmentResponse] =
    useState<AvoAssignmentResponse | null>(null);

  // UI

  const [isTeacherPreviewEnabled, setIsTeacherPreviewEnabled] =
    useState<boolean>(false);

  // HTTP
  const fetchAssignment = useCallback(async () => {
    try {
      if (!assignmentId || !assignmentResponseId) {
        return;
      }
      setAssignmentLoading(true);

      // Check if the user is a teacher, they do not have permission to create a response for assignments and should see a clear error message
      if (
        !PermissionService.hasPerm(
          commonUser,
          PermissionName.EDIT_ANY_ASSIGNMENT_RESPONSES,
        )
      ) {
        setAssignmentError({
          message: tHtml(
            'assignment/views/assignment-response-edit/assignment-response-admin-edit___enkel-een-admin-kan-leerlingencollecties-bewerken',
          ),
          icon: IconName.userStudent,
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

      const assignment = await AssignmentService.fetchAssignmentAndContent(
        commonUser?.profileId,
        assignmentId,
      );

      // Create an assignment response if needed
      const response =
        await AssignmentService.getAssignmentResponseById(assignmentResponseId);
      if (!response) {
        setAssignmentError({
          message: tText(
            'assignment/views/assignment-response-edit/assignment-response-admin-edit___de-leerlingencollectie-kon-niet-opgehaald-worden',
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
          'assignment/views/assignment-response-edit/assignment-response-admin-edit___het-ophalen-van-de-opdracht-antwoord-is-mislukt',
        ),
        icon: IconName.alertTriangle,
      });
    }
    setAssignmentLoading(false);
  }, [assignmentId, assignmentResponseId]);

  // Effects

  useEffect(() => {
    fetchAssignment().then(noop);
  }, [fetchAssignment]);

  // Events

  // Render

  const renderPageContent = () => {
    if (assignmentLoading) {
      return (
        <FullPageSpinner locationId="assignment-response-admin-edit--loading" />
      );
    }
    if (assignmentError) {
      return (
        <ErrorView
          message={
            assignmentError.message ||
            tHtml(
              'assignment/views/assignment-response-edit___het-ophalen-van-de-opdracht-is-mislukt',
            )
          }
          icon={assignmentError.icon || IconName.alertTriangle}
          locationId="assignment-response-admin-edit--error"
        />
      );
    }
    if (!assignment) {
      return (
        <ErrorView
          message={tHtml(
            'assignment/views/assignment-response-edit___de-opdracht-is-niet-gevonden',
          )}
          icon={IconName.search}
          locationId="assignment-response-admin-edit--error"
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
          locationId="assignment-response-admin-edit--error"
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
              | (Omit<AvoAssignmentResponse, 'assignment' | 'id'> & {
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
      <Helmet>
        <title>
          {GENERATE_SITE_TITLE(
            tText(
              'assignment/views/assignment-response-edit___maak-opdracht-antwoord-pagina-titel',
            ),
          )}
        </title>

        <meta
          name="description"
          content={tText(
            'assignment/views/assignment-response-edit___maak-opdracht-antwoord-pagina-beschrijving',
          )}
        />
      </Helmet>

      {renderPageContent()}
    </>
  );
};

export default AssignmentResponseAdminEdit;
