import { FormGroup, TextArea } from '@viaa/avo2-components';
import { FormGroupPropsSchema } from '@viaa/avo2-components/dist/esm/components/Form/FormGroup/FormGroup';
import { StringMap } from 'i18next';
import React, { FunctionComponent } from 'react';

import { MAX_SEARCH_DESCRIPTION_LENGTH } from '../../../collection/collection.const';
import { getValidationFeedbackForDescription } from '../../../collection/collection.helpers';
import useTranslation from '../../../shared/hooks/useTranslation';

interface ShortDescriptionFieldProps extends Pick<FormGroupPropsSchema, 'error'> {
	onChange: (value: string) => void;
	value: string | null;
}

const ShortDescriptionField: FunctionComponent<ShortDescriptionFieldProps> = ({
	onChange,
	value,
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
				placeholder={tText(
					'collection/components/collection-or-bundle-edit-meta-data___short-description-placeholder'
				)}
				onChange={onChange}
			/>
			<label>{error(false)}</label>
		</FormGroup>
	);
};

export default ShortDescriptionField;
