import React, { FunctionComponent } from 'react';

import { Form, FormGroup, Select } from '@viaa/avo2-components';
import { SpacerOption } from '@viaa/avo2-components/dist/components/Spacer/Spacer'; // TODO: export from components lib

import { PaddingFieldState } from '../../../../shared/types';

interface PaddingSelectProps {
	onChange: (value: string) => void;
	options: { label: string; value: SpacerOption }[];
	value: PaddingFieldState;
}

const PaddingSelect: FunctionComponent<PaddingSelectProps> = ({ options = [] }) => {
	return (
		<Form type="inline">
			<FormGroup label="Boven">
				<Select options={options} />
			</FormGroup>
			<FormGroup label="Onder">
				<Select options={options} />
			</FormGroup>
		</Form>
	);
};

export default PaddingSelect;
