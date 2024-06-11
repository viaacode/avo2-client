import { type Avo } from '@viaa/avo2-types';
import { filter, map, sortBy } from 'lodash';

import { groupLoms } from './lom';

export const getBottomLoms = (loms: Avo.Lom.LomField[]) => {
	// Group loms to split the incoming loms in levels and degrees
	const groupedLoms = groupLoms(loms);
	const parentIdsOfDegrees = map(groupedLoms.educationDegree, 'broader');
	// Filter out the education levels which have a child education degree
	const childlessLevels = filter(
		groupedLoms.educationLevel,
		(level) => !parentIdsOfDegrees.includes(level.id)
	);

	return sortBy([...groupedLoms.educationDegree, ...childlessLevels], (lom) =>
		lom.label.toLocaleLowerCase()
	);
};
