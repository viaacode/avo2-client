import useResizeObserver from '@react-hook/resize-observer';
import { Button, DefaultProps } from '@viaa/avo2-components';
import React, { FC, ReactNode, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Scrollbar from 'react-scrollbars-custom';

import './CollapsibleColumn.scss';

export interface CollapsibleColumnProps extends DefaultProps {
	grow: ReactNode;
	bound?: ReactNode;
}

const CollapsibleColumn: FC<CollapsibleColumnProps> = ({ style, className, grow, bound }) => {
	const [t] = useTranslation();
	const boundColumnContentRef = useRef<HTMLDivElement>(null);
	const growColumnContentRef = useRef<HTMLDivElement>(null);

	const [overflowing, setOverflowing] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);

	const [maxHeight, setMaxHeight] = useState<number>(380);

	const wrapperClassName = [
		'c-collapsible-column',
		...(overflowing ? ['c-collapsible-column--overflowing'] : []),
		...(isExpanded ? ['c-collapsible-column--scrollable'] : []),
		className,
	].join(' ');

	const boundedClassName = [
		'c-collapsible-column__bounded',
		...(overflowing ? ['c-collapsible-column__bounded--overflowing'] : []),
		...(isExpanded ? ['c-collapsible-column__bounded--scrollable'] : []),
	].join(' ');

	useResizeObserver(boundColumnContentRef, () => {
		const isOverflowing =
			(boundColumnContentRef.current?.scrollHeight || 0) >=
			(growColumnContentRef.current?.scrollHeight || 0);

		setMaxHeight(growColumnContentRef.current?.scrollHeight || 0);

		if (isOverflowing !== overflowing) {
			setOverflowing(isOverflowing);
		}
	});

	const content = (
		<>
			{bound}
			{(overflowing || isExpanded) && (
				<div className="c-collapsible-column__bounded-toggle">
					<Button
						type="underlined-link"
						icon="align-left"
						label={
							isExpanded
								? t(
										'shared/components/collapsible-column/collapsible-column___toon-minder'
								  )
								: t(
										'shared/components/collapsible-column/collapsible-column___toon-meer'
								  )
						}
						onClick={() => setIsExpanded(!isExpanded)}
					/>
				</div>
			)}
		</>
	);

	return (
		<div className={wrapperClassName} style={style}>
			<div>
				<div ref={growColumnContentRef}>{grow}</div>
			</div>

			<div className={boundedClassName} style={{ maxHeight: maxHeight + 'px' }}>
				<div
					className="c-collapsible-column__bounded-content"
					ref={boundColumnContentRef}
					style={isExpanded ? { height: maxHeight + 'px' } : {}}
				>
					{isExpanded ? <Scrollbar>{content}</Scrollbar> : content}
				</div>
			</div>
		</div>
	);
};

export default CollapsibleColumn;
