import { FormGroup, type TagInfo, TagsInput } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { compact } from 'lodash-es';
import React, { type FunctionComponent } from 'react';

import useTranslation from '../../../shared/hooks/useTranslation';
import { lomToTagInfo } from '../../helpers/string-to-select-options';
import { useLomEducationLevels } from '../../hooks/useLomEducationLevels';

interface EducationLevelsFieldProps {
	onChange?: (values: TagInfo[]) => void;
	value: string[] | null; // id of lom field (collections, assignments, profiles) or string label (videos and audio)
}

const EducationLevelsField: FunctionComponent<EducationLevelsFieldProps> = ({
	onChange,
	value,
}) => {
	const { tText } = useTranslation();

	const [educationLevels] = useLomEducationLevels();

	return (
		<FormGroup
			label={tText('collection/views/collection-edit-meta-data___onderwijsniveau')}
			labelFor="classificationId"
		>
			<TagsInput
				options={educationLevels.map(lomToTagInfo)}
				value={compact(
					(value || []).map((stringValue): Avo.Lom.LomField | undefined =>
						educationLevels.find(
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

export default EducationLevelsField;
