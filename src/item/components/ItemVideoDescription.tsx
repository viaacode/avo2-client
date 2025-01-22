import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import {
	Column,
	convertToHtml,
	ExpandableContainer,
	Grid,
	Toolbar,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import clsx from 'clsx';
import { debounce } from 'lodash-es';
import React, {
	createRef,
	type FC,
	type ReactNode,
	type RefObject,
	useEffect,
	useRef,
	useState,
} from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Link, type RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { buildGlobalSearchLink } from '../../assignment/helpers/build-search-link';
import { FlowPlayerWrapper, ItemMetadata } from '../../shared/components';
import { type CuePoints } from '../../shared/components/FlowPlayerWrapper/FlowPlayerWrapper';
import TextWithTimestamps from '../../shared/components/TextWithTimestamp/TextWithTimestamps';
import { TEAL_BRIGHT } from '../../shared/constants';
import { stripHtml } from '../../shared/helpers';
import { getFlowPlayerPoster } from '../../shared/helpers/get-poster';
import withUser, { type UserProps } from '../../shared/hocs/withUser';

import './ItemVideoDescription.scss';
import { tText } from '../../shared/helpers/translate-text';

interface ItemVideoDescriptionProps {
	itemMetaData: Avo.Item.Item;
	showMetadata: boolean;
	enableMetadataLink: boolean;
	showDescription?: boolean;
	collapseDescription?: boolean;
	showTitle?: boolean;
	title?: string | null;
	description?: string | null;
	src?: string;
	poster?: string;
	cuePointsVideo?: CuePoints;
	cuePointsLabel?: CuePoints;
	canPlay?: boolean; // If video is behind modal or inside a closed modal this value will be false
	renderButtons?: (itemMetaData: Avo.Item.Item) => ReactNode;
	verticalLayout?: boolean;
	titleLink?: string;
	onPlay?: () => void;
	trackPlayEvent: boolean;
}

const DEFAULT_VIDEO_HEIGHT = 421;

const ItemVideoDescription: FC<ItemVideoDescriptionProps & UserProps & RouteComponentProps> = ({
	itemMetaData,
	showMetadata = false,
	enableMetadataLink = false,
	showTitle = false,
	showDescription = true,
	collapseDescription = true,
	title = itemMetaData.title,
	description = itemMetaData.description,
	src,
	poster,
	cuePointsVideo,
	cuePointsLabel,
	canPlay = true,
	renderButtons = () => null,
	verticalLayout = false,
	titleLink,
	onPlay,
	trackPlayEvent,
}) => {
	const videoRef: RefObject<HTMLDivElement> = createRef();
	const descriptionRef = useRef<HTMLDivElement | null>(null);
	const scrollBarRef = createRef();

	const [videoHeight, setVideoHeight] = useState<number | null>(null);

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

	const handleDescriptionExpandCollapse = (isOpen: boolean) => {
		if (!isOpen) {
			// Scroll to the top of the description when it is collapsed
			descriptionRef.current?.children[0]?.scrollTo({ top: 0 });
		}
	};

	const handleDescriptionExpandCollapseTransitionEnd = () => {
		setTimeout(() => {
			(scrollBarRef.current as PerfectScrollbar)?.updateScroll();
			(scrollBarRef.current as PerfectScrollbar)?.forceUpdate();
		}, 100);
	};

	const renderMedia = () => {
		return (
			<div ref={videoRef}>
				<FlowPlayerWrapper
					src={src}
					poster={getFlowPlayerPoster(poster, itemMetaData)}
					item={itemMetaData}
					canPlay={canPlay}
					cuePointsVideo={cuePointsVideo}
					cuePointsLabel={cuePointsLabel}
					onPlay={onPlay}
					external_id={itemMetaData.external_id}
					duration={itemMetaData.duration}
					title={title || undefined}
					trackPlayEvent={trackPlayEvent}
				/>
			</div>
		);
	};

	const renderTitle = () => {
		if (!showTitle) {
			return null;
		}

		const titleElement = (
			<BlockHeading
				type="h2"
				className={clsx({ ['u-clickable']: titleLink }, 'u-spacer-bottom')}
				color={titleLink ? TEAL_BRIGHT : undefined}
			>
				{title}
			</BlockHeading>
		);

		if (titleLink) {
			return <Link to={titleLink}>{titleElement}</Link>;
		}
		return titleElement;
	};

	const renderDescription = () => {
		return <TextWithTimestamps content={description || ''} />;
	};

	const renderDescriptionWrapper = () => {
		if (!showDescription) {
			return null;
		}

		if (collapseDescription) {
			if (verticalLayout) {
				if (stripHtml(convertToHtml(description)).length < 444) {
					// The description is short enough so we don't need to collapse it, and we can make the height auto
					return renderDescription();
				}
				// The height is too large, we need to wrap the description in a collapsable container
				const collapsedHeight = 300 - 36 - 18 - (showMetadata ? 63 : 0);
				return (
					<div ref={descriptionRef} className={showMetadata ? 'u-spacer-top' : ''}>
						<ExpandableContainer collapsedHeight={collapsedHeight}>
							{renderDescription()}
						</ExpandableContainer>
					</div>
				);
			}

			if (!videoHeight) {
				// Don't render the description until we know the video height,
				// otherwise the ExpandableContainer doesn't calculate the display state of the expand button correctly
				return null;
			}
			// The description is rendered next to the video
			// We need to make the height of the description collapsable container the same as the video height
			{
				/* TODO: Fix label height - read more button (36) - additional margin (18) - metadata height (63)  */
			}
			const collapsedHeight = videoHeight - 36 - 18 - (showMetadata ? 63 : 0);
			return (
				<div ref={descriptionRef} className={showMetadata ? 'u-spacer-top' : ''}>
					<PerfectScrollbar
						style={{
							width: '100%',
							height: `${videoHeight - (showMetadata ? 63 : 0)}px`, // Height of button
						}}
						className="c-scrollable"
						ref={scrollBarRef as any}
					>
						<ExpandableContainer
							collapsedHeight={collapsedHeight}
							onChange={handleDescriptionExpandCollapse}
							onTransitionEnd={() => handleDescriptionExpandCollapseTransitionEnd()}
						>
							<BlockHeading type="h4">
								{tText('item/components/item-video-description___beschrijving')}
							</BlockHeading>
							{renderDescription()}
						</ExpandableContainer>
					</PerfectScrollbar>
				</div>
			);
		}

		return (
			<div ref={descriptionRef} className={showMetadata ? 'u-spacer-top' : ''}>
				{renderDescription()}
			</div>
		);
	};

	return (
		<div className="c-item-video-description">
			<Toolbar className="c-toolbar--no-height">
				<ToolbarLeft>{showTitle && renderTitle()}</ToolbarLeft>
				<ToolbarRight>{renderButtons(itemMetaData)}</ToolbarRight>
			</Toolbar>
			<Grid>
				<>
					<Column size={verticalLayout ? '2-12' : '2-7'}>{renderMedia()}</Column>
					{(showDescription || showMetadata) && (
						<Column
							size={verticalLayout ? '2-12' : '2-5'}
							className="c-item-video-description__metadata"
						>
							{showMetadata && (
								<ItemMetadata
									item={itemMetaData}
									buildSeriesLink={(series) =>
										enableMetadataLink
											? buildGlobalSearchLink({
													filters: { serie: [series] },
											  })
											: series
									}
								/>
							)}
							{renderDescriptionWrapper()}
						</Column>
					)}
				</>
			</Grid>
		</div>
	);
};

export default compose(withRouter, withUser)(ItemVideoDescription) as FC<ItemVideoDescriptionProps>;
