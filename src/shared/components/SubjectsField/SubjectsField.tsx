import { FormGroup, TagInfo, TagsInput } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { compact } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import useTranslation from '../../../shared/hooks/useTranslation';
import { lomToTagInfo } from '../../helpers/string-to-select-options';
import { useLomSubjects } from '../../hooks/useLomSubjects';

interface SubjectsFieldProps {
	onChange?: (values: TagInfo[]) => void;
	value: string[] | null; // id of lom field (collections, assignments, profiles) or string label (videos and audio)
}

const SubjectsField: FunctionComponent<SubjectsFieldProps> = ({ onChange, value }) => {
	const { tText } = useTranslation();

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

export default SubjectsField;
