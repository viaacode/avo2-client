import { ToggleButton, ToggleButtonProps } from '@viaa/avo2-components';
import React, { ReactNode } from 'react';

export type renderBookmarkButtonProps = Pick<
	ToggleButtonProps,
	'active' | 'onClick' | 'ariaLabel' | 'title'
>;

export const defaultRenderBookmarkButton = (props: renderBookmarkButtonProps): ReactNode => (
	<ToggleButton type="tertiary" icon="bookmark" {...props} />
);
