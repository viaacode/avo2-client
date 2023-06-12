import { Avo, LomSchemeType } from '@viaa/avo2-types';
import { filter, groupBy, isNil } from 'lodash-es';

import { LomFieldsByScheme } from '../types/lom';

export const groupLoms = (loms: { lom?: Avo.Lom.LomField }[]): LomFieldsByScheme => {
	const groupedLoms = groupBy(
		(loms || []).map((lom) => lom.lom),
		(lom) => lom?.scheme
	);

	return {
		educationLevels: filter(
			groupedLoms[LomSchemeType.structure],
			(lom) => !isNil(lom?.broader)
		),
		subjects: (groupedLoms[LomSchemeType.subject] as Avo.Lom.LomField[]) || [],
		themes: (groupedLoms[LomSchemeType.theme] as Avo.Lom.LomField[]) || [],
		contexts: filter(groupedLoms[LomSchemeType.structure], { broader: null }),
	} as LomFieldsByScheme;
};
