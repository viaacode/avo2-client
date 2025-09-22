import { TagList, type TagOption } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { compact } from 'lodash-es';
import React, { type FC } from 'react';

import { useGetLabelsForProfile } from '../../hooks/useGetLabelsForProfile';

interface LabelsClassesDisplayProps {
	type: Avo.LabelOrClass.Type;
	selectedLabels: string[];
}

const LabelsClassesDisplay: FC<LabelsClassesDisplayProps> = ({ type, selectedLabels }) => {
	const { data: allLabels } = useGetLabelsForProfile(type);

	const getLabelOptions = (labelType: Avo.LabelOrClass.Type): TagOption[] => {
		return compact(
			(allLabels || [])
				.filter((labelObj: Avo.LabelOrClass.LabelOrClass) => labelObj.type === labelType)
				.filter((labelObj: Avo.LabelOrClass.LabelOrClass) =>
					selectedLabels.includes(labelObj.id)
				)
				.map((labelObj: Avo.LabelOrClass.LabelOrClass): TagOption | null => {
					if (!labelObj.label) {
						return null;
					}

					return {
						id: labelObj.id,
						label: labelObj.label || '',
						color: labelObj.color_override || labelObj.enum_color?.label || 'hotpink',
					};
				})
		);
	};

	if (selectedLabels.length === 0) {
		return '-';
	}

	return <TagList tags={getLabelOptions(type)} swatches closable={false} />;
};

export default LabelsClassesDisplay as FC<LabelsClassesDisplayProps>;
