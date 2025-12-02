import {
  Alert,
  Button,
  Flex,
  IconName,
  Spacer,
  TextInput,
} from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import { clsx } from 'clsx'
import { type FC } from 'react'

import { APP_PATH } from '../../../constants';
import { buildLink } from '../../helpers/build-link';
import { copyToClipboard } from '../../helpers/clipboard';
import { tHtml } from '../../helpers/translate-html';
import { tText } from '../../helpers/translate-text';
import { useAssignmentPastDeadline } from '../../hooks/useAssignmentPastDeadline';
import { ToastService } from '../../services/toast-service';

import './ShareWithPupils.scss'

export type ShareWithPupilsProps = {
  assignment?: Avo.Assignment.Assignment
  onDetailLinkClicked?: () => void
  onContentLinkClicked?: () => void
}

export const ShareWithPupil: FC<ShareWithPupilsProps> = ({
  assignment,
  onDetailLinkClicked,
  onContentLinkClicked,
}) => {
  const isAssignmentExpired = useAssignmentPastDeadline(assignment)

  // Computed
  const assignmentShareLink: string = assignment
    ? window.location.origin +
      buildLink(APP_PATH.ASSIGNMENT_RESPONSE_DETAIL.route, {
        id: assignment.id,
      })
    : ''

  // https://meemoo.atlassian.net/browse/AVO-2819
  // https://meemoo.atlassian.net/browse/AVO-2051
  const isAssignmentDetailsComplete =
    !!assignment?.available_at && !!assignment?.deadline_at

  const hasAssignmentContent = !!assignment?.blocks?.length

  const canCopy =
    !isAssignmentExpired && hasAssignmentContent && isAssignmentDetailsComplete

  const handleCopyButtonClicked = () => {
    copyToClipboard(assignmentShareLink)
    ToastService.success(
      tHtml(
        'assignment/components/share-assignment-with-pupil___de-link-is-naar-je-klembord-gekopieerd',
      ),
    )
  }

  const handleContentLinkClicked = () => {
    onContentLinkClicked?.()
  }

  const handleDetailLinkClicked = () => {
    onDetailLinkClicked?.()
  }

  const determineAlertContent = () => {
    if (canCopy) {
      return {
        title: '',
        content: (
          <p>
            {tHtml(
              'shared/components/share-with-pupils/share-with-pupils___je-kan-de-link-enkel-delen-met-leerlingen-die-smartschool-of-leer-id-hebben',
            )}
          </p>
        ),
      }
    }

    if (isAssignmentExpired) {
      return {
        title: tText(
          'assignment/components/share-assignment-with-pupil___opdracht-is-verlopen--titel',
        ),
        content: (
          <p>
            {tHtml(
              'assignment/components/share-assignment-with-pupil___opdracht-is-verlopen--beschrijving',
            )}
          </p>
        ),
      }
    }

    if (!hasAssignmentContent) {
      return {
        title: tText(
          'assignment/components/share-assignment-with-pupil___link-nog-niet-deelbaar',
        ),
        content: (
          <p>
            {tText(
              'assignment/components/share-assignment-with-pupil___deze-opdracht-bevat-nog-geen',
            ) + ' '}
            <Button
              label={tText(
                'assignment/components/share-assignment-with-pupil___inhoud',
              )}
              type="inline-link"
              onClick={handleContentLinkClicked}
            />
            {'.'}
          </p>
        ),
      }
    }

    if (!isAssignmentDetailsComplete) {
      return {
        title: tText(
          'assignment/components/share-assignment-with-pupil___link-nog-niet-deelbaar',
        ),
        content: (
          <p>
            {tText(
              'assignment/components/share-assignment-with-pupil___vul-de-ontbrekende-informatie-onder',
            ) + ' '}
            <Button
              label={tText(
                'assignment/components/share-assignment-with-pupil___details',
              )}
              type="inline-link"
              onClick={handleDetailLinkClicked}
            />
            {' ' +
              tText('assignment/components/share-assignment-with-pupil___aan')}
          </p>
        ),
      }
    }

    return {
      title: '',
      content: '',
    }
  }

  const renderAlert = () => {
    const { title, content } = determineAlertContent()

    return (
      (title || content) && (
        <>
          <Spacer margin="bottom" />
          <Alert
            type={canCopy ? 'warn' : 'info'}
            message={
              <>
                {title && (
                  <h4>
                    <strong>{title}</strong>
                  </h4>
                )}
                {content}
              </>
            }
          />
        </>
      )
    )
  }
  return (
    <div
      className={clsx('c-share-with-pupil', {
        ['c-share-with-pupil--disabled']: !canCopy,
      })}
    >
      <Flex>
        <TextInput value={assignmentShareLink} />
        <Button
          label={tText(
            'assignment/components/share-assignment-with-pupil___kopieer',
          )}
          icon={IconName.copy}
          onClick={handleCopyButtonClicked}
          disabled={!canCopy}
          type="tertiary"
        />
      </Flex>
      {renderAlert()}
    </div>
  )
}
