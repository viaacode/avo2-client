import { Container, MultiRange, TextInput } from '@viaa/avo2-components';
import classnames from 'classnames';
import { clamp } from 'lodash-es';
import React, { type FC, useEffect, useState } from 'react';

import useTranslation from '../../../shared/hooks/useTranslation';
import { formatDurationHoursMinutesSeconds, parseDuration, toSeconds } from '../../helpers';
import { getValidStartAndEnd } from '../../helpers/cut-start-and-end';
import { ToastService } from '../../services/toast-service';

import './TimeCropControls.scss';

interface TimeCropControlsPops {
	startTime: number;
	endTime: number;
	minTime: number;
	maxTime: number;
	onChange: (newStartTime: number, newEndTime: number) => void;
	className?: string;
}

const TimeCropControls: FC<TimeCropControlsPops> = ({
	startTime,
	endTime,
	minTime,
	maxTime,
	onChange,
	className,
}) => {
	const { tHtml } = useTranslation();
	const [fragmentStartString, setFragmentStartString] = useState<string>(
		formatDurationHoursMinutesSeconds(startTime)
	);
	const [fragmentEndString, setFragmentEndString] = useState<string>(
		formatDurationHoursMinutesSeconds(endTime)
	);

	const clampDuration = (value: number): number => {
		return clamp(value, minTime, maxTime);
	};

	useEffect(() => {
		// console.log('set fragment strings', {
		// 	startTime,
		// 	endTime,
		// 	fragmentStartString: formatDurationHoursMinutesSeconds(startTime),
		// 	fragmentEndString: formatDurationHoursMinutesSeconds(endTime),
		// });
		setFragmentStartString(formatDurationHoursMinutesSeconds(startTime));
		setFragmentEndString(formatDurationHoursMinutesSeconds(endTime));
	}, [startTime, endTime]);

	const onUpdateMultiRangeValues = (values: number[]) => {
		// console.log('update multirange values', {
		// 	startTime: values[0],
		// 	endTime: values[1],
		// });
		onChange(values[0], values[1]);
	};
	const updateStartAndEnd = (type: 'start' | 'end', value?: string) => {
		if (value) {
			// onChange event
			if (type === 'start') {
				setFragmentStartString(value);
			} else {
				setFragmentEndString(value);
			}
			if (/[0-9]{2}:[0-9]{2}:[0-9]{2}/.test(value)) {
				// full duration
				if (type === 'start') {
					const newStartTime = clampDuration(parseDuration(value));

					if (newStartTime > (endTime || maxTime)) {
						onChange(newStartTime, newStartTime);
					} else {
						onChange(newStartTime, endTime);
					}
				} else {
					const newEndTime = clampDuration(parseDuration(value));

					if (newEndTime < (startTime || minTime)) {
						onChange(newEndTime, newEndTime);
					} else {
						onChange(startTime, newEndTime);
					}
				}
			}
			// else do nothing yet, until the user finishes the time entry
		} else {
			// on blur event
			if (type === 'start') {
				if (/[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/.test(fragmentStartString)) {
					const newStartTime = clampDuration(parseDuration(fragmentStartString));

					if (newStartTime > (endTime || maxTime)) {
						onChange(newStartTime, newStartTime);
					} else {
						onChange(newStartTime, endTime);
					}
				} else {
					onChange(0, endTime);
					ToastService.danger(
						tHtml(
							'item/components/modals/add-to-collection-modal___de-ingevulde-starttijd-heeft-niet-het-correcte-formaat-uu-mm-ss'
						)
					);
				}
			} else {
				if (/[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/.test(fragmentEndString)) {
					const newEndTime = clampDuration(parseDuration(fragmentEndString));

					if (newEndTime < (startTime || minTime)) {
						onChange(newEndTime, newEndTime);
					} else {
						onChange(startTime, newEndTime);
					}
				} else {
					onChange(startTime, toSeconds(endTime) || 0);
					ToastService.danger(
						tHtml(
							'item/components/modals/add-to-collection-modal___de-ingevulde-eidntijd-heeft-niet-het-correcte-formaat-uu-mm-ss'
						)
					);
				}
			}
		}
	};

	const [start, end] = getValidStartAndEnd(startTime || minTime, endTime || maxTime, maxTime);
	return (
		<Container className={classnames('c-time-crop-controls', className)}>
			<TextInput
				value={fragmentStartString}
				onBlur={() => updateStartAndEnd('start')}
				onChange={(endTime) => updateStartAndEnd('start', endTime)}
			/>
			<div className="m-multi-range-wrapper">
				<MultiRange
					values={[start || minTime, end || maxTime]}
					onChange={onUpdateMultiRangeValues}
					min={minTime}
					max={Math.max(maxTime, minTime + 1)} // Avoid issues with min === 0 and max === 0 with Range library
					step={1}
				/>
			</div>
			<TextInput
				value={fragmentEndString}
				onBlur={() => updateStartAndEnd('end')}
				onChange={(endTime) => updateStartAndEnd('end', endTime)}
			/>
		</Container>
	);
};

export default TimeCropControls;
