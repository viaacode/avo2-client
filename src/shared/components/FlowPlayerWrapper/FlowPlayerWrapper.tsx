import { get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AspectRatioWrapper, formatDuration, Icon } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { getProfileName } from '../../../authentication/helpers/get-profile-info';
import { CustomError, getEnv, reorderDate } from '../../helpers';
import withUser, { UserProps } from '../../hocs/withUser';
import { BookmarksViewsPlaysService, ToastService } from '../../services';
import { trackEvents } from '../../services/event-logging-service';
import { fetchPlayerTicket } from '../../services/player-ticket-service';

import { FlowPlayer } from './FlowPlayer/FlowPlayer';
import './FlowPlayerWrapper.scss';

export interface CuePoints {
	start: number | null;
	end: number | null;
}

type FlowPlayerWrapperProps = {
	item?: Avo.Item.Item;
	src?: string;
	poster?: string;
	canPlay?: boolean;
	cuePoints?: CuePoints;
	seekTime?: number;
	autoplay?: boolean;
};

/**
 * Handle flowplayer play events for the whole app, so we track play count
 * @param props
 * @constructor
 */
const FlowPlayerWrapper: FunctionComponent<FlowPlayerWrapperProps & UserProps> = props => {
	const [t] = useTranslation();

	const item: Avo.Item.Item | undefined = props.item;
	const poster: string | undefined = props.poster || get(item, 'thumbnail_path');

	const [triggeredForUrl, setTriggeredForUrl] = useState<string | null>(null);
	const [clickedThumbnail, setClickedThumbnail] = useState<boolean>(false);
	const [src, setSrc] = useState<string | undefined>(props.src);

	useEffect(() => {
		// reset token when item changes
		setSrc(props.src);
		setClickedThumbnail(false);
	}, [item, props.src, setSrc, setClickedThumbnail]);

	const initFlowPlayer = useCallback(async () => {
		try {
			if (!item) {
				throw new CustomError('Failed to init flowplayer since item is undefined');
			}
			setSrc(await fetchPlayerTicket(item.external_id));
		} catch (err) {
			console.error(
				new CustomError('Failed to initFlowlayer in FlowPlayerWrapper', err, {
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

	const handlePlay = () => {
		// Only trigger once per video
		if (item && item.uid && triggeredForUrl !== src) {
			BookmarksViewsPlaysService.action('play', 'item', item.uid, undefined).catch(err => {
				console.error(
					new CustomError('Failed to track item play event', err, { itemUuid: item.uid })
				);
			});
			if (props.user) {
				trackEvents(
					{
						object: item.external_id,
						object_type: 'avo_item_pid',
						message: `Gebruiker ${getProfileName(props.user)} heeft het item ${
							item.external_id
						} afgespeeld`,
						action: 'view',
					},
					props.user
				);
			}
			setTriggeredForUrl(src || null);
		}
	};

	const handlePosterClicked = () => {
		setClickedThumbnail(true);
		if (!src) {
			initFlowPlayer();
		}
	};

	return (
		<div className="c-video-player t-player-skin--dark">
			{src && (props.autoplay || clickedThumbnail || !item) ? (
				<FlowPlayer
					src={src}
					seekTime={props.seekTime}
					poster={poster}
					title={get(item, 'title')}
					subtitles={
						item
							? [
									reorderDate(item.issued || null, '.'),
									get(item, 'organisation.name', ''),
							  ]
							: undefined
					}
					token={getEnv('FLOW_PLAYER_TOKEN')}
					dataPlayerId={getEnv('FLOW_PLAYER_ID')}
					logo={get(item, 'organisation.logo_url')}
					{...props.cuePoints}
					autoplay={(!!item && !!src) || props.autoplay}
					canPlay={props.canPlay}
					onPlay={handlePlay}
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
					{props.cuePoints &&
						(props.cuePoints.start || props.cuePoints.start === 0) &&
						props.cuePoints.end && (
							<div className="c-cut-overlay">
								<Icon name="scissors" />
								{`${formatDuration(props.cuePoints.start)} - ${formatDuration(
									props.cuePoints.end
								)}`}
							</div>
						)}
				</div>
			)}
		</div>
	);
};

export default withUser(FlowPlayerWrapper) as FunctionComponent<FlowPlayerWrapperProps>;
