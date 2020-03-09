import { debounce, get, isArray, isNil } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import { SelectOption } from '@viaa/avo2-components';

import { createKey } from '../../../shared/helpers';
import {
	ContentBlockComponentState,
	ContentBlockEditor,
	ContentBlockField,
	ContentBlockMeta,
	ContentBlockState,
	ContentBlockStateType,
	PickerItem,
} from '../../../shared/types';

import { EDITOR_TYPES_MAP } from '../../content-block.const';

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
	let editorProps;

	switch (field.editorType) {
		case ContentBlockEditor.ContentPicker:
			editorProps = {
				onSelect: (picked: PickerItem) => {
					handleChange(type, fieldKey, { value: picked }, stateIndex);
				},
				currentSelection: get(state as any, 'buttonAction'),
			};
			break;
		case ContentBlockEditor.IconPicker:
		case ContentBlockEditor.ColorSelect:
			editorProps = {
				onChange: (option: SelectOption) =>
					handleChange(type, fieldKey, get(option, 'value', ''), stateIndex),
				value: defaultProps.options.find(
					(opt: SelectOption) => opt.value === (state as any)[fieldKey]
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
		case ContentBlockEditor.FileUpload:
			const urlOrUrls: string[] | undefined = (state as any)[fieldKey];
			editorProps = {
				// If the component wants a single value, take the first image from the array, otherwise pass the array
				onChange: (value: null | undefined | string[]) =>
					handleChange(
						type,
						fieldKey,
						field.editorProps.allowMulti || !value ? value : value[0],
						stateIndex
					),
				urls: Array.isArray(urlOrUrls) ? urlOrUrls : isNil(urlOrUrls) ? [] : [urlOrUrls],
			};
			break;
		case ContentBlockEditor.MultiRange:
			const num = (state as any)[fieldKey];
			editorProps = {
				onChange: (value: any) => {
					handleChange(
						type,
						fieldKey,
						isArray(value) ? value[0] || 0 : value,
						stateIndex
					);
				},
				values: [num || 0], // TODO default to min value of input field instead of 0
			};
			break;
		case ContentBlockEditor.Checkbox:
			editorProps = {
				onChange: (value: any) => handleChange(type, fieldKey, value, stateIndex),
				checked: (state as any)[fieldKey],
			};
			break;
		case ContentBlockEditor.TextArea:
		case ContentBlockEditor.TextInput:
			editorProps = {
				onChange: debounce(
					(value: any) => handleChange(type, fieldKey, value, stateIndex),
					150,
					{ leading: true }
				),
				value: (state as any)[fieldKey],
			};
			break;
		default:
			editorProps = {
				onChange: (value: any) => {
					handleChange(type, fieldKey, value, stateIndex);
				},
				value: (state as any)[fieldKey],
			};
			break;
	}

	return <EditorComponent {...defaultProps} {...editorProps} />;
};

export default React.memo(ContentBlockFieldEditor);
