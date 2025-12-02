import { FormGroup, type FormGroupProps, TextArea } from '@viaa/avo2-components'
import { type StringMap } from 'i18next'
import { type FC } from 'react'

import { MAX_SEARCH_DESCRIPTION_LENGTH } from '../../../collection/collection.const';
import { getValidationFeedbackForDescription } from '../../../collection/collection.helpers';
import { tText } from '../../helpers/translate-text';

interface ShortDescriptionFieldProps extends Pick<FormGroupProps, 'error'> {
  onChange: (value: string) => void
  value: string | null
  placeholder?: string
  onFocus?: () => void
}

export const ShortDescriptionField: FC<ShortDescriptionFieldProps> = ({
  onChange,
  value,
  placeholder,
  onFocus,
}) => {
  const error = (isError?: boolean): string =>
    getValidationFeedbackForDescription(
      value || '',
      MAX_SEARCH_DESCRIPTION_LENGTH,
      (count) =>
        tText(
          'collection/collection___de-korte-omschrijving-is-te-lang-count',
          {
            count,
          } as StringMap,
        ),
      isError,
    )

  return (
    <FormGroup
      label={tText(
        'collection/views/collection-edit-meta-data___korte-omschrijving',
      )}
      labelFor="shortDescriptionId"
      error={error(true)}
    >
      <TextArea
        name="shortDescriptionId"
        value={value || ''}
        id="shortDescriptionId"
        height="medium"
        placeholder={placeholder}
        onChange={onChange}
        onFocus={onFocus}
      />
      <label>{error(false)}</label>
    </FormGroup>
  )
}
