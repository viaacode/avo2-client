import useResizeObserver from '@react-hook/resize-observer';
import { Button, DefaultProps } from '@viaa/avo2-components';
import React, { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import './CollapsibleColumn.scss';

export type CollapsibleColumnProps = DefaultProps;

const CollapsibleColumn: FC<CollapsibleColumnProps> = ({ style, className, children }) => {
	const [t] = useTranslation();
	const el = useRef<HTMLDivElement>(null);

	const [overflowing, setOverflowing] = useState(false);
	const [expanded, setExpanded] = useState(false);

	const wrapperClassName = [
		'c-collapsible-column',
		...(overflowing ? ['c-collapsible-column--overflowing'] : []),
		...(expanded ? ['c-collapsible-column--expanded'] : []),
		className,
	].join(' ');

	useResizeObserver(el, () => {
		const isOverflowing =
			(el.current?.offsetHeight || 0) > (el.current?.parentElement?.offsetHeight || 0);

		if (isOverflowing !== overflowing) {
			setOverflowing(isOverflowing);
		}
	});

	return (
		<div className={wrapperClassName} style={style}>
			<div className="c-collapsible-column__content" ref={el}>
				{children}
			</div>

			{(overflowing || expanded) && (
				<div className="c-collapsible-column__toggle">
					<Button
						type="inline-link"
						icon={expanded ? 'close' : 'plus'} // TODO: add 'minus' icon
						label={
							expanded
								? t(
										'shared/components/collapsible-column/collapsible-column___toon-minder'
								  )
								: t(
										'shared/components/collapsible-column/collapsible-column___toon-meer'
								  )
						}
						onClick={() => setExpanded(!expanded)}
					/>
				</div>
			)}
		</div>
	);
};

export default CollapsibleColumn;
