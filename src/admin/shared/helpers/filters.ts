import { compact, isNil, without } from 'es-toolkit'
import { set } from 'es-toolkit/compat'

import { type EducationLevelType } from '../../../shared/helpers/lom.js'

export const NULL_FILTER = 'null'

export function getQueryFilter(
  query: string | undefined,
  getQueryFilterObj: (queryWildcard: string, query: string) => any[],
) {
  if (query) {
    return [
      {
        _or: getQueryFilterObj(`%${query}%`, query),
      },
    ]
  }
  return []
}

export function getDateRangeFilters(
  filters: any,
  props: string[],
  nestedProps?: string[],
): any[] {
  return setNestedValues(
    filters,
    props,
    nestedProps || props,
    (prop: string, value: any) => {
      return {
        [prop]: {
          ...(value && value.gte ? { _gte: value.gte } : null),
          ...(value && value.lte ? { _lte: value.lte } : null),
        },
      }
    },
  )
}

export function getBooleanFilters(
  filters: any,
  props: string[],
  nestedProps?: string[],
): any[] {
  return setNestedValues(
    filters,
    props,
    nestedProps || props,
    (prop: string, value: any) => {
      const orFilters = []
      if (!value || !value.length) {
        return {}
      }
      if (value.includes(NULL_FILTER)) {
        orFilters.push({
          [prop]: { _is_null: true },
        })
      }
      orFilters.push(
        ...without(value, NULL_FILTER).map((val) => ({
          [prop]: { _eq: val === 'true' },
        })),
      )
      return {
        _or: orFilters,
      }
    },
  )
}

/**
 * Used for fields where the user can select multiple values, but the object can only set one value
 * Example: userGroup
 * @param filters
 * @param props
 * @param nestedProps
 */
export function getMultiOptionFilters(
  filters: any,
  props: string[],
  nestedProps?: string[],
): any[] {
  return setNestedValues(
    filters,
    props,
    nestedProps || props,
    (prop: string, value: any) => {
      if (Array.isArray(value) && value.includes(NULL_FILTER)) {
        return {
          _or: [
            { [prop]: { _is_null: true } }, // Empty value
            { [prop]: { _in: without(value, NULL_FILTER) } }, // selected values
          ],
        }
      }
      return { [prop]: { _in: value } }
    },
  )
}

/**
 * Used for generating a filter when the user can select multiple values and the field can also contain multiple values
 * Example: Subjects
 * @param filters
 * @param props
 * @param nestedReferenceTables
 * @param labelPaths
 */
export function getMultiOptionsFilters(
  filters: any,
  props: string[],
  nestedReferenceTables: string[],
  labelPaths?: string[],
  keyIn?: boolean,
): any[] {
  return compact(
    props.map((prop: string, index: number) => {
      const filterValues = (filters as any)[prop]
      const nestedPathParts: string[] = nestedReferenceTables[index].split('.')
      const referenceTable: string | null = nestedPathParts.pop() || null
      const nestedPath: string = nestedPathParts.join('.')
      const labelPath: string | null = labelPaths ? labelPaths[index] : null

      if (
        isNil(filterValues) ||
        !Array.isArray(filterValues) ||
        !filterValues.length ||
        !referenceTable
      ) {
        return null
      }

      // Generate filter object
      let filterObject: any

      if (filterValues.includes(NULL_FILTER) && filterValues.length === 1) {
        // only empty filter
        filterObject = {
          _not: {
            [referenceTable]: {}, // empty value => no reference table entries exist
          },
        }
      } else if (filterValues.includes(NULL_FILTER)) {
        // empty filter with other values
        filterObject = {
          _or: [
            {
              _not: {
                [referenceTable]: {}, // empty value => no reference table entries exist
              },
            },

            // selected values => referenceTable.props in selected values array
            ...without(filterValues, NULL_FILTER).map((value: string) => {
              if (keyIn) {
                if (labelPath) {
                  return {
                    [referenceTable]: {
                      [labelPath]: { _in: value },
                    },
                  }
                }
                return {
                  [referenceTable]: { _in: value },
                }
              }
              if (labelPath) {
                return {
                  [referenceTable]: {
                    [labelPath]: { _has_keys_any: value },
                  },
                }
              }
              return {
                [referenceTable]: { _has_keys_any: value },
              }
            }),
          ],
        }
      } else {
        // only selected values without an empty filter
        filterObject = {}

        if (keyIn) {
          if (labelPath) {
            filterObject[referenceTable] = {
              [labelPath]: { _in: filterValues },
            }
          } else {
            filterObject[referenceTable] = { _in: filterValues }
          }
        } else {
          if (labelPath) {
            filterObject[referenceTable] = {
              [labelPath]: { _has_keys_any: filterValues },
            }
          }

          filterObject[referenceTable] = { _has_keys_any: filterValues }
        }
      }

      // Set filter query on main query object
      if (nestedPath) {
        const response = {}
        set(response, nestedPath, filterObject)
        return response
      }

      return filterObject
    }),
  )
}

/**
 * Takes a filter object and a list of properties and outputs a valid graphql query object
 * @param filters object containing the filter props and values set by the ui
 * @param props which props should be added to the graphql query
 * @param nestedProps wich props should be added to the graphql query in a nested fashion (matched to props by index in the array)
 * @param getValue function that returns the last part of the graphql query
 */
function setNestedValues(
  filters: any,
  props: string[],
  nestedProps: string[],
  getValue: (prop: string, value: any) => any,
): any[] {
  return compact(
    props.map((prop: string, index: number): any => {
      const value = (filters as any)[prop]
      if (!isNil(value) && (!Array.isArray(value) || value.length)) {
        const nestedProp = nestedProps ? nestedProps[index] : prop

        const lastProp = nestedProp.split('.').pop() as string
        const path = nestedProp.substring(
          0,
          nestedProp.length - lastProp.length - 1,
        )

        if (path) {
          const response = {}
          set(response, path, getValue(lastProp, value))
          return response
        }
        return getValue(lastProp, value)
      }
      return null
    }),
  )
}

/**
 * takes a list of lom ids and generates a where object for a graphql query
 * the list can also contain a null value: NULL_FILTER
 * @param values
 * @param scheme
 */
export function generateLomFilter(
  values: string[],
  scheme: EducationLevelType,
): any {
  if (values.includes(NULL_FILTER)) {
    return {
      _or: [
        {
          loms: {
            lom_id: {
              _in: without(values, NULL_FILTER),
            },
          },
        },
        {
          _not: {
            loms: {
              lom: {
                scheme: {
                  _eq: scheme,
                },
              },
            },
          },
        },
      ],
    }
  } else {
    return {
      loms: {
        lom_id: {
          _in: without(values, NULL_FILTER),
        },
      },
    }
  }
}

/**
 * takes a list of education lom ids and generates a where object for a graphql query
 * the list can also contain a null value: NULL_FILTER
 * @param values
 * @param allPossibleValues all values for the education levels or education degrees, so we can make the "NULL_FILTER" explicitly: not in any of these values
 */
export function generateEducationLomFilter(
  values: string[],
  allPossibleValues: string[],
): any {
  if (values.includes(NULL_FILTER)) {
    return {
      _or: [
        {
          loms: {
            lom_id: {
              _in: without(values, NULL_FILTER),
            },
          },
        },
        {
          _not: {
            loms: {
              lom_id: {
                _in: allPossibleValues,
              },
            },
          },
        },
      ],
    }
  } else {
    return {
      loms: {
        lom_id: {
          _in: without(values, NULL_FILTER),
        },
      },
    }
  }
}

/**
 * Does the same thing as `generateLomFilter` but matches a different structure
 */
export function generateEducationLevelFilter(
  educationLevels: string[],
  scheme: EducationLevelType,
): any {
  const match = {
    education_level: {
      id: {
        _in: without(educationLevels, NULL_FILTER),
      },
    },
  }

  if (educationLevels.includes(NULL_FILTER)) {
    return {
      _or: [
        match,
        {
          _not: {
            education_level: {
              scheme: {
                _eq: scheme,
              },
            },
          },
        },
      ],
    }
  } else {
    return match
  }
}
