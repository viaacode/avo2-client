import { Avo, LomSchemeTypeEnum } from '@viaa/avo2-types';
import { filter, groupBy, isNil } from 'lodash-es';

import { LomFieldsByScheme } from '../types/lom';

export const groupLoms = (loms: Avo.Lom.LomField[]): LomFieldsByScheme => {
	const groupedLoms = groupBy(loms, (lom) => lom?.scheme);

	return {
		educationLevels: filter(
			groupedLoms[LomSchemeTypeEnum.structure],
			(lom) => !isNil(lom?.broader)
		),
		subjects: (groupedLoms[LomSchemeTypeEnum.subject] as Avo.Lom.LomField[]) || [],
		themes: (groupedLoms[LomSchemeTypeEnum.theme] as Avo.Lom.LomField[]) || [],
		contexts: filter(groupedLoms[LomSchemeTypeEnum.structure], { broader: null }),
	} as LomFieldsByScheme;
};
