import { FlowPlayer, FlowplayerSourceItem, FlowplayerSourceList } from '@meemoo/react-components';
import { Icon, IconName, MediaCard, MediaCardThumbnail, Thumbnail } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { get, isNil, isString, noop, throttle } from 'lodash-es';
import { stringifyUrl } from 'query-string';
import React, { FunctionComponent, ReactNode, useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router-dom';
import { compose, Dispatch } from 'redux';

import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { APP_PATH } from '../../../constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { setLastVideoPlayedAtAction } from '../../../store/actions';
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
import { BookmarksViewsPlaysService } from '../../services/bookmarks-views-plays-service';
import { fetchPlayerTicket } from '../../services/player-ticket-service';
import { ToastService } from '../../services/toast-service';

import './FlowPlayerWrapper.scss';

export interface CuePoints {
	end: number | null;
	start: number | null;
}

export type FlowPlayerWrapperProps = {
	annotationText?: string;
	annotationTitle?: string;
	autoplay?: boolean;
	canPlay?: boolean;
	cuePoints?: CuePoints;
	duration?: string;
	external_id?: string;
	issuedDate?: string;
	item?: Avo.Item.Item;
	cuePointsVideo?: CuePoints;
	cuePointsLabel?: CuePoints;
	onEnded?: () => void;
	onPlay?: (playingSrc: string) => void;
	poster?: string;
	src?: string | FlowplayerSourceList;
	title?: string;
	topRight?: ReactNode;
};

/**
 * Handle flowplayer play events for the whole app, so we track play count
 * @param props
 * @constructor
 */
const FlowPlayerWrapper: FunctionComponent<
	FlowPlayerWrapperProps &
		UserProps &
		RouteComponentProps & { setLastVideoPlayedAt: (lastVideoPlayedAt: Date | null) => Dispatch }
> = (props) => {
	const { tText, tHtml } = useTranslation();

	const item: Avo.Item.Item | undefined = props.item;
	const poster: string | undefined = props.poster || get(item, 'thumbnail_path');

	const [triggeredForUrl, setTriggeredForUrl] = useState<Record<string, boolean>>({});

	// AVO-2241:
	// The flowplayer play event is created from outside react, so to be able to update the state, we need to use a ref.
	// see: https://medium.com/geographit/accessing-react-state-in-event-listeners-with-usestate-and-useref-hooks-8cceee73c559
	const triggeredForUrlRef = React.useRef(triggeredForUrl);
	const setTriggeredForUrlRef = (data: Record<string, boolean>) => {
		triggeredForUrlRef.current = data;
		setTriggeredForUrl(data);
	};

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
				tHtml(
					'item/components/item-video-description___het-ophalen-van-de-mediaplayer-ticket-is-mislukt'
				)
			);
		}
	}, [item, setSrc, tText]);

	useEffect(() => {
		if (props.autoplay && item) {
			initFlowPlayer();
		}
	}, [props.autoplay, item, initFlowPlayer]);

	const handlePlay = (playingSrc: string) => {
		// Only trigger once per video
		if (item && item.uid && !triggeredForUrlRef.current[playingSrc] && props.commonUser) {
			BookmarksViewsPlaysService.action('play', 'item', item.uid, props.commonUser).catch(
				(err: unknown) => {
					console.error(
						new CustomError('Failed to track item play event', err, {
							itemUuid: item.uid,
						})
					);
				}
			);

			if (props.onPlay) {
				props.onPlay(playingSrc);
			}
			setTriggeredForUrlRef({
				...triggeredForUrl,
				[playingSrc]: true,
			});
		}
	};

	const handleTimeUpdate = throttle(
		() => {
			// Keep track of the last time a video was played in the redux store
			// Since it influences when we want to show the "you are inactive" modal for editing collections and assignments
			// https://meemoo.atlassian.net/browse/AVO-2983
			props.setLastVideoPlayedAt(new Date());
		},
		30000,
		{ leading: true, trailing: true }
	);

	const handlePosterClicked = async () => {
		setClickedThumbnail(true);

		if (!src) {
			if (!props.commonUser) {
				redirectToClientPage(
					stringifyUrl({
						url: APP_PATH.REGISTER_OR_LOGIN.route,
						query: {
							returnToUrl: props.location.pathname,
						},
					}),
					props.history
				);
				return;
			}
			await initFlowPlayer();
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
					tHtml(
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
					tHtml(
						'shared/components/flow-player-wrapper/flow-player-wrapper___deze-video-kan-niet-worden-afgespeeld-probeer-een-andere-browser'
					)
				);
			}
		}

		return src;
	};

	const [start, end]: [number | null, number | null] = getValidStartAndEnd(
		props.cuePointsVideo?.start,
		props.cuePointsVideo?.end,
		toSeconds(item?.duration)
	);

	const trackingId =
		window.ga && typeof window.ga.getAll === 'function' && window.ga.getAll()[0]
			? window.ga.getAll()[0].get('trackingId')
			: undefined;

	return (
		<>
			<div className="c-video-player t-player-skin--dark" style={{ aspectRatio: '16/9' }}>
				{src && (props.autoplay || clickedThumbnail || !item) ? (
					<FlowPlayer
						src={getBrowserSafeUrl(src)}
						type={(item?.type?.label as 'video' | 'audio' | undefined) || 'video'}
						poster={poster}
						title={props.title}
						metadata={
							item
								? [
										props.issuedDate || reorderDate(item.issued || null, '.'),
										item?.organisation?.name || '',
								  ]
								: undefined
						}
						token={getEnv('FLOW_PLAYER_TOKEN')}
						dataPlayerId={getEnv('FLOW_PLAYER_ID')}
						logo={
							item?.organisation?.overlay ? item?.organisation?.logo_url : undefined
						}
						speed={{
							options: [0.5, 0.75, 1, 1.25, 1.5],
							labels: [
								tText(
									'shared/components/flow-player-wrapper/flow-player-wrapper___0-5'
								),
								tText(
									'shared/components/flow-player-wrapper/flow-player-wrapper___0-75'
								),
								tText(
									'shared/components/flow-player-wrapper/flow-player-wrapper___normaal'
								),
								tText(
									'shared/components/flow-player-wrapper/flow-player-wrapper___1-25'
								),
								tText(
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
						onTimeUpdate={handleTimeUpdate}
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
					// Fake player for logged-out users that do not yet have video playback rights
					<div
						className="c-video-player__overlay c-video-player__item c-video-player__thumbnail"
						onClick={handlePosterClicked}
						style={{ aspectRatio: '16/9', backgroundImage: `url(${poster})` }}
					>
						<div className="c-play-overlay">
							<div className="c-play-overlay__inner">
								<Icon name={IconName.play} className="c-play-overlay__button" />
							</div>
						</div>
						{!isNil(start) &&
							!isNil(end) &&
							(start !== 0 || end !== toSeconds(item?.duration)) && (
								<div className="c-cut-overlay">
									<Icon name={IconName.scissors} />
									{`${formatDurationHoursMinutesSeconds(
										start
									)} - ${formatDurationHoursMinutesSeconds(end)}`}
								</div>
							)}
						{!!props.topRight && (
							<div className="c-video-player__top-right">{props.topRight}</div>
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
	setLastVideoPlayedAt: (lastVideoPlayedAt: Date | null) =>
		dispatch(setLastVideoPlayedAtAction(lastVideoPlayedAt) as any),
});

export default compose(
	connect(noop, mapDispatchToProps),
	withRouter,
	withUser
)(FlowPlayerWrapper) as FunctionComponent<FlowPlayerWrapperProps>;
