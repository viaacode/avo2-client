import React, { FunctionComponent } from 'react';

import { Form, FormGroup, Select, SelectOption } from '@viaa/avo2-components';
import { SpacerOption } from '@viaa/avo2-components/dist/components/Spacer/Spacer'; // TODO: export from components lib

import { PaddingFieldState } from '../../../../shared/types';

interface PaddingSelectProps {
	onChange: (value: PaddingFieldState) => void;
	value: PaddingFieldState;
}

const PaddingSelect: FunctionComponent<PaddingSelectProps> = ({ onChange, value }) => {
	const handleChange = (newValue: string, direction: 'top' | 'bottom') => {
		onChange({ ...value, [direction]: newValue });
	};

	return (
		<Form type="inline">
			<FormGroup label="Boven">
				<Select
					onChange={(value: string) => handleChange(value, 'top')}
					options={
						[
							{ label: 'Klein', value: 'top-small' },
							{ label: 'Medium', value: 'top' },
							{ label: 'Groot', value: 'top-large' },
							{ label: 'Extra groot', value: 'top-extra-large' },
						] as SelectOption<SpacerOption>[]
					}
					value={value.top}
				/>
			</FormGroup>
			<FormGroup label="Onder">
				<Select
					onChange={(value: string) => handleChange(value, 'bottom')}
					options={
						[
							{ label: 'Klein', value: 'bottom-small' },
							{ label: 'Medium', value: 'bottom' },
							{ label: 'Groot', value: 'bottom-large' },
							{ label: 'Extra groot', value: 'bottom-extra-large' },
						] as SelectOption<SpacerOption>[]
					}
					value={value.bottom}
				/>
			</FormGroup>
		</Form>
	);
};

export default PaddingSelect;
