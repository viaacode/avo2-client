import { type Avo } from '@viaa/avo2-types'
import { isNil } from 'es-toolkit'

import {
  type DeleteInteractiveTourMutation,
  type DeleteInteractiveTourMutationVariables,
  type GetInteractiveTourByIdQuery,
  type GetInteractiveTourByIdQueryVariables,
  type GetInteractiveToursQuery,
  type GetInteractiveToursQueryVariables,
  type InsertInteractiveTourMutation,
  type InsertInteractiveTourMutationVariables,
  type UpdateInteractiveTourMutation,
  type UpdateInteractiveTourMutationVariables,
} from '../../shared/generated/graphql-db-operations.js'
import {
  DeleteInteractiveTourDocument,
  GetInteractiveTourByIdDocument,
  GetInteractiveToursDocument,
  InsertInteractiveTourDocument,
  UpdateInteractiveTourDocument,
} from '../../shared/generated/graphql-db-react-query.js'
import { CustomError } from '../../shared/helpers/custom-error.js'
import { dataService } from '../../shared/services/data-service.js'

import { ITEMS_PER_PAGE } from './interactive-tour.const.js'
import {
  type EditableInteractiveTour,
  type EditableStep,
  type InteractiveTourOverviewTableCols,
} from './interactive-tour.types.js'

export class InteractiveTourService {
  public static async fetchInteractiveTours(
    page: number,
    sortColumn: InteractiveTourOverviewTableCols,
    sortOrder: Avo.Search.OrderDirection,
    where: GetInteractiveToursQueryVariables['where'],
  ): Promise<[GetInteractiveToursQuery['app_interactive_tour'], number]> {
    let variables: GetInteractiveToursQueryVariables | null = null
    try {
      variables = {
        where,
        offset: ITEMS_PER_PAGE * page,
        limit: ITEMS_PER_PAGE,
        orderBy: [{ [sortColumn]: sortOrder }],
      }
      const response = await dataService.query<
        GetInteractiveToursQuery,
        GetInteractiveToursQueryVariables
      >({
        variables,
        query: GetInteractiveToursDocument,
      })
      const interactiveTours = response?.app_interactive_tour
      const interactiveTourCount =
        response?.app_interactive_tour_aggregate?.aggregate?.count || 0

      if (!interactiveTours) {
        throw new CustomError(
          'Response does not contain any interactive tours',
          null,
          {
            response,
          },
        )
      }

      return [interactiveTours, interactiveTourCount]
    } catch (err) {
      throw new CustomError(
        'Failed to get interactive tours from the database',
        err,
        {
          variables,
          query: 'GET_INTERACTIVE_TOURS',
        },
      )
    }
  }

  public static async fetchInteractiveTour(
    id: string,
  ): Promise<GetInteractiveTourByIdQuery['app_interactive_tour'][0]> {
    let variables: any
    try {
      variables = {
        id,
      }
      const response = await dataService.query<
        GetInteractiveTourByIdQuery,
        GetInteractiveTourByIdQueryVariables
      >({
        variables,
        query: GetInteractiveTourByIdDocument,
      })
      const interactiveTour = response?.app_interactive_tour?.[0]

      if (!interactiveTour) {
        throw new CustomError(
          'Response does not contain an interactiveTour',
          null,
          {
            response,
          },
        )
      }

      return interactiveTour
    } catch (err) {
      throw new CustomError(
        'Failed to get the interactiveTour from the database',
        err,
        {
          variables,
          query: 'GET_INTERACTIVE_TOUR_BY_ID',
        },
      )
    }
  }

  public static async insertInteractiveTour(
    interactiveTour: EditableInteractiveTour,
  ): Promise<number> {
    try {
      const response = await dataService.query<
        InsertInteractiveTourMutation,
        InsertInteractiveTourMutationVariables
      >({
        query: InsertInteractiveTourDocument,
        variables: {
          interactiveTour: {
            name: interactiveTour.name,
            page: interactiveTour.page_id, // Renamed page to page_id, because we already have page n the tableState
            steps: interactiveTour.steps,
          } as any,
        },
      })
      const interactiveTourId =
        response.insert_app_interactive_tour?.returning?.[0]?.id
      if (isNil(interactiveTourId)) {
        throw new CustomError(
          'Response from database does not contain the id of the inserted interactive tour',
          null,
          { response },
        )
      }
      return interactiveTourId
    } catch (err) {
      throw new CustomError(
        'Failed to insert interactive tour in the database',
        err,
        {
          interactiveTour,
          query: 'INSERT_INTERACTIVE_TOUR',
        },
      )
    }
  }

  static async updateInteractiveTour(
    interactiveTour: EditableInteractiveTour,
  ): Promise<void> {
    try {
      if (!interactiveTour.id) {
        throw new CustomError(
          'Cannot update interactive tour because the id is undefined',
          null,
        )
      }
      await dataService.query<
        UpdateInteractiveTourMutation,
        UpdateInteractiveTourMutationVariables
      >({
        query: UpdateInteractiveTourDocument,
        variables: {
          interactiveTour: {
            name: interactiveTour.name,
            page: interactiveTour.page_id,
            steps: interactiveTour.steps,
          } as any,
          interactiveTourId: interactiveTour.id,
        },
      })
    } catch (err) {
      throw new CustomError(
        'Failed to update interactive tour in the database',
        err,
        {
          interactiveTour,
          query: 'UPDATE_INTERACTIVE_TOUR',
        },
      )
    }
  }

  static async deleteInteractiveTour(interactiveTourId: number): Promise<void> {
    try {
      await dataService.query<
        DeleteInteractiveTourMutation,
        DeleteInteractiveTourMutationVariables
      >({
        query: DeleteInteractiveTourDocument,
        variables: {
          interactiveTourId,
        },
      })
    } catch (err) {
      throw new CustomError(
        'Failed to delete interactive tour from the database',
        err,
        {
          interactiveTourId,
          query: 'DELETE_INTERACTIVE_TOUR',
        },
      )
    }
  }

  public static swapStepPositions(
    steps: EditableStep[],
    currentStapIndex: number,
    delta: number,
  ): EditableStep[] {
    const currentStep = steps[currentStapIndex]
    steps[currentStapIndex] = steps[currentStapIndex + delta]
    steps[currentStapIndex + delta] = currentStep

    return steps
  }
}
