import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import i18n from '../../../../shared/translations/i18n';

import { Accordion, Button, Form, Spacer } from '@viaa/avo2-components';

import {
	ContentBlockBlockConfig,
	ContentBlockComponentsConfig,
	ContentBlockComponentState,
	ContentBlockConfig,
	ContentBlockFormError,
	ContentBlockState,
	ContentBlockStateType,
} from '../../content-block.types';
import { ContentBlockFormGroup } from '../ContentBlockFormGroup/ContentBlockFormGroup';

import './ContentBlockForm.scss';

interface ContentBlockFormProps {
	config: ContentBlockConfig;
	blockIndex: number;
	isAccordionOpen: boolean;
	length: number;
	onChange: (formGroupType: ContentBlockStateType, input: any, stateIndex?: number) => void;
	setIsAccordionOpen: () => void;
	addComponentToState: () => void;
}

const ContentBlockForm: FunctionComponent<ContentBlockFormProps> = ({
	config,
	blockIndex,
	isAccordionOpen,
	length,
	onChange,
	setIsAccordionOpen,
	addComponentToState,
}) => {
	const { components, block } = config;
	const { isArray } = Array;

	// Hooks
	const [formErrors, setFormErrors] = useState<ContentBlockFormError>({});

	// Methods
	const handleChange = (
		formGroupType: ContentBlockStateType,
		key: keyof ContentBlockComponentState | keyof ContentBlockState,
		value: any,
		stateIndex?: number
	) => {
		const parsedValue = get(value, 'value', value);
		const updateObject = {
			[key]: parsedValue,
		};
		const stateUpdate = isArray(components.state) ? [updateObject] : updateObject;

		handleValidation(key, formGroupType, parsedValue);
		onChange(formGroupType, stateUpdate, stateIndex);
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

	const renderFormGroups = (
		formGroup: ContentBlockComponentsConfig | ContentBlockBlockConfig,
		formGroupType: ContentBlockStateType
	) => {
		const formGroupOptions = {
			config,
			blockIndex,
			formGroup,
			formGroupType,
			handleChange,
			formErrors,
		};

		// Render each state individually in a ContentBlockFormGroup
		return isArray(formGroup.state) ? (
			formGroup.state.map((formGroupState, stateIndex = 0) => (
				<ContentBlockFormGroup
					key={stateIndex}
					{...formGroupOptions}
					formGroupState={formGroupState}
					stateIndex={stateIndex}
				/>
			))
		) : (
			<ContentBlockFormGroup {...formGroupOptions} formGroupState={formGroup.state} />
		);
	};

	const renderAddButton = (label: string) => (
		<Spacer margin="bottom">
			<Button
				label={i18n.t(
					'admin/content-block/components/content-block-form/content-block-form___voeg-label-to',
					{ label }
				)}
				icon="add"
				type="secondary"
				onClick={addComponentToState}
			/>
		</Spacer>
	);

	const renderBlockForm = (contentBlock: ContentBlockConfig) => {
		const label = get(contentBlock.components, 'name', '').toLowerCase();
		const notAtMax =
			isArray(components.state) && components.state.length < get(components, 'limits.max');

		return (
			<Accordion
				title={`${contentBlock.name} (${blockIndex}/${length})`}
				isOpen={isAccordionOpen}
				onToggle={setIsAccordionOpen}
			>
				{renderFormGroups(components, 'components')}
				{notAtMax && renderAddButton(label)}
				{renderFormGroups(block, 'block')}
			</Accordion>
		);
	};

	return <Form className="c-content-block-form">{renderBlockForm(config)}</Form>;
};

export default ContentBlockForm;
