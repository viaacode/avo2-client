import React, { FC, ReactNode, useEffect, useState } from 'react';

import {
	Button,
	ButtonGroup,
	ButtonProps,
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
export type CustomiseItemFormButtonsField = LabeledFormField & { items: ButtonProps[] };

export interface CustomiseItemFormProps extends DefaultProps {
	id: string | number;
	toggle?: CustomiseItemFormToggleField;
	title?: CustomiseItemFormTitleField;
	description?: CustomiseItemFormDescriptionField;
	buttons?: CustomiseItemFormButtonsField;
	preview?: () => ReactNode;
}

export const CustomiseItemFormIds = {
	toggle: 'c-customise-item-form__toggle',
	title: 'c-customise-item-form__title',
	description: 'c-customise-item-form__description',
	buttons: 'c-customise-item-form__switch',
};

export const CustomiseItemForm: FC<CustomiseItemFormProps> = (props) => {
	const { id, toggle, buttons, preview, style, className, children } = props;

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

							{toggle.help && <p className="c-form-help-text">{toggle.help}</p>}
						</FormGroup>
					)}

					{buttons && (
						<FormGroup
							label={buttons.label}
							labelFor={getId(CustomiseItemFormIds.buttons)}
						>
							<ButtonGroup>
								{buttons.items.map((button) => {
									return <Button type="secondary" {...button} />;
								})}
							</ButtonGroup>

							{buttons.help && <p className="c-form-help-text">{buttons.help}</p>}
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

							{props.title.help && (
								<p className="c-form-help-text">{props.title.help}</p>
							)}
						</FormGroup>
					)}

					{/* Arbitrary position, allows rendering of meta data in https://www.figma.com/file/CLxhzRtPtdHVIlY11TicxF/Zoek-%26-Bouw?node-id=5%3A162 */}
					{children}

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

							{props.description.help && (
								<p className="c-form-help-text">{props.description.help}</p>
							)}
						</FormGroup>
					)}
				</Form>
			</div>
		</div>
	);
};
