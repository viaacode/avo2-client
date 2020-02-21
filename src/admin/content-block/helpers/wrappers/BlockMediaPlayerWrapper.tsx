import { get } from 'lodash-es';
import React, { FC, useState } from 'react';

import { BlockFlowPlayer, ButtonAction } from '@viaa/avo2-components';

import { getEnv } from '../../../../shared/helpers';
import { fetchPlayerTicket } from '../../../../shared/services/player-ticket-service';
import toastService from '../../../../shared/services/toast-service';
import i18n from '../../../../shared/translations/i18n';

interface MediaPlayerProps {
	title: string;
	item: ButtonAction;
}

export const MediaPlayer: FC<MediaPlayerProps> = ({ item, title }) => {
	const [playerTicket, setPlayerTicket] = useState<string>();

	const initFlowPlayer = () =>
		!playerTicket &&
		fetchPlayerTicket(item.value.toString())
			.then((data: string) => {
				setPlayerTicket(data);
			})
			.catch((err: any) => {
				console.error(err);
				toastService.danger(
					i18n.t(
						'admin/content-block/helpers/wrappers/block-media-player-wrapper___het-ophalen-van-het-player-ticket-is-mislukt'
					)
				);
			});

	return (
		<div className="c-video-player t-player-skin--dark">
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
