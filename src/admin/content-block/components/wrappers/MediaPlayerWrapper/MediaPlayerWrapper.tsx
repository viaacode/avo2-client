import classnames from 'classnames';
import { get } from 'lodash-es';
import React, { FC, useCallback, useEffect, useState } from 'react';

import { BlockFlowPlayer, ButtonAction } from '@viaa/avo2-components';

import { CustomError, getEnv } from '../../../../../shared/helpers';
import { ToastService } from '../../../../../shared/services';
import { fetchPlayerTicket } from '../../../../../shared/services/player-ticket-service';
import { getVideoStills } from '../../../../../shared/services/stills-service';
import i18n from '../../../../../shared/translations/i18n';

import './BlockMediaPlayerWrapper.scss';

interface MediaPlayerProps {
	title: string;
	item?: ButtonAction;
	src?: string;
	poster?: string;
	width?: 'full-width' | '500px' | '400px';
	autoplay?: boolean;
}

export const MediaPlayerWrapper: FC<MediaPlayerProps> = ({
	item,
	src,
	poster,
	title,
	width,
	autoplay,
}) => {
	const [playerTicket, setPlayerTicket] = useState<string>();
	const [videoStill, setVideoStill] = useState<string>();

	const initFlowPlayer = async () => {
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
	};

	const retrieveStill = useCallback(async () => {
		if (poster) {
			setVideoStill(poster);
			return;
		}
		const videoStills = await getVideoStills([
			{ externalId: get(item, 'value', '').toString(), startTime: 0 },
		]);

		setVideoStill(get(videoStills[0], 'previewImagePath', '')); // TODO: Default image?
	}, [item, poster]);

	useEffect(() => {
		retrieveStill();
	}, [retrieveStill]);

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
			{!!videoStill && (
				<BlockFlowPlayer
					title={title}
					src={src || (playerTicket ? playerTicket.toString() : null)}
					poster={videoStill}
					onInit={get(item, 'value') ? initFlowPlayer : () => {}}
					token={getEnv('FLOW_PLAYER_TOKEN')}
					dataPlayerId={getEnv('FLOW_PLAYER_ID')}
					autoplay={src ? autoplay : true}
				/>
			)}
		</div>
	);
};
