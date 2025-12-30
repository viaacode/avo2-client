import { AvoAssignmentAssignment, AvoCollectionCollection, AvoSearchOrderDirection, } from '@viaa/avo2-types';
import { stringifyUrl } from 'query-string';
import { CustomError } from '../../shared/helpers/custom-error';
import { getEnv } from '../../shared/helpers/env';
import { type AssignmentSortProps } from './assignments.types';

export class AssignmentsAdminService {
  static async getAssignments(
    offset: number,
    limit: number,
    sortColumn: AssignmentSortProps,
    sortOrder: AvoSearchOrderDirection,
    filters: any,
    isCollection: boolean,
    includeRelations: boolean,
  ): Promise<{ assignments: AvoCollectionCollection[]; total: number }> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson<{
        assignments: AvoCollectionCollection[];
        total: number;
      }>(
        stringifyUrl({
          url: `${getEnv('PROXY_URL')}/assignments/admin/overview`,
          query: {
            offset,
            limit,
            sortColumn,
            sortOrder,
            filters: JSON.stringify(filters),
            isCollection,
            includeRelations,
          },
        }),
      );
    } catch (err) {
      throw new CustomError(
        'Failed to get assignments from the database',
        err,
        {
          offset,
          limit,
          sortColumn,
          sortOrder,
          filters,
          isCollection,
        },
      );
    }
  }

  static async getAssignmentsWithMarcom(
    offset: number,
    limit: number,
    sortColumn: AssignmentSortProps,
    sortOrder: AvoSearchOrderDirection,
    filters: any,
    includeRelations: boolean,
  ): Promise<{ assignments: AvoAssignmentAssignment[]; total: number }> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson<{
        assignments: AvoAssignmentAssignment[];
        total: number;
      }>(
        stringifyUrl({
          url: `${getEnv('PROXY_URL')}/assignments/admin/overview/marcom`,
          query: {
            offset,
            limit,
            sortColumn,
            sortOrder,
            filters: JSON.stringify(filters),
            includeRelations,
          },
        }),
      );
    } catch (err) {
      throw new CustomError(
        'Failed to get assignment marcom entries from the database',
        err,
        {
          offset,
          limit,
          sortColumn,
          sortOrder,
          filters,
        },
      );
    }
  }

  static async getAssignmentIds(filters: any): Promise<string[]> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      const response = await fetchWithLogoutJson<{
        assignmentIds: string[];
      }>(
        stringifyUrl({
          url: `${getEnv('PROXY_URL')}/assignments/admin/overview/ids`,
          query: {
            filters: JSON.stringify(filters),
          },
        }),
      );
      return response?.assignmentIds || [];
    } catch (err) {
      throw new CustomError(
        'Failed to get assignment ids from the database',
        err,
        {
          filters,
        },
      );
    }
  }

  static async getAssignmentMarcomIds(filters: any): Promise<string[]> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      const response = await fetchWithLogoutJson<{
        assignmentIds: string[];
      }>(
        stringifyUrl({
          url: `${getEnv('PROXY_URL')}/assignments/admin/overview/marcom/ids`,
          query: {
            filters: JSON.stringify(filters),
          },
        }),
      );
      return response?.assignmentIds || [];
    } catch (err) {
      throw new CustomError(
        'Failed to get assignment marcom ids from the database',
        err,
        {
          filters,
        },
      );
    }
  }
}
