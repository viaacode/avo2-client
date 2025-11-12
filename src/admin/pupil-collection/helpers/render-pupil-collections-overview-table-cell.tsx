import { Button, IconName } from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import React, { type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS } from '../../../assignment/assignment.const.js'
import { APP_PATH } from '../../../constants.js'
import { type PupilCollectionOverviewTableColumns } from '../../../pupil-collection/pupil-collection.types.js'
import { buildLink } from '../../../shared/helpers/build-link.js'
import { formatDate } from '../../../shared/helpers/formatters/date.js'
import { ACTIONS_TABLE_COLUMN_ID } from '../../../shared/helpers/table-column-list-to-csv-column-list.js'
import { tText } from '../../../shared/helpers/translate-text.js'
import { truncateTableValue } from '../../../shared/helpers/truncate.js'

export function renderPupilCollectionTableCellReact(
  pupilCollection: Partial<Avo.Assignment.Response>,
  columnId: PupilCollectionOverviewTableColumns,
): ReactNode {
  const { id, created_at, updated_at, assignment_id, assignment } =
    pupilCollection

  switch (columnId) {
    case 'title':
      return (
        <Link
          to={buildLink(APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_DETAIL.route, {
            assignmentId: assignment_id,
            responseId: id,
          })}
        >
          {truncateTableValue(pupilCollection?.collection_title || '-')}
        </Link>
      )

    case 'pupil':
      return truncateTableValue(pupilCollection?.owner?.full_name)

    case 'assignmentTitle':
      return (
        <Link
          to={buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, {
            id: assignment_id,
          })}
        >
          {truncateTableValue(assignment?.title || '-')}
        </Link>
      )

    case 'teacher':
      return truncateTableValue(pupilCollection?.assignment?.owner?.full_name)

    case 'created_at':
      return formatDate(created_at) || '-'

    case 'updated_at':
      return formatDate(updated_at) || '-'

    case 'deadline_at':
      return formatDate(assignment?.deadline_at) || '-'

    case 'status':
      return !!assignment?.deadline_at &&
        new Date(assignment?.deadline_at).getTime() < new Date().getTime()
        ? tText(
            'admin/pupil-collection/views/pupil-collections-overview___afgelopen',
          )
        : tText(
            'admin/pupil-collection/views/pupil-collections-overview___actief',
          )

    case ACTIONS_TABLE_COLUMN_ID:
    default:
      // TODO link to correct edit page for pupil collection
      //localhost:8080/werkruimte/opdrachten/de61d05b-ab4c-4651-a631-d97f76e9f280/antwoorden/6b7ebe33-6cdf-4e7f-b5d4-a38b8e2fa8b8
      return (
        <Link
          to={buildLink(
            APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_ADMIN_EDIT.route,
            {
              assignmentId: assignment?.id,
              responseId: id,
            },
            { tab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.MY_COLLECTION },
          )}
        >
          <Button
            icon={IconName.edit2}
            ariaLabel="Bewerk deze opdracht"
            type="secondary"
          />
        </Link>
      )
  }
}

export function renderPupilCollectionTableCellText(
  pupilCollection: Partial<Avo.Assignment.Response>,
  columnId: PupilCollectionOverviewTableColumns,
): string {
  const { created_at, updated_at, assignment } = pupilCollection

  switch (columnId) {
    case 'title':
      return pupilCollection?.collection_title || ''

    case 'pupil':
      return pupilCollection?.owner?.full_name || ''

    case 'assignmentTitle':
      return assignment?.title || ''

    case 'teacher':
      return pupilCollection?.assignment?.owner?.full_name || ''

    case 'created_at':
      return formatDate(created_at) || ''

    case 'updated_at':
      return formatDate(updated_at) || ''

    case 'deadline_at':
      return formatDate(assignment?.deadline_at) || ''

    case 'status':
      return !!assignment?.deadline_at &&
        new Date(assignment?.deadline_at).getTime() < new Date().getTime()
        ? tText(
            'admin/pupil-collection/views/pupil-collections-overview___afgelopen',
          )
        : tText(
            'admin/pupil-collection/views/pupil-collections-overview___actief',
          )

    case ACTIONS_TABLE_COLUMN_ID:
      return ''

    default:
      return pupilCollection[columnId] || '-'
  }
}
