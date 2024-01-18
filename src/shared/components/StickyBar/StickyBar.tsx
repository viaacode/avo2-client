import { Button, type ButtonProps, StickyEdgeBar } from '@viaa/avo2-components';
import React, { FunctionComponent } from 'react';

import './StickyBar.scss';

export interface StickySaveBarProps {
	title: string | React.ReactNode;
	isVisible: boolean;
	actionButtonProps?: ButtonProps;
	cancelButtonProps?: ButtonProps;
}

export const StickyBar: FunctionComponent<StickySaveBarProps> = ({
	isVisible,
	title,
	actionButtonProps,
	cancelButtonProps,
}) => {
	if (!isVisible) {
		return null;
	}

	return (
		<StickyEdgeBar className="c-sticky-bar">
			<strong className="c-sticky-bar__cta">{title}</strong>

			<Button className="u-spacer-right-s" {...cancelButtonProps} />

			<Button {...actionButtonProps} />
		</StickyEdgeBar>
	);
};
