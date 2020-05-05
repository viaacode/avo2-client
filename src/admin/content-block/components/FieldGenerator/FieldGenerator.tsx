import React, { FunctionComponent, Fragment } from 'react';
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
				const handleFieldGroupStateChange = (
					stateCopy: any,
					key: string,
					index: any,
					value: any
				) => {
					const newState = [...stateCopy];

					newState[index] = {
						...newState[index],
						[key]: value,
					};

					handleChange(type, fieldKey, newState, stateIndex);
				};

				if (field.repeat) {
					return (
						<>
							{currentState.map((singleState: any, singleStateIndex: number) => {
								return (
									<Fragment key={singleStateIndex}>
										<span>{`${fieldInstance.label} ${singleStateIndex +
											1}`}</span>
										{Object.entries((field as any).fields).map(
											(innerState: any, innerStateIndex: number) => {
												// generateFields(innerField)
												const editorProps: any = {
													...innerState[1].editorProps,
													...generateFieldAttributes(
														innerState[1],
														(value: any) =>
															handleFieldGroupStateChange(
																currentState,
																innerState[0],
																singleStateIndex,
																value
															),
														singleState[innerState[0]] as any,
														`${fieldKey}-${innerState[0]}-${innerStateIndex}`
													),
												};

												const EditorComponents = (EDITOR_TYPES_MAP as any)[
													innerState[1].editorType
												];

												return (
													<Spacer
														margin="top"
														key={`${fieldKey}-${innerState[0]}-${innerStateIndex}`}
													>
														<FormGroup label={`${innerState[1].label}`}>
															<Spacer margin="top-small">
																<EditorComponents
																	{...editorProps}
																/>
															</Spacer>
														</FormGroup>
													</Spacer>
												);
											}
										)}
										{currentState.length >
											((fieldInstance as any).min !== null
												? (fieldInstance as any).min
												: 1) && (
											<Spacer margin="top">
												<Flex center>
													{renderDeleteButton(
														currentState,
														singleStateIndex
													)}
												</Flex>
											</Spacer>
										)}
									</Fragment>
								);
							})}
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
						<span>{`${fieldInstance.label} ${stateIndex || 0 + 1}`}</span>
						{Object.entries((field as any).fields).map(
							(innerState: any, innerStateIndex: number) => {
								// generateFields(innerField)
								const editorProps: any = {
									...innerState[1].editorProps,
									...generateFieldAttributes(
										innerState[1],
										(value: any) =>
											handleFieldGroupStateChange(
												currentState,
												innerState[0],
												stateIndex,
												value
											),
										currentState[innerState[0]] as any,
										`${fieldKey}-${innerState[0]}-${innerStateIndex}`
									),
								};

								const EditorComponents = (EDITOR_TYPES_MAP as any)[
									innerState[1].editorType
								];

								return (
									<Spacer
										margin="top"
										key={`${fieldKey}-${innerState[0]}-${innerStateIndex}`}
									>
										<FormGroup label={`${innerState[1].label}`}>
											<Spacer margin="top-small">
												<EditorComponents {...editorProps} />
											</Spacer>
										</FormGroup>
									</Spacer>
								);
							}
						)}
						{currentState.length >
							((fieldInstance as any).min !== null
								? (fieldInstance as any).min
								: 1) && (
							<Spacer margin="top">
								<Flex center>{renderDeleteButton(currentState, stateIndex)}</Flex>
							</Spacer>
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
