import { debounce, get, isArray, isNil } from 'lodash-es';

import { SelectOption } from '@viaa/avo2-components';

import { ContentBlockEditor, ContentBlockField, PickerItem } from '../../shared/types';

export const generateFieldAttributes = (
	field: ContentBlockField,
	onChange: any,
	value: any,
	id: string
) => {
	switch (field.editorType) {
		case ContentBlockEditor.TextInput:
			return {
				value,
				onChange: debounce((value: any) => onChange(value), 150, { leading: true }),
			};
		case ContentBlockEditor.ContentPicker:
			return {
				onSelect: (picked: PickerItem) => {
					onChange({ value: picked });
				},
				initialValue: get(value, 'value'),
			};
		case ContentBlockEditor.DatePicker:
			return {
				onChange: (date: any) => onChange(date.toISOString()),
				value: value ? new Date(value) : null,
			};
		case ContentBlockEditor.IconPicker:
		case ContentBlockEditor.ColorSelect:
			return {
				onChange: (option: SelectOption<string>) => onChange(get(option, 'value', '')),
				value: field.editorProps.options.find(
					(opt: SelectOption<string>) => opt.value === value
				),
			};
		case ContentBlockEditor.WYSIWYG:
			return {
				id,
				data: value,
				onChange: (value: any) => onChange(value),
			};
		case ContentBlockEditor.FileUpload:
			const urlOrUrls: string[] | undefined = value;
			return {
				// If the component wants a single value, take the first image from the array, otherwise pass the array
				onChange: (value: null | undefined | string[]) =>
					onChange(field.editorProps.allowMulti || !value ? value : value[0]),
				urls: Array.isArray(urlOrUrls) ? urlOrUrls : isNil(urlOrUrls) ? [] : [urlOrUrls],
			};
		case ContentBlockEditor.MultiRange:
			const num = value;
			return {
				onChange: (value: any) => {
					onChange(isArray(value) ? value[0] || 0 : value);
				},
				values: [num || 0], // TODO default to min value of input field instead of 0
			};
		case ContentBlockEditor.Checkbox:
			return {
				onChange: (value: any) => onChange(value),
				checked: value,
			};
		case ContentBlockEditor.TextArea:
		case ContentBlockEditor.UserGroupSelect:
			return {
				onChange: (value: any) => onChange(value),
				values: value,
			};
		default:
			return {
				value,
				onChange: (value: any) => {
					onChange(value);
				},
			};
	}
};
