import React, { FunctionComponent, ReactNode } from 'react';

export interface RadioButtonGroupProps {
	children: ReactNode;
	inline?: boolean;
}

export const RadioButtonGroup: FunctionComponent<RadioButtonGroupProps> = ({
	children,
	inline,
}: RadioButtonGroupProps) => {
	const additionalClasses = inline ? 'c-radio-group--inline' : '';

	return <div className={`c-radio-group ${additionalClasses}`}>{children}</div>;
};
