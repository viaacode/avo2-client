import React, { FunctionComponent } from 'react';

import { FormGroup, Spacer } from '@viaa/avo2-components';

import {
	ContentBlockComponentState,
	ContentBlockFieldGroup,
	ContentBlockState,
	ContentBlockStateType,
} from '../../../shared/types';
import { EDITOR_TYPES_MAP } from '../../content-block.const';
import { generateFieldAttributes } from '../../helpers/field-attributes';

interface FieldGroupProps {
	globalState: any;
	globalStateIndex: number;
	fieldKey: keyof ContentBlockComponentState | keyof ContentBlockState;
	fieldGroup: ContentBlockFieldGroup;
	fieldGroupState: any;
	fieldGroupStateIndex: number;
	type: ContentBlockStateType; // State type
	handleChange: any;
}

export const FieldGroup: FunctionComponent<FieldGroupProps> = ({
	globalState,
	globalStateIndex,
	fieldKey,
	fieldGroup,
	fieldGroupState,
	fieldGroupStateIndex,
	type,
	handleChange,
}) => {
	const { fields } = fieldGroup;

	const handleFieldGroupStateChange = (stateCopy: any, key: string, index: any, value: any) => {
		const newState = [...stateCopy];

		newState[index] = {
			...newState[index],
			[key]: value,
		};

		handleChange(type, fieldKey, newState, globalStateIndex);
	};

	return (
		<>
			{Object.entries(fields).map((fieldState: any, fieldIndex: number) => {
				const editorProps: any = {
					...fieldState[1].editorProps,
					...generateFieldAttributes(
						fieldState[1],
						(value: any, key?: string) =>
							handleFieldGroupStateChange(
								globalState,
								key || fieldState[0],
								fieldGroupStateIndex,
								value
							),
						fieldGroupState[fieldState[0]] as any,
						`${fieldKey}-${fieldState[0]}-${fieldIndex}`,
						fieldState[0],
						fieldGroupState
					),
				};

				const EditorComponents = (EDITOR_TYPES_MAP as any)[fieldState[1].editorType];

				console.log('field group: ', editorProps);
				return (
					<Spacer margin="top" key={`${fieldKey}-${fieldState[0]}-${fieldIndex}`}>
						<FormGroup label={`${fieldState[1].label}`}>
							<Spacer margin="top-small">
								<EditorComponents {...editorProps} />
							</Spacer>
						</FormGroup>
					</Spacer>
				);
			})}
		</>
	);
};
