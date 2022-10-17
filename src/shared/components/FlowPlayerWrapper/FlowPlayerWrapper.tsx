import {
	AspectRatioWrapper,
	FlowPlayer,
	FlowplayerSourceItem,
	FlowplayerSourceList,
	Icon,
	MediaCard,
	MediaCardThumbnail,
	Thumbnail,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { get, isNil, isString } from 'lodash-es';
import React, { FunctionComponent, ReactNode, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	CustomError,
	formatDurationHoursMinutesSeconds,
	getEnv,
	isMobileWidth,
	reorderDate,
	toSeconds,
} from '../../helpers';
import { getValidStartAndEnd } from '../../helpers/cut-start-and-end';
import { getSubtitles } from '../../helpers/get-subtitles';
import withUser, { UserProps } from '../../hocs/withUser';
import { BookmarksViewsPlaysService, ToastService } from '../../services';
import { trackEvents } from '../../services/event-logging-service';
import { fetchPlayerTicket } from '../../services/player-ticket-service';
import { SmartschoolAnalyticsService } from '../../services/smartschool-analytics-service';

import './FlowPlayerWrapper.scss';

export interface CuePoints {
	start: number | null;
	end: number | null;
}

export type FlowPlayerWrapperProps = {
	item?: Avo.Item.Item;
	src?: string | FlowplayerSourceList;
	poster?: string;
	external_id?: string;
	title?: string;
	duration?: string;
	organisationName?: string;
	organisationLogo?: string;
	issuedDate?: string;
	annotationTitle?: string;
	annotationText?: string;
	canPlay?: boolean;
	cuePoints?: CuePoints;
	autoplay?: boolean;
	onPlay?: (playingSrc: string) => void;
	onEnded?: () => void;
};

/**
 * Handle flowplayer play events for the whole app, so we track play count
 * @param props
 * @constructor
 */
const FlowPlayerWrapper: FunctionComponent<FlowPlayerWrapperProps & UserProps> = (props) => {
	const [t] = useTranslation();

	const item: Avo.Item.Item | undefined = props.item;
	const poster: string | undefined = props.poster || get(item, 'thumbnail_path');

	const [triggeredForUrl, setTriggeredForUrl] = useState<Record<string, boolean>>({});
	const [clickedThumbnail, setClickedThumbnail] = useState<boolean>(false);
	const [src, setSrc] = useState<string | FlowplayerSourceList | undefined>(props.src);

	const isPlaylist = !isString(src) && !isNil(src);

	useEffect(() => {
		// reset token when item changes
		setSrc(props.src);
		setClickedThumbnail(false);
	}, [item, props.src, setSrc, setClickedThumbnail]);

	const initFlowPlayer = useCallback(async () => {
		try {
			if (!item && !props.src) {
				throw new CustomError('Failed to init flowplayer since item is undefined');
			}
			if (item) {
				setSrc(await fetchPlayerTicket(item.external_id));
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to initFlowPlayer in FlowPlayerWrapper', err, {
					item,
				})
			);
			ToastService.danger(
				t(
					'item/components/item-video-description___het-ophalen-van-de-mediaplayer-ticket-is-mislukt'
				)
			);
		}
	}, [item, setSrc, t]);

	useEffect(() => {
		if (props.autoplay && item) {
			initFlowPlayer();
		}
	}, [props.autoplay, item, initFlowPlayer]);

	const handlePlay = (playingSrc: string) => {
		trackEvents(
			{
				object: props.external_id || '',
				object_type: 'item',
				action: 'play',
			},
			props.user
		);

		// Only trigger once per video
		if (item && item.uid && !triggeredForUrl[playingSrc]) {
			BookmarksViewsPlaysService.action('play', 'item', item.uid, undefined).catch((err) => {
				console.error(
					new CustomError('Failed to track item play event', err, { itemUuid: item.uid })
				);
			});

			if (props.onPlay) {
				props.onPlay(playingSrc);
			}

			setTriggeredForUrl({
				...triggeredForUrl,
				[playingSrc]: true,
			});
		}

		SmartschoolAnalyticsService.triggerVideoPlayEvent(
			props.title || get(item, 'title'),
			props.external_id || get(item, 'external_id'),
			toSeconds(props.duration || get(item, 'duration'), true) || undefined
		);
	};

	const handlePosterClicked = () => {
		setClickedThumbnail(true);

		if (!src) {
			initFlowPlayer();
		}
	};

	const hasHlsSupport = (): boolean => {
		try {
			new MediaSource();

			return true;
		} catch (err) {
			return false;
		}
	};

	const renderPlaylistTile = (item: FlowplayerSourceItem): ReactNode => {
		return (
			<MediaCard
				title={item.title}
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
		);
	};

	const getBrowserSafeUrl = (
		src: string | FlowplayerSourceList
	): string | FlowplayerSourceList => {
		if (hasHlsSupport()) {
			return src;
		}

		if (isPlaylist) {
			// Convert each url in the entry in the playlist if possible
			(src as FlowplayerSourceList).items.forEach((entry) => {
				if (entry.src.includes('flowplayer')) {
					entry.src = entry.src
						.replace('/hls/', '/v-')
						.replace('/playlist.m3u8', '_original.mp4');
				}
			});

			if ((src as FlowplayerSourceList).items.some((entry) => entry.src.includes('.m3u8'))) {
				ToastService.danger(
					t(
						'shared/components/flow-player-wrapper/flow-player-wrapper___bepaalde-videos-in-de-playlist-kunnen-niet-worden-afgespeeld-probeer-een-andere-browser'
					)
				);
			}
		} else {
			// Convert src url
			if ((src as string).includes('flowplayer')) {
				return (src as string)
					.replace('/hls/', '/v-')
					.replace('/playlist.m3u8', '_original.mp4');
			}

			if ((src as string).endsWith('.m3u8')) {
				ToastService.danger(
					t(
						'shared/components/flow-player-wrapper/flow-player-wrapper___deze-video-kan-niet-worden-afgespeeld-probeer-een-andere-browser'
					)
				);
			}
		}

		return src;
	};

	const [start, end]: [number | null, number | null] = getValidStartAndEnd(
		props.cuePoints?.start,
		props.cuePoints?.end,
		toSeconds(item?.duration)
	);

	const trackingId =
		window.ga && typeof window.ga.getAll === 'function' && window.ga.getAll()[0]
			? window.ga.getAll()[0].get('trackingId')
			: undefined;

	return (
		<>
			<div className="c-video-player t-player-skin--dark">
				{src && (props.autoplay || clickedThumbnail || !item) ? (
					<FlowPlayer
						src={getBrowserSafeUrl(src)}
						poster={poster}
						title={props.title}
						metadata={
							item
								? [
										props.issuedDate || reorderDate(item.issued || null, '.'),
										props.organisationName ||
											get(item, 'organisation.name', ''),
								  ]
								: undefined
						}
						token={getEnv('FLOW_PLAYER_TOKEN')}
						dataPlayerId={getEnv('FLOW_PLAYER_ID')}
						logo={props.organisationLogo || get(item, 'organisation.logo_url')}
						speed={{
							options: [0.5, 0.75, 1, 1.25, 1.5],
							labels: [
								t(
									'shared/components/flow-player-wrapper/flow-player-wrapper___0-5'
								),
								t(
									'shared/components/flow-player-wrapper/flow-player-wrapper___0-75'
								),
								t(
									'shared/components/flow-player-wrapper/flow-player-wrapper___normaal'
								),
								t(
									'shared/components/flow-player-wrapper/flow-player-wrapper___1-25'
								),
								t(
									'shared/components/flow-player-wrapper/flow-player-wrapper___1-5'
								),
							],
						}}
						start={item ? start : null}
						end={item ? end : null}
						autoplay={(!!item && !!src) || (!isPlaylist && props.autoplay)}
						canPlay={props.canPlay}
						subtitles={getSubtitles(item)}
						playlistScrollable={!isMobileWidth()}
						onPlay={handlePlay}
						onEnded={props.onEnded}
						googleAnalyticsId={trackingId}
						googleAnalyticsEvents={
							[
								'video_player_load',
								'video_start',
								'video_click_play',
								'video_25_percent',
								'video_50_percent',
								'video_75_percent',
								'video_complete',
							] as any
						}
						googleAnalyticsTitle={props.title}
						renderPlaylistTile={renderPlaylistTile}
					/>
				) : (
					<div className="c-video-player__overlay" onClick={handlePosterClicked}>
						<AspectRatioWrapper
							className="c-video-player__item c-video-player__thumbnail"
							style={{ backgroundImage: `url(${poster})` }}
						/>
						<div className="c-play-overlay">
							<div className="c-play-overlay__inner">
								<Icon name="play" className="c-play-overlay__button" />
							</div>
						</div>
						{!isNil(start) &&
							!isNil(end) &&
							(start !== 0 || end !== toSeconds(item?.duration)) && (
								<div className="c-cut-overlay">
									<Icon name="scissors" />
									{`${formatDurationHoursMinutesSeconds(
										start
									)} - ${formatDurationHoursMinutesSeconds(end)}`}
								</div>
							)}
					</div>
				)}
			</div>

			{(!!props.annotationTitle || !!props.annotationText) && (
				<div className="a-block-image__annotation">
					{props.annotationTitle && <h3>&#169; {props.annotationTitle}</h3>}
					{props.annotationText && (
						<p className="a-flowplayer__text">{props.annotationText}</p>
					)}
				</div>
			)}
		</>
	);
};

export default withUser(FlowPlayerWrapper) as FunctionComponent<FlowPlayerWrapperProps>;
