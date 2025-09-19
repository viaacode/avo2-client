import { FormGroup, type TagInfo, TagsInput } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { compact } from 'lodash-es';
import React, { type FC } from 'react';

import { useTranslation } from '../../../shared/hooks/useTranslation';
import { lomToTagInfo } from '../../helpers/string-to-select-options';
import { useLomEducationLevelsAndDegrees } from '../../hooks/useLomEducationLevelsAndDegrees';

interface EducationLevelsFieldProps {
	onChange?: (values: TagInfo[]) => void;
	value: string[] | null; // id of lom field (collections, assignments, profiles) or string label (videos and audio)
}

export const EducationLevelsField: FC<EducationLevelsFieldProps> = ({ onChange, value }) => {
	const { tText } = useTranslation();

	const { data: educationLevelsAndDegrees } = useLomEducationLevelsAndDegrees();

	return (
		<FormGroup
			label={tText('collection/views/collection-edit-meta-data___onderwijsniveau')}
			labelFor="classificationId"
		>
			<TagsInput
				options={(educationLevelsAndDegrees || []).map(lomToTagInfo)}
				value={compact(
					(value || []).map((stringValue): Avo.Lom.LomField | undefined =>
						(educationLevelsAndDegrees || []).find(
							(educationLevel) =>
								educationLevel.label.toLowerCase() === stringValue ||
								educationLevel.id === stringValue
						)
					)
				).map(lomToTagInfo)}
				onChange={onChange}
			/>
		</FormGroup>
	);
};
