import { Avo, LomSchemeTypeEnum } from '@viaa/avo2-types';
import { groupBy } from 'lodash-es';

export const groupLoms = (
	loms: { lom?: Avo.Lom.LomEntry }[]
): Partial<Record<LomSchemeTypeEnum, Avo.Lom.LomEntry[]>> => {
	return groupBy(
		(loms || []).map((lom) => lom.lom),
		(lom) => lom?.scheme
	);
};
