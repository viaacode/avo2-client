import { type ReactNode } from 'react';

import { EducationLevelId } from '../../shared/helpers/lom';
import { tHtml } from '../../shared/helpers/translate';

export const EducationLevelDict: Partial<Record<EducationLevelId, ReactNode>> = {
	[EducationLevelId.lagerOnderwijs]: tHtml(
		'assignment/views/assignment-detail___lager-onderwijs'
	),
	[EducationLevelId.secundairOnderwijs]: tHtml(
		'assignment/views/assignment-detail___secundair-onderwijs'
	),
};

export const EducationLevelTooltipDict: Partial<Record<EducationLevelId, ReactNode>> = {
	[EducationLevelId.lagerOnderwijs]: tHtml(
		'assignment/views/assignment-detail___lager-onderwijs-tooltip'
	),
	[EducationLevelId.secundairOnderwijs]: tHtml(
		'assignment/views/assignment-detail___secundair-onderwijs-tooltip'
	),
};
