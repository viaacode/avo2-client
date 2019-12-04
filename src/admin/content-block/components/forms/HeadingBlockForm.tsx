import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import { ValueType } from 'react-select';

import {
	Button,
	ButtonGroup,
	Flex,
	FlexItem,
	Form,
	FormGroup,
	Heading,
	IconName,
	Select,
	TextInput,
} from '@viaa/avo2-components';

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
		<div className="c-cb-form c-cb-form--heading">
			<Flex className="c-cb-form__header" center justify="between">
				<Heading type="h3">Hoofding block</Heading>
				<Form type="inline">
					<FormGroup inlineMode="grow" label="Achtergrondkleur">
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
				</Form>
			</Flex>
			<Form className="u-spacer-bottom-s">
				<Flex spaced="wide">
					<FlexItem>
						<FormGroup label="Titel">
							<TextInput
								onChange={(value: string) => handleChange('title', value)}
								value={form.title}
							/>
						</FormGroup>
					</FlexItem>
					<FormGroup label="Stijl">
						<Select
							onChange={(value: string) => handleChange('level', value)}
							options={HEADING_LEVEL_OPTIONS}
							value={form.level}
						/>
					</FormGroup>
					<FormGroup label="Uitlijning">
						<ButtonGroup>
							{HEADING_ALIGN_OPTIONS.map(alignValue => (
								<Button
									key={`heading-block-align-${alignValue}`}
									active={form.align === alignValue}
									icon={`align-${alignValue}` as IconName}
									onClick={() => handleChange('align', alignValue)}
									type="secondary"
								/>
							))}
						</ButtonGroup>
					</FormGroup>
				</Flex>
			</Form>
		</div>
	);
};

export default HeadingBlockForm;
