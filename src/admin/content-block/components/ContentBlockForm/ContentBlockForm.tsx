import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';

import { Button, Flex, Form, FormGroup, Heading, Spacer } from '@viaa/avo2-components';

import { EDITOR_TYPES_MAP } from '../../content-block.const';
import {
	ContentBlockConfig,
	ContentBlockField,
	ContentBlockFormStates,
} from '../../content-block.types';

import './ContentBlockForm.scss';

interface ContentBlockFormProps {
	config: ContentBlockConfig;
	index: number;
	length: number;
	onSave: (formState: ContentBlockFormStates | ContentBlockFormStates[]) => void;
}

const ContentBlockForm: FunctionComponent<ContentBlockFormProps> = ({
	config,
	index,
	length,
	onSave,
}) => {
	const [formState, setFormState] = useState<ContentBlockFormStates | ContentBlockFormStates[]>(
		config.initialState
	);
	const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});

	// Methods
	const handleChange = (key: string, value: any) => {
		const updatedForm = { ...formState, [key]: value };

		setFormState(updatedForm);
	};

	const handleValidation = () => {
		const errors: any = {};

		// Go over every field's validator if present
		// to check if form is valid
		Object.keys(config.fields).forEach((fieldKey: string) => {
			const field = config.fields[fieldKey];
			const validator = get(field, 'validator');

			if (validator) {
				const errorArray = [];

				Array.isArray(formState)
					? formState.map(singleFormState =>
							errorArray.push(validator(singleFormState[fieldKey as keyof ContentBlockFormStates]))
					  )
					: errorArray.push(validator(formState[fieldKey as keyof ContentBlockFormStates]));

				if (errorArray.length) {
					errors[fieldKey] = errorArray;
				}
			}
		});

		setFormErrors(errors);

		return Object.keys(errors).length === 0;
	};

	const handleSave = () => {
		const isFormValid = handleValidation();

		if (!isFormValid) {
			return;
		}

		onSave(formState);
	};

	// Render
	const renderFieldEditor = (
		fieldKey: string,
		cb: ContentBlockField,
		state: ContentBlockFormStates
	) => {
		const EditorComponent = EDITOR_TYPES_MAP[cb.editorType];

		switch (cb.editorType) {
			default:
				return (
					<EditorComponent
						{...cb.editorProps}
						name={fieldKey}
						onChange={(value: any) => handleChange(fieldKey, value)}
						value={state[fieldKey as keyof ContentBlockFormStates]}
					/>
				);
		}
	};

	const renderFormGroups = (cb: ContentBlockConfig) => (
		<>
			<Heading type="h4">
				{cb.name}{' '}
				<span className="u-text-muted">
					({index}/{length})
				</span>
			</Heading>
			{Array.isArray(formState)
				? formState.map(singleFormState =>
						Object.keys(cb.fields).map((key: string) => (
							<FormGroup
								key={`${index}-${cb.name}-${key}`}
								label={cb.fields[key].label}
								error={formErrors[key]}
							>
								{renderFieldEditor(key, cb.fields[key], singleFormState)}
							</FormGroup>
						))
				  )
				: Object.keys(cb.fields).map((key: string) => (
						<FormGroup
							key={`${index}-${cb.name}-${key}`}
							label={cb.fields[key].label}
							error={formErrors[key]}
						>
							{renderFieldEditor(key, cb.fields[key], formState)}
						</FormGroup>
				  ))}
			{Array.isArray(formState) && <Button icon="add" type="secondary" onClick={() => {}} />}
		</>
	);

	return (
		<Form className="c-content-block-form" type="horizontal">
			{renderFormGroups(config)}
			<Spacer margin="top">
				<Flex justify="end">
					<Button label={`${config.name} opslaan`} onClick={handleSave} size="small" />
				</Flex>
			</Spacer>
		</Form>
	);
};

export default ContentBlockForm;
