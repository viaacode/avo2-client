import React, {
	createRef,
	FunctionComponent,
	ReactNode,
	RefObject,
	useEffect,
	useState,
} from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Scrollbar } from 'react-scrollbars-custom';

import {
	Button,
	Column,
	convertToHtml,
	ExpandableContainer,
	FlowPlayer,
	Grid,
	Heading,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { debounce } from 'lodash-es';
import { parse } from 'querystring';

import { getProfileName } from '../../authentication/helpers/get-profile-info';
import { getEnv, parseDuration } from '../../shared/helpers';
import { trackEvents } from '../../shared/services/event-logging-service';
import { fetchPlayerTicket } from '../../shared/services/player-ticket-service';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';

import './ItemVideoDescription.scss';

interface ItemVideoDescriptionProps extends RouteComponentProps {
	itemMetaData: Avo.Item.Item;
	showTitleOnVideo?: boolean;
	showDescriptionNextToVideo?: boolean;
}

const DEFAULT_VIDEO_HEIGHT = 421;

const ItemVideoDescription: FunctionComponent<ItemVideoDescriptionProps> = ({
	itemMetaData,
	location,
	showTitleOnVideo = true,
	showDescriptionNextToVideo = true,
}) => {
	const videoRef: RefObject<HTMLVideoElement> = createRef();

	const [playerTicket, setPlayerTicket] = useState<string>();
	const [time, setTime] = useState<number>(0);
	const [videoHeight, setVideoHeight] = useState<number>(DEFAULT_VIDEO_HEIGHT); // correct height for desktop screens

	useEffect(() => {
		// Set video current time from the query params once the video has loaded its meta data
		// If this happens sooner, the time will be ignored by the video player
		const queryParams = parse(location.search);

		setTime(parseInt((queryParams.time as string) || '0', 10));

		// Register window listener when the component mounts
		const onResizeHandler = debounce(
			() => {
				if (videoRef.current) {
					const vidHeight = videoRef.current.getBoundingClientRect().height;
					setVideoHeight(vidHeight);
				} else {
					setVideoHeight(DEFAULT_VIDEO_HEIGHT);
				}
			},
			300,
			{ leading: false, trailing: true }
		);

		window.addEventListener('resize', onResizeHandler);
		onResizeHandler();

		return () => {
			window.removeEventListener('resize', onResizeHandler);
		};
	}, [location.search, videoRef]);

	const handleTimeLinkClicked = async (timestamp: string) => {
		const seconds = parseDuration(timestamp);
		setTime(seconds);
	};

	/**
	 * Split string by time markers and adds links to those times into the output jsx code
	 */
	const formatTimestamps = (description: string = ''): ReactNode => {
		const timestampRegex = /([0-9]{2}:[0-9]{2}:[0-9]{2}|\n)/g;
		const parts: string[] = description.split(timestampRegex);
		return parts.map((part: string, index: number) => {
			if (part === '\n') {
				return <br key={`description-new-line-${index}`} />;
			}

			if (timestampRegex.test(part)) {
				return (
					<Button
						type="link"
						key={`description-link-${index}`}
						className="u-clickable"
						onClick={() => handleTimeLinkClicked(part)}
					>
						{part}
					</Button>
				);
			}

			return <span key={`description-part-${index}`} dangerouslySetInnerHTML={{ __html: part }} />;
		});
	};

	const initFlowPlayer = () =>
		!playerTicket &&
		fetchPlayerTicket(itemMetaData.external_id)
			.then((data: any) => {
				// TODO: add interface @benji
				setPlayerTicket(data);
				trackEvents({
					event_object: {
						type: 'item',
						identifier: itemMetaData.external_id,
					},
					event_message: `Gebruiker ${getProfileName()} heeft het item ${
						itemMetaData.external_id
					} afgespeeld`,
					name: 'view',
					category: 'item',
				});
			})
			.catch((err: any) => {
				console.error(err);
				toastService('Het ophalen van de mediaplayer ticket is mislukt', TOAST_TYPE.DANGER);
			});

	const renderMedia = () => (
		<div className="c-video-player t-player-skin--dark">
			{itemMetaData.thumbnail_path && ( // TODO: Replace publisher, published_at by real publisher
				<FlowPlayer
					src={playerTicket ? playerTicket.toString() : null}
					seekTime={time}
					poster={itemMetaData.thumbnail_path}
					title={itemMetaData.title}
					onInit={initFlowPlayer}
					subtitles={['Publicatiedatum', 'Aanbieder']}
					token={getEnv('FLOW_PLAYER_TOKEN')}
					dataPlayerId={getEnv('FLOW_PLAYER_ID')}
				/>
			)}
		</div>
	);

	const renderDescription = () => (
		<Scrollbar
			style={{
				width: '100%',
				height: `${videoHeight}px`, // Height of button
				overflowY: 'auto',
			}}
		>
			<Heading type="h4">Beschrijving</Heading>
			{/* "Beschrijving" label height (22) + padding (15 * 2) + read more button (36) - additional margin (8) */}
			<ExpandableContainer collapsedHeight={videoHeight - 22 - 15 * 2 - 36 - 8}>
				<p>{formatTimestamps(convertToHtml(itemMetaData.description))}</p>
			</ExpandableContainer>
		</Scrollbar>
	);

	return (
		<Grid className="c-item-video-description">
			{showDescriptionNextToVideo ? (
				<>
					<Column size="2-7">{renderMedia()}</Column>
					<Column size="2-5">{renderDescription()}</Column>
				</>
			) : (
				<>
					<Column size="2-3">
						<></>
					</Column>
					<Column size="2-6">{renderMedia()}</Column>
					<Column size="2-3">
						<></>
					</Column>
				</>
			)}
		</Grid>
	);
};

export default withRouter(ItemVideoDescription);
