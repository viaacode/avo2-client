import React, { FunctionComponent } from 'react';

import classNames from 'classnames';

export interface AvatarIconProps {
	initials: string;
	image?: string;
	size?: 'small';
}

export const AvatarIcon: FunctionComponent<AvatarIconProps> = ({
	initials,
	image,
	size,
}: AvatarIconProps) => (
	<div
		className={classNames('c-avatar', {
			'c-avatar--img': image,
			'c-avatar--small': size === 'small',
		})}
	>
		{image ? <img src={image} alt="avatar" /> : initials}
	</div>
);
