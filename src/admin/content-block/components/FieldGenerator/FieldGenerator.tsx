import React, { Fragment, FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Flex, FlexItem, FormGroup, Spacer } from '@viaa/avo2-components';

import {
	ContentBlockComponentState,
	ContentBlockField,
	ContentBlockState,
	ContentBlockStateType,
} from '../../../shared/types';
import { EDITOR_TYPES_MAP } from '../../content-block.const';
import { generateFieldAttributes } from '../../helpers/field-attributes';
import { FieldGroup } from '../FieldGroup/FieldGroup';

interface FieldGeneratorProps {
	fieldKey: keyof ContentBlockComponentState | keyof ContentBlockState;
	fieldId: string;
	field: ContentBlockField;
	stateIndex?: number; // Index of state object (within state array).
	state: any;
	type: ContentBlockStateType; // State type
	handleChange: any;
}

export const FieldGenerator: FunctionComponent<FieldGeneratorProps> = ({
	fieldKey,
	fieldId,
	field,
	stateIndex,
	state,
	type,
	handleChange,
}) => {
	const [t] = useTranslation();

	const renderAddButton = (stateCopy: any, label: string) => {
		const handleFieldAdd = () => {
			const newState = [...stateCopy];

			newState.push('');

			handleChange(type, fieldKey, newState, stateIndex);
		};

		return (
			<Button
				icon="add"
				onClick={handleFieldAdd}
				size="small"
				title={label}
				ariaLabel={label}
				type="secondary"
			/>
		);
	};

	const renderDeleteButton = (stateCopy: any, index?: number) => {
		const handleFieldDelete = (index: any) => {
			const newState = [...stateCopy];

			newState.splice(index, 1);

			handleChange(type, fieldKey, newState, stateIndex);
		};

		return (
			<Button
				icon="delete"
				onClick={() => handleFieldDelete(index)}
				size="small"
				title={t('Verwijder veld')}
				ariaLabel={t('Verwijder veld')}
				type="danger"
			/>
		);
	};

	const generateFields = (fieldInstance: any, currentState: any) => {
		switch (fieldInstance.type) {
			case 'fieldGroup':
				// REPEATED FIELDGROUP
				const renderFieldGroup = (singleState: any, singleStateIndex: number = 0) => (
					<Spacer key={`${fieldInstance.label}-${singleStateIndex}`} margin="top-large">
						<Flex>
							<FlexItem>{`${fieldInstance.label} ${singleStateIndex + 1}`}</FlexItem>
							<FlexItem shrink>
								{currentState.length >
									((fieldInstance as any).min !== null
										? (fieldInstance as any).min
										: 1) && renderDeleteButton(currentState, singleStateIndex)}
							</FlexItem>
						</Flex>
						<FieldGroup
							globalState={currentState}
							globalStateIndex={stateIndex || 0}
							fieldKey={fieldKey}
							fieldGroup={fieldInstance}
							fieldGroupState={singleState}
							fieldGroupStateIndex={singleStateIndex}
							type={type}
							handleChange={handleChange}
						/>
					</Spacer>
				);

				if (field.repeat) {
					return (
						<>
							{currentState.map(
								(fieldGroupState: any, fieldGroupStateIndex: number) =>
									renderFieldGroup(fieldGroupState, fieldGroupStateIndex)
							)}
							{currentState.length < ((fieldInstance as any).max || 0) && (
								<Spacer margin="top">
									<Flex center>
										{renderAddButton(
											currentState,
											`Voeg ${(fieldInstance as any).label.toLowerCase()} toe`
										)}
									</Flex>
								</Spacer>
							)}
						</>
					);
				}

				// FIELDGROUP
				return (
					<Fragment key={stateIndex}>
						{renderFieldGroup(currentState, stateIndex)}
						{currentState.length < ((fieldInstance as any).max || 0) && (
							<Spacer margin="top">
								<Flex center>
									{renderAddButton(
										currentState,
										`Voeg ${(fieldInstance as any).label.toLowerCase()} toe`
									)}
								</Flex>
							</Spacer>
						)}
					</Fragment>
				);
			case 'field':
			default:
				const EditorComponent = EDITOR_TYPES_MAP[field.editorType];

				const handleStateChange = (index: any, value: any) => {
					const newState = [...currentState];

					newState[index] = value;

					handleChange(type, fieldKey, newState, stateIndex);
				};

				// REPEATED FIELD
				if (field.repeat) {
					return (
						<>
							{currentState.map((innerState: any, index: number) => {
								const editorProps: any = generateFieldAttributes(
									field,
									(value: any) => handleStateChange(index, value),
									innerState as any,
									`${fieldKey}-${index}`
								);

								return (
									<Spacer margin="top" key={`${fieldKey}-${index}`}>
										<Flex justify="between" center orientation="vertical">
											<FlexItem>
												<FormGroup label={`${field.label} ${index + 1}`}>
													<Spacer margin="top-small">
														<EditorComponent {...editorProps} />
													</Spacer>
												</FormGroup>
											</FlexItem>
											{currentState.length > 1 && (
												<Spacer margin="left">
													{renderDeleteButton(currentState, index)}
												</Spacer>
											)}
										</Flex>
									</Spacer>
								);
							})}
							<Spacer margin="top">
								<Flex center>{renderAddButton(currentState, 'Voeg veld toe')}</Flex>
							</Spacer>
						</>
					);
				}

				// FIELD
				const defaultProps = {
					...field.editorProps,
					editorId: fieldId,
					name: fieldId,
				};

				const editorProps: any = generateFieldAttributes(
					field,
					(value: any) => handleChange(type, fieldKey, value, stateIndex),
					(state as any)[fieldKey],
					fieldId
				);

				return <EditorComponent {...defaultProps} {...editorProps} />;
		}
	};

	return <>{generateFields(field, state[fieldKey])}</>;
};
