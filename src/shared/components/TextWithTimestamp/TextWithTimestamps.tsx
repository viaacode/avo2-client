import { SanitizePreset } from '@meemoo/admin-core-ui/client';
import { setPlayingVideoSeekTime } from '@meemoo/react-components';
import React, { type FC, useCallback, useEffect, useRef } from 'react';

import { textToHtmlWithTimestamps } from '../../helpers/formatters/text-to-html-with-timestamps';
import { parseDuration } from '../../helpers/parsers/duration';
import { Html } from '../Html/Html';

import './TextWithTimestamps.scss';

interface TextWithTimestampsProps {
	content: string;
}

export const TextWithTimestamps: FC<TextWithTimestampsProps> = ({ content }) => {
	const textWrapperRef = useRef<HTMLDivElement>(null);

	const handleTimestampClicked = useCallback((e: MouseEvent) => {
		const isTimestamp = (e.target as HTMLElement).classList.contains('c-timestamp');
		const text = (e.target as HTMLElement).innerText;

		if (isTimestamp) {
			const parsed = parseDuration(text);
			if (!isNaN(parsed)) {
				setPlayingVideoSeekTime(parsed);
			}
		}
	}, []);

	useEffect(() => {
		textWrapperRef?.current?.addEventListener('click', handleTimestampClicked);
		const textWrapperRefCurrent = textWrapperRef?.current;

		return () => {
			textWrapperRefCurrent?.removeEventListener('click', handleTimestampClicked);
		};
	}, [textWrapperRef, handleTimestampClicked]);

	return (
		<div className="c-text-with-timestamps" ref={textWrapperRef}>
			<Html
				type="div"
				className="c-content"
				sanitizePreset={SanitizePreset.full}
				content={textToHtmlWithTimestamps(content)}
			/>
		</div>
	);
};
