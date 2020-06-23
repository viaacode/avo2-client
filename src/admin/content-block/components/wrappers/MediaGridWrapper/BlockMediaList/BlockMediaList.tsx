import classnames from 'classnames';
import { get, last } from 'lodash-es';
import React, { FunctionComponent, ReactNode, useState } from 'react';

import {
	BlockHeading,
	Button,
	ButtonAction,
	Column,
	DefaultProps,
	EnglishContentType,
	Grid,
	HeadingType,
	IconName,
	MediaCard,
	MediaCardMetaData,
	MediaCardThumbnail,
	MetaData,
	MetaDataItem,
	Modal,
	ModalBody,
	Orientation,
	Spacer,
	Thumbnail,
	Toolbar,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { ButtonTypeSchema } from '@viaa/avo2-components/dist/components/Button/Button.types';
import { MetaDataItemPropsSchema } from '@viaa/avo2-components/dist/components/MetaData/MetaDataItem/MetaDataItem';

import './BlockMediaList.scss';

export type MediaListItem = {
	category: EnglishContentType;
	metadata?: MetaDataItemPropsSchema[];
	thumbnail?: { label: string; meta?: string; src?: string };
	src?: string;
	title: string;
	buttonLabel?: string;
	buttonIcon?: IconName;
	buttonType?: ButtonTypeSchema;
	buttonAction: ButtonAction;
};

export interface BlockMediaListProps extends DefaultProps {
	title?: string;
	buttonLabel?: string;
	buttonAction?: ButtonAction;
	ctaTitle?: string;
	ctaTitleColor?: string;
	ctaTitleSize?: HeadingType;
	ctaContent?: string;
	ctaContentColor?: string;
	ctaButtonLabel?: string;
	ctaButtonType?: ButtonTypeSchema;
	ctaButtonIcon?: IconName;
	ctaBackgroundColor?: string;
	ctaBackgroundImage?: string;
	ctaWidth?: string;
	ctaButtonAction?: ButtonAction;
	fullWidth?: boolean;
	openMediaInModal?: boolean;
	elements: MediaListItem[];
	orientation?: Orientation;
	navigate?: (buttonAction?: ButtonAction) => void;
	renderPlayerModalBody: (item: MediaListItem) => ReactNode;
}

export const BlockMediaList: FunctionComponent<BlockMediaListProps> = ({
	title,
	buttonLabel,
	buttonAction,
	ctaTitle = '',
	ctaTitleColor,
	ctaTitleSize = 'h4',
	ctaContent = '',
	ctaContentColor,
	ctaButtonLabel = '',
	ctaBackgroundColor,
	ctaBackgroundImage,
	ctaButtonType = 'secondary',
	ctaButtonIcon,
	ctaButtonAction,
	fullWidth = false,
	openMediaInModal = false,
	className,
	elements = [],
	orientation,
	navigate = () => {},
	renderPlayerModalBody = () => null,
}) => {
	const hasCTA = ctaTitle || ctaButtonLabel || ctaContent;

	const [activeItem, setActiveItem] = useState<MediaListItem | null>(null);

	const onClickMediaCard = (mediaListItem: MediaListItem) => {
		if (openMediaInModal && get(mediaListItem, 'buttonAction.type') === 'ITEM') {
			// Open modal
			setActiveItem(mediaListItem);
		} else {
			navigate(buttonAction);
		}
	};

	return (
		<div className={classnames(className, 'c-block-media-list c-media-card-list')}>
			{(!!title || !!buttonLabel) && (
				<Toolbar>
					<ToolbarLeft>
						{title && <BlockHeading type="h2">{title}</BlockHeading>}
					</ToolbarLeft>
					<ToolbarRight>
						{buttonLabel && (
							<Button
								label={buttonLabel}
								type="secondary"
								onClick={() => navigate(buttonAction)}
							/>
						)}
					</ToolbarRight>
				</Toolbar>
			)}
			<Grid>
				{elements.map((mediaListItem, i) => {
					const {
						category,
						metadata,
						thumbnail,
						title,
						buttonLabel,
						buttonIcon,
						buttonType,
					} = mediaListItem;

					return (
						<Column key={`block-media-list-${i}`} size={fullWidth ? '3-12' : '3-3'}>
							<MediaCard
								category={category}
								onClick={() => onClickMediaCard(mediaListItem)}
								orientation={orientation}
								title={title}
							>
								{thumbnail && (
									<MediaCardThumbnail>
										<Thumbnail alt={title} category={category} {...thumbnail} />
									</MediaCardThumbnail>
								)}
								<MediaCardMetaData>
									{metadata && metadata.length > 0 && (
										<MetaData category={category}>
											{metadata.map((props, i) => (
												<MetaDataItem
													key={`block-media-list-meta-${i}`}
													{...props}
												/>
											))}
										</MetaData>
									)}
									{(!!buttonIcon || !!buttonLabel) && (
										<Spacer margin="top-small">
											<Button
												label={buttonLabel}
												type={buttonType}
												icon={buttonIcon}
											/>
										</Spacer>
									)}
								</MediaCardMetaData>
							</MediaCard>
						</Column>
					);
				})}
				{hasCTA && (
					<Column size={fullWidth ? '3-12' : '3-3'}>
						<div
							className={classnames(
								className,
								'c-media-card',
								'c-media-card--horizontal',
								'c-media-card__cta',
								{
									'u-clickable': !!ctaButtonAction,
								}
							)}
							onClick={() => navigate(ctaButtonAction)}
						>
							<div className="c-media-card-thumb">
								<div
									className="c-thumbnail"
									style={{
										backgroundImage: ctaBackgroundImage
											? `url('${ctaBackgroundImage}')`
											: 'none',
										backgroundColor: ctaBackgroundColor,
									}}
								>
									<div className="c-thumbnail__content">
										{ctaTitle && (
											<BlockHeading type={ctaTitleSize} color={ctaTitleColor}>
												{ctaTitle}
											</BlockHeading>
										)}
										{ctaContent && (
											<div style={{ color: ctaContentColor }}>
												{ctaContent}
											</div>
										)}
									</div>
								</div>
							</div>
							<div className="c-media-card-content">
								{!!get(last(elements), 'buttonLabel') && !fullWidth && (
									<div>
										<h4 className="c-media-card__title">titel</h4>
										<MetaData category="item">
											<MetaDataItem
												key={`block-media-list-meta-cta`}
												label="meta"
											/>
										</MetaData>
									</div>
								)}
								<Spacer margin="top-small">
									<Button
										label={ctaButtonLabel}
										type={ctaButtonType}
										icon={ctaButtonIcon}
									/>
								</Spacer>
							</div>
						</div>
					</Column>
				)}
			</Grid>
			<Modal
				isOpen={!!activeItem && !!activeItem.src}
				onClose={() => setActiveItem(null)}
				scrollable
				size="medium"
			>
				<ModalBody>{!!activeItem && renderPlayerModalBody(activeItem)}</ModalBody>
			</Modal>
		</div>
	);
};
