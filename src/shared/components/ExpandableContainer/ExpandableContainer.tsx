import React, { Fragment, FunctionComponent, ReactNode } from 'react';

import { Button, Spacer } from '@viaa/avo2-components';

import useCollapse from '../../hooks/react-collapsed/react-collapsed';

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
			<Spacer margin="top-small">
				<div className="u-text-center" {...getToggleProps()}>
					<Button type="secondary" label={isOpen ? collapseLabel : expandLabel} />
				</div>
			</Spacer>
		</Fragment>
	);
};
