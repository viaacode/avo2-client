import { convertToHtml } from '@viaa/avo2-components';
import React, { FC, useCallback, useEffect, useRef } from 'react';

import { parseDuration } from '../../helpers';
import Html from '../Html/Html';

interface TextWithTimestampsProps {
	content: string;
}

const TIMESTAMP_REGEX = /([0-9]{2}:[0-9]{2}(:[0-9]{2})?)/g;

const TextWithTimestamps: FC<TextWithTimestampsProps> = ({ content }) => {
	const textWrapperRef = useRef<HTMLDivElement>(null);

	const format = (input: string) => {
		return input
			.replace(/[\n\r]+/, '')
			.replace(TIMESTAMP_REGEX, (match) => `<span class="c-timestamp">${match}</span>`);
	};

	const handleTimestampClicked = useCallback((e: MouseEvent) => {
		const isTimestamp = (e.target as HTMLElement).classList.contains('c-timestamp');
		const text = (e.target as HTMLElement).innerText;

		if (isTimestamp) {
			const parsed = parseDuration(text);
			if (!isNaN(parsed)) {
				const playingVideo: HTMLVideoElement | null = document.querySelector(
					'.c-video-player .is-playing video'
				) as HTMLVideoElement | null;
				if (playingVideo) {
					playingVideo.currentTime = parsed;
				}
			}
		}
	}, []);

	useEffect(() => {
		textWrapperRef?.current?.addEventListener('click', handleTimestampClicked);

		return () => {
			textWrapperRef?.current?.removeEventListener('click', handleTimestampClicked);
		};
	}, [textWrapperRef, handleTimestampClicked]);

	return (
		<div className="c-text-with-timestamps" ref={textWrapperRef}>
			<Html
				type="div"
				className="c-content"
				sanitizePreset="full"
				content={format(convertToHtml(content))}
			/>
		</div>
	);
};

export default TextWithTimestamps;
