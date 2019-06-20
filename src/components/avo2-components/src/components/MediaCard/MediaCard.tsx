import React, { FunctionComponent } from 'react';

import classNames from 'classnames';

import { MetaData } from '../MetaData/MetaData';
import { MetaDataItem, MetaDataItemProps } from '../MetaDataItem/MetaDataItem';
import { Thumbnail } from '../Thumbnail/Thumbnail';

export interface MediaCardProps {
	orientation?: 'horizontal' | 'vertical';
	title: string;
	href: string;
	metaData?: MetaDataItemProps[];
	category: 'collection' | 'video' | 'audio';
	thumbnailSrc?: string;
	thumbnailAlt?: string;
	thumbnailLabel?: string;
	thumbnailMeta?: string;
}

export const MediaCard: FunctionComponent<MediaCardProps> = ({
	orientation = 'vertical',
	title,
	href,
	metaData,
	category,
	thumbnailSrc,
	thumbnailAlt,
	thumbnailLabel,
	thumbnailMeta,
}: MediaCardProps) => (
	<div
		className={classNames('c-media-card', `c-media-card--${category}`, {
			'c-media-card--horizontal': orientation === 'horizontal',
		})}
	>
		<a className="c-media-card-thumb" href={href}>
			<Thumbnail
				category={category}
				src={thumbnailSrc}
				alt={thumbnailAlt}
				meta={thumbnailMeta}
				label={thumbnailLabel}
			/>
		</a>
		<div className="c-media-card-content">
			<h4 className="c-media-card__title">
				<a href={href}>{title}</a>
			</h4>
			{metaData && (
				<MetaData>
					{metaData.map((metaDataItem, index) => (
						<MetaDataItem key={index} icon={metaDataItem.icon} label={metaDataItem.label} />
					))}
				</MetaData>
			)}
		</div>
	</div>
);
