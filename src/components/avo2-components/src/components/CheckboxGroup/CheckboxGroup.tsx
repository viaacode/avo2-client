import classNames from 'classnames';
import React, { FunctionComponent, ReactNode } from 'react';

export interface CheckboxGroupProps {
	inline?: boolean;
	children: ReactNode;
}

export const CheckboxGroup: FunctionComponent<CheckboxGroupProps> = ({
	inline = false,
	children,
}: CheckboxGroupProps) => (
	<div
		className={classNames({
			'c-checkbox-group': true,
			'c-checkbox-group--inline': inline,
		})}
	>
		{children}
	</div>
);
