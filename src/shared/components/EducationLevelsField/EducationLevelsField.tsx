import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FormGroup, TagInfo, TagsInput } from '@viaa/avo2-components';

import { SettingsService } from '../../../settings/settings.service';
import { CustomError } from '../../helpers';
import { stringToTagInfo } from '../../helpers/string-to-select-options';

interface EducationLevelsFieldProps {
	onChange?: (values: TagInfo[]) => void;
	value: string[] | null;
}

const EducationLevelsField: FunctionComponent<EducationLevelsFieldProps> = ({
	onChange,
	value,
}) => {
	const [t] = useTranslation();

	const [educationLevels, setEducationLevels] = useState<TagInfo[]>([]);

	useEffect(() => {
		SettingsService.fetchEducationLevels()
			.then((levels: string[]) => {
				setEducationLevels(levels.map(stringToTagInfo));
			})
			.catch((err) => {
				console.error(
					new CustomError('Failed to get education levels from the database', err)
				);
			});
	}, [setEducationLevels]);

	return (
		<FormGroup
			label={t('collection/views/collection-edit-meta-data___onderwijsniveau')}
			labelFor="classificationId"
		>
			<TagsInput
				options={educationLevels}
				value={(value || []).map(stringToTagInfo)}
				onChange={onChange}
			/>
		</FormGroup>
	);
};

export default EducationLevelsField;