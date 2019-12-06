import React, { FunctionComponent } from 'react';

import { Button, ButtonGroup, IconName } from '@viaa/avo2-components';

import { Aligns } from '../../content-block.types';

interface AlignSelectProps {
	onChange: (value: string) => void;
	options: { label: string; value: Aligns }[];
	value: Aligns;
}

const AlignSelect: FunctionComponent<AlignSelectProps> = ({ onChange, options, value }) => {
	return (
		<ButtonGroup>
			{options.map(option => (
				<Button
					key={`heading-block-align-${option.label}`}
					active={value === option.value}
					icon={`align-${option.label}` as IconName}
					onClick={() => onChange(option.value)}
					type="secondary"
				/>
			))}
		</ButtonGroup>
	);
};

export default AlignSelect;
