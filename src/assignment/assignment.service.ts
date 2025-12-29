import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/client';
import {
  AvoAssignmentAssignment,
  AvoAssignmentBlock,
  AvoAssignmentContributor,
  AvoAssignmentResponse,
  AvoCollectionCollection,
  AvoCoreBlockItemBase,
  AvoCoreBlockItemType,
  AvoItemItem,
  AvoSearchOrderDirection,
  AvoShareEditStatusResponse,
  AvoUserCommonUser,
} from '@viaa/avo2-types';
import { cloneDeep, isNil } from 'es-toolkit';
import { stringifyUrl } from 'query-string';
import { type AssignmentsOverviewTableState } from '../admin/assignments/assignments.types';
import { ItemsService } from '../admin/items/items.service';
import { CollectionService } from '../collection/collection.service';
import { type AssignmentMarcomEntry } from '../collection/collection.types';
import { canManageEditorial } from '../collection/helpers/can-manage-editorial';
import { type ItemTrimInfo } from '../item/item.types';
import {
  type ContributorInfo,
  type ContributorInfoRight,
} from '../shared/components/ShareWithColleagues/ShareWithColleagues.types';
import {
  type GetAssignmentWithResponseQuery,
  type GetAssignmentWithResponseQueryVariables,
  type GetContributorsByAssignmentUuidQuery,
  type GetContributorsByAssignmentUuidQueryVariables,
  type InsertAssignmentBlocksMutation,
  type InsertAssignmentBlocksMutationVariables,
  type InsertAssignmentResponseMutation,
  type InsertAssignmentResponseMutationVariables,
} from '../shared/generated/graphql-db-operations';
import {
  GetAssignmentWithResponseDocument,
  GetContributorsByAssignmentUuidDocument,
  InsertAssignmentBlocksDocument,
  InsertAssignmentResponseDocument,
} from '../shared/generated/graphql-db-react-query';
import {
  type App_Assignments_V2_Insert_Input,
  type App_Assignments_V2_Set_Input,
  Lookup_Enum_Relation_Types_Enum,
} from '../shared/generated/graphql-db-types';
import { CustomError } from '../shared/helpers/custom-error';
import { getEnv } from '../shared/helpers/env';
import { isUserSecondaryElementary } from '../shared/helpers/is-user';
import { tHtml } from '../shared/helpers/translate-html';
import { tText } from '../shared/helpers/translate-text';
import { dataService } from '../shared/services/data-service';
import { trackEvents } from '../shared/services/event-logging-service';
import { RelationService } from '../shared/services/relation-service/relation.service';
import { ToastService } from '../shared/services/toast-service';
import { VideoStillService } from '../shared/services/video-stills-service';
import { type TableColumnDataType } from '../shared/types/table-column-data-type';
import { ITEMS_PER_PAGE } from './assignment.const';
import {
  type AssignmentTableColumns,
  type FetchAssignmentsParams,
  type PupilCollectionFragment,
} from './assignment.types';
import { cleanupTitleAndDescriptions } from './helpers/cleanup-title-and-descriptions';
import { isItemWithMeta } from './helpers/is-item-with-meta';

export class AssignmentService {
  static async fetchAssignments(params: FetchAssignmentsParams): Promise<{
    assignments: AvoAssignmentAssignment[];
    count: number;
  }> {
    let url: string | undefined = undefined;

    try {
      url = stringifyUrl({
        url: `${getEnv('PROXY_URL')}/assignments`,
        query: {
          pastDeadline: params.pastDeadline ? 'true' : 'false',
          sortColumn: params.sortColumn,
          sortOrder: params.sortOrder,
          tableColumnDataType: params.tableColumnDataType,
          offset: params.offset,
          limit: params.limit || ITEMS_PER_PAGE,
          filterString: params.filterString,
          labelIds: params.labelIds?.join(','),
          classIds: params.classIds?.join(','),
          shareTypeIds: params.shareTypeIds?.join(','),
        },
      });
      return fetchWithLogoutJson(url);
    } catch (err) {
      throw new CustomError('Failed to fetch assignments from database', err, {
        ...params,
        url,
      });
    }
  }

  static async fetchAssignmentById(
    assignmentId: string,
    inviteToken?: string,
  ): Promise<AvoAssignmentAssignment> {
    try {
      const url = stringifyUrl({
        url: `${getEnv('PROXY_URL')}/assignments/${assignmentId}`,
        query: {
          inviteToken: inviteToken || undefined,
        },
      });
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      const assignment: AvoAssignmentAssignment = await fetchWithLogoutJson(
        url,
        {
          method: 'GET',
        },
      );

      if (!assignment) {
        throw new CustomError('Response does not contain an assignment', null, {
          response: assignment,
        });
      }

      return {
        ...assignment,
        blocks: (await this.enrichBlocksWithMeta(
          assignment.blocks,
        )) as AvoAssignmentBlock[],
      };
    } catch (err) {
      throw new CustomError(
        'Failed to get assignment by id from database',
        err,
        {
          assignmentId,
          query: 'GET_ASSIGNMENT_BY_UUID',
        },
      );
    }
  }

  static async fetchAssignmentBlocks(
    assignmentId: string,
  ): Promise<AvoAssignmentBlock[]> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/assignments/${assignmentId}/blocks`,
        {
          method: 'GET',
        },
      );
    } catch (err) {
      const error = new CustomError('Failed to fetch assignment blocks', err, {
        assignmentId,
      });
      console.error(error);
      throw error;
    }
  }

  /**
   * Helper functions for inserting, updating, validating and deleting assignment
   * This will be used by the Assignments view and the AssignmentEdit view
   * @param assignment
   * @param profileId
   */
  private static async transformAssignment(
    assignment: Partial<AvoAssignmentAssignment>,
    profileId: string,
  ): Promise<App_Assignments_V2_Insert_Input | App_Assignments_V2_Set_Input> {
    const assignmentToSave = cloneDeep(assignment);

    if (
      assignmentToSave.answer_url &&
      !/^(https?:)?\/\//.test(assignmentToSave.answer_url)
    ) {
      assignmentToSave.answer_url = `//${assignmentToSave.answer_url}`;
    }

    assignmentToSave.updated_by_profile_id = profileId;
    assignmentToSave.owner_profile_id =
      assignmentToSave.owner_profile_id || 'owner_profile_id';
    assignmentToSave.is_deleted = assignmentToSave.is_deleted || false;
    assignmentToSave.is_collaborative =
      assignmentToSave.is_collaborative || false;
    assignmentToSave.description =
      (assignmentToSave as any).descriptionRichEditorState &&
      (assignmentToSave as any).descriptionRichEditorState.toHTML
        ? (assignmentToSave as any).descriptionRichEditorState.toHTML()
        : assignmentToSave.description || '';

    if (!isNil(assignment.blocks)) {
      assignmentToSave.blocks = cleanupTitleAndDescriptions(
        assignment.blocks,
      ) as AvoAssignmentBlock[];
    }

    if (isNil(assignment.thumbnail_path)) {
      assignmentToSave.thumbnail_path =
        await this.getThumbnailPathForAssignment(assignment);
    }

    delete assignmentToSave.owner;
    delete assignmentToSave.responses;
    delete (assignmentToSave as any).__typename;
    delete (assignmentToSave as any).descriptionRichEditorState;
    delete assignmentToSave.contributors;
    delete assignmentToSave.updated_by;

    return assignmentToSave as AvoAssignmentAssignment;
  }

  static async deleteAssignment(assignmentId: string): Promise<void> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/assignments/${assignmentId}`,
        {
          method: 'DELETE',
        },
      );
    } catch (err) {
      const error = new CustomError('Failed to delete assignment', err, {
        assignmentId,
      });
      console.error(error);
      throw error;
    }
  }

  static async deleteAssignments(assignmentIds: string[]): Promise<void> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(`${getEnv('PROXY_URL')}/assignments`, {
        method: 'DELETE',
        body: JSON.stringify(assignmentIds),
      });
    } catch (err) {
      const error = new CustomError('Failed to delete assignment', err, {
        assignmentIds,
      });
      console.error(error);
      throw error;
    }
  }

  static async updateAssignment(
    assignment: Partial<AvoAssignmentAssignment>,
    profileId: string,
  ): Promise<AvoAssignmentAssignment | null> {
    try {
      const updatedAssignment = await this.transformAssignment(
        assignment,
        profileId,
      );

      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/assignments/${updatedAssignment.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updatedAssignment),
        },
      );
    } catch (err) {
      const error = new CustomError('Failed to update assignment', err, {
        assignment,
      });

      console.error(error);
      throw error;
    }
  }

  static async updateAssignmentUpdatedAtDate(
    assignmentId: string,
  ): Promise<void> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/assignments/${assignmentId}/updated-at`,
        {
          method: 'POST',
        },
      );
    } catch (err) {
      const error = new CustomError(
        'Failed to update assignment updated_at date',
        err,
        {
          assignmentId,
        },
      );

      console.error(error);
      throw error;
    }
  }

  static async updateAssignmentResponse(
    original: Omit<AvoAssignmentResponse, 'assignment'>,
    update: {
      collection_title: string;
      pupil_collection_blocks: PupilCollectionFragment[];
    },
  ): Promise<Omit<AvoAssignmentResponse, 'assignment'> | null> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/assignment-responses/${original.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(update),
        },
      );
    } catch (err) {
      const error = new CustomError('Failed to update assignment', err, {
        original,
        update,
      });

      console.error(error);
      throw error;
    }
  }

  static async insertAssignment(
    assignment: Partial<AvoAssignmentAssignment>,
    commonUser: AvoUserCommonUser,
  ): Promise<AvoAssignmentAssignment | null> {
    try {
      const assignmentToSave = await AssignmentService.transformAssignment(
        {
          ...assignment,
        },
        commonUser?.profileId,
      );

      // Check is_managed status
      // Should be copied to new assignment if user group is one of [redacteur, eindredacteur, beheerder]
      // Otherwise should be false
      // https://meemoo.atlassian.net/browse/AVO-3787
      assignmentToSave.is_managed = canManageEditorial(commonUser);

      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(`${getEnv('PROXY_URL')}/assignments`, {
        method: 'POST',
        body: JSON.stringify(assignmentToSave),
      });
    } catch (err) {
      throw new CustomError('Failed to insert assignment', err, { assignment });
    }
  }

  static async duplicateAssignment(
    newTitle: string,
    initialAssignment: Partial<AvoAssignmentAssignment> | null,
    commonUser: AvoUserCommonUser,
  ): Promise<AvoAssignmentAssignment> {
    const ownerProfileId = commonUser?.profileId;

    if (!initialAssignment || !initialAssignment.id || !ownerProfileId) {
      throw new CustomError(
        'Failed to copy assignment because the duplicateAssignment function received an empty assignment or was missing the intended user',
        null,
        { newTitle, initialAssignment, ownerProfileId },
      );
    }

    // See table in AVO-3160, reverted by AVO-3308
    // const education_level_id = isUserSecondaryElementary(commonUser)
    // 	? initialAssignment.education_level_id
    // 	: isUserTeacherSecondary(commonUser)
    // 	? EducationLevelId.secundairOnderwijs
    // 	: EducationLevelId.lagerOnderwijs;

    // clone the assignment
    const newAssignment: Partial<AvoAssignmentAssignment> = {
      ...cloneDeep(initialAssignment),
      title: newTitle,
      owner_profile_id: ownerProfileId,
      available_at: new Date().toISOString(),
      deadline_at: null,
      answer_url: null,
      is_public: false,
      created_at: new Date().toISOString(),
      published_at: undefined,
      contributors: [],
      labels: [],
      loms: [],
      quality_labels: [],
      education_level_id: isUserSecondaryElementary(commonUser)
        ? null
        : undefined,

      // Check is_managed status
      // Should be copied to new assignment if user group is one of [redacteur, eindredacteur, beheerder]
      // Otherwise should be false
      // https://meemoo.atlassian.net/browse/AVO-3787
      is_managed: canManageEditorial(commonUser),
    };

    delete newAssignment.owner;
    delete newAssignment.marcom_note;
    newAssignment.updated_at = new Date().toISOString();
    const blocks: AvoAssignmentBlock[] =
      await AssignmentService.fetchAssignmentBlocks(initialAssignment.id);
    const duplicatedAssignment = await AssignmentService.insertAssignment(
      {
        ...newAssignment,
        blocks,
      },
      commonUser,
    );

    if (!duplicatedAssignment) {
      throw new CustomError(
        'Failed to copy assignment because the insert method returned null',
        null,
        {
          newTitle,
          initialAssignment,
        },
      );
    } else {
      await RelationService.insertRelation(
        'assignment',
        duplicatedAssignment.id,
        Lookup_Enum_Relation_Types_Enum.IsCopyOf,
        initialAssignment.id,
      );
    }

    return duplicatedAssignment;
  }

  static async fetchAssignmentAndContent(
    pupilProfileId: string,
    assignmentId: string,
  ): Promise<AvoAssignmentAssignment> {
    try {
      // Load assignment
      const variables: GetAssignmentWithResponseQueryVariables = {
        assignmentId,
        pupilUuid: pupilProfileId,
      };
      const response = await dataService.query<
        GetAssignmentWithResponseQuery,
        GetAssignmentWithResponseQueryVariables
      >({
        query: GetAssignmentWithResponseDocument,
        variables,
      });

      const tempAssignment = response.app_assignments_v2[0];

      if (!tempAssignment) {
        throw new CustomError('Failed to find assignment by id');
      }

      // Load content (collection, item or search query) according to assignment
      const initialAssignmentBlocks: AvoAssignmentBlock[] =
        await AssignmentService.fetchAssignmentBlocks(assignmentId);

      const blocks = await this.enrichBlocksWithMeta(initialAssignmentBlocks);

      return {
        ...tempAssignment,
        blocks,
      } as unknown as AvoAssignmentAssignment;
    } catch (err: any) {
      const graphqlError = err?.graphQLErrors?.[0]?.message;

      if (graphqlError) {
        return graphqlError;
      }

      const customError = new CustomError(
        'Failed to fetch assignment with content',
        err,
        {
          pupilProfileId,
          assignmentId,
        },
      );

      console.error(customError);

      throw customError;
    }
  }

  static isOwnerOfAssignment(
    assignment: AvoAssignmentAssignment,
    commonUser: AvoUserCommonUser | undefined,
  ): boolean {
    return (
      !!commonUser?.profileId &&
      commonUser?.profileId === assignment.owner_profile_id
    );
  }

  // Fetch assignment responses for response overview page
  static async fetchAssignmentResponses(
    assignmentId: string,
    sortColumn: AssignmentTableColumns,
    sortOrder: AvoSearchOrderDirection,
    tableColumnDataType: TableColumnDataType,
    page: number,
    filterString: string | undefined,
  ): Promise<{
    assignmentResponses: AvoAssignmentResponse[];
    count: number;
  }> {
    let url: string | undefined = undefined;
    try {
      url = stringifyUrl({
        url: `${getEnv('PROXY_URL')}/assignment-responses`,
        query: {
          assignmentId,
          sortColumn,
          sortOrder,
          tableColumnDataType,
          offset: page * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
          filterString,
        },
      });

      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(url, {
        method: 'GET',
      });
    } catch (err) {
      const error = new CustomError(
        'Failed to fetch assignment responses from database',
        err,
        {
          url,
        },
      );
      console.error(error);
      throw error;
    }
  }

  static async deleteAssignmentResponse(
    assignmentResponseId: string,
  ): Promise<void> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/assignment-responses/${assignmentResponseId}`,
        {
          method: 'DELETE',
        },
      );
    } catch (err) {
      const error = new CustomError(
        'Failed to delete assignment response',
        err,
        {
          assignmentResponseId,
        },
      );
      console.error(error);
      throw error;
    }
  }

  static async deleteAssignmentResponses(
    assignmentResponseIds: string[],
  ): Promise<void> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/assignment-responses}`,
        {
          method: 'DELETE',
          body: JSON.stringify(assignmentResponseIds),
        },
      );
    } catch (err) {
      const error = new CustomError(
        'Failed to delete assignment responses',
        err,
        {
          assignmentResponseIds,
        },
      );
      console.error(error);
      throw error;
    }
  }

  /**
   * Fetches the item for each block in the list of given blocks
   * If the item was replaced by another, the other item is used
   * The item_meta is filled in into the existing response (mutable)
   * @param blocks
   * @param items
   */
  static async enrichBlocksWithMeta(
    blocks?: AvoCoreBlockItemBase[],
    items: (AvoItemItem | null)[] = [],
  ): Promise<AvoCoreBlockItemBase[]> {
    const enriched = await Promise.all(
      (blocks || []).map(async (block): Promise<AvoCoreBlockItemBase> => {
        if (block.fragment_id) {
          try {
            const item_meta =
              items.find((item) => item?.external_id === block.fragment_id) ||
              (await ItemsService.fetchItemByExternalId(block.fragment_id)) ||
              undefined;

            // * For collection items, we want to use the original_title and original_description.
            //     This is what the collection creator entered as a custom title and description for the item when it was added to the collection
            // * For items that were directly added to the assignment, we need to use the fragment title and description,
            //     so when those are updated, the fragment in the assignment also updates
            return {
              ...block,
              original_title: (block as any).original_title || item_meta?.title,
              original_description:
                (block as any).original_description || item_meta?.description,
              item_meta,
            };
          } catch (error) {
            console.warn(
              `Unable to fetch meta data for ${block.fragment_id}`,
              error,
            );
          }
        }

        return block;
      }),
    );

    return enriched.filter(isItemWithMeta);
  }

  /**
   * Get the assignment responses for the specified assignment id and owner of the assignment
   * @param assignmentId
   */
  static async getAssignmentResponses(
    assignmentId: string,
  ): Promise<AvoAssignmentResponse[]> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );

      return (await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/assignment-responses/${assignmentId}/multiple`,
        {
          method: 'GET',
        },
      )) as AvoAssignmentResponse[];
    } catch (err) {
      const error = new CustomError(
        'Failed to get assignment responses from database',
        err,
        {
          assignmentId,
        },
      );
      console.error(error);
      throw error;
    }
  }

  /**
   * Get One specific assignment response for the current user for the specified assignment
   * Helper for create assignmentResponseObject method below
   */
  static async getAssignmentResponse(
    assignmentId: string,
  ): Promise<Omit<AvoAssignmentResponse, 'assignment'> | undefined> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      const assignmentResponse = (await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/assignment-responses/${assignmentId}/personal`,
        {
          method: 'GET',
        },
      )) as AvoAssignmentResponse | null;

      if (!assignmentResponse) {
        return undefined;
      }

      return {
        ...assignmentResponse,
        pupil_collection_blocks: await AssignmentService.enrichBlocksWithMeta(
          assignmentResponse.pupil_collection_blocks as AvoCoreBlockItemBase[],
        ),
      };
    } catch (err) {
      const error = new CustomError(
        'Failed to get assignment response from database',
        err,
        {
          assignmentId,
        },
      );
      console.error(error);
      throw error;
    }
  }

  /**
   * Get a response (and pupil collection) by assignmentResponseId
   */
  static async getAssignmentResponseById(
    assignmentResponseId: string,
  ): Promise<AvoAssignmentResponse | null> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      const assignmentResponse = (await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/assignment-responses/${assignmentResponseId}`,
        {
          method: 'GET',
        },
      )) as AvoAssignmentResponse | null;

      if (!assignmentResponse) {
        return null;
      }

      return {
        ...assignmentResponse,
        pupil_collection_blocks: await AssignmentService.enrichBlocksWithMeta(
          assignmentResponse.pupil_collection_blocks as AvoCoreBlockItemBase[],
        ),
      } as AvoAssignmentResponse;
    } catch (err) {
      const error = new CustomError(
        'Failed to get assignment response from database',
        err,
        {
          assignmentResponseId,
        },
      );
      console.error(error);
      throw error;
    }
  }

  /**
   * If the creation of the assignment response fails, we'll still continue with getting the assignment content
   * @param assignment assignment is passed since the tempAssignment has not been set into the state yet,
   * since we might need to get the assignment content as well and
   * this looks cleaner if everything loads at once instead of staggered
   * @param commonUser
   */
  static async createOrFetchAssignmentResponseObject(
    assignment: AvoAssignmentAssignment,
    commonUser: AvoUserCommonUser | undefined,
  ): Promise<Partial<Omit<AvoAssignmentResponse, 'assignment'>> | null> {
    try {
      if (!commonUser || !commonUser.profileId) {
        return null;
      }
      const existingAssignmentResponse:
        | Omit<AvoAssignmentResponse, 'assignment'>
        | undefined = await AssignmentService.getAssignmentResponse(
        assignment?.id,
      );

      if (existingAssignmentResponse) {
        if (
          assignment.lom_learning_resource_type?.includes(
            AvoCoreBlockItemType.BOUW,
          )
        ) {
          existingAssignmentResponse.collection_title =
            existingAssignmentResponse.collection_title ||
            tText('assignment/assignment___nieuwe-collectie');
        }
        return {
          ...existingAssignmentResponse,
          pupil_collection_blocks:
            existingAssignmentResponse.pupil_collection_blocks || [],
        };
      }

      // Student has never viewed this assignment before, we should create a response object for him
      const assignmentResponse: Partial<AvoAssignmentResponse> = {
        owner_profile_id: commonUser.profileId,
        assignment_id: assignment.id,
        collection_title: assignment.lom_learning_resource_type?.includes(
          AvoCoreBlockItemType.BOUW,
        )
          ? tText('assignment/assignment___nieuwe-collectie')
          : null,
      };
      const response = await dataService.query<
        InsertAssignmentResponseMutation,
        InsertAssignmentResponseMutationVariables
      >({
        query: InsertAssignmentResponseDocument,
        variables: {
          assignmentResponses: [assignmentResponse as any],
        },
      });

      const insertedAssignmentResponse =
        response.insert_app_assignment_responses_v2?.returning?.[0];

      if (isNil(insertedAssignmentResponse)) {
        throw new CustomError(
          'Response from graphql does not contain an assignment response',
          null,
          { response },
        );
      }

      const pupilCollectionBlocks =
        (insertedAssignmentResponse?.pupil_collection_blocks ||
          []) as unknown as AvoCoreBlockItemBase[];
      return {
        ...insertedAssignmentResponse,
        owner: assignmentResponse.owner || undefined,
        pupil_collection_blocks: await this.enrichBlocksWithMeta(
          pupilCollectionBlocks,
        ),
      };
    } catch (err) {
      throw new CustomError(
        'Failed to insert an assignment response in the database',
        err,
        {
          assignment,
        },
      );
    }
  }

  static async getAssignmentBlockMaxPosition(
    assignmentId: string,
  ): Promise<number | null> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/assignments/${assignmentId}/block-max-position`,
        {
          method: 'GET',
        },
      );
    } catch (err) {
      const error = new CustomError(
        'Failed to get assignment block max position',
        err,
        {
          assignmentId,
        },
      );
      console.error(error);
      throw error;
    }
  }

  static async importCollectionToAssignment(
    collection: AvoCollectionCollection,
    assignmentId: string,
    withDescription: boolean,
  ): Promise<boolean> {
    if (collection.collection_fragments?.length > 0) {
      const currentMaxPosition =
        await AssignmentService.getAssignmentBlockMaxPosition(assignmentId);
      const startPosition =
        currentMaxPosition === null ? 0 : currentMaxPosition + 1;
      const blocks = collection.collection_fragments.map(
        (fragment: any, index: number) => {
          const block: Partial<AvoAssignmentBlock> = {
            assignment_id: assignmentId,
            fragment_id: fragment.external_id,
            custom_title: null,
            custom_description: null,
            original_title: null,
            original_description: null,
            use_custom_fields: false,
            start_oc: fragment.start_oc,
            end_oc: fragment.end_oc,
            position: startPosition + index,
            thumbnail_path: fragment.thumbnail_path,
          };
          if (fragment.type === AvoCoreBlockItemType.TEXT) {
            // text: original text null, custom text set
            block.custom_title = fragment.custom_title;
            block.custom_description = fragment.custom_description;
            block.use_custom_fields = true;
            block.type = AvoCoreBlockItemType.TEXT;
          } else {
            // ITEM
            // custom_title and custom_description remain null
            // regardless of withDescription: ALWAYS copy the fragment custom title and description to the original fields
            // Since importing from collection, the collection is the source of truth and the original == collection fields
            block.original_title = fragment.custom_title;
            block.original_description = fragment.custom_description;
            block.use_custom_fields = !withDescription;
            block.type = AvoCoreBlockItemType.ITEM;
          }

          return block;
        },
      );
      try {
        // Insert fragments into assignment and update the updated_at date in parallel
        await Promise.all([
          dataService.query<
            InsertAssignmentBlocksMutation,
            InsertAssignmentBlocksMutationVariables
          >({
            query: InsertAssignmentBlocksDocument,
            variables: {
              assignmentBlocks: blocks,
            },
          }),
          this.updateAssignmentUpdatedAtDate(assignmentId),
          CollectionService.incrementAddCollectionToAssignmentCount(
            collection.id,
          ),
        ]);
      } catch (err) {
        const error = new CustomError(
          'Failed to import collection to assignment',
          err,
          {
            assignmentId,
            collectionId: collection.id,
          },
        );
        console.error(error);
        throw error;
      }
    }
    return true;
  }

  static async createAssignmentFromCollection(
    commonUser: AvoUserCommonUser,
    collection: AvoCollectionCollection,
    withDescription: boolean,
  ): Promise<string> {
    const assignment = await AssignmentService.insertAssignment(
      {
        title: collection.title,
        description: collection.description ?? undefined,
        owner_profile_id: commonUser.profileId,
      },
      commonUser,
    );

    const assignmentId = assignment?.id;

    if (isNil(assignmentId)) {
      throw new CustomError(
        'Saving the assignment failed, assignment id was undefined',
        null,
        {
          assignment,
        },
      );
    }

    await AssignmentService.importCollectionToAssignment(
      collection,
      assignmentId as string,
      withDescription,
    );

    // Success
    // Track import collection into assignment event
    trackEvents(
      {
        object: assignmentId as string,
        object_type: 'assignment',
        action: 'add',
        resource: {
          type: 'collection',
          id: collection.id,
          education_level: String(assignment?.education_level_id),
        },
      },
      commonUser,
    );

    return assignmentId as string;
  }

  static async createAssignmentFromFragment(
    commonUser: AvoUserCommonUser,
    item: AvoItemItem & {
      start_oc?: number | null;
      end_oc?: number | null;
    },
  ): Promise<string> {
    const assignment = await AssignmentService.insertAssignment(
      {
        title: item.title,
        owner_profile_id: commonUser.profileId,
        blocks: [
          {
            fragment_id: item.external_id,
            type: AvoCoreBlockItemType.ITEM,
            position: 0,
            start_oc: item.start_oc || null,
            end_oc: item.end_oc || null,
            thumbnail_path: item.start_oc
              ? await VideoStillService.getVideoStill(
                  item.external_id,
                  item.type.id,
                  item.start_oc * 1000,
                )
              : null,
          },
        ] as unknown as AvoAssignmentAssignment['blocks'],
      },
      commonUser,
    );

    if (!assignment) {
      throw new CustomError(
        'Saving the assignment failed, assignment id was undefined',
        null,
        {
          assignment,
        },
      );
    }

    return assignment.id;
  }

  static async importFragmentToAssignment(
    item: AvoItemItem,
    assignmentId: string,
    itemTrimInfo?: ItemTrimInfo,
  ): Promise<string> {
    // Handle trim settings and thumbnail
    const trimInfo: ItemTrimInfo = itemTrimInfo || {
      hasCut: false,
      fragmentStartTime: 0,
      fragmentEndTime: 0,
    };
    const thumbnailPath = trimInfo.hasCut
      ? await VideoStillService.getVideoStill(
          item.external_id,
          item.type_id,
          trimInfo.fragmentStartTime * 1000,
        )
      : null;

    // Determine block position
    const currentMaxPosition =
      await AssignmentService.getAssignmentBlockMaxPosition(assignmentId);
    const startPosition =
      currentMaxPosition === null ? 0 : currentMaxPosition + 1;

    // Add block with this fragment
    const block = {
      assignment_id: assignmentId,
      fragment_id: item.external_id,
      type: AvoCoreBlockItemType.ITEM,
      start_oc: trimInfo.hasCut ? trimInfo.fragmentStartTime : null,
      end_oc: trimInfo.hasCut ? trimInfo.fragmentEndTime : null,
      position: startPosition,
      thumbnail_path: thumbnailPath,
    };

    // Insert fragment into assignment and update the updated_at date in parallel
    await Promise.all([
      dataService.query<
        InsertAssignmentBlocksMutation,
        InsertAssignmentBlocksMutationVariables
      >({
        query: InsertAssignmentBlocksDocument,
        variables: {
          assignmentBlocks: [block],
        },
      }),
      this.updateAssignmentUpdatedAtDate(assignmentId),
    ]);

    return assignmentId;
  }

  static async fetchAssignmentsForAdmin(
    offset: number,
    limit: number,
    sortColumn: AssignmentTableColumns,
    sortOrder: AvoSearchOrderDirection,
    tableColumnDataType: TableColumnDataType,
    filters: Partial<AssignmentsOverviewTableState> = {},
  ): Promise<[AvoAssignmentAssignment[], number]> {
    try {
      return fetchWithLogoutJson(
        stringifyUrl({
          url: `${getEnv('PROXY_URL')}/assignments/admin/overview`,
          query: {
            offset,
            limit,
            sortColumn,
            sortOrder,
            tableColumnDataType,
            filters: JSON.stringify(filters),
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
          tableColumnDataType,
          filters,
        },
      );
    }
  }

  static async getAssignmentsByTitleOrDescription(
    title: string,
    description: string | null,
    assignmentId: string,
  ): Promise<{
    byTitle: boolean;
    byDescription: boolean;
  }> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      const url = stringifyUrl({
        url: `${getEnv('PROXY_URL')}/assignments/search`,
        query: {
          title,
          description,
          assignmentId,
        },
      });
      return fetchWithLogoutJson(url);
    } catch (err) {
      throw new CustomError(
        'Failed to get duplicate assignments by title or description',
        err,
        { title, description },
      );
    }
  }

  static async changeAssignmentsAuthor(
    profileId: string,
    assignmentIds: string[],
  ): Promise<number> {
    try {
      const url = stringifyUrl({
        url: `${getEnv('PROXY_URL')}/assignments/bulk/change-author`,
        query: {
          assignmentIds,
          authorId: profileId,
        },
      });
      return await fetchWithLogoutJson(url, {
        method: 'PATCH',
      });
    } catch (err) {
      throw new CustomError(
        'Failed to update author for assignments in the database',
        err,
        {
          profileId,
          assignmentIds,
        },
      );
    }
  }

  static async increaseViewCount(assignmentId: string): Promise<number> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/assignments/${assignmentId}/view-count`,
        {
          method: 'POST',
        },
      );
    } catch (err) {
      throw new CustomError(
        'Failed to increase assignment view count in the database',
        err,
        {
          assignmentId,
          query: 'INCREMENT_ASSIGNMENT_VIEW_COUNT',
        },
      );
    }
  }

  private static async getThumbnailPathForAssignment(
    assignment: Partial<AvoAssignmentAssignment>,
  ): Promise<string | null> {
    try {
      if (!assignment.thumbnail_path) {
        return await VideoStillService.getThumbnailForSubject(assignment);
      }

      return assignment.thumbnail_path;
    } catch (err) {
      const customError = new CustomError(
        'Failed to get the thumbnail path for assignment',
        err,
        {
          collection: assignment,
        },
      );
      console.error(customError);

      ToastService.danger([
        tHtml(
          'assignment/assignment___het-ophalen-van-de-eerste-video-afbeelding-is-mislukt',
        ),
        tHtml(
          'assignment/assignment___de-opdracht-zal-opgeslagen-worden-zonder-video-afbeelding',
        ),
      ]);

      return null;
    }
  }

  static async fetchContributorsByAssignmentId(
    assignmentId: string,
  ): Promise<AvoAssignmentContributor[]> {
    try {
      const variables: GetContributorsByAssignmentUuidQueryVariables = {
        id: assignmentId,
      };
      const response = await dataService.query<
        GetContributorsByAssignmentUuidQuery,
        GetContributorsByAssignmentUuidQueryVariables
      >({
        query: GetContributorsByAssignmentUuidDocument,
        variables,
      });

      const contributors = response.app_assignments_v2_contributors;

      if (!contributors) {
        throw new CustomError('Response does not contain contributors', null, {
          response,
        });
      }

      return contributors as AvoAssignmentContributor[];
    } catch (err) {
      throw new CustomError(
        'Failed to get contributors by assignment id from database',
        err,
        {
          assignmentId,
          query: 'GET_CONTRIBUTORS_BY_ASSIGNMENT_UUID',
        },
      );
    }
  }

  static async addContributor(
    assignment: AvoAssignmentAssignment | null | undefined,
    invitee: Partial<ContributorInfo>,
    inviter?: AvoUserCommonUser,
  ): Promise<void> {
    if (!assignment) return;

    const assignmentId = assignment.id;

    if (!invitee.email) {
      throw new CustomError('User has no email address');
    }

    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      await fetchWithLogoutJson(
        stringifyUrl({
          url: `${getEnv('PROXY_URL')}/assignments/${assignmentId}/share/add-contributor`,
          query: {
            email: invitee.email,
            rights: invitee.rights,
          },
        }),
        { method: 'POST' },
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { loms, ...rest } = invitee;

      trackEvents(
        {
          object: assignmentId,
          object_type: 'assignment',
          action: 'share',
          resource: {
            education_level: String(assignment.education_level_id),
            ...rest,
          },
        },
        inviter,
      );
    } catch (err) {
      throw new CustomError('Failed to add assignment contributor', err, {
        assignmentId,
        invitee,
        inviter,
      });
    }
  }

  static async editContributorRights(
    assignmentId: string,
    contributorId: string,
    rights: ContributorInfoRight,
  ): Promise<void> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      await fetchWithLogoutJson(
        stringifyUrl({
          url: `${getEnv(
            'PROXY_URL',
          )}/assignments/${assignmentId}/share/change-contributor-rights`,
          query: {
            contributorId,
            rights,
          },
        }),
        { method: 'PATCH' },
      );
    } catch (err) {
      throw new CustomError(
        'Failed to edit assignment contributor rights',
        err,
        {
          assignmentId,
          rights,
          contributorId,
        },
      );
    }
  }

  static async deleteContributor(
    assignmentId: string,
    contributorId?: string,
    profileId?: string,
  ): Promise<void> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      await fetchWithLogoutJson(
        stringifyUrl({
          url: `${getEnv(
            'PROXY_URL',
          )}/assignments/${assignmentId}/share/delete-contributor`,
          query: {
            contributorId,
            profileId,
          },
        }),
        { method: 'DELETE' },
      );
    } catch (err) {
      throw new CustomError('Failed to remove assignment contributor', err, {
        assignmentId,
        contributorId,
      });
    }
  }

  static async acceptSharedAssignment(
    assignmentId: string,
    inviteToken: string,
  ): Promise<AvoAssignmentContributor> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        stringifyUrl({
          url: `${getEnv('PROXY_URL')}/assignments/${assignmentId}/share/accept-invite`,
          query: {
            inviteToken,
          },
        }),
        { method: 'PATCH' },
      );
    } catch (err) {
      throw new CustomError('Failed to accept to share assignment', err, {
        assignmentId,
        inviteToken,
      });
    }
  }

  static async declineSharedAssignment(
    assignmentId: string,
    inviteToken: string,
  ): Promise<void> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      await fetchWithLogoutJson(
        stringifyUrl({
          url: `${getEnv('PROXY_URL')}/assignments/${assignmentId}/share/reject-invite`,
          query: {
            inviteToken,
          },
        }),
        { method: 'DELETE' },
      );
    } catch (err) {
      throw new CustomError('Failed to decline to share assignment', err, {
        assignmentId,
        inviteToken,
      });
    }
  }

  static async transferAssignmentOwnerShip(
    assignmentId: string,
    contributorProfileId: string,
  ): Promise<void> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      await fetchWithLogoutJson(
        `${getEnv(
          'PROXY_URL',
        )}/assignments/${assignmentId}/share/transfer-owner?newOwnerProfileId=${contributorProfileId}`,
        { method: 'PATCH' },
      );
    } catch (err) {
      throw new CustomError('Failed to transfer assignment ownership', err, {
        contributorProfileId,
      });
    }
  }

  static async updateAssignmentEditor(assignmentId: string): Promise<void> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      await fetchWithLogoutJson(
        stringifyUrl({
          url: `${getEnv(
            'PROXY_URL',
          )}/assignments/${assignmentId}/share/request-edit-status`,
        }),
        { method: 'PATCH' },
      );
    } catch (err) {
      throw new CustomError('Failed to update assignment current editor', err, {
        assignmentId,
      });
    }
  }

  static async getAssignmentsEditStatuses(
    ids: string[],
  ): Promise<AvoShareEditStatusResponse> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        stringifyUrl({
          url: `${getEnv('PROXY_URL')}/assignments/share/edit-status`,
          query: { ids },
        }),
        { method: 'GET' },
      );
    } catch (err) {
      throw new CustomError(
        'Failed to get assignment(s) edit status(es)',
        err,
        {
          assignmentIds: ids,
        },
      );
    }
  }

  static async releaseAssignmentEditStatus(
    assignmentId: string,
  ): Promise<AvoShareEditStatusResponse> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        stringifyUrl({
          url: `${getEnv(
            'PROXY_URL',
          )}/assignments/${assignmentId}/share/release-edit-status`,
        }),
        { method: 'PATCH' },
      );
    } catch (err) {
      throw new CustomError('Failed to release assignment edit status', err, {
        assignmentId,
      });
    }
  }

  public static async getMarcomEntries(
    assignmentUuid: string,
  ): Promise<AssignmentMarcomEntry[]> {
    let url: string | undefined = undefined;
    try {
      url = stringifyUrl({
        url: `${getEnv('PROXY_URL')}/assignments/${assignmentUuid}/marcom`,
      });
      const response = await fetchWithLogoutJson<AssignmentMarcomEntry[]>(url, {
        method: 'GET',
      });

      return response || [];
    } catch (err) {
      throw new CustomError(
        'Fetch assignment marcom entries from the database failed',
        err,
        {
          url,
          assignmentUuid,
        },
      );
    }
  }

  public static async insertMarcomEntry(
    marcomEntry: AssignmentMarcomEntry,
  ): Promise<string> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/assignments/${marcomEntry.assignment_id}/marcom`,
        { method: 'POST', body: JSON.stringify(marcomEntry) },
      );
    } catch (err) {
      throw new CustomError(
        'Failed to insert a marcom entry for assignment',
        err,
        {
          marcomEntry,
        },
      );
    }
  }

  static async insertMarcomEntriesForBundleAssignments(
    parentCollectionId: string,
    assignmentIds: string[],
    marcomEntry: AssignmentMarcomEntry,
  ): Promise<void> {
    const allEntries = assignmentIds.map((assignmentId) => ({
      ...marcomEntry,
      assignment_id: assignmentId,
      parent_collection_id: parentCollectionId,
    }));

    try {
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/assignments/marcom`,
        {
          method: 'POST',
          body: JSON.stringify(allEntries),
        },
      );
    } catch (err) {
      throw new CustomError(
        'Failed to insert a marcom entry for all bundle assignments',
        err,
        {
          parentCollectionId,
          allEntries,
        },
      );
    }
  }

  public static async deleteMarcomEntry(
    assignmentId: string,
    marcomEntryId: string | undefined,
  ): Promise<void> {
    if (isNil(marcomEntryId)) {
      return;
    }
    let url: string | undefined = undefined;
    try {
      url = `${getEnv('PROXY_URL')}/assignments/${assignmentId}/marcom/${marcomEntryId}`;
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(url, { method: 'DELETE' });
    } catch (err) {
      throw new CustomError(
        'Failed to delete a marcom entry for the database',
        err,
        {
          assignmentId,
          marcomEntryId,
          url,
        },
      );
    }
  }

  public static async insertOrUpdateMarcomNote(
    assignmentId: string,
    marcomNote: string,
  ) {
    // TODO call the backend to insert the marcom note, create backend route
    throw new Error(
      'not yet implemented: ' + JSON.stringify({ assignmentId, marcomNote }),
    );
  }
}
