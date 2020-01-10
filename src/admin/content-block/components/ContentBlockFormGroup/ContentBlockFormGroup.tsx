import { get } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import { FormGroup } from '@viaa/avo2-components';

import {
	ContentBlockBlockConfig,
	ContentBlockComponentsConfig,
	ContentBlockComponentState,
	ContentBlockConfig,
	ContentBlockFormError,
	ContentBlockState,
	ContentBlockStateType,
} from '../../content-block.types';
import { createFieldEditorId, createFieldEditorLabel } from '../../helpers/field-editor';

import { ContentBlockFieldEditor } from '../ContentBlockFieldEditor/ContentBlockFieldEditor';

interface ContentBlockFormGroupProps {
	config: ContentBlockConfig;
	blockIndex: number;
	formGroup: ContentBlockComponentsConfig | ContentBlockBlockConfig;
	formGroupState: ContentBlockComponentState | ContentBlockState;
	formGroupType: ContentBlockStateType;
	stateIndex?: number;
	handleChange: (
		formGroupType: ContentBlockStateType,
		key: keyof ContentBlockComponentState | keyof ContentBlockState,
		value: any,
		stateIndex?: number
	) => void;
	formErrors: ContentBlockFormError;
}

export const ContentBlockFormGroup: FunctionComponent<ContentBlockFormGroupProps> = ({
	config,
	blockIndex,
	formGroup,
	formGroupState,
	formGroupType,
	stateIndex,
	handleChange,
	formErrors,
}) => (
	<>
		{Object.keys(formGroup.fields).map((key: string, formGroupIndex: number) => {
			const formGroupOptions = {
				key: createFieldEditorId(blockIndex, formGroupIndex, stateIndex),
				label: createFieldEditorLabel(
					get(config, 'components.name'),
					formGroup.fields[key].label,
					stateIndex
				),
			};

			return (
				<FormGroup
					{...formGroupOptions}
					error={formErrors[key as keyof ContentBlockComponentState | keyof ContentBlockState]}
				>
					<ContentBlockFieldEditor
						block={{ config, index: blockIndex }}
						fieldKey={key as keyof ContentBlockComponentState | keyof ContentBlockState}
						field={formGroup.fields[key]}
						state={formGroupState}
						type={formGroupType}
						stateIndex={stateIndex}
						handleChange={handleChange}
					/>
				</FormGroup>
			);
		})}
	</>
);
