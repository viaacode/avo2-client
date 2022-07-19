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
import React, { FC, ReactNode, useEffect, useState } from 'react';

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
	buttons?: ReactNode;
	buttonsLabel?: string;
	preview?: () => ReactNode;
}

export const CustomiseItemFormIds = {
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

	/**
	 * We keep track of a tempDescription here so we can trigger onChange events onBlur, which improved typing performance
	 * Ideally we would like to move away from the braft rich text editor and use something like: https://github.com/ianstormtaylor/slate
	 */
	const [tempDescription, setTempDescription] = useState<RichEditorState | undefined>();

	const getId = (key: string | number) => `${id}--${key}`;

	// See WYSIWYGInternal.tsx:162
	useEffect(() => {
		setTempDescription(undefined);
	}, [description?.initialHtml]);

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
								value={title?.value}
								onChange={title?.onChange}
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
							<WYSIWYGWrapper
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
