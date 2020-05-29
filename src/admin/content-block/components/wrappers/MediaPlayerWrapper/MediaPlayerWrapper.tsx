import classnames from 'classnames';
import { get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BlockFlowPlayer, ButtonAction } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { FlowPlayerWrapper } from '../../../../../shared/components';
import { CustomError, getEnv } from '../../../../../shared/helpers';
import { ToastService } from '../../../../../shared/services';
import { fetchPlayerTicket } from '../../../../../shared/services/player-ticket-service';
import i18n from '../../../../../shared/translations/i18n';
import { ItemsService } from '../../../../items/items.service';

import './BlockMediaPlayerWrapper.scss';

interface MediaPlayerWrapperProps {
	title: string;
	item?: ButtonAction;
	src?: string;
	poster?: string;
	width?: 'full-width' | '500px' | '400px';
	autoplay?: boolean;
}

const MediaPlayerWrapper: FunctionComponent<MediaPlayerWrapperProps> = ({
	item,
	src,
	poster,
	title,
	width,
	autoplay,
}) => {
	const [t] = useTranslation();

	const [playerTicket, setPlayerTicket] = useState<string>();
	const [videoStill, setVideoStill] = useState<string>();
	const [mediaItem, setMediaItem] = useState<Avo.Item.Item | null>(null);

	const initFlowPlayer = useCallback(async () => {
		try {
			if (!playerTicket && item) {
				const data: string = await fetchPlayerTicket(item.value.toString());
				setPlayerTicket(data);
			}
		} catch (err) {
			console.error(new CustomError('Player ticket kon niet worden opgehaald', err));
			ToastService.danger(
				i18n.t(
					'admin/content-block/helpers/wrappers/block-media-player-wrapper___het-ophalen-van-het-player-ticket-is-mislukt'
				)
			);
		}
	}, [setPlayerTicket, playerTicket, item]);

	const retrieveMediaItem = useCallback(async () => {
		try {
			if (item) {
				// Video from MAM
				const mediaItemTemp = await ItemsService.fetchItemByExternalId(
					item.value.toString()
				);
				setMediaItem(mediaItemTemp);
				setVideoStill(get(mediaItemTemp, 'thumbnail_path'));
			} else {
				// Custom video
				setVideoStill(poster);
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch item info from the database', err, { item })
			);
			ToastService.danger(t('Het ophalen van het fragment is mislukt'));
		}
	}, [item, poster, t]);

	useEffect(() => {
		retrieveMediaItem();
	}, [retrieveMediaItem]);

	useEffect(() => {
		if (autoplay) {
			initFlowPlayer();
		}
	}, [autoplay, initFlowPlayer]);

	return (
		<div
			className={classnames(
				'c-video-player t-player-skin--dark',
				`o-media-block-width-${width}`,
				'u-center-m'
			)}
		>
			{!!videoStill && src && (
				<BlockFlowPlayer
					title={title}
					src={src || (playerTicket ? playerTicket.toString() : null)}
					poster={videoStill}
					onInit={get(item, 'value') ? initFlowPlayer : () => {}}
					token={getEnv('FLOW_PLAYER_TOKEN')}
					dataPlayerId={getEnv('FLOW_PLAYER_ID')}
					// autoplay + src => internal autoplay = true
					// no autoplay + src => internal autoplay = false
					// autoplay + no src (mam) => call get token immediately + internal autoplay = true
					// no autoplay + no src (mam) => show poster + internal autoplay = true
					autoplay={src ? autoplay : true}
				/>
			)}
			{!!videoStill && mediaItem && (
				<FlowPlayerWrapper
					item={{
						...mediaItem,
						title: title || mediaItem.title,
					}}
				/>
			)}
		</div>
	);
};

export default MediaPlayerWrapper;
