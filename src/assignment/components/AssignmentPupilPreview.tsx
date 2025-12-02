import { Button, IconName } from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import { useAtomValue } from 'jotai'
import { noop } from 'es-toolkit'
import {
  type Dispatch,
  type FC,
  type SetStateAction,
  useMemo,
  useState,
} from 'react'

import { commonUserAtom } from '../../authentication/authentication.store';
import { AlertBar } from '../../shared/components/AlertBar/AlertBar';
import { EducationLevelId } from '../../shared/helpers/lom';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';
import { AssignmentResponseEdit } from '../views/AssignmentResponseEdit/AssignmentResponseEdit';

type AssignmentPupilPreviewProps = {
  assignment: Partial<Avo.Assignment.Assignment>
  isPreview?: boolean
  onClose: () => void
}

export const AssignmentPupilPreview: FC<AssignmentPupilPreviewProps> = ({
  assignment,
  isPreview = false,
  onClose,
}) => {
  const commonUser = useAtomValue(commonUserAtom)
  const [assignmentResponse, setAssignmentResponse] =
    useState<Avo.Assignment.Response>({
      collection_title: '',
      pupil_collection_blocks: [],
      assignment_id: assignment.id as string,
      assignment: assignment as unknown as Avo.Assignment.Assignment,
      owner: {
        full_name: tText(
          'assignment/components/assignment-pupil-preview___naam-leerling',
        ),
      },
      owner_profile_id: commonUser?.profileId,
      id: '///fake-assignment-response-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Avo.Assignment.Response)

  const renderClosePreviewButton = () => (
    <Button
      icon={IconName.close}
      label={
        isMobileWidth()
          ? undefined
          : tText(
              'assignment/components/assignment-pupil-preview___sluit-preview',
            )
      }
      ariaLabel={tText(
        'assignment/components/assignment-pupil-preview___sluit-preview',
      )}
      type="borderless-i"
      onClick={onClose}
    />
  )

  const alertText = useMemo(() => {
    const level = assignment.education_level_id

    switch (level) {
      case EducationLevelId.lagerOnderwijs:
        return tHtml(
          'assignment/components/assignment-pupil-preview___je-bent-aan-het-kijken-als-een-leerling-lager',
        )

      case EducationLevelId.secundairOnderwijs:
        return tHtml(
          'assignment/components/assignment-pupil-preview___je-bent-aan-het-kijken-als-een-leerling-secundair',
        )

      default:
        return tHtml(
          'assignment/components/assignment-pupil-preview___je-bent-aan-het-kijken-als-leerling',
        )
    }
  }, [assignment])

  return (
    <>
      <AlertBar
        icon={IconName.info}
        textLeft={alertText}
        contentRight={renderClosePreviewButton()}
      />
      {assignmentResponse && (
        <AssignmentResponseEdit
          assignment={assignment as Avo.Assignment.Assignment}
          assignmentResponse={assignmentResponse}
          setAssignmentResponse={
            setAssignmentResponse as Dispatch<
              SetStateAction<
                | (Omit<Avo.Assignment.Response, 'assignment' | 'id'> & {
                    id: string | undefined
                  })
                | null
              >
            >
          }
          isPreview={isPreview}
          showBackButton={false}
          onAssignmentChanged={async () => {
            // Ignore changes to assignment during preview
          }}
          onShowPreviewClicked={noop}
        />
      )}
    </>
  )
}
