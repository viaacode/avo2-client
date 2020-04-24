import React, { FunctionComponent } from 'react';

import { createKey } from '../../../shared/helpers';
import {
	ContentBlockComponentState,
	ContentBlockField,
	ContentBlockMeta,
	ContentBlockState,
	ContentBlockStateType,
} from '../../../shared/types';
import { EDITOR_TYPES_MAP } from '../../content-block.const';

import { generateFieldAttributes } from '../../helpers/field-attributes';

import { FieldRepeater } from '../FieldRepeater/FieldRepeater';

interface ContentBlockFieldProps {
	block: ContentBlockMeta; // Block metadata
	fieldKey: keyof ContentBlockComponentState | keyof ContentBlockState;
	field: ContentBlockField; // Field options
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

const ContentBlockFieldEditor: FunctionComponent<ContentBlockFieldProps> = ({
	block,
	fieldKey,
	formGroupIndex,
	field,
	type,
	state,
	stateIndex,
	handleChange,
}) => {
	const { index } = block;
	const EditorComponent = EDITOR_TYPES_MAP[field.editorType];
	const editorId = createKey('editor', index, formGroupIndex, stateIndex);
	const defaultProps = {
		...field.editorProps,
		editorId,
		name: editorId,
	};

	if (field.repeat) {
		return (
			<FieldRepeater
				fieldKey={fieldKey}
				field={field}
				state={(state as any)[fieldKey]}
				EditorComponent={EditorComponent}
				handleChange={handleChange}
				type={type}
				stateIndex={stateIndex}
			/>
		);
	}

	const editorProps: any = generateFieldAttributes(
		field,
		(value: any) => handleChange(type, fieldKey, value, stateIndex),
		(state as any)[fieldKey],
		editorId
	);

	return <EditorComponent {...defaultProps} {...editorProps} />;
};

export default React.memo(ContentBlockFieldEditor);
