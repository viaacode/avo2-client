import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Flex, FlexItem, FormGroup, Spacer } from '@viaa/avo2-components';

import {
	ContentBlockComponentState,
	ContentBlockField,
	ContentBlockState,
	ContentBlockStateType,
} from '../../../shared/types';

import { generateFieldAttributes } from '../../helpers/field-attributes';

interface FieldRepeaterProps {
	field: ContentBlockField;
	state: any;
	fieldKey: keyof ContentBlockComponentState | keyof ContentBlockState;
	EditorComponent: any;
	handleChange: any;
	type: ContentBlockStateType; // State type
	stateIndex?: number; // Index of state object (within state array).
}

export const FieldRepeater: FunctionComponent<FieldRepeaterProps> = ({
	field,
	state,
	fieldKey,
	EditorComponent,
	handleChange,
	type,
	stateIndex,
}) => {
	const [t] = useTranslation();

	const handleStateChange = (index: any, value: any) => {
		const newState = [...state];

		newState[index] = value;

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

	return (
		<>
			{state.map((innerState: any, index: number) => {
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
