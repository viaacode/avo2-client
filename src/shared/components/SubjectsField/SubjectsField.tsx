import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FormGroup, TagInfo, TagsInput } from '@viaa/avo2-components';

import { SettingsService } from '../../../settings/settings.service';
import { CustomError } from '../../helpers';
import { stringToTagInfo } from '../../helpers/string-to-select-options';

interface SubjectsFieldProps {
	onChange?: (values: TagInfo[]) => void;
	value: string[] | null;
}

const SubjectsField: FunctionComponent<SubjectsFieldProps> = ({ onChange, value }) => {
	const [t] = useTranslation();

	const [subjects, setSubjects] = useState<TagInfo[]>([]);

	useEffect(() => {
		SettingsService.fetchSubjects()
			.then((levels: string[]) => {
				setSubjects(levels.map(stringToTagInfo));
			})
			.catch((err) => {
				console.error(new CustomError('Failed to get subjects from the database', err));
			});
	}, [setSubjects]);

	return (
		<FormGroup
			label={t('collection/views/collection-edit-meta-data___vakken')}
			labelFor="subjectsId"
		>
			<TagsInput
				options={subjects}
				value={(value || []).map(stringToTagInfo)}
				onChange={onChange}
			/>
		</FormGroup>
	);
};

export default SubjectsField;