import { Button, IconName } from '@viaa/avo2-components';
import React, { type FC, useState } from 'react';

import { stripHtml } from '../../helpers';
import { tText } from '../../helpers/translate-text';

export interface TextToSpeechButtonProps {
	text: string | null | undefined;
	buttonLabel?: string;
	buttonIcon?: IconName;
}

enum PlaybackStatus {
	IDLE = 'IDLE',
	LOADING_LIBRARY = 'LOADING_LIBRARY',
	LOADING_MODEL = 'LOADING_MODEL',
	LOADING_SPEECH = 'LOADING_SPEECH',
	PLAYING = 'PLAYING',
	PAUSED = 'PAUSED',
}

const DEFAULT_LANGUAGE_MODEL = 'nl_BE-nathalie-x_low';

export const TextToSpeechButton: FC<TextToSpeechButtonProps> = ({
	text,
	buttonIcon = IconName.volume2,
	buttonLabel = tText('Lees voor'),
}) => {
	const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>(PlaybackStatus.IDLE);
	const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

	const readTextOutLoud = async (text: string) => {
		setPlaybackStatus(PlaybackStatus.LOADING_LIBRARY);
		const tts = await import('@diffusionstudio/vits-web');

		// Check model
		const loadedModels = await tts.stored();
		if (!loadedModels.includes(DEFAULT_LANGUAGE_MODEL)) {
			setPlaybackStatus(PlaybackStatus.LOADING_MODEL);
			await tts.download(DEFAULT_LANGUAGE_MODEL);
		}

		setPlaybackStatus(PlaybackStatus.LOADING_SPEECH);
		const wav = await tts.predict({
			text,
			voiceId: DEFAULT_LANGUAGE_MODEL,
		});

		const audioElementTemp = new Audio();
		setAudioElement(audioElementTemp);
		audioElementTemp.src = URL.createObjectURL(wav);
		audioElementTemp.addEventListener('ended', () => {
			if (!audioElement) {
				return;
			}
			audioElement.pause();
			audioElement.currentTime = 0;
			setPlaybackStatus(() => PlaybackStatus.PAUSED);
		});
		setPlaybackStatus(PlaybackStatus.PLAYING);
		await audioElementTemp.play();
	};

	const handleButtonClick = async () => {
		switch (playbackStatus) {
			case PlaybackStatus.IDLE:
				await readTextOutLoud(stripHtml(text));
				break;

			case PlaybackStatus.PLAYING:
				audioElement?.pause();
				setPlaybackStatus(PlaybackStatus.PAUSED);
				break;

			case PlaybackStatus.PAUSED:
				await audioElement?.play();
				setPlaybackStatus(PlaybackStatus.PLAYING);
				break;
		}
	};

	const getLabelByPlaybackStatus = () => {
		switch (playbackStatus) {
			case PlaybackStatus.IDLE:
				return buttonLabel;
			case PlaybackStatus.LOADING_LIBRARY:
				return tText('Laden bibliotheek...');
			case PlaybackStatus.LOADING_MODEL:
				return tText('Laden model...');
			case PlaybackStatus.LOADING_SPEECH:
				return tText('Laden stem...');
			case PlaybackStatus.PLAYING:
				return tText('Pauzeer');
			case PlaybackStatus.PAUSED:
				return tText('Speel af');
		}
	};

	const getIconByPlaybackStatus = () => {
		switch (playbackStatus) {
			case PlaybackStatus.IDLE:
				return buttonIcon;

			case PlaybackStatus.LOADING_LIBRARY:
			case PlaybackStatus.LOADING_MODEL:
			case PlaybackStatus.LOADING_SPEECH:
				return IconName.downloadCloud;

			case PlaybackStatus.PLAYING:
				return IconName.pause;

			case PlaybackStatus.PAUSED:
				return IconName.play;
		}
	};

	if (!text) {
		return null;
	}
	return (
		<Button
			type="secondary"
			icon={getIconByPlaybackStatus()}
			label={getLabelByPlaybackStatus()}
			onClick={() => handleButtonClick()}
		/>
	);
};
