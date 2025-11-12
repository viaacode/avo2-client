import { Container, MultiRange, TextInput } from '@viaa/avo2-components'
import { clsx } from 'clsx'
import { clamp } from 'es-toolkit'
import React, { type FC, useEffect, useState } from 'react'

import { getValidStartAndEnd } from '../../helpers/cut-start-and-end.js'
import { formatDurationHoursMinutesSeconds } from '../../helpers/formatters/duration.js'
import { parseDuration, toSeconds } from '../../helpers/parsers/duration.js'
import { ToastService } from '../../services/toast-service.js'

import './TimeCropControls.scss'
import { tHtml } from '../../helpers/translate-html.js'

interface TimeCropControlsPops {
  startTime: number
  endTime: number
  minTime: number
  maxTime: number
  disabled?: boolean
  onChange: (newStartTime: number, newEndTime: number) => void
  className?: string
}

export const TimeCropControls: FC<TimeCropControlsPops> = ({
  startTime,
  endTime,
  minTime,
  maxTime,
  disabled,
  onChange,
  className,
}) => {
  const [fragmentStartString, setFragmentStartString] = useState<string>(
    formatDurationHoursMinutesSeconds(startTime),
  )
  const [fragmentEndString, setFragmentEndString] = useState<string>(
    formatDurationHoursMinutesSeconds(endTime),
  )

  const clampDuration = (value: number): number => {
    return clamp(value, minTime, maxTime)
  }

  useEffect(() => {
    setFragmentStartString(formatDurationHoursMinutesSeconds(startTime))
    setFragmentEndString(formatDurationHoursMinutesSeconds(endTime))
  }, [startTime, endTime])

  const onUpdateMultiRangeValues = (values: number[]) => {
    onChange(values[0], values[1])
  }
  const updateStartAndEnd = (type: 'start' | 'end', value?: string) => {
    if (value) {
      // onChange event
      if (type === 'start') {
        setFragmentStartString(value)
      } else {
        setFragmentEndString(value)
      }
      if (/[0-9]{2}:[0-9]{2}:[0-9]{2}/.test(value)) {
        // full duration
        if (type === 'start') {
          const newStartTime = clampDuration(parseDuration(value))

          if (newStartTime > (endTime || maxTime)) {
            onChange(newStartTime, newStartTime)
          } else {
            onChange(newStartTime, endTime)
          }
        } else {
          const newEndTime = clampDuration(parseDuration(value))

          if (newEndTime < (startTime || minTime)) {
            onChange(newEndTime, newEndTime)
          } else {
            onChange(startTime, newEndTime)
          }
        }
      }
      // else do nothing yet, until the user finishes the time entry
    } else {
      // on blur event
      if (type === 'start') {
        if (/[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/.test(fragmentStartString)) {
          const newStartTime = clampDuration(parseDuration(fragmentStartString))

          if (newStartTime > (endTime || maxTime)) {
            onChange(newStartTime, newStartTime)
          } else {
            onChange(newStartTime, endTime)
          }
        } else {
          onChange(0, endTime)
          ToastService.danger(
            tHtml(
              'item/components/modals/add-to-collection-modal___de-ingevulde-starttijd-heeft-niet-het-correcte-formaat-uu-mm-ss',
            ),
          )
        }
      } else {
        if (/[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/.test(fragmentEndString)) {
          const newEndTime = clampDuration(parseDuration(fragmentEndString))

          if (newEndTime < (startTime || minTime)) {
            onChange(newEndTime, newEndTime)
          } else {
            onChange(startTime, newEndTime)
          }
        } else {
          onChange(startTime, toSeconds(endTime) || 0)
          ToastService.danger(
            tHtml(
              'item/components/modals/add-to-collection-modal___de-ingevulde-eidntijd-heeft-niet-het-correcte-formaat-uu-mm-ss',
            ),
          )
        }
      }
    }
  }

  const [start, end] = getValidStartAndEnd(
    startTime || minTime,
    endTime || maxTime,
    maxTime,
  )
  return (
    <Container className={clsx('c-time-crop-controls', className)}>
      <TextInput
        value={fragmentStartString}
        disabled={disabled}
        onBlur={() => updateStartAndEnd('start')}
        onChange={(endTime) => updateStartAndEnd('start', endTime)}
      />
      <div className="m-multi-range-wrapper">
        <MultiRange
          values={[start || minTime, end || maxTime]}
          disabled={disabled}
          onChange={onUpdateMultiRangeValues}
          min={minTime}
          max={Math.max(maxTime, minTime + 1)} // Avoid issues with min === 0 and max === 0 with Range library
          step={1}
        />
      </div>
      <TextInput
        disabled={disabled}
        value={fragmentEndString}
        onBlur={() => updateStartAndEnd('end')}
        onChange={(endTime) => updateStartAndEnd('end', endTime)}
      />
    </Container>
  )
}
