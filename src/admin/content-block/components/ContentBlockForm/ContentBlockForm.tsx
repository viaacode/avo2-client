import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';

import { Accordion, Button, Form, FormGroup, SelectOption } from '@viaa/avo2-components';

import { EDITOR_TYPES_MAP } from '../../content-block.const';
import {
	ContentBlockBlockConfig,
	ContentBlockComponentsConfig,
	ContentBlockComponentState,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockField,
	ContentBlockState,
	ContentBlockStateType,
	ContentBlockType,
} from '../../content-block.types';

import './ContentBlockForm.scss';

interface ContentBlockFormProps {
	config: ContentBlockConfig;
	index: number;
	isAccordionOpen: boolean;
	length: number;
	onChange: (formGroupType: ContentBlockStateType, input: any, stateIndex?: number) => void;
	setIsAccordionOpen: () => void;
	addComponentToState: () => void;
}

const ContentBlockForm: FunctionComponent<ContentBlockFormProps> = ({
	config,
	index,
	isAccordionOpen,
	length,
	onChange,
	setIsAccordionOpen,
	addComponentToState,
}) => {
	const { components, block } = config;

	// Hooks
	const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});

	// Methods
	const handleChange = (
		formGroupType: ContentBlockStateType,
		key: keyof ContentBlockComponentState | keyof ContentBlockState,
		value: any,
		stateIndex?: number
	) => {
		const parsedValue = get(value, 'value', value);

		const updatedFormSet = Array.isArray(components.state)
			? [
					{
						[key]: parsedValue,
					},
			  ]
			: {
					[key]: parsedValue,
			  };

		// Get value from select option otherwise fallback to original
		handleValidation(key, formGroupType, parsedValue);
		onChange(formGroupType, updatedFormSet, stateIndex);
	};

	const handleValidation = (
		fieldKey: keyof ContentBlockComponentState | keyof ContentBlockState,
		formGroupType: ContentBlockStateType,
		updatedFormValue: any
	) => {
		const errors: any = {};

		const field = config[formGroupType].fields[fieldKey];
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
		fieldKey: keyof ContentBlockComponentState | keyof ContentBlockState,
		contentBlock: ContentBlockField,
		formGroupState: ContentBlockComponentState | ContentBlockState,
		formGroupType: ContentBlockStateType,
		stateIndex?: number
	) => {
		const EditorComponent = EDITOR_TYPES_MAP[contentBlock.editorType];
		const editorId = `${index}-${block.state.blockType}-${fieldKey}`;
		const defaultProps = {
			...contentBlock.editorProps,
			editorId,
			name: editorId,
		};
		let editorProps = {};

		switch (contentBlock.editorType) {
			case ContentBlockEditor.ColorSelect:
				editorProps = {
					onChange: (option: SelectOption) =>
						handleChange(formGroupType, fieldKey, get(option, 'value', ''), stateIndex),
					value: defaultProps.options.find(
						(opt: SelectOption) => opt.value === block.state.backgroundColor
					),
				};
				break;
			case ContentBlockEditor.WYSIWYG:
				editorProps = {
					id: `${index}-${block.state.blockType}-${fieldKey}`,
					data: (formGroupState as any)[fieldKey],
					onChange: (value: any) => handleChange(formGroupType, fieldKey, value, stateIndex),
				};
				break;
			default:
				editorProps = {
					onChange: (value: any) => handleChange(formGroupType, fieldKey, value, stateIndex),
					value: (formGroupState as any)[fieldKey],
				};
				break;
		}

		return <EditorComponent {...defaultProps} {...editorProps} />;
	};

	const renderFormGroup = (
		blockType: ContentBlockType,
		formGroup: ContentBlockComponentsConfig | ContentBlockBlockConfig,
		formGroupState: ContentBlockComponentState | ContentBlockState,
		formGroupType: ContentBlockStateType,
		stateIndex?: number
	) => {
		return Object.keys(formGroup.fields).map((key: string, index: number) => (
			<FormGroup
				key={`${index}-${blockType}-${key}`}
				label={
					stateIndex
						? `${config.name} ${stateIndex}: ${formGroup.fields[key].label}`
						: formGroup.fields[key].label
				}
				error={formErrors[key as keyof ContentBlockComponentState | keyof ContentBlockState]}
			>
				{renderFieldEditor(
					key as keyof ContentBlockComponentState | keyof ContentBlockState,
					formGroup.fields[key],
					formGroupState,
					formGroupType,
					stateIndex
				)}
			</FormGroup>
		));
	};

	const renderFormGroups = (
		blockType: ContentBlockType,
		formGroup: ContentBlockComponentsConfig | ContentBlockBlockConfig,
		formGroupType: ContentBlockStateType
	) => {
		return Array.isArray(formGroup.state)
			? formGroup.state.map((formGroupState, stateIndex = 0) =>
					renderFormGroup(blockType, formGroup, formGroupState, formGroupType, stateIndex)
			  )
			: renderFormGroup(blockType, formGroup, formGroup.state, formGroupType);
	};

	const renderBlockForm = (contentBlock: ContentBlockConfig) => (
		<Accordion
			title={`${contentBlock.name} (${index}/${length})`}
			isOpen={isAccordionOpen}
			onToggle={setIsAccordionOpen}
		>
			{renderFormGroups(contentBlock.block.state.blockType, components, 'components')}
			{renderFormGroups(contentBlock.block.state.blockType, block, 'block')}
			{Array.isArray(components.state) && (
				<Button icon="add" type="secondary" onClick={addComponentToState} />
			)}
		</Accordion>
	);

	return <Form className="c-content-block-form">{renderBlockForm(config)}</Form>;
};

export default ContentBlockForm;
