import React, { FunctionComponent, ReactNode } from 'react';

import classNames from 'classnames';

export interface MetaDataProps {
	category?: 'collection' | 'video' | 'audio' | 'map';
	spaced?: boolean;
	children: ReactNode;
}

export const MetaData: FunctionComponent<MetaDataProps> = ({
	category,
	spaced,
	children,
}: MetaDataProps) => (
	<ul
		className={classNames(`c-meta-data c-meta-data--${category}`, {
			'c-meta-data--spaced-out': spaced,
		})}
	>
		{children}
	</ul>
);
