import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';

import { Accordion, Button, Flex, Form, FormGroup, Spacer } from '@viaa/avo2-components';

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
	onSave: (formState: ContentBlockFormStates) => void;
}

const ContentBlockForm: FunctionComponent<ContentBlockFormProps> = ({
	config,
	index,
	length,
	onSave,
}) => {
	const [accordionsOpenState, setAccordionsOpenState] = useState<{ [key: string]: boolean }>({});
	const [formState, setFormState] = useState<ContentBlockFormStates>(config.initialState);
	const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});

	// Methods
	const handleChange = (key: string, value: any) => {
		const updatedForm = { ...formState, [key]: value };

		setFormState(updatedForm);
		onSave(formState);
	};

	const handleValidation = () => {
		const errors: any = {};

		// Go over every field's validator if present
		// to check if form is valid
		Object.keys(config.fields).forEach((fieldKey: string) => {
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
		const formGroupId = `${cb.name}-${index}`;

		return (
			<Accordion
				title={`${cb.name} (${index}/${length})`}
				isOpen={accordionsOpenState[formGroupId] || false}
				onToggle={() =>
					setAccordionsOpenState({ [formGroupId]: !accordionsOpenState[formGroupId] })
				}
			>
				{Object.keys(cb.fields).map((key: string) => (
					<FormGroup
						key={`${index}-${cb.name}-${key}`}
						label={cb.fields[key].label}
						error={formErrors[key]}
					>
						{renderFieldEditor(key, cb.fields[key])}
					</FormGroup>
				))}
				{/* <Spacer margin="top">
					<Flex justify="end">
						<Button label={`${config.name} opslaan`} onClick={handleSave} size="small" />
					</Flex>
				</Spacer> */}
			</Accordion>
		);
	};

	return <Form className="c-content-block-form">{renderFormGroups(config)}</Form>;
};

export default ContentBlockForm;
