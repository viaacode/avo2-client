import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import {
	Column,
	convertToHtml,
	ExpandableContainer,
	Grid,
	Spacer,
	Toolbar,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { debounce } from 'lodash-es';
import React, {
	createRef,
	type FunctionComponent,
	type ReactNode,
	type RefObject,
	useEffect,
	useRef,
	useState,
} from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Link, type RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { FlowPlayerWrapper } from '../../shared/components';
import { type CuePoints } from '../../shared/components/FlowPlayerWrapper/FlowPlayerWrapper';
import TextWithTimestamps from '../../shared/components/TextWithTimestamp/TextWithTimestamps';
import { reorderDate, stripHtml } from '../../shared/helpers';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';

import './ItemVideoDescription.scss';
import { TEAL_BRIGHT } from '../../shared/constants';
import { getFlowPlayerPoster } from '../../shared/helpers/get-poster';

interface ItemVideoDescriptionProps {
	itemMetaData: Avo.Item.Item;
	showMetadata: boolean;
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
}

const DEFAULT_VIDEO_HEIGHT = 421;

const ItemVideoDescription: FunctionComponent<
	ItemVideoDescriptionProps & UserProps & RouteComponentProps
> = ({
	itemMetaData,
	showMetadata = false,
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
}) => {
	const { tText } = useTranslation();
	const videoRef: RefObject<HTMLVideoElement> = createRef();
	const descriptionRef = useRef<HTMLDivElement | null>(null);

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

	const renderMedia = () => {
		return (
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
			/>
		);
	};

	const renderTitle = () => {
		const titleElement = (
			<BlockHeading
				type="h3"
				className={titleLink ? 'u-clickable' : ''}
				color={titleLink ? TEAL_BRIGHT : undefined}
			>
				{title}
			</BlockHeading>
		);

		if (titleLink) {
			return (
				<Link to={titleLink} className="a-link__no-styles">
					{titleElement}
				</Link>
			);
		}
		return titleElement;
	};

	const renderDescription = () => {
		return (
			<>
				<Toolbar className="c-toolbar--no-height">
					<ToolbarLeft>
						{showTitle ? (
							renderTitle()
						) : (
							<BlockHeading type="h4">
								{tText('item/components/item-video-description___beschrijving')}
							</BlockHeading>
						)}
					</ToolbarLeft>
					<ToolbarRight>{renderButtons(itemMetaData)}</ToolbarRight>
				</Toolbar>

				<TextWithTimestamps content={description || ''} />
			</>
		);
	};

	const renderDescriptionWrapper = () => {
		if (collapseDescription) {
			if (verticalLayout) {
				if (stripHtml(convertToHtml(description)).length < 444) {
					// The description is short enough so we don't need to collapse it, and we can make the height auto
					return renderDescription();
				}
				// The height is too large, we need to wrap the description in a collapsable container
				return (
					<ExpandableContainer collapsedHeight={300 - 36 - 18}>
						{renderDescription()}
					</ExpandableContainer>
				);
			}
			// The description is rendered next to the video
			// We need to make the height of the description collapsable container the same as the video height
			return (
				<PerfectScrollbar
					style={{
						width: '100%',
						height: `${videoHeight}px`, // Height of button
					}}
				>
					{/* TODO: Fix label height - read more button (36) - additional margin (18) */}
					<ExpandableContainer collapsedHeight={videoHeight - 36 - 18}>
						{renderDescription()}
					</ExpandableContainer>
				</PerfectScrollbar>
			);
		}

		return renderDescription();
	};

	return (
		<Grid className="c-item-video-description">
			<>
				<Column size={verticalLayout ? '2-12' : '2-7'}>{renderMedia()}</Column>
				{(showDescription || showMetadata) && (
					<Column
						size={verticalLayout ? '2-12' : '2-5'}
						className="c-item-video-description__metadata"
					>
						{showMetadata && !!itemMetaData.issued && (
							<div>
								<span className="c-item-video-description__metadata__title">
									{tText('item/views/item___publicatiedatum')}:{' '}
								</span>
								<span className="c-item-video-description__metadata__value">
									{reorderDate(itemMetaData.issued, '/')}
								</span>
							</div>
						)}
						{showMetadata && !!itemMetaData?.organisation?.name && (
							<div>
								<span className="c-item-video-description__metadata__title">
									{tText('item/views/item___aanbieder')}:{' '}
								</span>
								<span className="c-item-video-description__metadata__value">
									{itemMetaData.organisation.name}
								</span>
							</div>
						)}
						{showMetadata && !!itemMetaData.series && (
							<div>
								<span className="c-item-video-description__metadata__title">
									{tText('item/views/item___reeks')}:{' '}
								</span>
								<span className="c-item-video-description__metadata__value">
									{itemMetaData.series}
								</span>
							</div>
						)}
						{showDescription && (
							<Spacer margin={showMetadata ? ['top'] : []}>
								<div ref={descriptionRef}>{renderDescriptionWrapper()}</div>
							</Spacer>
						)}
					</Column>
				)}
			</>
		</Grid>
	);
};

export default compose(
	withRouter,
	withUser
)(ItemVideoDescription) as FunctionComponent<ItemVideoDescriptionProps>;
