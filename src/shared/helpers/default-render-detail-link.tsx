import { Avo } from '@viaa/avo2-types';
import React, { ReactNode } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';

import { generateContentLinkString } from './link';

export const defaultGoToDetailLink =
	(history: RouteComponentProps['history']) =>
	(id: string, type: Avo.Core.ContentType): void => {
		history.push(generateContentLinkString(type, id));
	};

export const defaultRenderDetailLink = (
	linkText: string | ReactNode,
	id: string,
	type: Avo.Core.ContentType
): ReactNode => {
	return (
		<Link className="c-button--relative-link" to={generateContentLinkString(type, id)}>
			{linkText}
		</Link>
	);
};
