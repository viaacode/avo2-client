import React, { FC, FunctionComponent } from 'react';

import {
	BlockHeading,
	Button,
	ButtonAction,
	ButtonType,
	Column,
	Grid,
	IconName,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import {
	PermissionName,
	PermissionService,
} from '../../../../../authentication/helpers/permission-service';
import { generateSmartLink } from '../../../../../shared/helpers';
import withUser, { UserProps } from '../../../../../shared/hocs/withUser';
import { AlignOption, HeadingTypeOption } from '../../../../shared/types';
import MediaPlayerWrapper from '../MediaPlayerWrapper/MediaPlayerWrapper';
import RichTextWrapper from '../RichTextWrapper/RichTextWrapper';

interface MediaPlayerTitleTextButtonWrapperProps {
	mediaItem: ButtonAction;
	mediaSrc?: string;
	mediaPoster?: string;
	mediaTitle: string;
	mediaExternalId: string;
	mediaIssued?: string;
	mediaOrganisation?: Avo.Organization.Organization;
	mediaDuration?: string;
	mediaAutoplay?: boolean;
	headingType: HeadingTypeOption;
	headingTitle: string;
	content: string;
	buttonLabel: string;
	buttonAltTitle?: string;
	buttonIcon?: IconName;
	buttonType?: ButtonType;
	buttonAction?: ButtonAction;
	align: AlignOption;
}

export const MediaPlayerTitleTextButtonWrapper: FC<
	MediaPlayerTitleTextButtonWrapperProps & UserProps
> = ({
	mediaItem,
	mediaSrc,
	mediaPoster,
	mediaTitle,
	mediaExternalId,
	mediaIssued,
	mediaOrganisation,
	mediaDuration,
	headingTitle,
	headingType,
	content,
	buttonIcon,
	buttonLabel,
	buttonType,
	buttonAltTitle,
	buttonAction,
	align,
	mediaAutoplay,
	user,
}) => {
	const shouldTitleLink =
		PermissionService.hasPerm(user, PermissionName.VIEW_ANY_PUBLISHED_ITEMS) && !!mediaItem;

	return (
		<Grid className="c-item-video-description">
			<Column size="2-7">
				<MediaPlayerWrapper
					item={mediaItem}
					title={mediaTitle}
					external_id={mediaExternalId}
					duration={mediaDuration}
					autoplay={mediaAutoplay}
					src={mediaSrc}
					poster={mediaPoster}
					issued={mediaIssued}
					organisation={mediaOrganisation}
				/>
			</Column>
			<Column size="2-5" className={`u-text-${align}`}>
				{generateSmartLink(
					mediaItem,
					<BlockHeading
						type={headingType}
						className={shouldTitleLink ? 'u-clickable' : ''}
					>
						{headingTitle}
					</BlockHeading>
				)}
				<RichTextWrapper elements={{ content }} />
				{buttonAction &&
					generateSmartLink(
						buttonAction,
						<Button icon={buttonIcon} label={buttonLabel} type={buttonType} />,
						buttonLabel,
						buttonAltTitle || buttonLabel
					)}
			</Column>
		</Grid>
	);
};

export default withUser(
	MediaPlayerTitleTextButtonWrapper
) as FunctionComponent<MediaPlayerTitleTextButtonWrapperProps>;
