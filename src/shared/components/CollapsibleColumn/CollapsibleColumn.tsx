import { Button, type ButtonProps, type DefaultProps, IconName } from '@viaa/avo2-components';
import React, { type FC, type ReactNode, useState } from 'react';

import { useResizeObserver } from '../../hooks/useResizeObserver';
import { useTranslation } from '../../hooks/useTranslation';

import './CollapsibleColumn.scss';

type CollapsibleColumnProps = DefaultProps & {
	children?: ReactNode;
	button?: Partial<Omit<ButtonProps, 'icon' | 'label'>> & {
		icon?: (expanded: boolean) => IconName;
		label?: (expanded: boolean) => string;
	};
};

export const CollapsibleColumn: FC<CollapsibleColumnProps> = ({
	style,
	className,
	children,
	button,
}) => {
	const { tText } = useTranslation();

	const [overflowing, setOverflowing] = useState(false);
	const [expanded, setExpanded] = useState(false);

	const wrapperClassName = [
		'c-collapsible-column',
		...(overflowing ? ['c-collapsible-column--overflowing'] : []),
		...(expanded ? ['c-collapsible-column--expanded'] : []),
		className,
	].join(' ');

	const ref = useResizeObserver((el: HTMLDivElement) => {
		const isOverflowing = (el.offsetHeight || 0) > (el.parentElement?.offsetHeight || 0);

		if (isOverflowing !== overflowing) {
			setOverflowing(isOverflowing);
		}
	});

	const getButtonIcon = (): IconName => {
		if (button?.icon) {
			return button.icon(expanded);
		}

		return expanded ? IconName.close : IconName.plus;
	};

	const getButtonLabel = () => {
		if (button?.label) {
			return button.label(expanded);
		}

		return expanded
			? tText('shared/components/collapsible-column/collapsible-column___toon-minder')
			: tText('shared/components/collapsible-column/collapsible-column___toon-meer');
	};

	return (
		<div className={wrapperClassName} style={style}>
			<div className="c-collapsible-column__content" ref={ref}>
				{children}
			</div>

			{(overflowing || expanded) && (
				<div className="c-collapsible-column__toggle">
					<Button
						type="underlined-link"
						{...button}
						icon={getButtonIcon()}
						label={getButtonLabel()}
						onClick={(e) => {
							expanded && setOverflowing(true);
							setExpanded(!expanded);

							button?.onClick?.(e);
						}}
					/>
				</div>
			)}
		</div>
	);
};
