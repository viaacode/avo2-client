import { Button } from '@viaa/avo2-components'
import React, { type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { type UrlUpdateType } from 'use-query-params'

import { APP_PATH } from '../../constants.js'
import { type FilterState } from '../../search/search.types.js'
import { buildLink } from '../../shared/helpers/build-link.js'
import { ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS } from '../assignment.const.js'
import { type PupilSearchFilterState } from '../assignment.types.js'

/**
 * Creates a link that navigates to the /search route
 * @param state
 * @param props
 * @param children
 */
export const buildGlobalSearchLink = (
  state: Partial<FilterState>,
  props?: Partial<Omit<LinkProps, 'to'>>,
  children?: ReactNode,
): ReactNode => {
  const { page, ...rest } = state

  return (
    <Link
      {...props}
      to={buildLink(
        APP_PATH.SEARCH.route,
        {},
        {
          ...rest,
          filters: JSON.stringify(state.filters),
          ...(page ? { page: String(page) } : {}),
        },
      )}
    >
      {children || state.filters?.serie?.[0]}
    </Link>
  )
}

/**
 * Generates a link that sets the filter state (used for pupil search inside an assignment)
 * @param setFilterState
 */
export const buildAssignmentSearchLink =
  (
    setFilterState: (
      state: PupilSearchFilterState,
      urlPushType?: UrlUpdateType,
    ) => void,
  ) =>
  // eslint-disable-next-line react/display-name
  (filterState: Partial<FilterState>): ReactNode => {
    return (
      <Button
        type="inline-link"
        label={filterState.filters?.serie?.[0]}
        onClick={() => {
          setFilterState({
            filters: filterState.filters,
            tab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.SEARCH,
            selectedSearchResultId: undefined,
          })
        }}
      />
    )
  }
