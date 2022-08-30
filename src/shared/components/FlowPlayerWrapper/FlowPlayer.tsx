import flowplayer, { Config } from '@flowplayer/player';
import '@flowplayer/player/flowplayer.css';
import cuepointsPlugin from '@flowplayer/player/plugins/cuepoints';
import googleAnalyticsPlugin from '@flowplayer/player/plugins/google-analytics';
import hlsPlugin from '@flowplayer/player/plugins/hls';
import keyboardPlugin from '@flowplayer/player/plugins/keyboard';
import playlistPlugin from '@flowplayer/player/plugins/playlist';
import subtitlesPlugin from '@flowplayer/player/plugins/subtitles';
import {
	DefaultProps,
	EnglishContentType,
	MediaCard,
	MediaCardThumbnail,
	Thumbnail,
} from '@viaa/avo2-components';
import classnames from 'classnames';
import { get, isNil, isString, noop } from 'lodash-es';
import React, { createRef, FunctionComponent, useEffect, useMemo, useState } from 'react';
import { default as Scrollbar } from 'react-scrollbars-custom';

import './FlowPlayer.scss';

flowplayer(
	subtitlesPlugin,
	hlsPlugin,
	cuepointsPlugin,
	keyboardPlugin,
	playlistPlugin,
	googleAnalyticsPlugin
);

(flowplayer as any).i18n.nl = {
	ads: { ad: 'Ad', ads: 'Ads', advertisement: 'Advertentie', indicator: 'Ads' },
	audio: { button_txt: 'Audio', menu_title: 'Audio' },
	core: {
		exit_fullscreen: 'Sluit fullscreen',
		fullscreen: 'Fullscreen',
		mute: 'Dempen',
		pause: 'Pause',
		play: 'Play',
		unmute: 'Dempen opheffen',
		volume: 'Volume',
	},
	ovp: { starting_in: 'Start over' },
	playlist: { cancel: 'Annuleren', up_next: 'Volgende' },
	qsel: { menu_title: 'Kwaliteit' },
	share: {
		clipboard_failure: 'Toegang tot klembord mislukt',
		clipboard_success: 'De tekst staat nu op je klembord',
		embed: 'Embed',
		link: 'Link',
		menu_title: 'Deel',
	},
	speed: { menu_title: 'Snelheid' },
};

export type FlowplayerPlugin =
	| 'subtitles'
	| 'hls'
	| 'cuepoints'
	| 'keyboard'
	| 'playlist'
	| 'ga'
	| 'chromecast'
	| 'airplay';

export type GoogleAnalyticsEvent =
	| 'fullscreen_enter'
	| 'fullscreen_exit'
	| 'video_player_load'
	| 'video_start'
	| 'video_click_play'
	| 'video_pause'
	| 'video_resume'
	| 'video_mute'
	| 'video_unmute'
	| 'video_25_percent'
	| 'video_50_percent'
	| 'video_75_percent'
	| 'video_complete'
	| 'live_start'
	| 'live_click_play'
	| 'live_pause'
	| 'live_resume'
	| 'live_mute'
	| 'live_unmute'
	| 'live_complete'
	| 'ad_start_preroll'
	| 'ad_start_midroll'
	| 'ad_start_postroll'
	| 'ad_completed_preroll'
	| 'ad_completed_midroll'
	| 'ad_completed_postroll'
	| 'ad_skipped_preroll'
	| 'ad_skipped_midroll'
	| 'ad_skipped_postroll';

type Cuepoints = {
	startTime: number | null | undefined;
	endTime: number | null | undefined;
}[];

type FlowplayerConfigWithPlugins = Config & {
	cuepoints?: Cuepoints;
	subtitles?: { tracks: FlowplayerTrackSchema[] };
	chromecast?: any;
	keyboard?: any;
	speed: any;
	plugins: FlowplayerPlugin[];
};

export interface FlowplayerTrackSchema {
	crossorigin?: 'use-credentials' | 'anonymous';
	default: boolean;
	id?: string;
	kind?: 'captions' | 'subtitles' | 'descriptions';
	label: string;
	lang?: string;
	src: string;
}

export type FlowplayerSourceListSchema = {
	type: 'flowplayer/playlist';
	items: {
		src: string;
		title: string;
		category: EnglishContentType;
		provider: string;
		poster: string;
		cuepoints?: Cuepoints;
	}[];
};
export type FlowplayerSourceList = FlowplayerSourceListSchema;

export interface FlowPlayerPropsSchema extends DefaultProps {
	src: string | FlowplayerSourceListSchema;
	poster?: string;
	logo?: string;
	title?: string;
	metadata?: string[];
	start?: number | null;
	end?: number | null;
	speed?: {
		options: number[];
		labels: string[];
	};
	token?: string;
	dataPlayerId?: string;
	autoplay?: boolean;
	onPlay?: (src: string) => void;
	onPause?: () => void;
	onEnded?: () => void;
	onTimeUpdate?: (time: number) => void;
	preload?: 'none' | 'auto' | 'metadata';
	plugins?: FlowplayerPlugin[];
	subtitles?: FlowplayerTrackSchema[];
	playlistScrollable: boolean;
	canPlay?: boolean; // Indicates if the video can play at this type. Eg: will be set to false if a modal is open in front of the video player
	className?: string;
	googleAnalyticsId?: string;
	googleAnalyticsEvents?: GoogleAnalyticsEvent[];
	googleAnalyticsTitle?: string;
}

export const convertGAEventsArrayToObject = (
	googleAnalyticsEvents: GoogleAnalyticsEvent[]
): any => {
	return googleAnalyticsEvents.reduce((acc: any, curr: GoogleAnalyticsEvent) => {
		acc[curr] = curr;

		return acc;
	}, {});
};

const DEFAULT_VIDEO_HEIGHT = 500;
const DELAY_BETWEEN_PLAYLIST_VIDEOS = 7;

export const FlowPlayer: FunctionComponent<FlowPlayerPropsSchema> = ({
	src,
	poster,
	title,
	metadata,
	token,
	preload,
	speed,
	dataPlayerId,
	plugins = [
		'subtitles',
		'cuepoints',
		'hls',
		'ga',
		'keyboard',
		'playlist',
		// 'chromecast', 'airplay', // Disabled for now for video security: https://meemoo.atlassian.net/browse/AVO-1859
	],
	start,
	end,
	canPlay,
	logo,
	onPlay,
	onPause,
	onEnded,
	onTimeUpdate,
	className,
	playlistScrollable,
	subtitles,
	googleAnalyticsId,
	googleAnalyticsEvents,
	googleAnalyticsTitle,
}) => {
	const videoContainerRef = createRef<HTMLDivElement>();
	const [player, setPlayer] = useState<any | null>(null);
	const [resizeObserver, setResizeObserver] = useState<ResizeObserver>();
	const [startedPlaying, setStartedPlaying] = useState<boolean>(false);
	const [videoHeight, setVideoHeight] = useState<number>(DEFAULT_VIDEO_HEIGHT);

	useEffect(() => {
		if (src) {
			reInitFlowPlayer();
		}

		// Listen to video size changes
		if (videoContainerRef.current) {
			const resizeObserver = new ResizeObserver(onResizeHandler);
			resizeObserver.observe(videoContainerRef.current);
			setResizeObserver(resizeObserver);
			onResizeHandler();
		}

		return () => {
			// const flowPlayerInstance = flowPlayerInstance;
			if (player) {
				// player.destroy();
				if (player.parentElement) {
					player.parentElement.innerHTML = '';
				}
			}
			document
				.querySelectorAll('.fp-skip-prev,.fp-skip-next')
				.forEach((elem) => elem.remove());

			if (videoContainerRef.current) {
				resizeObserver?.unobserve(videoContainerRef.current);
			}
		};
	}, []);

	const onResizeHandler = () => {
		const tempVideoHeight =
			videoContainerRef.current?.getBoundingClientRect().height || DEFAULT_VIDEO_HEIGHT;
		const playlistContainer: HTMLDivElement | null | undefined =
			videoContainerRef.current?.parentNode?.querySelector(
				'.c-video-player__playlist__scrollable'
			);
		setVideoHeight(tempVideoHeight);
		if (playlistContainer) {
			playlistContainer.style.height = tempVideoHeight + 'px';
		}
	};

	const createTitleOverlay = () => {
		const titleOverlay = document.createElement('div');
		titleOverlay.classList.add('c-title-overlay');

		const publishDiv = document.createElement('div');
		publishDiv.classList.add('u-d-flex');

		if (title) {
			const titleHeader = document.createElement('h5');
			titleHeader.classList.add('c-title-overlay__title');
			titleHeader.innerText = title || '';
			titleOverlay.appendChild(titleHeader);
		}

		titleOverlay.classList.add('a-flowplayer__title');
		titleOverlay.appendChild(publishDiv);

		if (metadata && metadata.length) {
			metadata.forEach((metadata: string) => {
				const substitleDiv = document.createElement('div');
				substitleDiv.innerText = metadata;
				substitleDiv.classList.add('c-title-overlay__meta');
				publishDiv.appendChild(substitleDiv);
			});
		}

		return titleOverlay;
	};

	const createLogoOverlay = () => {
		if (logo) {
			const logoOverlay = document.createElement('div');
			const logoImg = document.createElement('img');

			logoOverlay.classList.add('c-logo-overlay');
			logoImg.classList.add('c-logo-overlay__img');

			logoImg.src = logo;

			logoOverlay.appendChild(logoImg);

			return logoOverlay;
		}
	};

	const drawCustomElements = () => {
		if (!player?.parentElement) {
			return;
		}

		// Add overlay elements for title and logo
		const flowPlayerUi = player.parentElement.querySelector('.fp-ui');
		const titleElem = createTitleOverlay();
		const logoElem = createLogoOverlay();
		if (flowPlayerUi) {
			flowPlayerUi.prepend(titleElem);
			if (logoElem) {
				flowPlayerUi.prepend(logoElem);
			}
		}

		// Add cuepoint indicator div to the flowplayer timeline
		const timeline = player.parentElement.querySelector('.fp-timeline');
		if (timeline) {
			const cuePointIndicator = document.createElement('div');
			cuePointIndicator.classList.add('fp-cuepoint');
			timeline.appendChild(cuePointIndicator);
		}
	};

	/**
	 * Jump to first cuepoint if it exists
	 * @private
	 */
	const jumpToFirstCuepoint = () => {
		if (!player) {
			return;
		}
		const startTime =
			(player.opts as FlowplayerConfigWithPlugins).cuepoints?.[0].startTime || 0;
		if (startTime) {
			player.currentTime = startTime;
		}
	};

	const reInitFlowPlayer = () => {
		if (!videoContainerRef.current) {
			return;
		}

		// player?.destroy();
		const flowPlayerConfig: FlowplayerConfigWithPlugins = {
			// DATA
			src: src,
			token: token,
			poster: (src as FlowplayerSourceListSchema)?.items?.[0]?.poster || poster,

			// CONFIGURATION
			// autoplay breaks the wait time between videos of a playlist => when autoplay and playlist, we'll start the first video from code manually
			autoplay: isString(src) ? flowplayer.autoplay.ON : flowplayer.autoplay.OFF,
			multiplay: false,
			ui: (flowplayer as any).ui.LOGO_ON_RIGHT | (flowplayer as any).ui.USE_DRAG_HANDLE,
			plugins,
			preload: preload || (!poster ? 'metadata' : 'none'),
			lang: 'nl',

			// KEYBOARD
			...(plugins.includes('keyboard') ? { keyboard: { seek_step: '15' } } : {}),

			// SPEED
			speed: speed,

			// CUEPOINTS
			// Only set cuepoints if an end point was passed in the props or one of the playlist items has cuepoints configured
			...(plugins.includes('cuepoints') &&
			(end || (src as FlowplayerSourceListSchema)?.items?.some((item) => !!item.cuepoints))
				? {
						cuepoints: [
							{
								startTime: start,
								endTime: end,
							},
						],
				  }
				: {}),

			// PLAYLIST
			...(plugins.includes('playlist') && !isString(src)
				? {
						playlist: {
							advance: true,
							skip_controls: true,
							delay: DELAY_BETWEEN_PLAYLIST_VIDEOS,
						},
				  }
				: {}),

			// SUBTITLES
			...(plugins.includes('subtitles') && subtitles
				? {
						subtitles: {
							tracks: subtitles,
						},
				  }
				: {}),

			// CHROMECAST
			...(plugins.includes('chromecast')
				? {
						chromecast: {
							app: (flowplayer as any).chromecast.apps.STABLE,
						},
				  }
				: {}),

			// GOOGLE ANALYTICS
			...(plugins.includes('ga') && googleAnalyticsId
				? {
						ga: {
							ga_instances: [googleAnalyticsId],
							event_actions: googleAnalyticsEvents
								? convertGAEventsArrayToObject(googleAnalyticsEvents)
								: {},
							media_title: googleAnalyticsTitle || title,
						},
				  }
				: {}),
		};

		const tempPlayer = flowplayer(videoContainerRef.current as HTMLElement, flowPlayerConfig);

		if (!tempPlayer) {
			console.error('Failed to init flow player');
			return;
		}

		// Jump to the end of the video when a cuepoint end event is encountered
		// The video end event can then be handled however the user sees fit
		tempPlayer.on(flowplayer.events.CUEPOINT_END, () => {
			if (tempPlayer) {
				tempPlayer.currentTime = tempPlayer.duration;
			}
		});

		tempPlayer.on('error', (err: any) => {
			console.error(err);
		});

		if (plugins.includes('playlist')) {
			tempPlayer.on('playlist:ready', () => {
				// Update cover images on the playlist
				document
					.querySelectorAll('.fp-playlist li .video-info')
					.forEach((elem, elemIndex) => {
						const image = document.createElement('img');
						image.src = (src as FlowplayerSourceListSchema).items[elemIndex]
							.poster as string;
						const div = document.createElement('div');
						div.classList.add('image');
						div.appendChild(image);
						elem.append(div);
					});
			});
		}

		drawCustomElements();

		tempPlayer.on('playing', () => {
			if (!startedPlaying) {
				// First time playing the video

				jumpToFirstCuepoint();

				if (onPlay && player) {
					onPlay(player.src);
				}
				setStartedPlaying(true);
			}
		});
		tempPlayer.on('pause', onPause || noop);
		tempPlayer.on('ended', onEnded || noop);
		tempPlayer.on(
			playlistPlugin.events.PLAYLIST_NEXT,
			(evt: Event & { detail: { next_index: number } }) => {
				updateActivePlaylistItem(evt.detail.next_index);
				jumpToFirstCuepoint();
			}
		);
		tempPlayer.on('loadeddata', () => {
			onResizeHandler();
			updateCuepointPosition();
		});
		tempPlayer.on('timeupdate', () => {
			(onTimeUpdate || noop)(get(videoContainerRef, 'current.currentTime', 0));
		});

		setPlayer(tempPlayer);
	};

	/**
	 * Sets the cuepoint config from the active item in the playlist as the cuepoint on the flowplayer
	 * @param itemIndex
	 * @private
	 */
	const updateActivePlaylistItem = (itemIndex: number): void => {
		if (!player || isNaN(player.duration)) {
			return;
		}

		const playlistItem = (src as FlowplayerSourceListSchema)?.items?.[itemIndex];

		if (playlistItem) {
			// Update cuepoint
			player.emit(flowplayer.events.CUEPOINTS, {
				cuepoints: playlistItem.cuepoints,
			});
			updateCuepointPosition();

			// Update poster
			player.poster = playlistItem.poster;
			player.opts.poster = playlistItem.poster;
		}
	};

	/**
	 * Updates the styles of the timeline cuepoint indicator according to the active cuepoint
	 */
	const updateCuepointPosition = () => {
		if (!player || isNaN(player.duration)) {
			return;
		}

		const cuePointIndicator: HTMLDivElement | null = player.root.querySelector(
			'.fp-cuepoint'
		) as HTMLDivElement | null;
		if (cuePointIndicator) {
			let start = (player.opts as FlowplayerConfigWithPlugins).cuepoints?.[0]?.startTime;
			let end = (player.opts as FlowplayerConfigWithPlugins).cuepoints?.[0]?.endTime;
			if (isNil(start) && isNil(end)) {
				cuePointIndicator.style.display = 'none';
				return;
			}
			start = start || 0;
			end = (end || player.duration || 0) as number;
			cuePointIndicator.style.left = Math.round((start / player.duration) * 100) + '%';
			cuePointIndicator.style.width = ((end - start) / player.duration) * 100 + '%';
			cuePointIndicator.style.display = 'block';
		}
	};

	const handleMediaCardClicked = (itemIndex: number): void => {
		player.playlist?.play(itemIndex);
		player.emit(flowplayer.events.CUEPOINTS, {
			cuepoints: (src as FlowplayerSourceListSchema).items[itemIndex].cuepoints,
		});
		updateCuepointPosition();
	};

	const renderPlaylistItems = (playlistItems: FlowplayerSourceList['items']) => {
		return (
			<ul className="c-video-player__playlist">
				{playlistItems.map((item, itemIndex) => {
					return (
						<li key={item.src + '--' + itemIndex}>
							<MediaCard
								title={item.title}
								onClick={() => handleMediaCardClicked(itemIndex)}
								orientation="vertical"
								category="search" // Clearest color on white background
							>
								<MediaCardThumbnail>
									<Thumbnail
										category={item.category}
										src={item.poster}
										meta={item.provider}
										label={item.category}
									/>
								</MediaCardThumbnail>
							</MediaCard>
						</li>
					);
				})}
			</ul>
		);
	};

	const renderedVideoContainer = useMemo(() => {
		return (
			<div
				className={classnames('c-video-player-inner')}
				data-player-id={dataPlayerId}
				ref={videoContainerRef}
			/>
		);
	}, [videoContainerRef, dataPlayerId, start, end, canPlay, poster, src]);

	const playlistItems = (src as FlowplayerSourceListSchema)?.items;

	return (
		<div className={classnames(className, 'c-video-player')}>
			{renderedVideoContainer}
			{playlistItems && playlistScrollable && (
				<Scrollbar
					className="c-video-player__playlist__scrollable"
					noScrollX
					style={{
						width: '30%',
						height: videoHeight ? videoHeight + 'px' : 'auto',
					}}
				>
					{renderPlaylistItems(playlistItems)}
				</Scrollbar>
			)}
			{playlistItems && !playlistScrollable && renderPlaylistItems(playlistItems)}
		</div>
	);
};
