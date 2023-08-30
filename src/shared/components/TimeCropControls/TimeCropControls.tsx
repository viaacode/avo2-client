import { Container, MultiRange, TextInput } from '@viaa/avo2-components';
import classnames from 'classnames';
import { clamp } from 'lodash-es';
import React, { FC, useEffect, useState } from 'react';

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
	const [fragmentStartTime, setFragmentStartTime] = useState<number>(startTime || minTime);
	const [fragmentEndTime, setFragmentEndTime] = useState<number>(endTime || maxTime);

	const clampDuration = (value: number): number => {
		return clamp(value, minTime, maxTime);
	};

	useEffect(() => {
		onChange(fragmentStartTime, fragmentEndTime);
	}, [fragmentStartTime, fragmentEndTime]);

	const onUpdateMultiRangeValues = (values: number[]) => {
		setFragmentStartTime(values[0]);
		setFragmentEndTime(values[1]);
		setFragmentStartString(formatDurationHoursMinutesSeconds(values[0]));
		setFragmentEndString(formatDurationHoursMinutesSeconds(values[1]));
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
					setFragmentStartTime(newStartTime);
					setFragmentStartString(formatDurationHoursMinutesSeconds(newStartTime));
					if (newStartTime > fragmentEndTime) {
						setFragmentEndTime(newStartTime);
						setFragmentEndString(formatDurationHoursMinutesSeconds(newStartTime));
					}
				} else {
					const newEndTime = clampDuration(parseDuration(value));
					setFragmentEndTime(newEndTime);
					setFragmentEndString(formatDurationHoursMinutesSeconds(newEndTime));
					if (newEndTime < fragmentStartTime) {
						setFragmentStartTime(newEndTime);
						setFragmentStartString(formatDurationHoursMinutesSeconds(newEndTime));
					}
				}
			}
			// else do nothing yet, until the user finishes the time entry
		} else {
			// on blur event
			if (type === 'start') {
				if (/[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/.test(fragmentStartString)) {
					const newStartTime = clampDuration(parseDuration(fragmentStartString));
					setFragmentStartTime(newStartTime);
					setFragmentStartString(formatDurationHoursMinutesSeconds(newStartTime));
					if (newStartTime > fragmentEndTime) {
						setFragmentEndTime(newStartTime);
						setFragmentEndString(formatDurationHoursMinutesSeconds(newStartTime));
					}
				} else {
					setFragmentStartTime(0);
					setFragmentStartString(formatDurationHoursMinutesSeconds(0));
					ToastService.danger(
						tHtml(
							'item/components/modals/add-to-collection-modal___de-ingevulde-starttijd-heeft-niet-het-correcte-formaat-uu-mm-ss'
						)
					);
				}
			} else {
				if (/[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/.test(fragmentEndString)) {
					const newEndTime = clampDuration(parseDuration(fragmentEndString));
					setFragmentEndTime(newEndTime);
					setFragmentEndString(formatDurationHoursMinutesSeconds(newEndTime));
					if (newEndTime < fragmentStartTime) {
						setFragmentStartTime(newEndTime);
						setFragmentStartString(formatDurationHoursMinutesSeconds(newEndTime));
					}
				} else {
					setFragmentEndTime(toSeconds(endTime) || 0);
					setFragmentEndString(
						formatDurationHoursMinutesSeconds(toSeconds(endTime) || 0)
					);
					ToastService.danger(
						tHtml(
							'item/components/modals/add-to-collection-modal___de-ingevulde-eidntijd-heeft-niet-het-correcte-formaat-uu-mm-ss'
						)
					);
				}
			}
		}
	};

	const [start, end] = getValidStartAndEnd(fragmentStartTime, fragmentEndTime, maxTime);
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
