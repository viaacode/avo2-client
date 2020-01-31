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
	Column,
	Form,
	Grid,
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
	config: ContentBlockConfig;
	blockIndex: number;
	isAccordionOpen: boolean;
	length: number;
	onChange: (formGroupType: ContentBlockStateType, input: any, stateIndex?: number) => void;
	onRemove: (configIndex: number) => void;
	onReorder: (configIndex: number, indexUpdate: number) => void;
	setIsAccordionOpen: () => void;
	addComponentToState: () => void;
	removeComponentFromState: (stateIndex: number) => void;
}

const ContentBlockForm: FunctionComponent<ContentBlockFormProps> = ({
	config,
	blockIndex,
	isAccordionOpen,
	length,
	onChange,
	onRemove,
	onReorder,
	setIsAccordionOpen,
	addComponentToState,
	removeComponentFromState,
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

	const renderRemoveButton = (stateIndex: number) => {
		const aboveMin =
			isArray(components.state) && components.state.length > get(components, 'limits.min', 1);

		return (
			removeComponentFromState &&
			aboveMin && (
				<Column className="u-flex-align-end" size="static">
					<Button
						icon="delete"
						type="danger"
						onClick={() => removeComponentFromState(stateIndex)}
					/>
				</Column>
			)
		);
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
		return (
			<Spacer margin="top-small">
				{isArray(formGroup.state) ? (
					formGroup.state.map((formGroupState, stateIndex) => (
						<Spacer key={stateIndex} margin="bottom-small">
							<Grid>
								<Column size="flex">
									<ContentBlockFormGroup
										key={stateIndex}
										{...formGroupOptions}
										formGroupState={formGroupState}
										stateIndex={stateIndex}
									/>
								</Column>
								{renderRemoveButton(stateIndex)}
							</Grid>
						</Spacer>
					))
				) : (
					<ContentBlockFormGroup {...formGroupOptions} formGroupState={formGroup.state} />
				)}
			</Spacer>
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
		const accordionTitle = `${contentBlock.name} (${blockIndex + 1}/${length})`;
		const label = get(contentBlock.components, 'name', '').toLowerCase();
		const underLimit =
			isArray(components.state) && components.state.length < get(components, 'limits.max');

		return (
			<Accordion isOpen={isAccordionOpen}>
				<AccordionTitle>{accordionTitle}</AccordionTitle>
				<AccordionActions>
					<ButtonToolbar>
						<Button
							disabled={blockIndex === 0}
							icon="chevron-up"
							onClick={() => onReorder(blockIndex, -1)}
							size="small"
							title="Verplaats naar boven"
							type="tertiary"
						/>
						<Button
							disabled={blockIndex + 1 === length}
							icon="chevron-down"
							onClick={() => onReorder(blockIndex, 1)}
							size="small"
							title="Verplaats naar onder"
							type="tertiary"
						/>
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
							onClick={() => onRemove(blockIndex)}
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
					{underLimit && renderAddButton(label)}
					{renderFormGroups(block, 'block')}
				</AccordionBody>
			</Accordion>
		);
	};

	return <Form className="c-content-block-form">{renderBlockForm(config)}</Form>;
};

export default ContentBlockForm;
