import useResizeObserver from '@react-hook/resize-observer';
import { DefaultProps } from '@viaa/avo2-components';
import React, { FC, ReactNode, useRef, useState } from 'react';
import Scrollbar from 'react-scrollbars-custom';

export interface MaxHeightContainerProps extends DefaultProps {
	children?: ReactNode;
	maxHeight: number;
}

const MaxHeightContainer: FC<MaxHeightContainerProps> = ({
	children,
	maxHeight = 380,
	className,
}) => {
	const contentRef = useRef<HTMLDivElement>(null);

	const [overflowing, setOverflowing] = useState(false);

	useResizeObserver(contentRef, () => {
		const isOverflowing = (contentRef.current?.scrollHeight || 0) >= maxHeight;

		if (isOverflowing !== overflowing) {
			setOverflowing(isOverflowing);
		}
	});

	return (
		<div
			className={['c-collapsible-container', className].join(' ')}
			ref={contentRef}
			style={overflowing ? { height: maxHeight + 'px' } : {}}
		>
			{overflowing ? <Scrollbar>{children}</Scrollbar> : children}
		</div>
	);
};

export default MaxHeightContainer;
