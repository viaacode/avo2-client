import React, { ReactNode } from 'react';

import './renderMobileDesktop.scss';

/**
 * Renders mobile parameter if width is < 700, renders desktop param in width is larger
 * @param children
 */
export function renderMobileDesktop(children: {
	mobile: ReactNode;
	desktop: ReactNode;
}): ReactNode {
	return (
		<>
			<div className="u-less-than--mobile-width">{children.mobile}</div>
			<div className="u-more-than--mobile-width">{children.desktop}</div>
		</>
	);
}
