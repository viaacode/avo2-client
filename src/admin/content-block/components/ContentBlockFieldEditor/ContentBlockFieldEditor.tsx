import { get } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import { SelectOption } from '@viaa/avo2-components';

import { EDITOR_TYPES_MAP } from '../../content-block.const';
import {
	ContentBlockComponentState,
	ContentBlockEditor,
	ContentBlockField,
	ContentBlockMeta,
	ContentBlockState,
	ContentBlockStateType,
} from '../../content-block.types';

interface ContentBlockFieldProps {
	block: ContentBlockMeta;
	fieldKey: keyof ContentBlockComponentState | keyof ContentBlockState;
	field: ContentBlockField;
	type: ContentBlockStateType;
	state: ContentBlockComponentState | ContentBlockState;
	stateIndex?: number;
	handleChange: (
		formGroupType: ContentBlockStateType,
		fieldKey: keyof ContentBlockComponentState | keyof ContentBlockState,
		value: any,
		stateIndex?: number
	) => void;
}

export const ContentBlockFieldEditor: FunctionComponent<ContentBlockFieldProps> = ({
	block,
	fieldKey,
	field,
	type,
	state,
	stateIndex,
	handleChange,
}) => {
	const { index, config } = block;
	const EditorComponent = EDITOR_TYPES_MAP[field.editorType];
	const editorId = `${index}-${config.block.state.blockType}-${fieldKey}`;
	const defaultProps = {
		...field.editorProps,
		editorId,
		name: editorId,
	};
	let editorProps = {};

	switch (field.editorType) {
		case ContentBlockEditor.ColorSelect:
			editorProps = {
				onChange: (option: SelectOption) =>
					handleChange(type, fieldKey, get(option, 'value', ''), stateIndex),
				value: defaultProps.options.find(
					(opt: SelectOption) => opt.value === config.block.state.backgroundColor
				),
			};
			break;
		case ContentBlockEditor.WYSIWYG:
			editorProps = {
				id: editorId,
				data: (state as any)[fieldKey],
				onChange: (value: any) => handleChange(type, fieldKey, value, stateIndex),
			};
			break;
		default:
			editorProps = {
				onChange: (value: any) => handleChange(type, fieldKey, value, stateIndex),
				value: (state as any)[fieldKey],
			};
			break;
	}

	return <EditorComponent {...defaultProps} {...editorProps} />;
};
