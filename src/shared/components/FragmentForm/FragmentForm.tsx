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

import WYSIWYGWrapper, { WYSIWYGWrapperProps } from '../WYSIWYGWrapper/WYSIWYGWrapper';

import './FragmentForm.scss';

export interface FragmentFormField {
	label?: string;
}

export type FragmentFormToggleField = FragmentFormField & ToggleProps;
export type FragmentFormTitleField = FragmentFormField & TextInputProps;
export type FragmentFormDescriptionField = FragmentFormField & WYSIWYGWrapperProps;

export interface FragmentFormProps extends DefaultProps {
	id: string | number;
	toggle?: FragmentFormToggleField;
	title?: FragmentFormTitleField;
	description?: FragmentFormDescriptionField;
	preview?: () => ReactNode;
}

export const FragmentFormIds = {
	toggle: 'c-fragment-form__toggle',
	title: 'c-fragment-form__title',
	description: 'c-fragment-form__description',
};

export const FragmentForm: FC<FragmentFormProps> = (props) => {
	const { id, toggle, preview, style, className } = props;

	const titleValue = props.title?.value;
	const descriptionDisabled = props.description?.disabled;
	const descriptionInitialHtml = props.description?.initialHtml;
	const wrapperClasses = [
		'c-fragment-form',
		...(!!preview ? ['c-fragment-form--has-preview'] : []),
		...(!!className ? [className] : []),
	];

	const [description, setDescription] = useState<RichEditorState | undefined>();
	const [title, setTitle] = useState<string | undefined>();

	const getId = (key: string | number) => `${id}--${key}`;

	useEffect(() => {
		setTitle(titleValue);
	}, [titleValue]);

	useEffect(() => {
		if (descriptionDisabled) {
			descriptionInitialHtml &&
				setDescription(() => ({ toHTML: () => descriptionInitialHtml }));
		} else {
			setDescription(undefined);
		}

		console.info(descriptionDisabled, descriptionInitialHtml);
	}, [descriptionDisabled, descriptionInitialHtml]);

	return (
		<div className={wrapperClasses.join(' ')} style={style}>
			{preview && <div className="c-fragment-form__preview">{preview()}</div>}

			<div className="c-fragment-form__fields">
				<Form>
					{toggle && (
						<FormGroup label={toggle.label} labelFor={getId(FragmentFormIds.toggle)}>
							<Toggle {...toggle} id={getId(FragmentFormIds.toggle)}></Toggle>
						</FormGroup>
					)}

					{props.title && (
						<FormGroup
							label={props.title.label}
							labelFor={getId(FragmentFormIds.title)}
						>
							<TextInput
								{...props.title}
								value={title}
								onChange={setTitle}
								onBlur={() => props.title?.onChange?.(title as string)}
								id={getId(FragmentFormIds.title)}
							/>
						</FormGroup>
					)}

					{props.description && (
						<FormGroup
							label={props.description.label}
							labelFor={getId(FragmentFormIds.description)}
						>
							<WYSIWYGWrapper
								{...props.description}
								state={description}
								onChange={setDescription}
								onBlur={() =>
									props.description?.onChange?.(description as RichEditorState)
								}
								id={getId(FragmentFormIds.description)}
							></WYSIWYGWrapper>
						</FormGroup>
					)}
				</Form>
			</div>
		</div>
	);
};
