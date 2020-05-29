import { get, isNumber } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import { FormGroup, Spacer } from '@viaa/avo2-components';

import { createKey } from '../../../shared/helpers';
import {
	ContentBlockBlockConfig,
	ContentBlockComponentsConfig,
	ContentBlockComponentState,
	ContentBlockConfig,
	ContentBlockState,
	ContentBlockStateType,
} from '../../../shared/types';
import ContentBlockFields from '../ContentBlockFields/ContentBlockFields';

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
}

const ContentBlockFormGroup: FunctionComponent<ContentBlockFormGroupProps> = ({
	config,
	blockIndex,
	formGroup,
	formGroupState,
	formGroupType,
	stateIndex,
	handleChange,
}) => (
	<div className="c-content-block-form-group">
		{Object.keys(formGroup.fields).map((key: string, formGroupIndex: number) => {
			let error: string[];
			const configErrors = config.errors || {};
			const stateKey = key as keyof ContentBlockComponentState | keyof ContentBlockState;
			const formErrorsForBlock = configErrors[stateKey];

			if (isNumber(stateIndex)) {
				error = get(formErrorsForBlock, [stateIndex]) as string[];
			} else {
				error = formErrorsForBlock as string[];
			}

			return (
				<Spacer
					key={createKey('form-group', blockIndex, formGroupIndex, stateIndex)}
					margin="bottom"
				>
					<FormGroup
						label={
							formGroup.fields[key].repeat ? undefined : formGroup.fields[key].label
						}
						error={error}
					>
						<ContentBlockFields
							block={{ config, index: blockIndex }}
							fieldKey={stateKey}
							fieldOrFieldGroup={formGroup.fields[key]}
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
	</div>
);

export default React.memo(ContentBlockFormGroup);
