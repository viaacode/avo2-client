import React, { FunctionComponent } from 'react';

import { createKey } from '../../../shared/helpers';
import {
	ContentBlockComponentState,
	ContentBlockField,
	ContentBlockFieldGroup,
	ContentBlockMeta,
	ContentBlockState,
	ContentBlockStateType,
} from '../../../shared/types';
import { FieldGenerator } from '../FieldGenerator/FieldGenerator';

interface ContentBlockFieldProps {
	block: ContentBlockMeta; // Block metadata
	fieldKey: keyof ContentBlockComponentState | keyof ContentBlockState;
	fieldOrFieldGroup: ContentBlockField | ContentBlockFieldGroup; // Field options
	type: ContentBlockStateType; // State type
	state: ContentBlockComponentState | ContentBlockState; // State object (within state array).
	formGroupIndex?: number; // Index of form group.
	stateIndex?: number; // Index of state object (within state array).
	handleChange: (
		formGroupType: ContentBlockStateType,
		fieldKey: keyof ContentBlockComponentState | keyof ContentBlockState,
		value: any,
		stateIndex?: number
	) => void;
}

const ContentBlockFields: FunctionComponent<ContentBlockFieldProps> = ({
	block,
	fieldKey,
	fieldOrFieldGroup,
	stateIndex,
	state,
	formGroupIndex,
	type,
	handleChange,
}) => {
	// Generate field id
	const { index } = block;
	const fieldId = createKey('editor', index, formGroupIndex, stateIndex);

	// Generate fields

	console.log('rendering ContentBlockFields: ', state);
	return (
		<FieldGenerator
			fieldKey={fieldKey}
			fieldId={fieldId}
			fieldOrFieldGroup={fieldOrFieldGroup}
			stateIndex={stateIndex}
			state={state}
			type={type}
			handleChange={handleChange}
		/>
	);
};

export default React.memo(ContentBlockFields);
