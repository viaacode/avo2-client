import { Location } from 'history';
import { get } from 'lodash-es';
import { parse } from 'query-string';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FlowPlayer } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { getProfileName } from '../../../authentication/helpers/get-profile-info';
import { CustomError, getEnv, reorderDate } from '../../helpers';
import { BookmarksViewsPlaysService, ToastService } from '../../services';
import { trackEvents } from '../../services/event-logging-service';
import { fetchPlayerTicket } from '../../services/player-ticket-service';
import { generateRandomId } from '../../helpers/uuid';

export interface CuePoints {
	start: number | null;
	end: number | null;
}

interface FlowPlayerWrapperProps {
	item: Avo.Item.Item;
	user: Avo.User.User;
	canPlay?: boolean;
	cuePoints?: CuePoints;
	location: Location;
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
	location,
}) => {
	const [t] = useTranslation();

	const videoRef = useRef<HTMLDivElement>(null);

	const [triggeredForUrl, setTriggeredForUrl] = useState<string | null>(null);
	const [playerTicket, setPlayerTicket] = useState<string>();
	const [time, setTime] = useState<number>(0);
	const [randomId] = useState<string>(generateRandomId());

	useEffect(() => {
		// reset token when item changes
		console.log('resetting player ticket');
		setPlayerTicket(undefined);
	}, [item.external_id]);

	useEffect(() => {
		// Set video current time from the query params once the video has loaded its meta data
		// If this happens sooner, the time will be ignored by the video player
		const queryParams = parse(location.search);

		setTime(parseInt((queryParams.time as string) || '0', 10));
	}, [location.search]);

	const initFlowPlayer = async () => {
		try {
			if (playerTicket) {
				return;
			}
			const data: string = await fetchPlayerTicket(item.external_id);
			console.log('setting player ticket', data);
			setPlayerTicket(data);
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

	console.log('seek time: ', time, playerTicket, randomId);
	return (
		<div className="c-video-player t-player-skin--dark" ref={videoRef}>
			<FlowPlayer
				src={playerTicket ? playerTicket.toString() : null}
				seekTime={time}
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
