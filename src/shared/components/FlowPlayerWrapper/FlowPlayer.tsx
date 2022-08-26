import flowplayer, { Config, Player } from '@flowplayer/player';
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
import { debounce, get, isNil, isString, noop } from 'lodash-es';
import React, { createRef, ReactNode } from 'react';
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
	seekTime?: number;
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

interface FlowPlayerState {
	flowPlayerInstance: Player | null;
	startedPlaying: boolean;
	videoHeight: number;
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

export class FlowPlayer extends React.Component<FlowPlayerPropsSchema, FlowPlayerState> {
	private videoContainerRef = createRef<HTMLDivElement>();

	constructor(props: FlowPlayerPropsSchema) {
		super(props);
		this.state = {
			flowPlayerInstance: null,
			startedPlaying: false,
			videoHeight: DEFAULT_VIDEO_HEIGHT,
		};
	}

	private destroyPlayer() {
		this.setState((state) => {
			const flowPlayerInstance = state.flowPlayerInstance;
			if (flowPlayerInstance) {
				flowPlayerInstance.destroy();
				if (flowPlayerInstance.parentElement) {
					flowPlayerInstance.parentElement.innerHTML = '';
				}
			}
		});
		document.querySelectorAll('.fp-skip-prev,.fp-skip-next').forEach((elem) => elem.remove());
	}

	shouldComponentUpdate(nextProps: FlowPlayerPropsSchema): boolean {
		if (!this.videoContainerRef.current) {
			return true;
		}

		const flowPlayerInstance = this.state.flowPlayerInstance;
		if (flowPlayerInstance) {
			if (nextProps.seekTime !== this.props.seekTime && nextProps.seekTime) {
				flowPlayerInstance.currentTime = nextProps.seekTime;
			}

			if (nextProps.start !== this.props.start || nextProps.end !== this.props.end) {
				if (this.videoContainerRef) {
					flowPlayerInstance.emit(flowplayer.events.CUEPOINTS, {
						cuepoints: [
							{
								start: nextProps.start,
								end: nextProps.end,
							},
						],
					});
				}
			}

			// Pause video when modal opens in front
			// Or pause video when modal is closed which contains this flowplayer
			if (!nextProps.canPlay && this.props.canPlay) {
				flowPlayerInstance.pause();
			}
		}

		if (nextProps.poster !== this.props.poster && (this.props.poster || nextProps.poster)) {
			// Video was changed before playing the video
			return true;
		}

		// Get the first part of the first video src, to see if the video url changed
		const nextUrl: string | undefined =
			nextProps.src &&
			(
				(nextProps.src as FlowplayerSourceListSchema)?.items?.[0]?.src ||
				(nextProps.src as string)
			)?.split('?')[0];
		const currentUrl: string | undefined =
			this.props.src &&
			(
				(this.props.src as FlowplayerSourceListSchema)?.items?.[0]?.src ||
				(this.props.src as string)
			)?.split('?')[0];
		if (nextUrl !== currentUrl) {
			if (nextUrl) {
				// User clicked the post to play the video
				this.reInitFlowPlayer(nextProps);
			} else {
				// User clicked another video and the video src has been set to undefined
				this.destroyPlayer();
			}
			return true;
		}

		return false;
	}

	private onResizeHandler = debounce(
		() => {
			if (this.videoContainerRef.current) {
				const vidHeight = this.videoContainerRef.current.getBoundingClientRect().height;
				this.setState({
					...this.state,
					videoHeight: vidHeight,
				});
			} else {
				this.setState({
					...this.state,
					videoHeight: DEFAULT_VIDEO_HEIGHT,
				});
			}
		},
		300,
		{ leading: false, trailing: true }
	);

	componentDidMount(): void {
		if (this.props.src) {
			this.reInitFlowPlayer(this.props);
		}

		window.addEventListener('resize', this.onResizeHandler);
		this.onResizeHandler();
	}

	componentWillUnmount(): void {
		this.destroyPlayer();
		window.removeEventListener('resize', this.onResizeHandler);
	}

	private createTitleOverlay() {
		const titleOverlay = document.createElement('div');
		titleOverlay.classList.add('c-title-overlay');

		const publishDiv = document.createElement('div');
		publishDiv.classList.add('u-d-flex');

		if (this.props.title) {
			const titleHeader = document.createElement('h5');
			titleHeader.classList.add('c-title-overlay__title');
			titleHeader.innerText = this.props.title || '';
			titleOverlay.appendChild(titleHeader);
		}

		titleOverlay.classList.add('a-flowplayer__title');
		titleOverlay.appendChild(publishDiv);

		if (this.props.metadata && this.props.metadata.length) {
			this.props.metadata.forEach((metadata: string) => {
				const substitleDiv = document.createElement('div');
				substitleDiv.innerText = metadata;
				substitleDiv.classList.add('c-title-overlay__meta');
				publishDiv.appendChild(substitleDiv);
			});
		}

		return titleOverlay;
	}

	private createLogoOverlay() {
		if (this.props.logo) {
			const logoOverlay = document.createElement('div');
			const logoImg = document.createElement('img');

			logoOverlay.classList.add('c-logo-overlay');
			logoImg.classList.add('c-logo-overlay__img');

			logoImg.src = this.props.logo;

			logoOverlay.appendChild(logoImg);

			return logoOverlay;
		}
	}

	private drawCustomElements(flowplayerInstance: Player) {
		if (!flowplayerInstance.parentElement) {
			return;
		}

		// Add overlay elements for title and logo
		const flowPlayerUi = flowplayerInstance.parentElement.querySelector('.fp-ui');
		const titleElem = this.createTitleOverlay();
		const logoElem = this.createLogoOverlay();
		if (flowPlayerUi) {
			flowPlayerUi.prepend(titleElem);
			if (logoElem) {
				flowPlayerUi.prepend(logoElem);
			}
		}

		// Add cuepoint indicator div to the flowplayer timeline
		const timeline = flowplayerInstance.parentElement.querySelector('.fp-timeline');
		if (timeline) {
			const cuePointIndicator = document.createElement('div');
			cuePointIndicator.classList.add('fp-cuepoint');
			timeline.appendChild(cuePointIndicator);
		}
	}

	/**
	 * Jump to first cuepoint if it exists
	 * @private
	 */
	private jumpToFirstCuepoint() {
		const player = this.state.flowPlayerInstance;
		if (!player) {
			return;
		}
		const startTime =
			(player.opts as FlowplayerConfigWithPlugins).cuepoints?.[0].startTime || 0;
		if (startTime) {
			player.currentTime = startTime;
		}
	}

	private reInitFlowPlayer(props: FlowPlayerPropsSchema) {
		this.destroyPlayer();

		if (!this.videoContainerRef.current) {
			return;
		}

		const plugins = props.plugins || [
			'subtitles',
			'cuepoints',
			'hls',
			'ga',
			'keyboard',
			'playlist',
			// 'chromecast', 'airplay', // Disabled for now for video security: https://meemoo.atlassian.net/browse/AVO-1859
		];

		const flowPlayerConfig: FlowplayerConfigWithPlugins = {
			// DATA
			src: props.src,
			token: props.token,
			poster: (props.src as FlowplayerSourceListSchema)?.items?.[0]?.poster || props.poster,

			// CONFIGURATION
			autoplay: props.autoplay ? flowplayer.autoplay.ON : flowplayer.autoplay.OFF,
			multiplay: false,
			ui: (flowplayer as any).ui.LOGO_ON_RIGHT | (flowplayer as any).ui.USE_DRAG_HANDLE,
			plugins,
			preload: props.preload || (!props.poster ? 'metadata' : 'none'),
			lang: 'nl',

			// KEYBOARD
			...(plugins.includes('keyboard') ? { keyboard: { seek_step: '15' } } : {}),

			// SPEED
			speed: props.speed,

			// CUEPOINTS
			// Only set cuepoints if an end point was passed in the props or one of the playlist items has cuepoints configured
			...(plugins.includes('cuepoints') &&
			(props.end ||
				(this.props.src as FlowplayerSourceListSchema)?.items?.some(
					(item) => !!item.cuepoints
				))
				? {
						cuepoints: [
							{
								startTime: props.start,
								endTime: props.end,
							},
						],
				  }
				: {}),

			// PLAYLIST
			...(plugins.includes('playlist') && !isString(props.src)
				? {
						playlist: {
							advance: true,
							skip_controls: true,
							delay: 7,
						},
				  }
				: {}),

			// SUBTITLES
			...(plugins.includes('subtitles') && props.subtitles
				? {
						subtitles: {
							tracks: props.subtitles,
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
			...(plugins.includes('ga') && props.googleAnalyticsId
				? {
						ga: {
							ga_instances: [props.googleAnalyticsId],
							event_actions: props.googleAnalyticsEvents
								? convertGAEventsArrayToObject(props.googleAnalyticsEvents)
								: {},
							media_title: props.googleAnalyticsTitle || props.title,
						},
				  }
				: {}),
		};

		const flowplayerInstance: Player = flowplayer(
			this.videoContainerRef.current as HTMLElement,
			flowPlayerConfig
		);

		if (!flowplayerInstance) {
			console.error('Failed to init flow player');
			return;
		}

		// Jump to the end of the video when a cuepoint end event is encountered
		// The video end event can then be handled however the user sees fit
		flowplayerInstance.on(flowplayer.events.CUEPOINT_END, () => {
			if (flowplayerInstance) {
				flowplayerInstance.currentTime = flowplayerInstance.duration;
			}
		});

		flowplayerInstance.on('error', (err: any) => {
			console.error(err);
		});

		if (plugins.includes('playlist')) {
			flowplayerInstance.on('playlist:ready', () => {
				// Update cover images on the playlist
				document
					.querySelectorAll('.fp-playlist li .video-info')
					.forEach((elem, elemIndex) => {
						const image = document.createElement('img');
						image.src = (this.props.src as FlowplayerSourceListSchema).items[elemIndex]
							.poster as string;
						const div = document.createElement('div');
						div.classList.add('image');
						div.appendChild(image);
						elem.append(div);
					});
			});
		}

		this.drawCustomElements(flowplayerInstance);

		flowplayerInstance.on('playing', () => {
			if (!this.state.startedPlaying) {
				// First time playing the video

				this.jumpToFirstCuepoint();

				if (this.props.onPlay && this.state.flowPlayerInstance) {
					this.props.onPlay(this.state.flowPlayerInstance.src);
				}

				this.setState({
					...this.state,
					startedPlaying: true,
				});
			}
		});
		flowplayerInstance.on('pause', this.props.onPause || noop);
		flowplayerInstance.on('ended', this.props.onEnded || noop);
		flowplayerInstance.on(
			playlistPlugin.events.PLAYLIST_NEXT,
			(evt: Event & { detail: { next_index: number } }) => {
				this.updateActivePlaylistItem(evt.detail.next_index);
				this.jumpToFirstCuepoint();
			}
		);
		flowplayerInstance.on('loadeddata', () => {
			this.onResizeHandler();
			this.updateCuepointPosition();
		});
		flowplayerInstance.on('timeupdate', () => {
			(this.props.onTimeUpdate || noop)(
				get(this.videoContainerRef, 'current.currentTime', 0)
			);
		});

		this.setState({
			flowPlayerInstance: flowplayerInstance,
		});
	}

	/**
	 * Sets the cuepoint config from the active item in the playlist as the cuepoint on the flowplayer
	 * @param itemIndex
	 * @private
	 */
	private updateActivePlaylistItem(itemIndex: number): void {
		const player = this.state.flowPlayerInstance;
		if (!player || isNaN(player.duration)) {
			return;
		}

		const playlistItem = (this.props.src as FlowplayerSourceListSchema)?.items?.[itemIndex];

		if (playlistItem) {
			// Update cuepoint
			player.emit(flowplayer.events.CUEPOINTS, {
				cuepoints: playlistItem.cuepoints,
			});
			this.updateCuepointPosition();

			// Update poster
			player.poster = playlistItem.poster;
			player.opts.poster = playlistItem.poster;
		}
	}

	/**
	 * Updates the styles of the timeline cuepoint indicator according to the active cuepoint
	 */
	private updateCuepointPosition() {
		const player = this.state.flowPlayerInstance;
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
			end = end || player.duration;
			cuePointIndicator.style.left = Math.round((start / player.duration) * 100) + '%';
			cuePointIndicator.style.width = ((end - start) / player.duration) * 100 + '%';
			cuePointIndicator.style.display = 'block';
		}
	}

	private renderPlaylistItems(playlistItems: FlowplayerSourceList['items']) {
		return (
			<ul className="c-video-player__playlist">
				{playlistItems.map((item, itemIndex) => {
					return (
						<li key={item.src + '--' + itemIndex}>
							<MediaCard
								title={item.title}
								onClick={() => {
									const player = this.state.flowPlayerInstance as any;
									player?.playlist?.play(itemIndex);
									player.emit(flowplayer.events.CUEPOINTS, {
										cuepoints: (this.props.src as FlowplayerSourceListSchema)
											.items[itemIndex].cuepoints,
									});
									this.updateCuepointPosition();
								}}
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
	}

	render(): ReactNode {
		const playlistItems = (this.props.src as FlowplayerSourceListSchema)?.items;
		return (
			<div className={classnames(this.props.className, 'c-video-player')}>
				<div
					className={classnames('c-video-player-inner')}
					data-player-id={this.props.dataPlayerId}
					ref={this.videoContainerRef}
				/>
				{playlistItems && this.props.playlistScrollable && (
					<Scrollbar
						className="c-video-player__playlist__scrollable"
						noScrollX
						style={{
							width: '30%',
							height:
								(this.videoContainerRef.current?.getBoundingClientRect().height ||
									500) + 'px',
						}}
					>
						{this.renderPlaylistItems(playlistItems)}
					</Scrollbar>
				)}
				{playlistItems &&
					!this.props.playlistScrollable &&
					this.renderPlaylistItems(playlistItems)}
			</div>
		);
	}
}
