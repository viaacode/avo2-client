import React, { FunctionComponent, ReactNode } from 'react';

import classNames from 'classnames';

import { Icon } from '../Icon/Icon';

export interface MetaDataItemProps {
	icon?: string;
	label?: string;
	children?: ReactNode;
}

export const MetaDataItem: FunctionComponent<MetaDataItemProps> = ({
	icon,
	label,
	children,
}: MetaDataItemProps) => (
	<li
		className={classNames('c-meta-data__item', {
			'c-meta-data-item--icon': icon,
		})}
	>
		{icon && !children && <Icon name={icon} />}
		{!children && <p>{label}</p>}
		{children}
	</li>
);
