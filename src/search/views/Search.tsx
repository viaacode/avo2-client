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
} from '@viaa/avo2-components';
import { AvoCoreContentType, PermissionName } from '@viaa/avo2-types';
import { isEmpty } from 'es-toolkit/compat';
import { useAtomValue } from 'jotai';
import { type FC, type ReactNode, type ReactText, useEffect, useState, } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { buildGlobalSearchLink } from '../../assignment/helpers/build-search-link';
import { commonUserAtom } from '../../authentication/authentication.store';
import { PermissionGuard } from '../../authentication/components/PermissionGuard';
import { PermissionGuardFail, PermissionGuardPass, } from '../../authentication/components/PermissionGuard.slots';
import { GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views/ErrorView';
import { InteractiveTour } from '../../shared/components/InteractiveTour/InteractiveTour';
import { getMoreOptionsLabel } from '../../shared/constants';
import { copyToClipboard } from '../../shared/helpers/clipboard';
import { generateContentLinkString } from '../../shared/helpers/link';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { SearchFiltersAndResults } from '../components/SearchFiltersAndResults';
import { type FilterState } from '../search.types';

import './Search.scss';
import { SortDirectionParam } from '../../admin/shared/helpers/query-string-converters.ts';
import { JsonParam, NumberParam, StringParam, useQueryParams, } from '../../shared/helpers/routing/use-query-params-ssr.ts';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';

export const Search: FC = () => {
  const commonUser = useAtomValue(commonUserAtom);

  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const queryParamConfig = {
    filters: JsonParam,
    orderProperty: StringParam,
    orderDirection: SortDirectionParam,
    tab: StringParam,
    page: NumberParam,
  };
  const [filterState, setFilterState] = useQueryParams(queryParamConfig);

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
      );
    }
  }, [filterState, commonUser]);

  const handleOptionClicked = (optionId: string | number | ReactText) => {
    setIsOptionsMenuOpen(false);

    switch (optionId) {
      case 'copy_link':
        onCopySearchLinkClicked();
        return;
    }
  };

  const copySearchLink = () => {
    copyToClipboard(window.location.href);
  };

  const onCopySearchLinkClicked = () => {
    copySearchLink();
    setIsOptionsMenuOpen(false);
    ToastService.success(
      tHtml('search/views/search___de-link-is-succesvol-gekopieerd'),
    );
  };

  const renderDetailLink = (
    linkText: string | ReactNode,
    id: string,
    type: AvoCoreContentType,
  ) => {
    return <Link to={generateContentLinkString(type, id)}>{linkText}</Link>;
  };

  const renderSearchLink = (
    linkText: string | ReactNode,
    newFilterState: FilterState,
    className?: string,
  ) => {
    const filters = newFilterState.filters;
    return (
      filters && buildGlobalSearchLink(newFilterState, { className }, linkText)
    );
  };

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
          <SearchFiltersAndResults
            bookmarks
            filterState={filterState as FilterState}
            setFilterState={(newFilterState) =>
              setFilterState(newFilterState as any)
            }
            renderDetailLink={renderDetailLink}
            renderSearchLink={renderSearchLink}
          />
        </PermissionGuardPass>
        <PermissionGuardFail>
          <ErrorView
            locationId="search-page--permission--error"
            message={tHtml(
              'search/views/search___je-hebt-geen-rechten-om-de-zoek-pagina-te-bekijken',
            )}
            icon={IconName.lock}
            actionButtons={['home']}
          />
        </PermissionGuardFail>
      </PermissionGuard>
    </>
  );
};

export default Search;
