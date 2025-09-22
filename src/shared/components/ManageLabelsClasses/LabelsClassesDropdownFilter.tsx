import { type Avo } from '@viaa/avo2-types';
import { compact } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useState } from 'react';

import useTranslation from '../../hooks/use-translation/use-translation';
import { LabelsClassesService } from '../../services/labels-classes';
import {
	CheckboxDropdownModal,
	type CheckboxOption,
} from '../CheckboxDropdownModal/CheckboxDropdownModal';

interface LabelsClassesDropdownFilterProps {
	type: Avo.LabelOrClass.Type;
	selectedLabelIds?: (string | null)[] | null;
	selectedClassLabelIds?: (string | null)[] | null;
	onChange: (selectedLabels: string[]) => void;
}

const LabelsClassesDropdownFilter: FC<LabelsClassesDropdownFilterProps> = ({
	type,
	selectedLabelIds,
	selectedClassLabelIds,
	onChange,
}) => {
	const { tText } = useTranslation();

	const [allLabels, setAllLabels] = useState<Avo.LabelOrClass.LabelOrClass[]>([]);

	const fetchLabels = useCallback(async () => {
		// Fetch all labels for the current user
		setAllLabels(await LabelsClassesService.getLabelsForProfile());
	}, [setAllLabels]);

	useEffect(() => {
		fetchLabels();
	}, [fetchLabels]);

	const getLabelOptions = (labelType: Avo.LabelOrClass.Type): CheckboxOption[] => {
		return compact(
			allLabels
				.filter((labelObj: Avo.LabelOrClass.LabelOrClass) => labelObj.type === labelType)
				.map((labelObj: Avo.LabelOrClass.LabelOrClass): CheckboxOption | null => {
					if (!labelObj.label) {
						return null;
					}
					return {
						label: labelObj.label,
						id: labelObj.id,
						checked: [
							...(selectedLabelIds || []),
							...(selectedClassLabelIds || []),
						].includes(labelObj.id),
					};
				})
		);
	};

	const checkboxLabel = type === 'LABEL' ? tText('Label filter') : tText('Klas filter');

	return (
		<CheckboxDropdownModal
			label={checkboxLabel}
			id="Klas"
			options={getLabelOptions(type)}
			onChange={onChange}
		/>
	);
};

export default LabelsClassesDropdownFilter as FC<LabelsClassesDropdownFilterProps>;
