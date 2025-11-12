import {
  Container,
  Flex,
  IconName,
  MoreOptionsDropdown,
  Navbar,
  Toolbar,
  ToolbarItem,
  ToolbarLeft,
  ToolbarRight,
  ToolbarTitle,
} from '@viaa/avo2-components'
import { type Avo, PermissionName } from '@viaa/avo2-types'
import { useAtomValue } from 'jotai'
import { isEmpty } from 'es-toolkit/compat'
import React, {
  type FC,
  type ReactNode,
  type ReactText,
  useEffect,
  useState,
} from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import {
  JsonParam,
  NumberParam,
  StringParam,
  useQueryParams,
} from 'use-query-params'

import { buildGlobalSearchLink } from '../../assignment/helpers/build-search-link.js'
import { commonUserAtom } from '../../authentication/authentication.store.js'
import { PermissionGuard } from '../../authentication/components/PermissionGuard.js'
import {
  PermissionGuardFail,
  PermissionGuardPass,
} from '../../authentication/components/PermissionGuard.slots.js'
import { PermissionService } from '../../authentication/helpers/permission-service.js'
import { GENERATE_SITE_TITLE } from '../../constants.js'
import { ErrorView } from '../../error/views/ErrorView.js'
import { InteractiveTour } from '../../shared/components/InteractiveTour/InteractiveTour.js'
import { getMoreOptionsLabel } from '../../shared/constants/index.js'
import { copyToClipboard } from '../../shared/helpers/clipboard.js'
import { generateContentLinkString } from '../../shared/helpers/link.js'
import { trackEvents } from '../../shared/services/event-logging-service.js'
import { ToastService } from '../../shared/services/toast-service.js'
import { SearchFiltersAndResults } from '../components/SearchFiltersAndResults.js'
import { type FilterState } from '../search.types.js'

import './Search.scss'
import { tHtml } from '../../shared/helpers/translate-html.js'
import { tText } from '../../shared/helpers/translate-text.js'

export const Search: FC = () => {
  const commonUser = useAtomValue(commonUserAtom)

  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false)
  const queryParamConfig = {
    filters: JsonParam,
    orderProperty: StringParam,
    orderDirection: StringParam,
    tab: StringParam,
    page: NumberParam,
  }
  const [filterState, setFilterState] = useQueryParams(queryParamConfig)

  useEffect(() => {
    if (!isEmpty(filterState.filters)) {
      trackEvents(
        {
          object: filterState.filters?.query || '',
          object_type: 'query',
          action: 'search',
          resource: filterState.filters,
        },
        commonUser,
      )
    }
  }, [filterState, commonUser])

  const handleOptionClicked = (optionId: string | number | ReactText) => {
    setIsOptionsMenuOpen(false)

    switch (optionId) {
      case 'copy_link':
        onCopySearchLinkClicked()
        return
    }
  }

  const copySearchLink = () => {
    copyToClipboard(window.location.href)
  }

  const onCopySearchLinkClicked = () => {
    copySearchLink()
    setIsOptionsMenuOpen(false)
    ToastService.success(
      tHtml('search/views/search___de-link-is-succesvol-gekopieerd'),
    )
  }

  const renderDetailLink = (
    linkText: string | ReactNode,
    id: string,
    type: Avo.Core.ContentType,
  ) => {
    return <Link to={generateContentLinkString(type, id)}>{linkText}</Link>
  }

  const renderSearchLink = (
    linkText: string | ReactNode,
    newFilterState: FilterState,
    className?: string,
  ) => {
    const filters = newFilterState.filters
    return (
      filters && buildGlobalSearchLink(newFilterState, { className }, linkText)
    )
  }

  return (
    <>
      <Helmet>
        <title>
          {GENERATE_SITE_TITLE(
            tText('search/views/search___zoeken-pagina-titel'),
          )}
        </title>
        <meta
          name="description"
          content={tText('search/views/search___zoeken-pagina-beschrijving')}
        />
      </Helmet>
      <PermissionGuard permissions={[PermissionName.SEARCH]}>
        <PermissionGuardPass>
          <Navbar>
            <Container mode="horizontal">
              <Toolbar className="c-toolbar--results">
                <ToolbarLeft>
                  <ToolbarItem>
                    <ToolbarTitle>
                      {tText('search/views/search___zoekresultaten')}
                    </ToolbarTitle>
                  </ToolbarItem>
                </ToolbarLeft>
                <ToolbarRight>
                  <Flex spaced="regular">
                    <InteractiveTour showButton />
                    <MoreOptionsDropdown
                      isOpen={isOptionsMenuOpen}
                      onOpen={() => setIsOptionsMenuOpen(true)}
                      onClose={() => setIsOptionsMenuOpen(false)}
                      label={getMoreOptionsLabel()}
                      menuItems={[
                        {
                          icon: IconName.link,
                          id: 'copy_link',
                          label: tText(
                            'search/views/search___kopieer-vaste-link-naar-deze-zoekopdracht',
                          ),
                        },
                      ]}
                      onOptionClicked={handleOptionClicked}
                    />
                  </Flex>
                </ToolbarRight>
              </Toolbar>
            </Container>
          </Navbar>
          {PermissionService.hasPerm(commonUser, PermissionName.SEARCH) ? (
            <SearchFiltersAndResults
              bookmarks
              filterState={filterState}
              setFilterState={setFilterState}
              renderDetailLink={renderDetailLink}
              renderSearchLink={renderSearchLink}
            />
          ) : (
            <ErrorView
              message={tHtml(
                'search/views/search___je-hebt-geen-rechten-om-te-zoeken',
              )}
              actionButtons={['home', 'helpdesk']}
              icon={IconName.lock}
            />
          )}
        </PermissionGuardPass>
        <PermissionGuardFail>
          <ErrorView
            message={tHtml(
              'search/views/search___je-hebt-geen-rechten-om-de-zoek-pagina-te-bekijken',
            )}
            icon={IconName.lock}
            actionButtons={['home']}
          />
        </PermissionGuardFail>
      </PermissionGuard>
    </>
  )
}

export default Search
