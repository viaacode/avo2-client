import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

import { generateQuickLaneHref } from '../../helpers/generate-quick-lane-href';

import './QuickLaneLink.scss';

interface QuickLaneLinkProps {
	id: string;
	label?: string;
	short?: boolean;
}

const defaultLabel = (id: string) => {
	return `${window.location.origin}${generateQuickLaneHref(id)}`;
};

const QuickLaneLink: FunctionComponent<QuickLaneLinkProps> = ({ id, label, short }) => {
	const className = classNames({
		'c-quick-lane-link': true,
		'c-quick-lane-link--short': short === true,
	});

	return (
		<a
			className={className}
			target="_blank"
			href={generateQuickLaneHref(id)}
			rel="noopener noreferrer"
		>
			{label ? label : defaultLabel(id)}
		</a>
	);
};

export default QuickLaneLink;
