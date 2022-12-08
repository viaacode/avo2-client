import { FormGroup, TagInfo, TagsInput } from '@viaa/avo2-components';
import React, { FunctionComponent, useEffect, useState } from 'react';

import { SettingsService } from '../../../settings/settings.service';
import useTranslation from '../../../shared/hooks/useTranslation';
import { CustomError } from '../../helpers';
import { stringToTagInfo } from '../../helpers/string-to-select-options';

interface SubjectsFieldProps {
	onChange?: (values: TagInfo[]) => void;
	value: string[] | null;
}

const SubjectsField: FunctionComponent<SubjectsFieldProps> = ({ onChange, value }) => {
	const { tText } = useTranslation();

	const [subjects, setSubjects] = useState<TagInfo[]>([]);

	useEffect(() => {
		let fetch = true;

		SettingsService.fetchSubjects()
			.then((levels: string[]) => {
				fetch && setSubjects(levels.map(stringToTagInfo));
			})
			.catch((err) => {
				console.error(new CustomError('Failed to get subjects from the database', err));
			});

		return () => {
			fetch = false;
		};
	}, [setSubjects]);

	return (
		<FormGroup
			label={tText('collection/views/collection-edit-meta-data___vakken')}
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
