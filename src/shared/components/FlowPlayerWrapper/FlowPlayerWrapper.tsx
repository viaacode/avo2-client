import { get } from 'lodash-es';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Avo } from '@viaa/avo2-types';

import { getProfileName } from '../../../authentication/helpers/get-profile-info';
import { CustomError, getEnv, reorderDate } from '../../helpers';
import { BookmarksViewsPlaysService, ToastService } from '../../services';
import { trackEvents } from '../../services/event-logging-service';
import { fetchPlayerTicket } from '../../services/player-ticket-service';
import { FlowPlayer } from '@viaa/avo2-components';

export interface CuePoints {
	start: number | null;
	end: number | null;
}

interface FlowPlayerWrapperProps {
	item: Avo.Item.Item;
	user: Avo.User.User | undefined;
	canPlay?: boolean;
	cuePoints?: CuePoints;
	seekTime?: number;
}

/**
 * Handle flowplayer play events for the whole app, so we track play count
 * @param props
 * @constructor
 */
const FlowPlayerWrapper: FunctionComponent<FlowPlayerWrapperProps> = ({
	item,
	user,
	canPlay = true,
	cuePoints,
	seekTime = 0,
}) => {
	const [t] = useTranslation();

	const videoRef = useRef<HTMLDivElement>(null);

	const [triggeredForUrl, setTriggeredForUrl] = useState<string | null>(null);
	const [playerTicket, setPlayerTicket] = useState<string>();

	useEffect(() => {
		// reset token when item changes
		setPlayerTicket(undefined);
	}, [item.external_id]);

	const initFlowPlayer = async () => {
		try {
			if (playerTicket) {
				return;
			}
			const data: string = await fetchPlayerTicket(item.external_id);
			setPlayerTicket(data);
			if (user) {
				trackEvents(
					{
						object: item.external_id,
						object_type: 'avo_item_pid',
						message: `Gebruiker ${getProfileName(user)} heeft het item ${
							item.external_id
						} afgespeeld`,
						action: 'view',
					},
					user
				);
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to initFlowlayer in FlowPlayerWrapper', err, {
					playerTicket,
				})
			);
			ToastService.danger(
				t(
					'item/components/item-video-description___het-ophalen-van-de-mediaplayer-ticket-is-mislukt'
				)
			);
		}
	};

	const handlePlay = () => {
		// Only trigger once per video
		if (item.uid && triggeredForUrl !== playerTicket) {
			BookmarksViewsPlaysService.action('play', 'item', item.uid, undefined).catch(err => {
				console.error(
					new CustomError('Failed to track item play event', err, { itemUuid: item.uid })
				);
			});
			setTriggeredForUrl(playerTicket || null);
		}
	};

	return (
		<div className="c-video-player t-player-skin--dark" ref={videoRef}>
			<FlowPlayer
				src={playerTicket ? playerTicket.toString() : null}
				seekTime={seekTime}
				poster={item.thumbnail_path}
				title={item.title}
				onInit={initFlowPlayer}
				subtitles={[
					reorderDate(item.issued || null, '.'),
					get(item, 'organisation.name', ''),
				]}
				token={getEnv('FLOW_PLAYER_TOKEN')}
				dataPlayerId={getEnv('FLOW_PLAYER_ID')}
				logo={get(item, 'organisation.logo_url')}
				{...cuePoints}
				autoplay
				canPlay={canPlay}
				onPlay={handlePlay}
			/>
		</div>
	);
};

export default FlowPlayerWrapper;
