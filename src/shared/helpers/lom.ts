import type { Avo } from '@viaa/avo2-types';
import { LomSchemeType, LomType } from '@viaa/avo2-types';
import { compact, groupBy, map } from 'lodash-es';

import { LomFieldsByScheme, LomsByScheme } from '../types/lom';

const EDUCATION_LEVEL_IDS = [
	'https://w3id.org/onderwijs-vlaanderen/id/structuur/kleuteronderwijs',
	'https://w3id.org/onderwijs-vlaanderen/id/structuur/lager-onderwijs',
	'https://w3id.org/onderwijs-vlaanderen/id/structuur/deeltijds-kunstonderwijs',
	'https://w3id.org/onderwijs-vlaanderen/id/structuur/secundair-onderwijs',
	'https://w3id.org/onderwijs-vlaanderen/id/structuur/hoger-onderwijs',
	'https://w3id.org/onderwijs-vlaanderen/id/structuur/volwassenenonderwijs ',
];

export const groupLoms = (loms: Avo.Lom.LomField[]): LomFieldsByScheme => {
	const groupedLoms = groupBy(loms, (lom) => lom?.scheme);

	return {
		educationLevel: (groupedLoms[LomSchemeType.structure] || []).filter((lom) =>
			EDUCATION_LEVEL_IDS.includes(lom.id)
		),
		educationDegree: (groupedLoms[LomSchemeType.structure] || []).filter(
			(lom) => !EDUCATION_LEVEL_IDS.includes(lom.id)
		),
		subject: (groupedLoms[LomSchemeType.subject] as Avo.Lom.LomField[]) || [],
		theme: (groupedLoms[LomSchemeType.theme] as Avo.Lom.LomField[]) || [],
	};
};

export const groupLomLinks = (lomLinks: Avo.Lom.Lom[]): LomsByScheme => {
	const groupedLoms = groupBy(lomLinks, (lom) => lom?.lom?.scheme);

	return {
		educationLevel: (groupedLoms[LomSchemeType.structure] || []).filter(
			(lom) => lom.lom?.id && EDUCATION_LEVEL_IDS.includes(lom.lom?.id)
		),
		educationDegree: (groupedLoms[LomSchemeType.structure] || []).filter(
			(lom) => lom.lom?.id && !EDUCATION_LEVEL_IDS.includes(lom.lom?.id)
		),
		subject: groupedLoms[LomSchemeType.subject] || [],
		theme: groupedLoms[LomSchemeType.theme] || [],
	};
};

export const getGroupedLomsKeyValue = (
	loms: Avo.Lom.Lom[],
	lomKey: string
): Record<LomType, string[]> => {
	return Object.fromEntries(
		Object.entries(groupLoms(compact(map(loms, 'lom')))).map(([key, value]) => [
			key,
			map(value, lomKey),
		])
	) as Record<LomType, string[]>;
};
