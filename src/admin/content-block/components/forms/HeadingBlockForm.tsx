import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import { ValueType } from 'react-select';

import { Form, FormGroup, Select, TextInput } from '@viaa/avo2-components';

import { ReactSelectOption, ValueOf } from '../../../../shared/types';

import {
	BACKGROUND_COLOR_OPTIONS,
	HEADING_ALIGN_OPTIONS,
	HEADING_LEVEL_OPTIONS,
} from '../../content-block.const';
import { HeadingBlockFormState } from '../../content-block.types';
import { INITIAL_HEADING_BLOCK } from '../../helpers/generators/heading';
import ColorSelect from '../ColorSelect/ColorSelect';

interface HeadingBLockFormProps {
	onChange: (formState: HeadingBlockFormState) => void;
}

const HeadingBlockForm: FunctionComponent<HeadingBLockFormProps> = ({ onChange }) => {
	// State
	const [form, setForm] = useState<HeadingBlockFormState>(INITIAL_HEADING_BLOCK);

	// Methods
	const handleChange = (
		key: keyof HeadingBlockFormState,
		value: ValueOf<HeadingBlockFormState>
	) => {
		const updatedForm = { ...form, [key]: value };
		setForm(updatedForm);
		onChange(updatedForm);
	};

	return (
		<Form>
			<FormGroup inlineMode="grow">
				<ColorSelect
					onChange={(option: ValueType<ReactSelectOption<string>>) =>
						handleChange('backgroundColor', get(option, 'value'))
					}
					value={BACKGROUND_COLOR_OPTIONS.find(
						(option: ReactSelectOption<string>) => option.value === form.backgroundColor
					)}
					options={BACKGROUND_COLOR_OPTIONS}
				/>
			</FormGroup>
			<FormGroup inlineMode="grow">
				<TextInput value={form.title} />
			</FormGroup>
			<FormGroup inlineMode="grow">
				<Select
					onChange={(value: string) => handleChange('level', value)}
					options={HEADING_LEVEL_OPTIONS}
					value={form.level}
				/>
			</FormGroup>
			<FormGroup inlineMode="grow">
				<Select
					onChange={(value: string) => handleChange('align', value)}
					options={HEADING_ALIGN_OPTIONS}
					value={form.align}
				/>
			</FormGroup>
		</Form>
	);
};

export default HeadingBlockForm;
