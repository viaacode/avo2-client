import { BlockHeading, Color } from '@meemoo/admin-core-ui';
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
	FunctionComponent,
	ReactNode,
	RefObject,
	useEffect,
	useRef,
	useState,
} from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { Scrollbar } from 'react-scrollbars-custom';
import { compose } from 'redux';

import { FlowPlayerWrapper } from '../../shared/components';
import { CuePoints } from '../../shared/components/FlowPlayerWrapper/FlowPlayerWrapper';
import TextWithTimestamps from '../../shared/components/TextWithTimestamp/TextWithTimestamps';
import { stripHtml } from '../../shared/helpers';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';

import './ItemVideoDescription.scss';

interface ItemVideoDescriptionProps {
	itemMetaData: Avo.Item.Item;
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
				poster={poster}
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
				color={titleLink ? Color.TealBright : undefined}
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
				<Scrollbar
					style={{
						width: '100%',
						height: `${videoHeight}px`, // Height of button
						overflowY: 'auto',
					}}
				>
					{/* TODO: Fix label height - read more button (36) - additional margin (18) */}
					<ExpandableContainer collapsedHeight={videoHeight - 36 - 18}>
						{renderDescription()}
					</ExpandableContainer>
				</Scrollbar>
			);
		}

		return renderDescription();
	};

	return (
		<Grid className="c-item-video-description">
			{showDescription ? (
				<>
					<Column size={verticalLayout ? '2-12' : '2-7'}>{renderMedia()}</Column>
					<Column size={verticalLayout ? '2-12' : '2-5'}>
						<Spacer margin={verticalLayout ? ['top'] : []}>
							<div ref={descriptionRef}>{renderDescriptionWrapper()}</div>
						</Spacer>
					</Column>
				</>
			) : (
				<>
					<Column size={verticalLayout ? '2-12' : '2-3'}>
						<></>
					</Column>
					<Column size={verticalLayout ? '2-12' : '2-6'}>{renderMedia()}</Column>
					<Column size={verticalLayout ? '2-12' : '2-3'}>
						<></>
					</Column>
				</>
			)}
		</Grid>
	);
};

export default compose(
	withRouter,
	withUser
)(ItemVideoDescription) as FunctionComponent<ItemVideoDescriptionProps>;
