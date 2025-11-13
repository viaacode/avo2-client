import { Accordion, AccordionBody, Spacer } from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import { clsx } from 'clsx'
import { cloneDeep, omit, uniqBy } from 'es-toolkit'
import React, { type FC, type ReactNode, useMemo } from 'react'

import {
  CheckboxDropdownModal,
  type CheckboxOption,
} from '../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import { DateRangeDropdown } from '../../shared/components/DateRangeDropdown/DateRangeDropdown';
import { LANGUAGES } from '../../shared/constants/index';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { tText } from '../../shared/helpers/translate-text';
import { SearchFilter } from '../search.const';
import {
  type SearchFilterControlsProps,
  type SearchFilterMultiOptions,
} from '../search.types';

import './SearchFilterControls.scss'
import { forEach } from 'es-toolkit/compat'

const languageCodeToLabel = (code: string): string => {
  return LANGUAGES.nl[code] || code
}

export const SearchFilterControls: FC<SearchFilterControlsProps> = ({
  filterState,
  handleFilterFieldChange,
  multiOptions,
  onSearch,
  enabledFilters,
  collectionLabels,
}) => {
  const getCombinedMultiOptions = useMemo(() => {
    const combinedMultiOptions: SearchFilterMultiOptions =
      cloneDeep(multiOptions)
    const arrayFilters: Record<string, string[]> = omit(filterState, [
      SearchFilter.query,
      SearchFilter.broadcastDate,
      SearchFilter.elementary,
    ]) as {
      [filterName: string]: string[]
    }
    forEach(
      arrayFilters,
      (values: string[] | Avo.Core.ContentType[], filterName: string) => {
        combinedMultiOptions[filterName] = uniqBy(
          [
            ...(combinedMultiOptions[filterName] || []),
            ...(values || []).map((val) => ({
              option_name: val,
              option_count: 0,
            })),
          ],
          (filterEntry) => filterEntry.option_name,
        )
      },
    )
    return combinedMultiOptions
  }, [multiOptions])

  const isFilterEnabled = (filterName: keyof Avo.Search.Filters): boolean => {
    if (!enabledFilters) {
      return true
    }
    return enabledFilters.includes(filterName)
  }

  const renderCheckboxDropdownModal = (
    label: string,
    propertyName: Avo.Search.FilterProp,
    disabled = false,
    labelsMapping?: Record<string | number, string>,
  ): ReactNode => {
    const checkboxMultiOptions = (
      getCombinedMultiOptions[propertyName] || []
    ).map(
      ({
        option_name,
        option_count,
      }: Avo.Search.OptionProp): CheckboxOption => {
        let checkboxLabel = option_name

        if (propertyName === SearchFilter.language) {
          checkboxLabel = languageCodeToLabel(option_name)
        }

        if (labelsMapping) {
          checkboxLabel = labelsMapping[option_name]
        }

        return {
          label: checkboxLabel,
          optionCount: option_count,
          id: option_name,
          checked: ((filterState?.[propertyName] || []) as string[]).includes(
            option_name,
          ),
        }
      },
    )

    return (
      <li
        className={`c-filter-dropdown c-filter-dropdown-${propertyName.toLowerCase()}`}
      >
        <CheckboxDropdownModal
          label={label}
          id={propertyName as string}
          options={checkboxMultiOptions}
          showMaxOptions={40}
          disabled={disabled}
          onChange={async (values: string[]) => {
            await handleFilterFieldChange(values, propertyName)
          }}
          onSearch={onSearch}
        />
      </li>
    )
  }

  const renderDateRangeDropdown = (
    label: string,
    propertyName: Avo.Search.FilterProp,
  ): ReactNode => {
    const range: Avo.Search.DateRange = filterState?.[
      SearchFilter.broadcastDate
    ] || {
      gte: '',
      lte: '',
    }
    const correctRange: Avo.Search.DateRange = {
      gte: range.gte || '',
      lte: range.lte || '',
    }

    return (
      <li
        className={`c-filter-dropdown c-filter-dropdown-${propertyName.toLowerCase()}`}
      >
        <DateRangeDropdown
          label={label}
          id={propertyName}
          range={correctRange as { gte: string; lte: string }}
          onChange={(dateRange: Avo.Search.DateRange) => {
            handleFilterFieldChange(dateRange, propertyName)
          }}
        />
      </li>
    )
  }

  const renderFilters = () => (
    <ul
      className={clsx('c-filter-dropdown-list', {
        'c-filter-dropdown-list--mobile': isMobileWidth(),
      })}
    >
      {isFilterEnabled(SearchFilter.type) &&
        renderCheckboxDropdownModal(
          tText('search/components/search-filter-controls___type'),
          SearchFilter.type,
        )}
      {isFilterEnabled(SearchFilter.educationLevel) &&
        renderCheckboxDropdownModal(
          tText('search/components/search-filter-controls___onderwijsniveau'),
          SearchFilter.educationLevel,
        )}
      {isFilterEnabled(SearchFilter.educationDegree) &&
        renderCheckboxDropdownModal(
          tText('search/components/search-filter-controls___onderwijsgraad'),
          SearchFilter.educationDegree,
        )}
      {isFilterEnabled(SearchFilter.subject) &&
        renderCheckboxDropdownModal(
          tText('search/components/search-filter-controls___vak'),
          SearchFilter.subject,
        )}
      {isFilterEnabled(SearchFilter.thema) &&
        renderCheckboxDropdownModal(
          tText('search/components/search-filter-controls___thema'),
          SearchFilter.thema,
        )}
      {isFilterEnabled(SearchFilter.keyword) &&
        renderCheckboxDropdownModal(
          tText('search/components/search-filter-controls___trefwoord'),
          SearchFilter.keyword,
        )}
      {isFilterEnabled(SearchFilter.serie) &&
        renderCheckboxDropdownModal(
          tText('search/components/search-filter-controls___serie'),
          SearchFilter.serie,
        )}
      {isFilterEnabled(SearchFilter.broadcastDate) &&
        renderDateRangeDropdown(
          tText('search/components/search-filter-controls___uitzenddatum'),
          SearchFilter.broadcastDate,
        )}
      {isFilterEnabled(SearchFilter.language) &&
        renderCheckboxDropdownModal(
          tText('search/components/search-filter-controls___taal'),
          SearchFilter.language,
        )}
      {isFilterEnabled(SearchFilter.provider) &&
        renderCheckboxDropdownModal(
          tText('search/components/search-filter-controls___aanbieder'),
          SearchFilter.provider,
        )}
      {isFilterEnabled(SearchFilter.collectionLabel) &&
        renderCheckboxDropdownModal(
          tText('search/components/search-filter-controls___label'),
          SearchFilter.collectionLabel,
          false,
          Object.fromEntries(
            collectionLabels.map((item) => [item.value, item.description]),
          ),
        )}
    </ul>
  )

  if (isMobileWidth()) {
    return (
      <Spacer margin="bottom-large">
        <Accordion
          title={tText('search/components/search-filter-controls___filters')}
          className="c-accordion--filters"
        >
          <AccordionBody>{renderFilters()}</AccordionBody>
        </Accordion>
      </Spacer>
    )
  }

  return renderFilters()
}
