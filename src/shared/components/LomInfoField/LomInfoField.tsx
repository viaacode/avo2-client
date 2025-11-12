import { Spacer } from '@viaa/avo2-components'
import React, { type FC, type ReactNode } from 'react'

import { type SearchFilter } from '../../../search/search.const.js'
import { type FilterState } from '../../../search/search.types.js'
import { renderSearchLinks } from '../../helpers/link.js'

type LomInfoFieldProps = {
  id: string
  label: string
  lomLabels: string[] | null
  searchFilterType: SearchFilter
  renderSearchLink: (
    linkText: string | ReactNode,
    newFilters: FilterState,
    className?: string,
  ) => ReactNode
}

export const LomInfoField: FC<LomInfoFieldProps> = ({
  id,
  label,
  lomLabels,
  searchFilterType,
  renderSearchLink,
}) => {
  return (
    <Spacer margin="top-large">
      <p className="u-text-bold">{label}</p>

      <p className="c-body-1">
        {lomLabels && lomLabels.length ? (
          renderSearchLinks(
            renderSearchLink,
            id,
            searchFilterType,
            lomLabels?.sort(),
          )
        ) : (
          <span className="u-d-block">-</span>
        )}
      </p>
    </Spacer>
  )
}
