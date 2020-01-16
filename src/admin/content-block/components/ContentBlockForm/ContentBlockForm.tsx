import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Accordion,
	AccordionActions,
	AccordionBody,
	AccordionTitle,
	Button,
	ButtonToolbar,
	Form,
	Spacer,
} from '@viaa/avo2-components';

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
	addComponentToState: () => void;
	config: ContentBlockConfig;
	index: number;
	isAccordionOpen: boolean;
	length: number;
	onChange: (formGroupType: ContentBlockStateType, input: any, stateIndex?: number) => void;
	onRemove: (configIndex: number) => void;
	onReorder: (configIndex: number, indexUpdate: number) => void;
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
	onReorder,
	setIsAccordionOpen,
}) => {
	const { components, block } = config;
	const { isArray } = Array;

	// Hooks
	const [formErrors, setFormErrors] = useState<ContentBlockFormError>({});

	const [t] = useTranslation();

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
			formGroup,
			formGroupType,
			handleChange,
			formErrors,
		};

		// Render each state individually in a ContentBlockFormGroup
		return isArray(formGroup.state) ? (
			formGroup.state.map((formGroupState, stateIndex = 0) => (
				<ContentBlockFormGroup
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
				label={t(
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
		const accordionTitle = `${contentBlock.name} (${index + 1}/${length})`;
		const label = get(contentBlock.components, 'name', '').toLowerCase();
		const notAtMax =
			isArray(components.state) && components.state.length < get(components, 'limits.max');

		return (
			<Accordion isOpen={isAccordionOpen}>
				<AccordionTitle>{accordionTitle}</AccordionTitle>
				<AccordionActions>
					<ButtonToolbar>
						{index > 0 && (
							<Button
								icon="chevron-up"
								onClick={() => onReorder(index, -1)}
								size="small"
								title="Verplaats naar boven"
								type="tertiary"
							/>
						)}
						{index + 1 < length && (
							<Button
								icon="chevron-down"
								onClick={() => onReorder(index, 1)}
								size="small"
								title="Verplaats naar onder"
								type="tertiary"
							/>
						)}
						<Button
							icon="edit"
							onClick={setIsAccordionOpen}
							size="small"
							title={t(
								'admin/content-block/components/content-block-form/content-block-form___bewerk-content-block'
							)}
							type="tertiary"
						/>
						<Button
							icon="delete"
							onClick={() => onRemove(index)}
							size="small"
							title={t(
								'admin/content-block/components/content-block-form/content-block-form___verwijder-content-block'
							)}
							type="tertiary"
						/>
					</ButtonToolbar>
				</AccordionActions>
				<AccordionBody>
					{renderFormGroups(components, 'components')}
					{notAtMax && renderAddButton(label)}
					{renderFormGroups(block, 'block')}
				</AccordionBody>
			</Accordion>
		);
	};

	return <Form className="c-content-block-form">{renderBlockForm(config)}</Form>;
};

export default ContentBlockForm;
