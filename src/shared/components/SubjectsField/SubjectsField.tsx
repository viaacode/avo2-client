import { FormGroup, type TagInfo, TagsInput } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { compact } from 'lodash-es';
import React, { type FC } from 'react';

import { lomToTagInfo } from '../../helpers/string-to-select-options';
import { tText } from '../../helpers/translate-text';
import { useLomSubjects } from '../../hooks/useLomSubjects';

interface SubjectsFieldProps {
	onChange?: (values: TagInfo[]) => void;
	value: string[] | null; // id of lom field (collections, assignments, profiles) or string label (videos and audio)
}

export const SubjectsField: FC<SubjectsFieldProps> = ({ onChange, value }) => {
	const [subjects] = useLomSubjects();

	return (
		<FormGroup
			label={tText('collection/views/collection-edit-meta-data___vakken')}
			labelFor="subjectsId"
		>
			<TagsInput
				options={subjects.map(lomToTagInfo)}
				value={compact(
					(value || []).map((stringValue): Avo.Lom.LomField | undefined =>
						subjects.find(
							(subject) =>
								subject.label.toLowerCase() === stringValue ||
								subject.id === stringValue
						)
					)
				).map(lomToTagInfo)}
				onChange={onChange}
			/>
		</FormGroup>
	);
};
