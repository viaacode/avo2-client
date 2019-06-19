import React, { FunctionComponent } from 'react';

import classNames from 'classnames';

export interface ImageProps {
	src: string;
	alt?: string;
	wide?: boolean;
}

export const Image: FunctionComponent<ImageProps> = ({ src, alt, wide }: ImageProps) => (
	<div className={classNames('c-image', { 'c-image--full-width': wide })}>
		<img src={src} alt={alt} />
	</div>
);
