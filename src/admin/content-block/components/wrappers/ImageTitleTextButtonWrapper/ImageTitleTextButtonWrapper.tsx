import {
	BlockHeading,
	BlockRichTextWrapper,
	ImageTitleTextButtonBlockComponentState,
} from '@meemoo/admin-core-ui';
import { Button, Column, Grid, Image } from '@viaa/avo2-components';
import classNames from 'classnames';
import React, { FC, FunctionComponent } from 'react';

import { generateSmartLink } from '../../../../../shared/helpers';
import withUser, { UserProps } from '../../../../../shared/hocs/withUser';

export const ImageTitleTextButtonWrapper: FC<
	ImageTitleTextButtonBlockComponentState & UserProps
> = (props) => {
	const {
		buttonAction,
		buttonAltTitle,
		buttonIcon,
		buttonLabel,
		buttonType,
		content,
		headingTitle,
		headingType,
		imageAction,
		imageAlt,
		imagePosition,
		imageSource,
	} = props;

	const image = imageSource && <Image src={imageSource} alt={imageAlt || headingTitle} wide />;

	return (
		<Grid
			className={classNames(
				'c-item-video-description',
				`c-image-title-text-button-wrapper--image-${imagePosition}`
			)}
		>
			<Column size="2-7">
				{imageAction ? generateSmartLink(imageAction, image) : image}
			</Column>
			<Column size="2-5">
				{headingType && headingTitle && (
					<BlockHeading type={headingType}>{headingTitle}</BlockHeading>
				)}

				{content && <BlockRichTextWrapper elements={{ content }} />}

				{buttonAction &&
					generateSmartLink(
						buttonAction,
						<Button icon={buttonIcon} label={buttonLabel} type={buttonType} />,
						buttonAltTitle || buttonLabel
					)}
			</Column>
		</Grid>
	);
};

export default withUser(
	ImageTitleTextButtonWrapper
) as FunctionComponent<ImageTitleTextButtonBlockComponentState>;
