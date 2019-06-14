import React, { FunctionComponent } from 'react';

import classNames from 'classnames';

export interface SpinnerProps {
	size?: 'large';
}

export const Spinner: FunctionComponent<SpinnerProps> = ({ size }: SpinnerProps) => (
	<div className={classNames('c-spinner', { 'c-spinner--large': size === 'large' })}>
		<div className="c-spinner__bar" />
		<div className="c-spinner__bar" />
		<div className="c-spinner__bar" />
		<div className="c-spinner__bar" />
		<div className="c-spinner__bar" />
		<div className="c-spinner__bar" />
		<div className="c-spinner__bar" />
		<div className="c-spinner__bar" />
		<div className="c-spinner__bar" />
		<div className="c-spinner__bar" />
		<div className="c-spinner__bar" />
		<div className="c-spinner__bar" />
	</div>
);
