import React, { FunctionComponent, ReactNode } from 'react';

import classNames from 'classnames';

export interface FormGroupProps {
	label?: string;
	labelFor?: string;
	error?: string;
	inlineMode?: 'grow' | 'shrink';
	children: ReactNode;
}

export const FormGroup: FunctionComponent<FormGroupProps> = ({
	label,
	labelFor,
	error,
	inlineMode,
	children,
}: FormGroupProps) => (
	<div
		className={classNames('o-form-group', {
			'o-form-group--error': error,
			[`o-form-group--inline-${inlineMode}`]: inlineMode,
		})}
	>
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
