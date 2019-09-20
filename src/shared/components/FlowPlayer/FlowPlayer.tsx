import React, { FunctionComponent, useEffect, useRef } from 'react';

import { Icon } from '@viaa/avo2-components';
import { CustomWindow } from '../../../shared/types/global';

import './FlowPlayer.scss';

declare const flowplayer: any;

interface FlowPlayerProps {
	src: string | null;
	poster: string;
	logo?: string;
	title: string;
	start?: number;
	end?: number;
	onInit?: () => void;
}

export const FlowPlayer: FunctionComponent<FlowPlayerProps> = ({ src, poster, title, onInit }) => {
	const videoContainerRef = useRef(null);
	const videoPlayerRef = useRef(null);

	useEffect(() => {
		if (videoContainerRef.current) {
			videoPlayerRef.current = flowplayer(videoContainerRef.current, {
				// DATA
				title,
				poster,
				src,

				// CONFIGURATION
				token: (window as CustomWindow)._ENV_.FLOW_PLAYER_TOKEN,
				autoplay: true,
				ui: flowplayer.ui.LOGO_ON_RIGHT | flowplayer.ui.USE_DRAG_HANDLE,
				plugins: ['subtitles', 'chromecast'],
			});
		}

		return () => {
			if (videoPlayerRef.current) {
				(videoPlayerRef.current as any).destroy();
				videoPlayerRef.current = null;
			}
		};
	}, [videoContainerRef, src, poster, title]);

	return src && poster ? (
		<div
			className="c-video-player"
			data-player-id={(window as CustomWindow)._ENV_.FLOW_PLAYER_ID}
			ref={videoContainerRef}
		/>
	) : (
		<div className="c-video-player">
			<div className="c-video-player__item">
				<img src={poster} alt={`Thumbnail voor video over ${title}.`} />
			</div>
			<div className="c-play-overlay" onClick={onInit}>
				<div className="c-play-overlay__inner">
					<Icon name="play" />
				</div>
			</div>
		</div>
	);
};
