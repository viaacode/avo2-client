import React, { FunctionComponent } from 'react';
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

interface RepeaterProps {
	field: ContentBlockField;
	state: any;
	fieldType: 'field' | 'fieldGroup';
	fieldKey: keyof ContentBlockComponentState | keyof ContentBlockState;
	EditorComponent: any;
	handleChange: any;
	type: ContentBlockStateType; // State type
	stateIndex?: number; // Index of state object (within state array).
}

export const Repeater: FunctionComponent<RepeaterProps> = ({
	field,
	state,
	fieldKey,
	EditorComponent,
	handleChange,
	fieldType,
	stateIndex,
	type,
}) => {
	const [t] = useTranslation();

	const handleStateChange = (index: any, value: any) => {
		const newState = [...state];

		newState[index] = value;

		// console.log(newState);
		handleChange(type, fieldKey, newState, stateIndex);
	};

	const handleFieldDelete = (index: any) => {
		const newState = [...state];

		newState.splice(index, 1);

		handleChange(type, fieldKey, newState, stateIndex);
	};

	const handleFieldAdd = () => {
		const newState = [...state];

		newState.push('');

		handleChange(type, fieldKey, newState, stateIndex);
	};

	const handleFieldGroupStateChange = (key: string, index: any, value: any) => {
		const newState = [...state];

		newState[index] = {
			...newState[index],
			[key]: value,
		};

		handleChange(type, fieldKey, newState, stateIndex);
	};

	if (fieldType === 'fieldGroup') {
		return (
			<>
				{state.map((innerState: any, stateIndex: any) => {
					return (
						<>
							<span>{`${field.label} ${stateIndex + 1}`}</span>
							{Object.entries((field as any).fields).map((inner: any, index) => {
								const editorProps: any = {
									...inner[1].editorProps,
									...generateFieldAttributes(
										inner[1],
										(value: any) =>
											handleFieldGroupStateChange(
												inner[0],
												stateIndex,
												value
											),
										innerState[inner[0]] as any,
										`${fieldKey}-${inner[0]}-${index}`
									),
								};

								const EditorComponents = (EDITOR_TYPES_MAP as any)[
									inner[1].editorType
								];

								return (
									<Spacer margin="top" key={`${fieldKey}-${inner[0]}-${index}`}>
										<FormGroup label={`${inner[1].label}`}>
											<Spacer margin="top-small">
												<EditorComponents {...editorProps} />
											</Spacer>
										</FormGroup>
									</Spacer>
								);
							})}
							{state.length >
								((field as any).min !== null ? (field as any).min : 1) && (
								<Spacer margin="top">
									<Flex center>
										<Button
											icon="delete"
											onClick={() => handleFieldDelete(stateIndex)}
											size="small"
											title={t('Verwijder veld')}
											ariaLabel={t('Verwijder veld')}
											type="danger"
											label={`Verwijder ${(field as any).label.toLowerCase()}`}
										/>
									</Flex>
								</Spacer>
							)}
						</>
					);
				})}
				{state.length < ((field as any).max || 0) && (
					<Spacer margin="top">
						<Flex center>
							<Button
								icon="add"
								onClick={handleFieldAdd}
								size="small"
								title={t('Voeg veld toe')}
								ariaLabel={t('Voeg veld toe')}
								type="secondary"
								label={`Voeg ${(field as any).label.toLowerCase()} toe`}
							/>
						</Flex>
					</Spacer>
				)}
			</>
		);
	}

	return (
		<>
			{state.map((innerState: any, index: number) => {
				const editorProps: any = generateFieldAttributes(
					field,
					(value: any) => handleStateChange(index, value),
					innerState as any,
					`${fieldKey}-${index}`
				);

				console.log(editorProps);

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
							{state.length > 1 && (
								<Spacer margin="left">
									<Button
										icon="delete"
										onClick={() => handleFieldDelete(index)}
										size="small"
										title={t('Verwijder veld')}
										ariaLabel={t('Verwijder veld')}
										type="danger"
									/>
								</Spacer>
							)}
						</Flex>
					</Spacer>
				);
			})}
			<Spacer margin="top">
				<Flex center>
					<Button
						icon="add"
						onClick={handleFieldAdd}
						size="small"
						title={t('Voeg veld toe')}
						ariaLabel={t('Voeg veld toe')}
						type="secondary"
					/>
				</Flex>
			</Spacer>
		</>
	);
};
