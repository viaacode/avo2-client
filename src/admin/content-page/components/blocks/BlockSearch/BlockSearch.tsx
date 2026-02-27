import { BlockHeading } from '@meemoo/admin-core-ui/client';
import {
  Button,
  Container,
  Dropdown,
  DropdownButton,
  DropdownContent,
  IconName,
  MenuSearchResultContent,
  type MenuSearchResultItemInfo,
  Spacer,
  Spinner,
  TextInput,
} from '@viaa/avo2-components';

import { isNil } from 'es-toolkit';
import { type FC, type KeyboardEvent, useState } from 'react';
import { useNavigate } from 'react-router';

import { CONTENT_TYPE_TRANSLATIONS_NL_TO_EN } from '../../../../../collection/collection.types';
import { SearchFilter } from '../../../../../search/search.const';
import {
  generateContentLinkString,
  generateSearchLinkString,
} from '../../../../../shared/helpers/link';
import { useDebounce } from '../../../../../shared/hooks/useDebounce';
import { ToastService } from '../../../../../shared/services/toast-service';
import { KeyCode } from '../../../../../shared/types';
import './BlockSearch.scss';
import { AvoSearchResultItem } from '@viaa/avo2-types';
import { useSearchAutocomplete } from './hooks/use-search-autocomplete';
import { tHtml } from '../../../../../shared/helpers/translate-html';
import { tText } from '../../../../../shared/helpers/translate-text';

export const BlockSearch: FC = () => {
  const navigateFunc = useNavigate();

  const [searchTerms, setSearchTerms] = useState<string>('');
  const [isAutocompleteSearchOpen, setAutocompleteSearchOpen] =
    useState<boolean>(false);
  const debouncedSearchTerms = useDebounce(searchTerms, 200);

  const { data: searchResults, isLoading } =
    useSearchAutocomplete(debouncedSearchTerms);

  // Computed
  const autocompleteMenuItems = (
    (searchResults?.results || []) as AvoSearchResultItem[]
  ).map(
    (searchResult: AvoSearchResultItem): MenuSearchResultItemInfo => ({
      label: searchResult.dc_title,
      id: searchResult.external_id,
      key: searchResult.external_id,
      type: CONTENT_TYPE_TRANSLATIONS_NL_TO_EN[
        searchResult.administrative_type
      ],
    }),
  );

  const autocompleteButtonLabel = autocompleteMenuItems.length
    ? 'Alle zoekresultaten'
    : 'Ga naar de zoek pagina';

  // Methods
  const gotoSearchPage = () => {
    navigateFunc(generateSearchLinkString(SearchFilter.query, searchTerms));
  };

  const goToSearchResult = (searchResultId: string | undefined) => {
    if (!isNil(searchResultId)) {
      // Collection ids are numbers and item ids are strings
      const searchResultItem: AvoSearchResultItem | undefined = (
        searchResults?.results || []
      ).find(
        (searchResult) =>
          searchResult.id === (searchResultId as string).toString(),
      );

      if (searchResultItem) {
        navigateFunc(
          generateContentLinkString(
            searchResultItem.administrative_type,
            searchResultItem.id,
          ),
        );
      } else {
        ToastService.danger(
          tHtml('home/views/home___geen-zoekresultaten-gevonden-met-id-id', {
            id: searchResultId,
          }),
        );
      }
    }
  };

  const handleSearchTermChanged = (searchTerm: string) => {
    setSearchTerms(searchTerm);
    setAutocompleteSearchOpen(true);
  };

  const handleSearchFieldKeyUp = (evt: KeyboardEvent<HTMLInputElement>) => {
    if (evt.keyCode === KeyCode.Enter) {
      gotoSearchPage();
    }
  };

  return (
    <Container mode="horizontal" size="medium" className="m-search-block">
      <Spacer>
        <BlockHeading type="h2" className="u-text-center">
          {tText(
            'home/views/home___vind-alles-wat-je-nodig-hebt-om-je-lessen-te-verrijken',
          )}
        </BlockHeading>
        <div className="u-text-center">
          <Spacer margin="large" className="c-dropdown__wrapper">
            <Dropdown
              triggerWidth="full-width"
              isOpen={isAutocompleteSearchOpen}
              onOpen={() => setAutocompleteSearchOpen(true)}
              onClose={() => setAutocompleteSearchOpen(false)}
              searchMenu
              placement="bottom-start"
            >
              <DropdownButton>
                <TextInput
                  placeholder={tText('home/views/home___vul-een-zoekterm-in')}
                  icon={IconName.search}
                  value={searchTerms}
                  onChange={(searchTerm) => handleSearchTermChanged(searchTerm)}
                  onKeyUp={handleSearchFieldKeyUp}
                />
              </DropdownButton>
              <DropdownContent>
                <div className="c-dropdown-results">
                  {isLoading ? (
                    <Spinner size="large" />
                  ) : (
                    <MenuSearchResultContent
                      menuItems={autocompleteMenuItems}
                      noResultsLabel={tText(
                        'home/views/home___geen-resultaten',
                      )}
                      onClick={(id) => goToSearchResult(id.toString())}
                    />
                  )}
                </div>
                <div className="c-menu__footer">
                  <Button
                    block
                    label={autocompleteButtonLabel}
                    onClick={gotoSearchPage}
                    type="secondary"
                  />
                </div>
              </DropdownContent>
            </Dropdown>
          </Spacer>
        </div>
      </Spacer>
    </Container>
  );
};
