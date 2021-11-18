import React, { FunctionComponent } from 'react';

import { generateQuickLaneHref } from '../../helpers/generate-quick-lane-href';

interface QuickLaneLinkProps {
	id: string;
	label?: string;
}

const defaultLabel = (id: string) => {
	return `${window.location.origin}${generateQuickLaneHref(id)}`;
};

const QuickLaneLink: FunctionComponent<QuickLaneLinkProps> = ({ id, label }) => {
	return (
		<a target="_blank" href={generateQuickLaneHref(id)}>
			{label ? label : defaultLabel(id)}
		</a>
	);
};

export default QuickLaneLink;
