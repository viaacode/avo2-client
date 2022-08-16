import { Button, DefaultProps } from '@viaa/avo2-components';
import React, { FC, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface MaxHeightContainerProps extends DefaultProps {
	children?: ReactNode;
	expandLabel?: string;
	collapseLabel?: string;
	initialState?: 'collapsed' | 'expanded';
}

const CollapsibleContainer: FC<MaxHeightContainerProps> = ({
	children,
	expandLabel,
	collapseLabel,
	className,
	initialState,
}) => {
	const [t] = useTranslation();
	const [isExpanded, setIsExpanded] = useState(initialState === 'expanded');

	return (
		<div className={['c-collapsible-container', className].join(' ')}>
			{isExpanded && children}
			{
				<div>
					<Button
						type="underlined-link"
						icon="align-left"
						label={
							isExpanded
								? collapseLabel ||
								  t(
										'shared/components/collapsible-column/collapsible-column___toon-minder'
								  )
								: expandLabel ||
								  t(
										'shared/components/collapsible-column/collapsible-column___toon-meer'
								  )
						}
						onClick={() => setIsExpanded(!isExpanded)}
					/>
				</div>
			}
		</div>
	);
};

export default CollapsibleContainer;
