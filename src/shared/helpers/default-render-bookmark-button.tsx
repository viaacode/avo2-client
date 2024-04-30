import { IconName, ToggleButton, type ToggleButtonProps } from '@viaa/avo2-components';
import React, { type ReactNode } from 'react';

export type renderBookmarkButtonProps = Pick<
	ToggleButtonProps,
	'active' | 'onClick' | 'ariaLabel' | 'title'
>;

export const defaultRenderBookmarkButton = (props: renderBookmarkButtonProps): ReactNode => (
	<ToggleButton type="tertiary" icon={IconName.bookmark} {...props} />
);
