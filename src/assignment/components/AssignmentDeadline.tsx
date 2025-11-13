import {
  DeadlineIndicator,
  type DeadlineIndicatorColors,
  type DeadlineIndicatorShapes,
  Flex,
  FlexItem,
} from '@viaa/avo2-components'
import { differenceInHours } from 'date-fns'
import React, { type FC, useMemo } from 'react'

import { formatCustomTimestamp } from '../../shared/helpers/formatters/date';

interface AssignmentDeadlineProps {
  deadline?: string | null | Date
}

export const AssignmentDeadline: FC<AssignmentDeadlineProps> = ({
  deadline,
}) => {
  const config: [DeadlineIndicatorColors, DeadlineIndicatorShapes] | undefined =
    useMemo(() => {
      if (!deadline) return undefined

      const now = new Date()
      const cast = new Date(deadline)
      const difference = differenceInHours(cast, now)

      if (difference <= 48) {
        return ['error', 'square']
      }

      if (difference <= 168) {
        return ['yellow', 'diamond']
      }

      return ['success', 'circle']
    }, [deadline])

  if (!config) {
    return <>-</>
  }

  return (
    <Flex center>
      <DeadlineIndicator
        className="u-spacer-right-s"
        color={config[0]}
        shape={config[1]}
      />

      <FlexItem shrink={false}>
        {formatCustomTimestamp(deadline, 'dd-MM-yyyy HH:mm')}
      </FlexItem>
    </Flex>
  )
}
