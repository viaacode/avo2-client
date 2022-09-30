import flowplayer, { Player } from '@flowplayer/player';
import '@flowplayer/player/flowplayer.css';
import audioPlugin from '@flowplayer/player/plugins/audio';
import cuepointsPlugin from '@flowplayer/player/plugins/cuepoints';
import googleAnalyticsPlugin from '@flowplayer/player/plugins/google-analytics';
import hlsPlugin from '@flowplayer/player/plugins/hls';
import keyboardPlugin from '@flowplayer/player/plugins/keyboard';
import playlistPlugin from '@flowplayer/player/plugins/playlist';
import speedPlugin from '@flowplayer/player/plugins/speed';
import subtitlesPlugin from '@flowplayer/player/plugins/subtitles';
import classnames from 'classnames';
import { get, isNil, noop } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { default as Scrollbar } from 'react-scrollbars-custom';

import {
	ALL_FLOWPLAYER_PLUGINS,
	DELAY_BETWEEN_PLAYLIST_VIDEOS,
	dutchFlowplayerTranslations,
} from './FlowPlayer.consts';
import { convertGAEventsArrayToObject, setPlayingVideoSeekTime } from './FlowPlayer.helpers';
import {
	FlowplayerConfigWithPlugins,
	FlowPlayerPropsSchema,
	FlowplayerSourceItemSchema,
	FlowplayerSourceList,
	FlowplayerSourceListSchema,
} from './FlowPlayer.types';
import { drawPeak } from './Peak/draw-peak';

import './FlowPlayer.scss';

flowplayer(
	subtitlesPlugin,
	hlsPlugin,
	cuepointsPlugin,
	keyboardPlugin,
	speedPlugin,
	audioPlugin,
	playlistPlugin,
	googleAnalyticsPlugin
);

export const FlowPlayerInternal: FunctionComponent<FlowPlayerPropsSchema> = ({
	src,
	poster,
	title,
	metadata,
	token,
	preload,
	speed,
	dataPlayerId,
	autoplay,
	plugins = ALL_FLOWPLAYER_PLUGINS,
	start,
	end,
	logo,
	pause,
	fullscreen,
	onPlay,
	onPause,
	onEnded,
	onTimeUpdate,
	canPlay,
	className,
	playlistScrollable = false,
	renderPlaylistTile,
	subtitles,
	customControls = null,
	waveformData,
	googleAnalyticsId,
	googleAnalyticsEvents,
	googleAnalyticsTitle,
}) => {
	const videoContainerRef = useRef<HTMLDivElement>(null);
	const peakCanvas = useRef<HTMLCanvasElement>(null);

	// Trick to avoid stale references in flowplayer event listener handlers: https://medium.com/geographit/accessing-react-state-in-event-listeners-with-usestate-and-useref-hooks-8cceee73c559
	const [_player, _setPlayer] = useState<any | null>(null);
	const player = useRef(_player);
	const setPlayer = (newPlayer: any) => {
		player.current = newPlayer;
		_setPlayer(newPlayer);
	};

	const [startedPlaying, setStartedPlaying] = useState<boolean>(false);
	const [drawPeaksTimerId, setDrawPeaksTimerId] = useState<number | null>(null);
	const [activeItemIndex, setActiveItemIndex] = useState<number>(0);

	const isPlaylist = (src as FlowplayerSourceList)?.type === 'flowplayer/playlist';
	const isAudio = (src as any)?.[0]?.type === 'audio/mp3';

	const createTitleOverlay = useCallback(() => {
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
	}, [metadata, title]);

	const createLogoOverlay = useCallback(() => {
		if (logo) {
			const logoOverlay = document.createElement('div');
			const logoImg = document.createElement('img');

			logoOverlay.classList.add('c-logo-overlay');
			logoImg.classList.add('c-logo-overlay__img');

			logoImg.src = logo;

			logoOverlay.appendChild(logoImg);

			return logoOverlay;
		}
	}, [logo]);

	const drawCustomElements = useCallback(() => {
		if (!videoContainerRef?.current?.parentElement) {
			return;
		}

		// Add overlay elements for title and logo
		const flowPlayerUi = videoContainerRef.current.parentElement.querySelector('.fp-ui');
		const titleElem = createTitleOverlay();
		const logoElem = createLogoOverlay();
		if (flowPlayerUi) {
			flowPlayerUi.prepend(titleElem);
			if (logoElem) {
				flowPlayerUi.prepend(logoElem);
			}
		}

		// Add cuepoint indicator div to the flowplayer timeline
		const timeline = videoContainerRef.current.parentElement.querySelector('.fp-timeline');
		if (timeline) {
			const cuePointIndicator = document.createElement('div');
			cuePointIndicator.classList.add('fp-cuepoint');
			timeline.prepend(cuePointIndicator);
		}
	}, [createLogoOverlay, createTitleOverlay, videoContainerRef]);

	/**
	 * Jump to first cuepoint if it exists
	 * @private
	 */
	const jumpToFirstCuepoint = useCallback(
		(tempPlayer?: Player) => {
			if (!player.current && !tempPlayer) {
				return;
			}
			const flowplayerInstance = player.current || tempPlayer;
			const startTime =
				(flowplayerInstance.opts as FlowplayerConfigWithPlugins).cuepoints?.[0].startTime ||
				0;

			if (startTime) {
				setPlayingVideoSeekTime(startTime);
			}
		},
		[player]
	);

	/**
	 * Updates the styles of the timeline cuepoint indicator according to the active cuepoint
	 */
	const updateCuepointPosition = useCallback(
		(tempPlayer: any, activeIndex: number) => {
			try {
				const flowplayerInstance = tempPlayer || player.current;
				if (!flowplayerInstance) {
					return;
				}

				const cuePointIndicator: HTMLDivElement | null =
					flowplayerInstance.parentElement.querySelector(
						'.fp-cuepoint'
					) as HTMLDivElement | null;

				if (cuePointIndicator) {
					let start = (flowplayerInstance.opts as FlowplayerConfigWithPlugins)
						.cuepoints?.[0]?.startTime;
					let end = (flowplayerInstance.opts as FlowplayerConfigWithPlugins)
						.cuepoints?.[0]?.endTime;

					if (isNil(start) && isNil(end)) {
						cuePointIndicator.style.display = 'none';
						return;
					}

					const duration =
						(src as FlowplayerSourceListSchema)?.items?.[activeIndex]?.duration ||
						flowplayerInstance.duration;
					start = start || 0;
					end = (end || duration || 0) as number;

					cuePointIndicator.style.left = Math.round((start / duration) * 100) + '%';
					cuePointIndicator.style.width = ((end - start) / duration) * 100 + '%';
					cuePointIndicator.style.display = 'block';
				}
			} catch (err) {
				console.error(
					'Failed to update cuepoint location on the flowplayer progress bar: ' +
						JSON.stringify(err)
				);
			}
		},
		[player]
	);

	/**
	 * Sets the cuepoint config from the active item in the playlist as the cuepoint on the flowplayer
	 * @param itemIndex
	 * @private
	 */
	const updateActivePlaylistItem = useCallback(
		(itemIndex: number): void => {
			setActiveItemIndex(itemIndex);

			if (!player.current) {
				return;
			}

			const playlistItem = (src as FlowplayerSourceListSchema)?.items?.[itemIndex];

			if (playlistItem) {
				// Update cuepoint
				player.current.emit(flowplayer.events.CUEPOINTS, {
					cuepoints: playlistItem.cuepoints,
				});

				// Update poster
				player.current.poster = playlistItem.poster;
				player.current.opts.poster = playlistItem.poster;
			}

			setTimeout(() => {
				updateCuepointPosition(player.current, itemIndex);
			}, 0);
		},
		[player, src, updateCuepointPosition]
	);

	const handleLoadedMetadata = () => {
		updateCuepointPosition(player.current, activeItemIndex);
	};

	const handlePlaylistNext = (evt: Event & { detail: { next_index: number } }) => {
		updateActivePlaylistItem(evt.detail.next_index);

		player.current.once('playing', jumpToFirstCuepoint);
	};

	const handlePlaylistReady = () => {
		// Update cover images on the playlist
		document.querySelectorAll('.fp-playlist li .video-info').forEach((elem, elemIndex) => {
			const image = document.createElement('img');
			image.src = (src as FlowplayerSourceListSchema).items[elemIndex].poster as string;
			const div = document.createElement('div');
			div.classList.add('image');
			div.appendChild(image);
			elem.append(div);
		});
	};

	const handlePlayingOnce = () => {
		jumpToFirstCuepoint(player.current);
	};

	const handlePlaying = () => {
		if (!startedPlaying) {
			// First time playing the video
			if (onPlay && player.current) {
				onPlay(player.current.src);
			}

			setStartedPlaying(true);
		}
	};

	const handleCuepointEnd = () => {
		if (player.current) {
			player.current.pause();
			if (!isPlaylist) {
				player.current.currentTime = player.current.opts.cuepoints[0].startTime;
			}
			player.current.emit(flowplayer.events.ENDED);
		}
	};

	const handleTimeUpdate = () => {
		(onTimeUpdate || noop)(get(videoContainerRef, 'current.currentTime', 0));
	};

	const reInitFlowPlayer = useCallback(() => {
		if (!videoContainerRef.current) {
			return;
		}

		if (player.current) {
			player.current.destroy();
			setStartedPlaying(false);
		}

		(flowplayer as any).i18n.nl = dutchFlowplayerTranslations;

		let resolvedPoster = (src as FlowplayerSourceListSchema)?.items?.[0]?.poster || poster;
		if (!resolvedPoster && isAudio) {
			// Transparent 1920 x 1080 poster
			resolvedPoster =
				'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB4AAAAQ4AQMAAADSHVMAAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAANQTFRFAAAAp3o92gAAAAF0Uk5TAEDm2GYAAAETSURBVHic7cEBDQAAAMKg909tDwcUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADApwH45QABmSWJDwAAAABJRU5ErkJggg==';
		}

		const flowPlayerConfig: FlowplayerConfigWithPlugins = {
			// DATA
			src: src,
			token: token,
			poster: resolvedPoster,

			// CONFIGURATION
			autoplay: autoplay ? flowplayer.autoplay.ON : flowplayer.autoplay.OFF,
			multiplay: false,
			ui: (flowplayer as any).ui.LOGO_ON_RIGHT | (flowplayer as any).ui.USE_DRAG_HANDLE,
			plugins,
			preload: preload || (!poster ? 'metadata' : 'none'),
			lang: 'nl',

			// KEYBOARD
			...(plugins.includes('keyboard') ? { keyboard: { seek_step: '15' } } : {}),

			// SPEED
			...(plugins.includes('speed') && speed ? { speed: speed } : {}),

			// CUEPOINTS
			// Only set cuepoints if an end point was passed in the props or one of the playlist items has cuepoints configured
			...(plugins.includes('cuepoints') &&
			(end || !!(src as FlowplayerSourceListSchema)?.items?.[0].cuepoints?.[0]?.endTime)
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
			...(plugins.includes('playlist') && isPlaylist
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
		tempPlayer.on(flowplayer.events.CUEPOINT_END, handleCuepointEnd);

		tempPlayer.on('error', (err: any) => {
			console.error(err);
		});

		if (plugins.includes('playlist')) {
			tempPlayer.on('playlist:ready', handlePlaylistReady);
		}

		drawCustomElements();

		tempPlayer.once('playing', handlePlayingOnce);
		tempPlayer.on('playing', handlePlaying);
		tempPlayer.on('pause', onPause || noop);
		tempPlayer.on('ended', onEnded || noop);
		tempPlayer.on('loadeddata', handleLoadedMetadata);
		tempPlayer.on(playlistPlugin.events.PLAYLIST_NEXT, handlePlaylistNext);
		tempPlayer.on('timeupdate', handleTimeUpdate);

		setPlayer(tempPlayer);
	}, [
		drawCustomElements,
		end,
		googleAnalyticsEvents,
		googleAnalyticsId,
		googleAnalyticsTitle,
		jumpToFirstCuepoint,
		onEnded,
		onPause,
		onPlay,
		onTimeUpdate,
		player.current,
		plugins,
		poster,
		preload,
		speed,
		src,
		start,
		subtitles,
		title,
		token,
		updateActivePlaylistItem,
		updateCuepointPosition,
		videoContainerRef,
	]);

	useEffect(() => {
		videoContainerRef.current && !player.current && reInitFlowPlayer();
	}, [videoContainerRef]); // Only redo effect when ref changes

	useEffect(() => {
		if (!canPlay) {
			player.current?.pause();
		}
	}, [canPlay]);

	useEffect(() => {
		return () => {
			//  cleanup on unload component
			player.current?.destroy();
		};
	}, []);

	useEffect(() => {
		if (isNil(pause) || !player.current) {
			return;
		}
		if (pause) {
			player.current.pause();
		} else {
			player.current.play();
		}
	}, [player, pause]);

	useEffect(() => {
		if (isNil(fullscreen) || !player.current) {
			return;
		}
		player.current.toggleFullScreen(fullscreen);
	}, [player, fullscreen]);

	const drawPeaksHandler = useCallback(() => {
		if (waveformData && peakCanvas.current) {
			drawPeak(
				peakCanvas.current,
				waveformData || [],
				player.current?.duration ? player.current.currentTime / player.current.duration : 0
			);
		}
	}, [peakCanvas, waveformData]);

	useEffect(() => {
		if (waveformData && peakCanvas.current) {
			if (drawPeaksTimerId) {
				clearInterval(drawPeaksTimerId);
			}
			setDrawPeaksTimerId(window.setInterval(drawPeaksHandler, 1000));
		}

		return () => {
			if (drawPeaksTimerId) {
				clearInterval(drawPeaksTimerId);
			}
		};
	}, [waveformData, peakCanvas, setDrawPeaksTimerId]);

	const handleMediaCardClicked = useCallback(
		(itemIndex: number): void => {
			setActiveItemIndex(itemIndex);
			player.current.playlist?.play(itemIndex);
			player.current.emit(flowplayer.events.CUEPOINTS, {
				cuepoints: (src as FlowplayerSourceListSchema).items[itemIndex].cuepoints,
			});

			setTimeout(() => {
				updateCuepointPosition(player.current, itemIndex);
			}, 0);
		},
		[player, updateCuepointPosition]
	);

	const renderPlaylistItems = useCallback(
		(playlistItems: FlowplayerSourceList['items']) => {
			return (
				<ul className="c-video-player__playlist">
					{playlistItems.map((item: FlowplayerSourceItemSchema, itemIndex) => {
						return (
							<li
								key={item.src + '--' + itemIndex}
								className={
									'c-video-player__playlist__item' +
									(activeItemIndex === itemIndex
										? ' c-video-player__playlist__item--active'
										: '')
								}
							>
								<button onClick={() => handleMediaCardClicked(itemIndex)}>
									{renderPlaylistTile?.(item) || item.title}
								</button>
							</li>
						);
					})}
				</ul>
			);
		},
		[handleMediaCardClicked, activeItemIndex]
	);

	const playlistItems = useMemo(() => (src as FlowplayerSourceListSchema)?.items, [src]);

	const playerHtml = useMemo(
		() => (
			<div
				className={classnames('c-video-player-inner')}
				data-player-id={dataPlayerId}
				ref={videoContainerRef}
			>
				{waveformData && (
					<canvas ref={peakCanvas} className="c-peak" width="1212" height="779" />
				)}
				{customControls}
			</div>
		),
		[dataPlayerId]
	);

	return useMemo(() => {
		return (
			<div className={classnames(className, 'c-video-player')}>
				{playerHtml}
				{playlistItems && (
					<div className="c-video-player__playlist__wrapper">
						{playlistScrollable && (
							<Scrollbar className="c-video-player__playlist__scrollable" noScrollX>
								{renderPlaylistItems(playlistItems)}
							</Scrollbar>
						)}
						{!playlistScrollable && renderPlaylistItems(playlistItems)}
					</div>
				)}
			</div>
		);
	}, [playlistItems, playlistScrollable, className, renderPlaylistItems, playerHtml]);
};

export default FlowPlayerInternal;
