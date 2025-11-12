import { type PaginationBarProps } from '@meemoo/react-components'
import { Icon, IconName } from '@viaa/avo2-components'
import React from 'react'

import { tText } from '../../../../shared/helpers/translate-text.js'

export function GET_DEFAULT_PAGINATION_BAR_PROPS(): Pick<
  PaginationBarProps,
  | 'itemsPerPage'
  | 'previousLabel'
  | 'previousIcon'
  | 'nextLabel'
  | 'nextIcon'
  | 'firstLabel'
  | 'firstIcon'
  | 'lastLabel'
  | 'lastIcon'
  | 'backToTopLabel'
  | 'backToTopIcon'
  | 'labelBetweenPageStartAndEnd'
  | 'labelBetweenPageEndAndTotal'
  | 'showButtonLabels'
  | 'showFirstAndLastButtons'
  | 'showBackToTop'
> {
  return {
    itemsPerPage: 20,
    previousLabel: tText(
      'shared/components/filter-table/filter-table___vorige',
    ),
    previousIcon: <Icon name={IconName.chevronLeft} />,
    nextLabel: tText('shared/components/filter-table/filter-table___volgende'),
    nextIcon: <Icon name={IconName.chevronRight} />,
    firstLabel: tText(
      'admin/shared/components/filter-table/filter-table___eerste',
    ),
    firstIcon: <Icon name={IconName.chevronsLeft} />,
    lastLabel: tText(
      'admin/shared/components/filter-table/filter-table___laatste',
    ),
    lastIcon: <Icon name={IconName.chevronsRight} />,
    backToTopLabel: tText(
      'shared/components/filter-table/filter-table___terug-naar-boven',
    ),
    backToTopIcon: <Icon name={IconName.chevronsUp} />,
    labelBetweenPageStartAndEnd: tText(
      'modules/shared/components/filter-table/filter-table___label-between-start-and-end-page-in-pagination-bar',
    ),
    labelBetweenPageEndAndTotal: tText(
      'modules/shared/components/filter-table/filter-table___label-between-end-page-and-total-in-pagination-bar',
    ),
    showButtonLabels: false,
    showFirstAndLastButtons: true,
    showBackToTop: true,
  }
}
