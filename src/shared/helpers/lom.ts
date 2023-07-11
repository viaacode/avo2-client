import type { Avo } from '@viaa/avo2-types';
import { LomSchemeType, LomType } from '@viaa/avo2-types';
import { filter, groupBy, isNil, map } from 'lodash-es';

import { LomFieldsByScheme } from '../types/lom';

export const groupLoms = (loms: Avo.Lom.LomField[]): LomFieldsByScheme => {
	const groupedLoms = groupBy(loms, (lom) => lom?.scheme);

	return {
		educationLevel: filter(groupedLoms[LomSchemeType.structure], (lom) => !isNil(lom?.broader)),
		subject: (groupedLoms[LomSchemeType.subject] as Avo.Lom.LomField[]) || [],
		theme: (groupedLoms[LomSchemeType.theme] as Avo.Lom.LomField[]) || [],
		context: filter(groupedLoms[LomSchemeType.structure], { broader: null }),
	} as LomFieldsByScheme;
};

export const getGroupedLomsKeyValue = (
	loms: Avo.Lom.Lom[],
	lomKey: string
): Record<LomType, string[]> => {
	return Object.fromEntries(
		Object.entries(groupLoms(map(loms, 'lom'))).map(([key, value]) => [key, map(value, lomKey)])
	) as Record<LomType, string[]>;
};
