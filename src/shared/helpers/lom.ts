import { Avo, LomSchemeType } from '@viaa/avo2-types';
import { filter, groupBy, isNil } from 'lodash-es';

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