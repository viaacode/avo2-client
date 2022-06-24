import React, { FC, ReactNode, useEffect, useState } from 'react';

import {
	DefaultProps,
	Form,
	FormGroup,
	TextInput,
	TextInputProps,
	Toggle,
	ToggleProps,
} from '@viaa/avo2-components';
import { RichEditorState } from '@viaa/avo2-components/dist/esm/wysiwyg';

import { LabeledFormField } from '../../types';
import WYSIWYGWrapper, { WYSIWYGWrapperProps } from '../WYSIWYGWrapper/WYSIWYGWrapper';

import './CustomiseItemForm.scss';

export type CustomiseItemFormToggleField = LabeledFormField & ToggleProps;
export type CustomiseItemFormTitleField = LabeledFormField & TextInputProps;
export type CustomiseItemFormDescriptionField = LabeledFormField & WYSIWYGWrapperProps;

export interface CustomiseItemFormProps extends DefaultProps {
	id: string | number;
	toggle?: CustomiseItemFormToggleField;
	title?: CustomiseItemFormTitleField;
	description?: CustomiseItemFormDescriptionField;
	preview?: () => ReactNode;
}

export const CustomiseItemFormIds = {
	toggle: 'c-customise-item-form__toggle',
	title: 'c-customise-item-form__title',
	description: 'c-customise-item-form__description',
};

export const CustomiseItemForm: FC<CustomiseItemFormProps> = (props) => {
	const { id, toggle, preview, style, className } = props;

	const titleValue = props.title?.value;
	const descriptionInitialHtml = props.description?.initialHtml;

	const wrapperClasses = [
		'c-customise-item-form',
		...(!!preview ? ['c-customise-item-form--has-preview'] : []),
		...(!!className ? [className] : []),
	];

	const [description, setDescription] = useState<RichEditorState | undefined>();
	const [title, setTitle] = useState<string | undefined>();

	const getId = (key: string | number) => `${id}--${key}`;

	// Reflect changes to local state
	useEffect(() => {
		setTitle(titleValue);
	}, [titleValue]);

	// See WYSIWYGInternal.tsx:162
	useEffect(() => {
		setDescription(undefined);
	}, [descriptionInitialHtml]);

	return (
		<div className={wrapperClasses.join(' ')} style={style}>
			{preview && <div className="c-customise-item-form__preview">{preview()}</div>}

			<div className="c-customise-item-form__fields">
				<Form>
					{toggle && (
						<FormGroup
							label={toggle.label}
							labelFor={getId(CustomiseItemFormIds.toggle)}
						>
							<Toggle {...toggle} id={getId(CustomiseItemFormIds.toggle)}></Toggle>
						</FormGroup>
					)}

					{props.title && (
						<FormGroup
							label={props.title.label}
							labelFor={getId(CustomiseItemFormIds.title)}
						>
							<TextInput
								{...props.title}
								value={title}
								onChange={setTitle}
								onBlur={() => props.title?.onChange?.(title as string)}
								id={getId(CustomiseItemFormIds.title)}
							/>
						</FormGroup>
					)}

					{props.description && (
						<FormGroup
							label={props.description.label}
							labelFor={getId(CustomiseItemFormIds.description)}
						>
							<WYSIWYGWrapper
								{...props.description}
								state={description}
								onChange={setDescription}
								onBlur={() =>
									props.description?.onChange?.(description as RichEditorState)
								}
								id={getId(CustomiseItemFormIds.description)}
							></WYSIWYGWrapper>
						</FormGroup>
					)}
				</Form>
			</div>
		</div>
	);
};
