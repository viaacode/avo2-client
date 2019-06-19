import React, { FunctionComponent } from 'react';

export interface SwatchProps {
	color: string;
	name: string;
}

export const Swatch: FunctionComponent<SwatchProps> = ({ color, name }: SwatchProps) => (
	<div className="c-swatch">
		<div className="c-swatch__block" style={{ background: color }} />
		<div className="c-swatch__info">
			<div className="c-swatch__color-name">{name}</div>
			<div className="c-swatch__color-hex">{color}</div>
		</div>
	</div>
);
