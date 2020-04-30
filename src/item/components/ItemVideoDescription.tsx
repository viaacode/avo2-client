import { debounce, get } from 'lodash-es';
import { parse } from 'query-string';
import React, {
	createRef,
	FunctionComponent,
	ReactNode,
	RefObject,
	useEffect,
	useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Scrollbar } from 'react-scrollbars-custom';

import {
	BlockHeading,
	Button,
	Column,
	convertToHtml,
	ExpandableContainer,
	Grid,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { Color } from '../../admin/shared/types';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { getProfileName } from '../../authentication/helpers/get-profile-info';
import { FlowPlayerWrapper } from '../../shared/components';
import { getEnv, parseDuration, reorderDate } from '../../shared/helpers';
import { ToastService } from '../../shared/services';
import { trackEvents } from '../../shared/services/event-logging-service';
import { fetchPlayerTicket } from '../../shared/services/player-ticket-service';

import './ItemVideoDescription.scss';

interface CuePoints {
	start: number | null;
	end: number | null;
}

interface ItemVideoDescriptionProps extends DefaultSecureRouteProps {
	itemMetaData: Avo.Item.Item;
	showTitleOnVideo?: boolean;
	showDescription?: boolean;
	showTitle?: boolean;
	title?: string;
	description?: string;
	cuePoints?: CuePoints;
	canPlay?: boolean; // If video is behind modal or inside a closed modal this value will be false
	onTitleClicked?: () => void;
}

const DEFAULT_VIDEO_HEIGHT = 421;

const ItemVideoDescription: FunctionComponent<ItemVideoDescriptionProps> = ({
	itemMetaData,
	location,
	showTitle = false,
	showDescription = true,
	title = itemMetaData.title,
	description = itemMetaData.description,
	onTitleClicked,
	cuePoints,
	canPlay = true,
	user,
}) => {
	const [t] = useTranslation();

	const videoRef: RefObject<HTMLVideoElement> = createRef();

	const [playerTicket, setPlayerTicket] = useState<string>();
	const [time, setTime] = useState<number>(0);
	const [videoHeight, setVideoHeight] = useState<number>(DEFAULT_VIDEO_HEIGHT); // correct height for desktop screens

	useEffect(() => {
		// reset token when item changes
		setPlayerTicket(undefined);
	}, [itemMetaData.external_id]);

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
						title={t(
							'item/components/item-video-description___sprint-naar-tijdscode-code',
							{ code: part }
						)}
						ariaLabel={t(
							'item/components/item-video-description___sprint-naar-tijdscode-code',
							{ code: part }
						)}
						className="u-clickable"
						onClick={() => handleTimeLinkClicked(part)}
					>
						{part}
					</Button>
				);
			}

			return (
				<span
					key={`description-part-${index}`}
					dangerouslySetInnerHTML={{ __html: part }}
				/>
			);
		});
	};

	const initFlowPlayer = () =>
		!playerTicket &&
		fetchPlayerTicket(itemMetaData.external_id)
			.then((data: string) => {
				setPlayerTicket(data);
				trackEvents(
					{
						object: itemMetaData.external_id,
						object_type: 'avo_item_pid',
						message: `Gebruiker ${getProfileName(user)} heeft het item ${
							itemMetaData.external_id
						} afgespeeld`,
						action: 'view',
					},
					user
				);
			})
			.catch((err: any) => {
				console.error(err);
				ToastService.danger(
					t(
						'item/components/item-video-description___het-ophalen-van-de-mediaplayer-ticket-is-mislukt'
					)
				);
			});

	const renderMedia = () => (
		<div className="c-video-player t-player-skin--dark">
			<FlowPlayerWrapper
				src={playerTicket ? playerTicket.toString() : null}
				seekTime={time}
				poster={itemMetaData.thumbnail_path}
				title={itemMetaData.title}
				onInit={initFlowPlayer}
				subtitles={[
					reorderDate(itemMetaData.issued || null, '.'),
					get(itemMetaData, 'organisation.name', ''),
				]}
				token={getEnv('FLOW_PLAYER_TOKEN')}
				dataPlayerId={getEnv('FLOW_PLAYER_ID')}
				logo={get(itemMetaData, 'organisation.logo_url')}
				{...cuePoints}
				autoplay
				canPlay={canPlay}
				itemUuid={itemMetaData.uid}
			/>
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
			{/* TODO: Fix label height - read more button (36) - additional margin (18) */}
			<ExpandableContainer collapsedHeight={videoHeight - 36 - 18}>
				{showTitle ? (
					<BlockHeading
						type="h3"
						className={onTitleClicked ? 'u-clickable' : ''}
						onClick={onTitleClicked || (() => {})}
						color={onTitleClicked ? Color.TealBright : undefined}
					>
						{title}
					</BlockHeading>
				) : (
					<BlockHeading type="h4">
						<Trans i18nKey="item/components/item-video-description___beschrijving">
							Beschrijving
						</Trans>
					</BlockHeading>
				)}
				<p>{formatTimestamps(convertToHtml(description))}</p>
			</ExpandableContainer>
		</Scrollbar>
	);

	return (
		<Grid className="c-item-video-description">
			{showDescription ? (
				<>
					<Column size="2-7" className="c-video-column">
						{renderMedia()}
					</Column>
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

export default ItemVideoDescription;
