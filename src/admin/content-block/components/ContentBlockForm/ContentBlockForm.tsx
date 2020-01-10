import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import i18n from '../../../../shared/translations/i18n';

import {
	Accordion,
	AccordionActions,
	AccordionBody,
	AccordionTitle,
	Button,
	ButtonToolbar,
	Form,
	FormGroup,
	Spacer,
} from '@viaa/avo2-components';

import {
	ContentBlockBlockConfig,
	ContentBlockComponentsConfig,
	ContentBlockComponentState,
	ContentBlockConfig,
	ContentBlockState,
	ContentBlockStateType,
	ContentBlockType,
} from '../../content-block.types';
import { ContentBlockFieldEditor } from '../ContentBlockFieldEditor/ContentBlockFieldEditor';

import './ContentBlockForm.scss';

interface ContentBlockFormProps {
	addComponentToState: () => void;
	config: ContentBlockConfig;
	index: number;
	isAccordionOpen: boolean;
	length: number;
	onChange: (formGroupType: ContentBlockStateType, input: any, stateIndex?: number) => void;
	onRemove: (configIndex: number) => void;
	setIsAccordionOpen: () => void;
}

const ContentBlockForm: FunctionComponent<ContentBlockFormProps> = ({
	addComponentToState,
	config,
	index,
	isAccordionOpen,
	length,
	onChange,
	onRemove,
	setIsAccordionOpen,
}) => {
	const { components, block } = config;
	const isComponentsArray = Array.isArray(components.state);

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
		const updateObject = {
			[key]: parsedValue,
		};
		const stateUpdate = isComponentsArray ? [updateObject] : updateObject;

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
					stateIndex || stateIndex === 0
						? `${config.components.name} ${stateIndex + 1}: ${formGroup.fields[key].label}`
						: formGroup.fields[key].label
				}
				error={formErrors[key as keyof ContentBlockComponentState | keyof ContentBlockState]}
			>
				<ContentBlockFieldEditor
					block={{ index, config }}
					fieldKey={key as keyof ContentBlockComponentState | keyof ContentBlockState}
					field={formGroup.fields[key]}
					state={formGroupState}
					type={formGroupType}
					stateIndex={stateIndex}
					handleChange={handleChange}
				/>
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

	const renderBlockForm = (contentBlock: ContentBlockConfig) => {
		const accordionTitle = `${contentBlock.name} (${index + 1}/${length})`;
		const label = get(contentBlock.components, 'name', '').toLowerCase();

		return (
			<Accordion isOpen={isAccordionOpen}>
				<AccordionTitle>{accordionTitle}</AccordionTitle>
				<AccordionActions>
					<ButtonToolbar>
						<Button
							icon="edit"
							onClick={() => setIsAccordionOpen()}
							size="small"
							title="Bewerk content block"
							type="tertiary"
						/>
						<Button
							icon="delete"
							onClick={() => onRemove(index)}
							size="small"
							title="Verwijder content block"
							type="tertiary"
						/>
					</ButtonToolbar>
				</AccordionActions>
				<AccordionBody>
					{renderFormGroups(contentBlock.block.state.blockType, components, 'components')}
					{Array.isArray(components.state) &&
						components.state.length < get(components, 'limits.max') && (
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
						)}
					{renderFormGroups(contentBlock.block.state.blockType, block, 'block')}
				</AccordionBody>
			</Accordion>
		);
	};

	return <Form className="c-content-block-form">{renderBlockForm(config)}</Form>;
};

export default ContentBlockForm;
