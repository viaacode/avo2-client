import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';

import { Accordion, Form, FormGroup, SelectOption } from '@viaa/avo2-components';

import { EDITOR_TYPES_MAP } from '../../content-block.const';
import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockField,
	ContentBlockFormStates,
} from '../../content-block.types';

import './ContentBlockForm.scss';

interface ContentBlockFormProps {
	config: ContentBlockConfig;
	index: number;
	isAccordionOpen: boolean;
	length: number;
	onSave: (formState: ContentBlockFormStates) => void;
	setIsAccordionOpen: () => void;
}

const ContentBlockForm: FunctionComponent<ContentBlockFormProps> = ({
	config,
	index,
	isAccordionOpen,
	length,
	onSave,
	setIsAccordionOpen,
}) => {
	const [formState, setFormState] = useState<ContentBlockFormStates>(config.formState);
	const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});

	// Methods
	const handleChange = (key: keyof ContentBlockFormStates, value: any) => {
		const updatedForm = { ...formState, [key]: get(value, 'value', value) };

		setFormState(updatedForm);
		handleValidation(key, updatedForm);
		onSave(updatedForm);
	};

	const handleValidation = (
		fieldKey: keyof ContentBlockFormStates,
		updatedFormState: ContentBlockFormStates
	) => {
		const errors: any = {};

		const field = config.fields[fieldKey];
		const validator = get(field, 'validator');

		if (validator) {
			const errorArray = validator(updatedFormState[fieldKey]);

			if (errorArray.length) {
				errors[fieldKey] = errorArray;
			}
		}

		setFormErrors(errors);
	};

	// Render
	const renderFieldEditor = (fieldKey: keyof ContentBlockFormStates, cb: ContentBlockField) => {
		const EditorComponent = EDITOR_TYPES_MAP[cb.editorType];
		const editorId = `${index}-${config.name}-${fieldKey}`;
		const defaultProps = {
			...cb.editorProps,
			id: editorId,
			name: editorId,
		};
		let editorProps = {};

		switch (cb.editorType) {
			case ContentBlockEditor.ColorSelect:
				editorProps = {
					onChange: (option: SelectOption) => handleChange(fieldKey, get(option, 'value', '')),
					value: defaultProps.options.find(
						(opt: SelectOption) => opt.value === formState.backgroundColor
					),
				};
				break;
			case ContentBlockEditor.WYSIWYG:
				editorProps = {
					data: formState[fieldKey],
					onChange: (value: any) => handleChange(fieldKey, value),
				};
				break;
			default:
				editorProps = {
					onChange: (value: any) => handleChange(fieldKey, value),
					value: formState[fieldKey],
				};
				break;
		}

		return <EditorComponent {...defaultProps} {...editorProps} />;
	};

	const renderFormGroups = (cb: ContentBlockConfig) => {
		return (
			<Accordion
				title={`${cb.name} (${index}/${length})`}
				isOpen={isAccordionOpen}
				onToggle={setIsAccordionOpen}
			>
				{Object.keys(cb.fields).map((key: string) => (
					<FormGroup
						key={`${index}-${cb.name}-${key}`}
						label={cb.fields[key].label}
						error={formErrors[key]}
					>
						{renderFieldEditor(key as keyof ContentBlockFormStates, cb.fields[key])}
					</FormGroup>
				))}
			</Accordion>
		);
	};

	return <Form className="c-content-block-form">{renderFormGroups(config)}</Form>;
};

export default ContentBlockForm;
