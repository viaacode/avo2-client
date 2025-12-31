import { type ReactNode } from 'react';

import { EducationLevelId } from '../../../helpers/lom';
import { tHtml } from '../../../helpers/translate-html';

export const GET_EDUCATION_LEVEL_DICT: () => Partial<
  Record<EducationLevelId, ReactNode>
> = () => ({
  [EducationLevelId.lagerOnderwijs]: tHtml(
    'shared/components/block-list/blocks/assignment-block-type-search___lager-onderwijs',
  ),
  [EducationLevelId.secundairOnderwijs]: tHtml(
    'shared/components/block-list/blocks/assignment-block-type-search___secundair-onderwijs',
  ),
});

export const GET_EDUCATION_LEVEL_TOOLTIP_DICT: () => Partial<
  Record<EducationLevelId, ReactNode>
> = () => ({
  [EducationLevelId.lagerOnderwijs]: tHtml(
    'shared/components/block-list/blocks/assignment-block-type-search___lager-onderwijs-tooltip',
  ),
  [EducationLevelId.secundairOnderwijs]: tHtml(
    'shared/components/block-list/blocks/assignment-block-type-search___secundair-onderwijs-tooltip',
  ),
});
