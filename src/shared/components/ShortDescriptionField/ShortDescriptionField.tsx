import { FormGroup, type FormGroupProps, TextArea } from '@viaa/avo2-components';
import { StringMap } from 'i18next';
import React, { FunctionComponent } from 'react';

import { MAX_SEARCH_DESCRIPTION_LENGTH } from '../../../collection/collection.const';
import { getValidationFeedbackForDescription } from '../../../collection/collection.helpers';
import useTranslation from '../../../shared/hooks/useTranslation';

interface ShortDescriptionFieldProps extends Pick<FormGroupProps, 'error'> {
	onChange: (value: string) => void;
	value: string | null;
	placeholder?: string;
}

const ShortDescriptionField: FunctionComponent<ShortDescriptionFieldProps> = ({
	onChange,
	value,
	placeholder,
}) => {
	const { tText } = useTranslation();

	const error = (isError?: boolean): string =>
		getValidationFeedbackForDescription(
			value || '',
			MAX_SEARCH_DESCRIPTION_LENGTH,
			(count) =>
				tText('collection/collection___de-korte-omschrijving-is-te-lang-count', {
					count,
				} as StringMap),
			isError
		);

	return (
		<FormGroup
			label={tText('collection/views/collection-edit-meta-data___korte-omschrijving')}
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
			/>
			<label>{error(false)}</label>
		</FormGroup>
	);
};

export default ShortDescriptionField;
