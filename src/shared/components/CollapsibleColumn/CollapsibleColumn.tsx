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
	const el = useRef<HTMLDivElement>(null);

	const [overflowing, setOverflowing] = useState(false);
	const [scrollable, setScrollable] = useState(false);

	const wrapperClassName = [
		'c-collapsible-column',
		...(overflowing ? ['c-collapsible-column--overflowing'] : []),
		...(scrollable ? ['c-collapsible-column--scrollable'] : []),
		className,
	].join(' ');

	const boundedClassName = [
		'c-collapsible-column__bounded',
		...(overflowing ? ['c-collapsible-column__bounded--overflowing'] : []),
		...(scrollable ? ['c-collapsible-column__bounded--scrollable'] : []),
	].join(' ');

	useResizeObserver(el, () => {
		const isOverflowing = (el.current?.scrollHeight || 0) > (el.current?.offsetHeight || 0);

		if (isOverflowing !== overflowing) {
			setOverflowing(isOverflowing);
		}
	});

	const content = (
		<>
			{bound}
			{(overflowing || scrollable) && (
				<div className="c-collapsible-column__bounded-toggle">
					<Button
						type="underlined-link"
						icon={scrollable ? 'close' : 'plus'} // TODO: add 'minus' icon
						label={
							scrollable
								? t(
										'shared/components/collapsible-column/collapsible-column___toon-minder'
								  )
								: t(
										'shared/components/collapsible-column/collapsible-column___toon-meer'
								  )
						}
						onClick={() => setScrollable(!scrollable)}
					/>
				</div>
			)}
		</>
	);

	return (
		<div className={wrapperClassName} style={style}>
			{grow}

			<div className={boundedClassName} ref={el}>
				<div className="c-collapsible-column__bounded-content">
					{scrollable ? <Scrollbar>{content}</Scrollbar> : content}
				</div>
			</div>
		</div>
	);
};

export default CollapsibleColumn;
