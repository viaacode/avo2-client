import React, { CSSProperties, FunctionComponent } from 'react';

import classnames from 'classnames';
import moment from 'moment';

import './BlockKlaar.scss';

export interface KlaarElement {
	title: string;
}

export interface BlockKlaarProps {
	className?: string;
	style?: CSSProperties;
	date: string;
	elements: KlaarElement[];
}

export const BlockKlaar: FunctionComponent<BlockKlaarProps> = ({ className, date, elements }) => (
	<div className={classnames(className, 'klaar-header')} role="banner">
		<div className="klaar-header__logo">
			<span>KLAAR</span>
		</div>
		<div className="klaar-header__date">{moment(date).format('LL')}</div>
		<div className="klaar-header__titles">
			{elements.map(
				(element: KlaarElement, index: number) =>
					`${element.title.toUpperCase()} ${index === elements.length - 1 ? '' : ' • '}`
			)}
		</div>
	</div>
);
