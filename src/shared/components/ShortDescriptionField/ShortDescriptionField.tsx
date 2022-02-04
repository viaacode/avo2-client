import { StringMap } from 'i18next';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { FormGroup, TextArea } from '@viaa/avo2-components';
import { FormGroupPropsSchema } from '@viaa/avo2-components/dist/esm/components/Form/FormGroup/FormGroup';

import { MAX_SEARCH_DESCRIPTION_LENGTH } from '../../../collection/collection.const';
import { getValidationFeedbackForDescription } from '../../../collection/collection.helpers';

interface ShortDescriptionFieldProps extends Pick<FormGroupPropsSchema, 'error'> {
	onChange: (value: string) => void;
	value: string | null;
}

const ShortDescriptionField: FunctionComponent<ShortDescriptionFieldProps> = ({
	onChange,
	value,
}) => {
	const [t] = useTranslation();

	const error = (isError?: boolean): string =>
		getValidationFeedbackForDescription(
			value || '',
			MAX_SEARCH_DESCRIPTION_LENGTH,
			(count) =>
				t('collection/collection___de-korte-omschrijving-is-te-lang-count', {
					count,
				} as StringMap),
			isError
		);

	return (
		<FormGroup
			label={t('collection/views/collection-edit-meta-data___korte-omschrijving')}
			labelFor="shortDescriptionId"
			error={error(true)}
		>
			<TextArea
				name="shortDescriptionId"
				value={value || ''}
				id="shortDescriptionId"
				height="medium"
				placeholder={t(
					'collection/components/collection-or-bundle-edit-meta-data___short-description-placeholder'
				)}
				onChange={onChange}
			/>
			<label>{error(false)}</label>
		</FormGroup>
	);
};

export default ShortDescriptionField;
