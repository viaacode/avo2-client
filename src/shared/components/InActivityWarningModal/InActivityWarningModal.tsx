import { Modal, ModalBody } from '@viaa/avo2-components'
import { addMinutes, differenceInSeconds, isAfter } from 'date-fns'
import { useAtomValue } from 'jotai'
import React, { type FC, type ReactNode, useEffect, useState } from 'react'
import { useIdleTimer } from 'react-idle-timer'
import { matchPath } from 'react-router'

import {
  EDIT_STATUS_REFETCH_TIME,
  IDLE_TIME_UNTIL_WARNING,
  MAX_EDIT_IDLE_TIME,
} from '../../constants/index.js'
import { formatDurationMinutesSeconds } from '../../helpers/formatters/duration.js'
import { tHtml } from '../../helpers/translate-html.js'
import { useBeforeUnload } from '../../hooks/useBeforeUnload.js'
import { lastVideoPlayedAtAtom } from '../../store/ui.store.js'

type InActivityWarningModalProps = {
  onActivity: () => void
  onExit: () => void
  onForcedExit: () => void
  warningMessage: string | ReactNode
  editPath: string
  currentPath: string
}

export const InActivityWarningModal: FC<InActivityWarningModalProps> = ({
  onActivity,
  onExit,
  onForcedExit,
  warningMessage,
  editPath,
  currentPath,
}) => {
  const maxIdleTime = MAX_EDIT_IDLE_TIME / 1000
  const [remainingTime, setRemainingTime] = useState<number>(maxIdleTime)
  const [isWarningModalOpen, setIsWarningModalOpen] = useState<boolean>(false)
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false)
  const [idleStart, setIdleStart] = useState<Date | null>(null)
  const [documentTitle] = useState(document.title)

  const lastVideoPlayedAt = useAtomValue(lastVideoPlayedAtAtom)

  useEffect(() => {
    if (!isTimedOut) {
      return () => {
        onExit()
      }
    }
  }, [isTimedOut])

  useBeforeUnload(() => {
    onExit()
  })

  useEffect(() => {
    const changingRoute = !matchPath(currentPath, editPath)
    if (changingRoute) {
      onExit()
    }
  }, [currentPath])

  const handleOnAction = () => {
    setIdleStart(null)
    setRemainingTime(maxIdleTime)
    setIsWarningModalOpen(false)
    onActivity()
    reset()
  }

  const onIdle = () => {
    // Last video play was less than 1 minute ago?
    if (
      !!lastVideoPlayedAt &&
      isAfter(lastVideoPlayedAt, addMinutes(new Date(), -1))
    ) {
      // Video is playing => do not show modal
      // https://meemoo.atlassian.net/browse/AVO-2983
    } else {
      // No video is playing and user is idle
      setIsWarningModalOpen(true)
      setIdleStart(new Date())
    }
  }

  const { reset } = useIdleTimer({
    onAction: handleOnAction,
    onActive: handleOnAction,
    onIdle,
    throttle: EDIT_STATUS_REFETCH_TIME,
    timeout: IDLE_TIME_UNTIL_WARNING,
  })

  useEffect(() => {
    let timerId: number | null = null
    if (idleStart) {
      timerId = window.setInterval(() => {
        const idledTime = differenceInSeconds(new Date(), idleStart)

        setRemainingTime(Math.max(maxIdleTime - idledTime, 0))
      }, 500)
    }

    return () => {
      if (timerId) {
        clearInterval(timerId)
      }
    }
  }, [idleStart])

  useEffect(() => {
    if (remainingTime === 0) {
      setIsTimedOut(true)
      onForcedExit()
    }

    // AVO-2846: show timer before tab title when timer starts counting down
    if (remainingTime < maxIdleTime) {
      document.title =
        formatDurationMinutesSeconds(remainingTime) + ' | ' + documentTitle
    }

    // AVO-2846: hide timer in tab title when there is activity
    if (remainingTime >= maxIdleTime) {
      document.title = documentTitle
    }
  }, [remainingTime])

  return (
    <Modal
      isOpen={isWarningModalOpen}
      title={tHtml(
        'shared/components/in-activity-warning-modal/in-activity-warning-modal___opgelet',
      )}
      size="medium"
    >
      <ModalBody>
        <p>{formatDurationMinutesSeconds(remainingTime)}</p>

        {warningMessage}
      </ModalBody>
    </Modal>
  )
}
