import classnames from 'classnames';
import { get } from 'lodash-es';
import React, { FC, useState } from 'react';

import { BlockFlowPlayer, ButtonAction } from '@viaa/avo2-components';

import { getEnv } from '../../../../../shared/helpers';
import { ToastService } from '../../../../../shared/services';
import { fetchPlayerTicket } from '../../../../../shared/services/player-ticket-service';
import i18n from '../../../../../shared/translations/i18n';

import './BlockMediaPlayerWrapper.scss';

interface MediaPlayerProps {
	title: string;
	item: ButtonAction;
	width?: 'full-width' | '500px' | '400px';
}

export const MediaPlayerWrapper: FC<MediaPlayerProps> = ({ item, title, width }) => {
	const [playerTicket, setPlayerTicket] = useState<string>();

	const initFlowPlayer = () =>
		!playerTicket &&
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

	return (
		<div
			className={classnames(
				'c-video-player t-player-skin--dark',
				`o-media-block-width-${width}`,
				'u-center-m'
			)}
		>
			<BlockFlowPlayer
				title={title}
				src={playerTicket ? playerTicket.toString() : null}
				poster="https://via.placeholder.com/1920x1080"
				onInit={get(item, 'value') ? initFlowPlayer : () => {}}
				token={getEnv('FLOW_PLAYER_TOKEN')}
				dataPlayerId={getEnv('FLOW_PLAYER_ID')}
			/>
		</div>
	);
};
