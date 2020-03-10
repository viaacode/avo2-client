import classnames from 'classnames';
import { get } from 'lodash-es';
import React, { FC, useEffect, useState } from 'react';

import { BlockFlowPlayer, ButtonAction } from '@viaa/avo2-components';

import { getEnv } from '../../../../../shared/helpers';
import { ToastService } from '../../../../../shared/services';
import { fetchPlayerTicket } from '../../../../../shared/services/player-ticket-service';
import { getVideoStills } from '../../../../../shared/services/stills-service';
import i18n from '../../../../../shared/translations/i18n';

import './BlockMediaPlayerWrapper.scss';

interface MediaPlayerProps {
	title: string;
	item: ButtonAction;
	width?: 'full-width' | '500px' | '400px';
}

export const MediaPlayerWrapper: FC<MediaPlayerProps> = ({ item, title, width }) => {
	const [playerTicket, setPlayerTicket] = useState<string>();
	const [videoStill, setVideoStill] = useState<string>();

	useEffect(() => {
		retrieveStill();
	});

	const initFlowPlayer = () => {
		if (!playerTicket) {
			fetchPlayerTicket(item.value.toString())
				.then((data: string) => {
					setPlayerTicket(data);
				})
				.catch((err: any) => {
					console.error(err);
					ToastService.danger(
						i18n.t(
							'admin/content-block/helpers/wrappers/block-media-player-wrapper___het-ophalen-van-het-player-ticket-is-mislukt'
						)
					);
				});
		}
	};

	const retrieveStill = async () => {
		const videoStills = await getVideoStills([
			{ externalId: get(item, 'value', '').toString(), startTime: 0 },
		]);

		setVideoStill(get(videoStills[0], 'previewImagePath', '')); // TODO: Default image?
	};

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
					src={playerTicket ? playerTicket.toString() : null}
					poster={videoStill}
					onInit={get(item, 'value') ? initFlowPlayer : () => {}}
					token={getEnv('FLOW_PLAYER_TOKEN')}
					dataPlayerId={getEnv('FLOW_PLAYER_ID')}
				/>
			)}
		</div>
	);
};
