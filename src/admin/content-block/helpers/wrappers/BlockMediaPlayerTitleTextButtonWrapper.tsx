import React, { FC } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import {
	BlockHeading,
	BlockRichText,
	Button,
	ButtonAction,
	Column,
	Grid,
	IconName,
} from '@viaa/avo2-components';

import { navigateToContentType } from '../../../../shared/helpers';

// TODO use exported ButtonType from components repo
import { ButtonType } from '@viaa/avo2-components/dist/components/Button/Button.types';
import { AlignOptions, HeadingLevelOptions } from '../../content-block.types';
import { MediaPlayer } from './BlockMediaPlayerWrapper';

interface MediaPlayerTitleTextButtonProps extends RouteComponentProps {
	mediaTitle: string;
	mediaItem: ButtonAction;
	headingType: HeadingLevelOptions;
	headingTitle: string;
	content: string;
	buttonLabel: string;
	buttonIcon?: IconName;
	buttonType?: ButtonType;
	buttonAction?: ButtonAction;
	align: AlignOptions;
}

export const MediaPlayerTitleTextButton: FC<MediaPlayerTitleTextButtonProps> = ({
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
				<MediaPlayer item={mediaItem} title={mediaTitle} />
			</Column>
			<Column size="2-5" className={`u-text-${align}`}>
				<BlockHeading type={headingType}>{headingTitle}</BlockHeading>
				<BlockRichText elements={{ content }} />
				<Button
					icon={buttonIcon}
					label={buttonLabel}
					type={buttonType}
					onClick={() => {
						navigateToContentType(buttonAction, history);
					}}
				/>
			</Column>
		</Grid>
	);
};

export default withRouter(MediaPlayerTitleTextButton);
