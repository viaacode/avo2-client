import React, { FunctionComponent } from 'react';

import classNames from 'classnames';

import { Icon } from '../Icon/Icon';

export interface MetaDataItemProps {
	icon?: string;
	label: string;
}

export const MetaDataItem: FunctionComponent<MetaDataItemProps> = ({
	icon,
	label,
}: MetaDataItemProps) => (
	<li
		className={classNames('c-meta-data__item', {
			'c-meta-data-item--icon': icon,
		})}
	>
		{icon && <Icon name={icon} />}
		<p>{label}</p>
	</li>
);
