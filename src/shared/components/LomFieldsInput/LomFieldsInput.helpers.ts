import { SelectOptionSchema } from '@viaa/avo2-components/dist/esm/components/Select/Select';
import { TagInfoSchema } from '@viaa/avo2-components/dist/esm/components/TagsInput/TagsInput';
import { Avo } from '@viaa/avo2-types';
import { capitalize } from 'lodash-es';

export const mapLomFieldsToOptions = (lomFields: Avo.Lom.LomField[]): SelectOptionSchema[] => {
	return (lomFields || []).map(
		(lomField) =>
			({ value: lomField.id, label: capitalize(lomField.label) } as SelectOptionSchema)
	);
};

export const mapOptionsToLomFields = (options: TagInfoSchema[]): Avo.Lom.LomField[] => {
	return (options || []).map(
		(option) => ({ id: option.value, label: capitalize(option.label) } as Avo.Lom.LomField)
	);
};

export const mapLomsToLomFields = (loms: Avo.Lom.LomEntry[]): Avo.Lom.LomField[] => {
	return (loms || []).map(
		(lom) => ({ id: lom.id, label: capitalize(lom.label) } as Avo.Lom.LomField)
	);
};
