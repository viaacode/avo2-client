import { Dispatch, RefObject, SetStateAction, useCallback, useEffect, useState } from 'react';
import { NumberParam, useQueryParams } from 'use-query-params';

import { parseDuration } from '../helpers';

const TIMESTAMP_REGEX = /([0-9]{2}:[0-9]{2}:[0-9]{2})/g;
const isTimestamp = (text?: string): boolean => {
	return !!text && TIMESTAMP_REGEX.test(text);
};

const format = (input: string) => {
	const className = 'c-timestamp';
	const formatted = input
		.replace(/[\n\r]+/, '')
		.replace(TIMESTAMP_REGEX, (match) => `<span class="${className}">${match}</span>`);

	return formatted;
};

export const useVideoWithTimestamps = (
	element?: RefObject<HTMLElement | undefined | null>,
	initialTime: number = 0
): [number, Dispatch<SetStateAction<number>>, (input: string) => string] => {
	const [time, setTime] = useState<number>(initialTime);
	const [query] = useQueryParams({
		time: NumberParam,
	});

	// Listener
	const handleElementClicked = useCallback((e: MouseEvent) => {
		const text = (e.target as HTMLElement).innerText;

		if (text.length <= 8 && isTimestamp(text)) {
			const parsed = parseDuration(text);
			!isNaN(parsed) && setTime(parsed);
		}
	}, []);

	// Manage listeners
	useEffect(() => {
		const ref: HTMLElement | undefined | null = element?.current;
		ref && ref.addEventListener('click', handleElementClicked);

		return () => ref?.removeEventListener('click', handleElementClicked);
	}, [element, handleElementClicked]);

	// Watch query parameters for `time=`
	useEffect(() => {
		query.time && setTime(query.time);
	}, [query, setTime]);

	// Synchronise incoming values with local state
	useEffect(() => {
		initialTime && setTime(initialTime);
	}, [initialTime, setTime]);

	return [time, setTime, format];
};
