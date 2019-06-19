import React, { FunctionComponent, ReactElement, ReactNode, ReactNodeArray } from 'react';

import classNames from 'classnames';

import { ToolbarCenter, ToolbarLeft, ToolbarRight, ToolbarSlotProps } from './Toolbar.slots';

export interface ToolbarProps {
	children: ReactNode;
	size?: 'medium';
	spaced?: boolean;
	autoHeight?: boolean;
	alignTop?: boolean;
	interactiveCenter?: boolean;
	altCenter?: boolean;
	justified?: boolean;
}

export const Toolbar: FunctionComponent<ToolbarProps> = ({
	children,
	size,
	spaced,
	autoHeight,
	alignTop,
	interactiveCenter,
	altCenter,
	justified,
}: ToolbarProps) => {
	const left = getSlot(ToolbarLeft);
	const center = getSlot(ToolbarCenter);
	const right = getSlot(ToolbarRight);

	function getSlot(type: FunctionComponent<ToolbarSlotProps>) {
		const slots: ReactNodeArray = Array.isArray(children) ? children : [children];
		const element: ReactElement = slots.find((c: any) => c.type === type) as ReactElement;

		if (element && element.props.children) {
			return element.props.children;
		}

		return null;
	}

	return (
		<div
			className={classNames('c-toolbar', {
				'c-toolbar--medium': size === 'medium',
				'c-toolbar--spaced': spaced,
				'c-toolbar--auto': autoHeight,
				'c-toolbar--align-top': alignTop,
				'c-toolbar__center--interactive': interactiveCenter,
				'c-toolbar__center-inner--alt': altCenter,
				'c-toolbar__justified': justified,
			})}
		>
			{left && <div className="c-toolbar__left">{left}</div>}
			{center && (
				<div className="c-toolbar__center">
					<div className="c-toolbar__center-inner">{center}</div>
				</div>
			)}
			{right && <div className="c-toolbar__right">{right}</div>}
		</div>
	);
};
