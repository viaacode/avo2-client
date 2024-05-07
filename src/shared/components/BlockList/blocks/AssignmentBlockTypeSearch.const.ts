import { type ReactNode } from 'react';

import { EducationLevelId } from '../../../helpers/lom';
import { tHtml } from '../../../helpers/translate';

export const EducationLevelDict: Partial<Record<EducationLevelId, ReactNode>> = {
	[EducationLevelId.lagerOnderwijs]: tHtml(
		'shared/components/block-list/blocks/assignment-block-type-search___lager-onderwijs'
	),
	[EducationLevelId.secundairOnderwijs]: tHtml(
		'shared/components/block-list/blocks/assignment-block-type-search___secundair-onderwijs'
	),
};

export const EducationLevelTooltipDict: Partial<Record<EducationLevelId, ReactNode>> = {
	[EducationLevelId.lagerOnderwijs]: tHtml(
		'shared/components/block-list/blocks/assignment-block-type-search___lager-onderwijs-tooltip'
	),
	[EducationLevelId.secundairOnderwijs]: tHtml(
		'shared/components/block-list/blocks/assignment-block-type-search___secundair-onderwijs-tooltip'
	),
};
