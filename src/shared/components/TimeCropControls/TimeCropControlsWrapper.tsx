import {
  TimeCropControls,
  TimeCropControlsErrors,
} from '@meemoo/react-components';
import { clsx } from 'clsx';
import { type FC } from 'react';

import './TimeCropControlsWrapper.scss';
import { tHtml } from '../../helpers/translate-html.tsx';
import { tText } from '../../helpers/translate-text.ts';
import { ToastService } from '../../services/toast-service.tsx';

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
  const onError = (error: TimeCropControlsErrors) => {
    if (error === TimeCropControlsErrors.WRONG_FORMAT_START_DATE) {
      ToastService.danger(
        tHtml(
          'item/components/modals/add-to-collection-modal___de-ingevulde-starttijd-heeft-niet-het-correcte-formaat-uu-mm-ss',
        ),
      );
    } else if (error === TimeCropControlsErrors.WRONG_FORMAT_END_DATE) {
      ToastService.danger(
        tHtml(
          'item/components/modals/add-to-collection-modal___de-ingevulde-eidntijd-heeft-niet-het-correcte-formaat-uu-mm-ss',
        ),
      );
    }
  };

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
      correctWrongTimeInput={false}
      allowStartAndEndToBeTheSame={true}
      disabled={disabled}
      onChange={(startTime, endTime) => {
        console.log(startTime, endTime);
        onChange(startTime, endTime);
      }}
      onError={onError}
      startInputAriaLabel={tText(
        'shared/components/time-crop-controls/time-crop-controls-wrapper___start-tijd-van-de-video-audio-selectie-input-aria-label',
      )}
      endInputAriaLabel={tText(
        'shared/components/time-crop-controls/time-crop-controls-wrapper___eind-tijd-van-de-video-audio-selectie-input-aria-label',
      )}
      startSliderAriaLabel={tText(
        'shared/components/time-crop-controls/time-crop-controls-wrapper___start-tijd-van-de-video-audio-selectie-input-aria-label',
      )}
      endSliderAriaLabel={tText(
        'shared/components/time-crop-controls/time-crop-controls-wrapper___eind-tijd-van-de-video-audio-selectie-input-aria-label',
      )}
      startSliderId="time-crop-controls__start-slider-id"
      endSliderId="time-crop-controls__end-slider-id"
    />
  );
};
