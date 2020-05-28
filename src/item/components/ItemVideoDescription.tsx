import { debounce } from 'lodash-es';
import React, { createRef, FunctionComponent, RefObject, useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { Scrollbar } from 'react-scrollbars-custom';

import {
	BlockHeading,
	Column,
	convertToHtml,
	ExpandableContainer,
	Grid,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { Color } from '../../admin/shared/types';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { FlowPlayerWrapper } from '../../shared/components';
import { CuePoints } from '../../shared/components/FlowPlayerWrapper/FlowPlayerWrapper';

import './ItemVideoDescription.scss';

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
	const videoRef: RefObject<HTMLVideoElement> = createRef();

	const [videoHeight, setVideoHeight] = useState<number>(DEFAULT_VIDEO_HEIGHT); // correct height for desktop screens

	useEffect(() => {
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
	}, [videoRef]);

	// const handleTimeLinkClicked = async (timestamp: string) => {
	// 	const seconds = parseDuration(timestamp);
	// 	history.push({
	// 		pathname: location.pathname,
	// 		search: `?time=${seconds}`,
	// 	});
	// };

	// /**
	//  * Split string by time markers and adds links to those times into the output jsx code
	//  */
	// const formatTimestamps = (description: string = ''): ReactNode => {
	// 	const timestampRegex = /([0-9]{2}:[0-9]{2}:[0-9]{2}|\n)/g;
	// 	const parts: string[] = description.split(timestampRegex);
	// 	return parts.map((part: string, index: number) => {
	// 		if (part === '\n') {
	// 			return <br key={`description-new-line-${index}`} />;
	// 		}
	//
	// 		if (timestampRegex.test(part)) {
	// 			return (
	// 				<Button
	// 					type="link"
	// 					key={`description-link-${index}`}
	// 					title={t(
	// 						'item/components/item-video-description___sprint-naar-tijdscode-code',
	// 						{ code: part }
	// 					)}
	// 					ariaLabel={t(
	// 						'item/components/item-video-description___sprint-naar-tijdscode-code',
	// 						{ code: part }
	// 					)}
	// 					className="u-clickable"
	// 					onClick={() => handleTimeLinkClicked(part)}
	// 				>
	// 					{part}
	// 				</Button>
	// 			);
	// 		}
	//
	// 		return (
	// 			<span
	// 				key={`description-part-${index}`}
	// 				dangerouslySetInnerHTML={{ __html: part }}
	// 			/>
	// 		);
	// 	});
	// };

	const renderMedia = () => (
		<FlowPlayerWrapper
			item={itemMetaData}
			canPlay={canPlay}
			user={user}
			cuePoints={cuePoints}
			location={location}
		/>
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
				<p>
					<span dangerouslySetInnerHTML={{ __html: convertToHtml(description) }} />
				</p>
				{/*<p>{formatTimestamps(convertToHtml(description))}</p>*/}
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
