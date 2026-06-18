import {
  type DefaultProps,
  Form,
  FormGroup,
  TextInput,
  type TextInputProps,
} from '@viaa/avo2-components';
import { type FC, useEffect, useState } from 'react';

import {
  RichTextEditorWrapper,
  type RichTextEditorWrapperProps,
} from '../RichTextEditorWrapper/RichTextEditorWrapper';

interface TitleDescriptionFormField {
  label?: string;
}

export type TitleDescriptionFormTitleField = TitleDescriptionFormField &
  TextInputProps;
export type TitleDescriptionFormDescriptionField = TitleDescriptionFormField &
  RichTextEditorWrapperProps;

interface TitleDescriptionFormProps extends DefaultProps {
  id: string | number;
  title?: TitleDescriptionFormTitleField;
  description?: TitleDescriptionFormDescriptionField;
}

const TitleDescriptionFormIds = {
  title: 'c-title-description-form__title',
  description: 'c-title-description-form__description',
};

export const TitleDescriptionForm: FC<TitleDescriptionFormProps> = (props) => {
  const { id, style, className } = props;

  const titleValue = props.title?.value;
  const descriptionValue = props.description?.value;

  const wrapperClasses = [
    'c-title-description-form',
    ...(className ? [className] : []),
  ];

  const [description, setDescription] = useState<string | undefined>();
  const [title, setTitle] = useState<string | undefined>();

  const getId = (key: string | number) => `${id}--${key}`;

  // Reflect changes to local state
  useEffect(() => {
    setTitle(titleValue);
  }, [titleValue]);

  useEffect(() => {
    setDescription(undefined);
  }, [descriptionValue]);

  return (
    <Form className={wrapperClasses.join(' ')} style={style}>
      {props.title && (
        <FormGroup
          label={props.title.label}
          labelFor={getId(TitleDescriptionFormIds.title)}
        >
          <TextInput
            {...props.title}
            value={title}
            onChange={setTitle}
            onBlur={() => props.title?.onChange?.(title as string)}
            id={getId(TitleDescriptionFormIds.title)}
          />
        </FormGroup>
      )}

      {props.description && (
        <FormGroup
          label={props.description.label}
          labelFor={getId(TitleDescriptionFormIds.description)}
        >
          <RichTextEditorWrapper
            {...props.description}
            value={description ?? (props.description.value ?? '')}
            onChange={setDescription}
            onBlur={() => props.description?.onChange?.(description || '')}
            id={getId(TitleDescriptionFormIds.description)}
          />
        </FormGroup>
      )}
    </Form>
  );
};
