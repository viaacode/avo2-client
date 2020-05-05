import React, { FC } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import {
	BlockHeading,
	BlockRichText,
	Button,
	ButtonAction,
	ButtonType,
	Column,
	Grid,
	IconName,
} from '@viaa/avo2-components';

import { navigateToContentType } from '../../../../../shared/helpers';
import { AlignOption, HeadingTypeOption } from '../../../../shared/types';
import { MediaPlayerWrapper } from '../MediaPlayerWrapper/MediaPlayerWrapper';

interface MediaPlayerTitleTextButtonWrapperProps extends RouteComponentProps {
	mediaTitle: string;
	mediaItem: ButtonAction;
	headingType: HeadingTypeOption;
	headingTitle: string;
	content: string;
	buttonLabel: string;
	buttonIcon?: IconName;
	buttonType?: ButtonType;
	buttonAction?: ButtonAction;
	align: AlignOption;
}

export const MediaPlayerTitleTextButtonWrapper: FC<MediaPlayerTitleTextButtonWrapperProps> = ({
	mediaItem,
	mediaTitle,
	headingTitle,
	headingType,
	content,
	buttonIcon,
	buttonLabel,
	buttonType,
	buttonAction,
	history,
	align,
}) => {
	return (
		<Grid className="c-item-video-description">
			<Column size="2-7">
				<MediaPlayerWrapper item={mediaItem} title={mediaTitle} />
			</Column>
			<Column size="2-5" className={`u-text-${align}`}>
				<BlockHeading type={headingType}>{headingTitle}</BlockHeading>
				<BlockRichText elements={{ content }} />
				{buttonAction && (
					<Button
						icon={buttonIcon}
						label={buttonLabel}
						type={buttonType}
						onClick={() => {
							navigateToContentType(buttonAction, history);
						}}
					/>
				)}
			</Column>
		</Grid>
	);
};

export default withRouter(MediaPlayerTitleTextButtonWrapper);
