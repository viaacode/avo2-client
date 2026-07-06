import { TimeCropControls } from '@meemoo/react-components';
import { clsx } from 'clsx';
import { noop } from 'es-toolkit';
import { type FC } from 'react';

import './TimeCropControlsWrapper.scss';
import { tText } from '../../helpers/translate-text.ts';

interface TimeCropControlsPops {
  startTime: number;
  endTime: number;
  minTime: number;
  maxTime: number;
  disabled?: boolean;
  onChange: (newStartTime: number, newEndTime: number) => void;
  className?: string;
}

export const TimeCropControlsWrapper: FC<TimeCropControlsPops> = ({
  startTime,
  endTime,
  minTime,
  maxTime,
  disabled,
  onChange,
  className,
}) => {
  return (
    <TimeCropControls
      id="material-request_for-reuse-blade__time-crop-controls"
      className={clsx('c-time-crop-controls', className)}
      startTime={startTime ?? 0}
      endTime={endTime}
      minTime={minTime}
      maxTime={maxTime}
      trackColor="#C4C4C4"
      highlightColor="#25a4cf"
      correctWrongTimeInput={true}
      allowStartAndEndToBeTheSame={true}
      disabled={disabled}
      onChange={(startTime, endTime) => onChange(startTime, endTime)}
      onError={noop}
      startInputAriaLabel={tText(
        'start-tijd-van-de-video-audio-selectie-input-aria-label',
      )}
      endInputAriaLabel={tText(
        'eind-tijd-van-de-video-audio-selectie-input-aria-label',
      )}
      startSliderAriaLabel={tText(
        'start-tijd-van-de-video-audio-selectie-input-aria-label',
      )}
      endSliderAriaLabel={tText(
        'eind-tijd-van-de-video-audio-selectie-input-aria-label',
      )}
      startSliderId="time-crop-controls__start-slider-id"
      endSliderId="time-crop-controls__end-slider-id"
    />
  );
};
