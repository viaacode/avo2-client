import React, { FunctionComponent } from 'react';

import { Form, FormGroup, Select, SelectOption, SpacerOption } from '@viaa/avo2-components';

import { PaddingFieldState } from '../../../../shared/types';

interface PaddingSelectProps {
	onChange: (value: PaddingFieldState) => void;
	value: PaddingFieldState;
}

type PaddingDirection = 'top' | 'bottom';

const PaddingSelect: FunctionComponent<PaddingSelectProps> = ({ onChange, value }) => {
	const generateOptions = (direction: PaddingDirection) =>
		[
			{ label: 'Klein', value: `${direction}-small` },
			{ label: 'Medium', value: `${direction}` },
			{ label: 'Groot', value: `${direction}-large` },
			{ label: 'Extra groot', value: `${direction}-extra-large` },
		] as SelectOption<SpacerOption>[];

	const handleChange = (newValue: string, direction: PaddingDirection) => {
		onChange({ ...value, [direction]: newValue });
	};

	return (
		<Form type="inline">
			<FormGroup label="Boven">
				<Select
					onChange={(value: string) => handleChange(value, 'top')}
					options={generateOptions('top')}
					value={value.top}
				/>
			</FormGroup>
			<FormGroup label="Onder">
				<Select
					onChange={(value: string) => handleChange(value, 'bottom')}
					options={generateOptions('bottom')}
					value={value.bottom}
				/>
			</FormGroup>
		</Form>
	);
};

export default PaddingSelect;
