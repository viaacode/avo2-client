import React, { FunctionComponent, ReactNode } from 'react';

import classNames from 'classnames';

export interface MetaDataProps {
	spaced?: boolean;
	children: ReactNode;
}

export const MetaData: FunctionComponent<MetaDataProps> = ({ spaced, children }: MetaDataProps) => (
	<ul
		className={classNames(`c-meta-data`, {
			'c-meta-data--spaced-out': spaced,
		})}
	>
		{children}
	</ul>
);
