import { Button, StickyEdgeBar } from '@viaa/avo2-components';
import { ButtonPropsSchema } from '@viaa/avo2-components/src/components/Button/Button';
import React, { FunctionComponent } from 'react';

import './StickyBar.scss';

export interface StickySaveBarProps {
	title: string | React.ReactNode;
	isVisible: boolean;
	actionButtonProps?: ButtonPropsSchema;
	cancelButtonProps?: ButtonPropsSchema;
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
