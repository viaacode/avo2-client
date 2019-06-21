import React, { Fragment, FunctionComponent, ReactNode } from 'react';

import { Button } from '../avo2-components/src';
const useCollapse = require('../../hooks/react-collapsed/react-collapsed').default;

export interface ExpandableContainerProps {
	expandLabel?: string;
	collapseLabel?: string;
	collapsedHeight?: number;
	defaultExpanded?: boolean;
	children: ReactNode;
}

export const ExpandableContainer: FunctionComponent<ExpandableContainerProps> = ({
	expandLabel = 'Meer lezen',
	collapseLabel = 'Minder lezen',
	collapsedHeight = 44,
	defaultExpanded = false,
	children,
}: ExpandableContainerProps) => {
	const { getCollapseProps, getToggleProps, isOpen } = useCollapse({
		collapsedHeight,
		defaultOpen: defaultExpanded,
	});

	return (
		<Fragment>
			<div {...getCollapseProps()}>{children}</div>
			<div className="u-spacer-top-s">
				<div className="u-text-center" {...getToggleProps()}>
					<Button type="secondary" label={isOpen ? collapseLabel : expandLabel} />
				</div>
			</div>
		</Fragment>
	);
};
