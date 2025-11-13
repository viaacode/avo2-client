import { Flex } from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import React, { type FC } from 'react'

import { formatTimestamp } from '../../shared/helpers/formatters/date';

import './AssignmentMetadata.scss'
import { tHtml } from '../../shared/helpers/translate-html';

type AssignmentMetadataProps = {
  assignment: Avo.Assignment.Assignment
  assignmentResponse?: Omit<Avo.Assignment.Response, 'assignment'> | null
  who: 'teacher' | 'pupil'
}

export const AssignmentMetadata: FC<AssignmentMetadataProps> = ({
  assignment,
  assignmentResponse,
  who,
}) => {
  if (!assignment) {
    return null
  }

  const teacherName = who === 'teacher' && assignment?.owner?.full_name
  const pupilName = who === 'pupil' && assignmentResponse?.owner?.full_name
  const deadline = formatTimestamp(assignment?.deadline_at, false)

  return (
    <section className="u-spacer-bottom">
      <Flex className="l-assignment-response__meta-data">
        {[
          teacherName && (
            <>
              {tHtml('assignment/views/assignment-response-edit___lesgever')}:
              <b>{` ${teacherName}`}</b>
            </>
          ),
          pupilName && (
            <>
              {tHtml('assignment/components/assignment-metadata___leerling')}:
              <b>{` ${pupilName}`}</b>
            </>
          ),
          deadline && (
            <>
              {tHtml('assignment/views/assignment-response-edit___deadline')}:
              <b>{` ${deadline}`}</b>
            </>
          ),
        ]
          .filter((node) => !!node)
          .map((node, i) => (
            <div
              key={`l-assignment-response__meta-data__item--${i}`}
              className="l-assignment-response__meta-data__item"
            >
              {node}
            </div>
          ))}
      </Flex>
    </section>
  )
}
