import { type RichEditorState } from '@meemoo/react-components';
import {
	type DefaultProps,
	Form,
	FormGroup,
	TextInput,
	type TextInputProps,
	Toggle,
	type ToggleProps,
} from '@viaa/avo2-components';
import React, { type FC, type ReactNode, useEffect, useState } from 'react';

import { type LabeledFormField } from '../../types';
import {
	RichTextEditorWrapper,
	type RichTextEditorWrapperProps,
} from '../RichTextEditorWrapper/RichTextEditorWrapper';

import './CustomiseItemForm.scss';

export type CustomiseItemFormToggleField = LabeledFormField & ToggleProps;
export type CustomiseItemFormTitleField = LabeledFormField & TextInputProps;
export type CustomiseItemFormDescriptionField = LabeledFormField & RichTextEditorWrapperProps;

interface CustomiseItemFormProps extends DefaultProps {
	children?: ReactNode;
	id: string | number;
	toggle?: CustomiseItemFormToggleField;
	title?: CustomiseItemFormTitleField;
	description?: CustomiseItemFormDescriptionField;
	buttons?: ReactNode;
	buttonsLabel?: string;
	preview?: () => ReactNode;
}

const CustomiseItemFormIds = {
	toggle: 'c-customise-item-form__toggle',
	title: 'c-customise-item-form__title',
	description: 'c-customise-item-form__description',
	buttons: 'c-customise-item-form__switch',
};

export const CustomiseItemForm: FC<CustomiseItemFormProps> = ({
	title,
	description,
	id,
	toggle,
	buttons,
	buttonsLabel,
	preview,
	style,
	className,
	children,
}) => {
	const wrapperClasses = [
		'c-customise-item-form',
		...(preview ? ['c-customise-item-form--has-preview'] : []),
		...(className ? [className] : []),
	];

	const getId = (key: string | number) => `${id}--${key}`;

	/**
	 * We keep track of temp fields here, so we can trigger onChange events onBlur, which improves perceived performance
	 * Ideally we would like to move away from the braft rich text editor causing this lag and use something like:
	 * https://github.com/ianstormtaylor/slate
	 */
	const [tempTitle, setTempTitle] = useState<string | undefined>();
	const [tempDescription, setTempDescription] = useState<RichEditorState | undefined>();

	/**
	 * Synchronise the temp fields with incoming values
	 */

	// See RichTextEditorInternal.tsx:162
	useEffect(() => {
		setTempDescription(undefined);
	}, [description?.initialHtml]);

	useEffect(() => {
		setTempTitle(title?.value);
	}, [title?.value]);

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
							<Toggle {...toggle} id={getId(CustomiseItemFormIds.toggle)} />

							{toggle.help && <p className="c-form-help-text">{toggle.help}</p>}
						</FormGroup>
					)}

					{buttons && (
						<FormGroup
							label={buttonsLabel}
							labelFor={getId(CustomiseItemFormIds.buttons)}
						>
							{buttons}
						</FormGroup>
					)}

					{title && (
						<FormGroup label={title.label} labelFor={getId(CustomiseItemFormIds.title)}>
							<TextInput
								{...title}
								value={tempTitle}
								onChange={setTempTitle}
								onBlur={() => title?.onChange?.(tempTitle || '')}
								id={getId(CustomiseItemFormIds.title)}
							/>

							{title.help && <p className="c-form-help-text">{title.help}</p>}
						</FormGroup>
					)}

					{/* Arbitrary position, allows rendering of metadata in https://www.figma.com/file/CLxhzRtPtdHVIlY11TicxF/Zoek-%26-Bouw?node-id=5%3A162 */}
					{children}

					{description && (
						<FormGroup
							label={description.label}
							labelFor={getId(CustomiseItemFormIds.description)}
						>
							<RichTextEditorWrapper
								{...description}
								state={tempDescription}
								onChange={setTempDescription}
								onBlur={() =>
									description?.onChange?.(tempDescription as RichEditorState)
								}
								id={getId(CustomiseItemFormIds.description)}
							/>

							{description.help && (
								<p className="c-form-help-text">{description.help}</p>
							)}
						</FormGroup>
					)}
				</Form>
			</div>
		</div>
	);
};
