import { SelectOptionSchema } from '@viaa/avo2-components/dist/esm/components/Select/Select';
import { TagInfoSchema } from '@viaa/avo2-components/dist/esm/components/TagsInput/TagsInput';
import type { Avo } from '@viaa/avo2-types';
import { LomFieldSchema } from '@viaa/avo2-types/types/lom';
import { capitalize, compact, isNil } from 'lodash-es';

export const mapLomFieldsToOptions = (lomFields: Avo.Lom.LomField[]): SelectOptionSchema[] => {
	return (lomFields || []).map(
		(lomField) =>
			({ value: lomField.id, label: capitalize(lomField.label) } as SelectOptionSchema)
	);
};

export const mapOptionsToLomFields = (
	options: TagInfoSchema[],
	originalLoms: Avo.Lom.LomField[]
): Avo.Lom.LomField[] => {
	return (options || []).map((option) => {
		return originalLoms.find((lom) => lom.id === option.value) as Avo.Lom.LomField;
	});
};

export const getParentEducationLevel = (
	loms: Avo.Lom.LomField[],
	allLoms: Avo.Lom.LomField[]
): LomFieldSchema[] => {
	return compact(
		loms.map((lom) => {
			if (isNil(lom.broader)) {
				return null;
			}

			let foundParent: Avo.Lom.LomField | undefined = (allLoms || []).find(
				(edu) => edu.id === lom.broader
			);

			while (!isNil(foundParent?.broader)) {
				foundParent = (allLoms || []).find((edu) => edu.id === foundParent?.broader);
			}

			return foundParent;
		})
	);
};
