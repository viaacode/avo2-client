import React, { FunctionComponent } from 'react';

import { FormGroup, Spacer } from '@viaa/avo2-components';

import { createKey } from '../../../shared/helpers/create-key';
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
				key: createKey('e', blockIndex, formGroupIndex, stateIndex),
				label: formGroup.fields[key].label,
			};

			return (
				<Spacer margin="bottom">
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
							formGroupIndex={formGroupIndex}
							stateIndex={stateIndex}
							handleChange={handleChange}
						/>
					</FormGroup>
				</Spacer>
			);
		})}
	</>
);
