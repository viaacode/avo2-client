import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';

import { Accordion, Button, Form, FormGroup, SelectOption } from '@viaa/avo2-components';

import { ValueOf } from '../../../../shared/types';

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
	onChange: (
		formState: Partial<ContentBlockFormStates> | Partial<ContentBlockFormStates>[]
	) => void;
	setIsAccordionOpen: () => void;
}

const ContentBlockForm: FunctionComponent<ContentBlockFormProps> = ({
	config,
	index,
	isAccordionOpen,
	length,
	onChange,
	setIsAccordionOpen,
}) => {
	const { formState } = config;

	// Hooks
	const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});

	// Methods
	const handleChange = (key: keyof ContentBlockFormStates, value: any) => {
		if (Array.isArray(formState)) {
			// TODO: Handle change in array-based form states.
			return;
		}

		// Get value from select option otherwise fallback to original
		const parsedValue = get(value, 'value', value);
		const updatedFormSet = { [key]: parsedValue };

		handleValidation(key, parsedValue);
		onChange(updatedFormSet);
	};

	const handleValidation = (
		fieldKey: keyof ContentBlockFormStates,
		updatedFormValue: Partial<ValueOf<ContentBlockFormStates>>
	) => {
		const errors: any = {};

		const field = config.fields[fieldKey];
		const validator = get(field, 'validator');

		if (validator) {
			const errorArray = validator(updatedFormValue);

			if (errorArray.length) {
				errors[fieldKey] = errorArray;
			}
		}

		setFormErrors(errors);
	};

	// Render
	const renderFieldEditor = (
		fieldKey: keyof ContentBlockFormStates,
		contentBlock: ContentBlockField,
		formGroupState: ContentBlockFormStates
	) => {
		const EditorComponent = EDITOR_TYPES_MAP[contentBlock.editorType];
		const editorId = `${index}-${formGroupState.blockType}-${fieldKey}`;
		const defaultProps = {
			...contentBlock.editorProps,
			editorId,
			name: editorId,
		};
		let editorProps = {};

		switch (contentBlock.editorType) {
			case ContentBlockEditor.ColorSelect:
				editorProps = {
					onChange: (option: SelectOption) => handleChange(fieldKey, get(option, 'value', '')),
					value: defaultProps.options.find(
						(opt: SelectOption) => opt.value === formGroupState.backgroundColor
					),
				};
				break;
			case ContentBlockEditor.WYSIWYG:
				editorProps = {
					data: formGroupState[fieldKey],
					onChange: (value: any) => handleChange(fieldKey, value),
				};
				break;
			default:
				editorProps = {
					onChange: (value: any) => handleChange(fieldKey, value),
					value: formGroupState[fieldKey],
				};
				break;
		}

		return <EditorComponent {...defaultProps} {...editorProps} />;
	};

	const renderFormGroup = (
		contentBlock: ContentBlockConfig,
		formGroupState: ContentBlockFormStates
	) =>
		Object.keys(contentBlock.fields).map((key: string, index: number) => (
			<FormGroup
				key={`${index}-${contentBlock.name}-${key}`}
				label={contentBlock.fields[key].label}
				error={formErrors[key as keyof ContentBlockFormStates]}
			>
				{renderFieldEditor(
					key as keyof ContentBlockFormStates,
					contentBlock.fields[key],
					formGroupState
				)}
			</FormGroup>
		));

	const renderFormGroups = (contentBlock: ContentBlockConfig) =>
		Array.isArray(formState)
			? formState.map(formGroupState => renderFormGroup(contentBlock, formGroupState))
			: renderFormGroup(contentBlock, formState);

	const renderBlockForm = (contentBlock: ContentBlockConfig) => (
		<Accordion
			title={`${contentBlock.name} (${index}/${length})`}
			isOpen={isAccordionOpen}
			onToggle={setIsAccordionOpen}
		>
			{renderFormGroups(contentBlock)}
			{Array.isArray(formState) && (
				<Button
					icon="add"
					type="secondary"
					onClick={() => {} /* TODO: Add empty element to form state. */}
				/>
			)}
		</Accordion>
	);

	return <Form className="c-content-block-form">{renderBlockForm(config)}</Form>;
};

export default ContentBlockForm;
