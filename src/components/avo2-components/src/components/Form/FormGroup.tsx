import React, { FunctionComponent, ReactNode } from 'react';

import classNames from 'classnames';

export interface FormGroupProps {
	label?: string;
	labelFor?: string;
	error?: string;
	children: ReactNode;
}

export const FormGroup: FunctionComponent<FormGroupProps> = ({
	label,
	labelFor,
	error,
	children,
}: FormGroupProps) => (
	<div className={classNames('o-form-group', { 'o-form-group--error': error })}>
		{label && (
			<label className="o-form-group__label" htmlFor={labelFor}>
				{label}
			</label>
		)}
		<div className="o-form-group__controls">
			{children}
			{error && <div className="c-form-help-text c-form-help-text--error">{error}</div>}
		</div>
	</div>
);
