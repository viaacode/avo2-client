import React, { FunctionComponent, ReactNode } from 'react';

import classNames from 'classnames';

export interface MetaDataProps {
	children: ReactNode;
	category: 'collection' | 'video' | 'audio' | 'map';
	spaced?: boolean;
}

export const MetaData: FunctionComponent<MetaDataProps> = ({
	children,
	category,
	spaced,
}: MetaDataProps) => (
	<ul
		className={classNames(`c-meta-data c-meta-data--${category}`, {
			'c-meta-data--spaced-out': spaced,
		})}
	>
		{children}
	</ul>
);
