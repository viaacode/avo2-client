import React, { FunctionComponent, ReactNode } from 'react';

import classNames from 'classnames';

export interface FormGroupProps {
	type?: 'standard' | 'horizontal' | 'inline';
	children: ReactNode;
}

export const Form: FunctionComponent<FormGroupProps> = ({
	type = 'standard',
	children,
}: FormGroupProps) => (
	<div className={classNames('o-form-group-layout', `o-form-group-layout--${type}`)}>
		{children}
	</div>
);
