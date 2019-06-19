import React, { Component } from 'react';

import { Icon } from '../Icon/Icon';

export interface ThumbnailProps {
	category: 'collection' | 'video' | 'audio';
	src?: string;
	alt?: string;
	label?: string;
	meta?: string;
}

export interface ThumbnailState {
	loaded: boolean;
}

export class Thumbnail extends Component<ThumbnailProps, ThumbnailState> {
	constructor(props: ThumbnailProps) {
		super(props);

		this.state = {
			loaded: false,
		};
	}

	handleImageLoaded() {
		this.setState({ loaded: true });
	}

	render() {
		const { category, src, alt, label, meta }: ThumbnailProps = this.props;
		const { loaded }: ThumbnailState = this.state;

		const metaClass = loaded ? 'c-thumbnail-meta--img-is-loaded' : '';

		return (
			<div className={`c-thumbnail c-thumbnail-media c-thumbnail-media--${category}`}>
				<div className="c-thumbnail-placeholder">{category && <Icon name={category} />}</div>
				{src && (
					<div className="c-thumbnail-image">
						<img src={src} alt={alt} onLoad={this.handleImageLoaded.bind(this)} />
					</div>
				)}
				<div className={`c-thumbnail-meta ${metaClass}`}>
					<div className="c-thumbnail-media__category">
						<Icon name={category} />
						{label && <p>{label}</p>}
					</div>
					{meta && <div className="c-thumbnail-media__meta">{meta}</div>}
				</div>
			</div>
		);
	}
}
