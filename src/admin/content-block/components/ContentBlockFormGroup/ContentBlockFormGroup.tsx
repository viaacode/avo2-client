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

import { ContentBlockFieldEditor } from '../ContentBlockFieldEditor/ContentBlockFieldEditor';

interface ContentBlockFormGroupProps {
	config: ContentBlockConfig;
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
	formGroup,
	formGroupState,
	formGroupType,
	stateIndex,
	handleChange,
	formErrors,
}) => (
	<>
		{Object.keys(formGroup.fields).map((key: string, index: number) => (
			<FormGroup
				key={`${index}-${config.block.state.blockType}-${key}`}
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
		))}
	</>
);
