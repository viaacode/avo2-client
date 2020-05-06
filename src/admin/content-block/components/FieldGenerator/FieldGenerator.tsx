import React, { Fragment, FunctionComponent } from 'react';

import { Button, Flex, FlexItem, FormGroup, Spacer } from '@viaa/avo2-components';

import {
	ContentBlockComponentState,
	ContentBlockField,
	ContentBlockFieldGroup,
	ContentBlockState,
	ContentBlockStateType,
} from '../../../shared/types';
import { EDITOR_TYPES_MAP } from '../../content-block.const';
import { generateFieldAttributes } from '../../helpers/field-attributes';
import { FieldGroup } from '../FieldGroup/FieldGroup';

interface FieldGeneratorProps {
	fieldKey: keyof ContentBlockComponentState | keyof ContentBlockState;
	fieldId: string;
	fieldOrFieldGroup: ContentBlockField | ContentBlockFieldGroup;
	stateIndex?: number; // Index of state object (within state array).
	state: any;
	type: ContentBlockStateType; // State type
	handleChange: any;
}

export const FieldGenerator: FunctionComponent<FieldGeneratorProps> = ({
	fieldKey,
	fieldId,
	fieldOrFieldGroup,
	stateIndex,
	state,
	type,
	handleChange,
}) => {
	const renderAddButton = (stateCopy: any, label?: string) => {
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
				label={label}
				type="secondary"
			/>
		);
	};

	const renderDeleteButton = (stateCopy: any, label?: string, index?: number) => {
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
				title={label}
				ariaLabel={label}
				type="danger"
			/>
		);
	};

	const generateFields = (
		fieldOrFieldGroupInstance: ContentBlockField | ContentBlockFieldGroup,
		currentState: any = []
	) => {
		switch ((fieldOrFieldGroupInstance as any).type) {
			case 'fieldGroup':
				const fieldGroup: ContentBlockFieldGroup = fieldOrFieldGroupInstance as ContentBlockFieldGroup;

				if (!fieldGroup) {
				}

				// REPEATED FIELDGROUP
				const renderFieldGroups = (singleState: any, singleStateIndex: number = 0) => (
					<Spacer key={`${fieldGroup.label}-${singleStateIndex}`} margin="top-large">
						<Flex>
							<FlexItem>{`${fieldGroup.label} ${singleStateIndex + 1}`}</FlexItem>
							<FlexItem shrink>
								{currentState.length >
									(fieldGroup.min !== undefined ? fieldGroup.min : 1) &&
									renderDeleteButton(
										currentState,
										fieldGroup.repeatDeleteButtonLabel,
										singleStateIndex
									)}
							</FlexItem>
						</Flex>
						<FieldGroup
							globalState={currentState}
							globalStateIndex={stateIndex || 0}
							fieldKey={fieldKey}
							fieldGroup={fieldGroup}
							fieldGroupState={singleState}
							fieldGroupStateIndex={singleStateIndex}
							type={type}
							handleChange={handleChange}
						/>
					</Spacer>
				);

				if (fieldGroup.repeat) {
					return (
						<>
							{currentState.map(
								(fieldGroupState: any, fieldGroupStateIndex: number) =>
									renderFieldGroups(fieldGroupState, fieldGroupStateIndex)
							)}
							{currentState.length < (fieldGroup.max || 0) && (
								<Spacer margin="top">
									<Flex center>
										{renderAddButton(
											currentState,
											fieldGroup.repeatAddButtonLabel
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
						{renderFieldGroups(currentState, stateIndex)}
					</Fragment>
				);
			case 'field':
			default:
				const field: ContentBlockField = fieldOrFieldGroupInstance as ContentBlockField;
				const EditorComponent = (EDITOR_TYPES_MAP as any)[
					(field as ContentBlockField).editorType
				];

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
									field as ContentBlockField,
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
													{renderDeleteButton(
														currentState,
														(field as ContentBlockField)
															.repeatDeleteButtonLabel,
														index
													)}
												</Spacer>
											)}
										</Flex>
									</Spacer>
								);
							})}
							<Spacer margin="top">
								<Flex center>
									{renderAddButton(
										currentState,
										(field as ContentBlockField).repeatAddButtonLabel
									)}
								</Flex>
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

	return <>{generateFields(fieldOrFieldGroup, state[fieldKey])}</>;
};
