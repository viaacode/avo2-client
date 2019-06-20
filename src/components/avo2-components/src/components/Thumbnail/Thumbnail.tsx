import React, { FunctionComponent, useState } from 'react';

import classNames from 'classnames';

import { Icon } from '../..';

export interface ThumbnailProps {
	category: 'collection' | 'video' | 'audio';
	src?: string;
	alt?: string;
	label?: string;
	meta?: string;
}

export const Thumbnail: FunctionComponent<ThumbnailProps> = ({
	category,
	src,
	alt,
	label,
	meta,
}: ThumbnailProps) => {
	const [loaded, setLoaded] = useState(false);
	const iconName = category === 'audio' ? 'headphone' : category;

	return (
		<div
			className={classNames('c-thumbnail', 'c-thumbnail-media', `c-thumbnail-media--${category}`)}
		>
			<div className="c-thumbnail-placeholder">{category && <Icon name={iconName} />}</div>
			{src && (
				<div className="c-thumbnail-image">
					<img src={src} alt={alt} onLoad={() => setLoaded(true)} />
				</div>
			)}
			<div
				className={classNames('c-thumbnail-meta', {
					'c-thumbnail-meta--img-is-loaded': loaded,
				})}
			>
				<div className="c-thumbnail-media__category">
					<Icon name={iconName} />
					{label && <p>{label}</p>}
				</div>
				{meta && <div className="c-thumbnail-media__meta">{meta}</div>}
			</div>
		</div>
	);
};
