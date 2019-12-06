import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';

import { Button, Form, FormGroup, Heading } from '@viaa/avo2-components';

import { EDITOR_TYPES_MAP } from '../../content-block.const';
import {
	ContentBlockConfig,
	ContentBlockField,
	ContentBlockFormStates,
} from '../../content-block.types';

interface ContentBlockFormProps {
	config: ContentBlockConfig;
	index: number;
	length: number;
	onSave: (formState: ContentBlockFormStates) => void;
}

const ContentBlockForm: FunctionComponent<ContentBlockFormProps> = ({
	config,
	index,
	length,
	onSave,
}) => {
	const [formState, setFormState] = useState<ContentBlockFormStates>(config.initialState);
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
		Object.keys(config.fields).map((fieldKey: string) => {
			const field = config.fields[fieldKey];
			const validator = get(field, 'validator');

			if (validator) {
				const errorArray = validator(formState[fieldKey as keyof ContentBlockFormStates]);

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
	const renderFieldEditor = (fieldKey: string, cb: ContentBlockField) => {
		const EditorComponent = EDITOR_TYPES_MAP[cb.editorType];

		switch (cb.editorType) {
			default:
				return (
					<EditorComponent
						{...cb.editorProps}
						name={fieldKey}
						onChange={(value: any) => handleChange(fieldKey, value)}
						value={formState[fieldKey as keyof ContentBlockFormStates]}
					/>
				);
		}
	};

	const renderFormGroups = (cb: ContentBlockConfig) => {
		return (
			<>
				<Heading type="h4">
					{cb.name} ({index}/{length})
				</Heading>
				{Object.keys(cb.fields).map((key: string) => (
					<FormGroup label={cb.fields[key].label} error={formErrors[key]}>
						{renderFieldEditor(key, cb.fields[key])}
					</FormGroup>
				))}
			</>
		);
	};

	return (
		<Form type="horizontal">
			{renderFormGroups(config)}
			<Button label="Opslaan" onClick={handleSave} />
		</Form>
	);
};

export default ContentBlockForm;
