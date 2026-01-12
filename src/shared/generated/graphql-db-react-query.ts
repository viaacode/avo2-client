// @ts-nocheck
import { useMutation, useQuery, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { fetchData } from '../services/data-service.ts';

export const BulkAddLabelsToCollectionsDocument = `
    mutation bulkAddLabelsToCollections($labels: [app_collection_labels_insert_input!]!) {
  insert_app_collection_labels(objects: $labels) {
    affected_rows
  }
}
    `;
export const useBulkAddLabelsToCollectionsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<BulkAddLabelsToCollectionsMutation, TError, BulkAddLabelsToCollectionsMutationVariables, TContext>) =>
    useMutation<BulkAddLabelsToCollectionsMutation, TError, BulkAddLabelsToCollectionsMutationVariables, TContext>(
      ['bulkAddLabelsToCollections'],
      (variables?: BulkAddLabelsToCollectionsMutationVariables) => fetchData<BulkAddLabelsToCollectionsMutation, BulkAddLabelsToCollectionsMutationVariables>(BulkAddLabelsToCollectionsDocument, variables)(),
      options
    );
export const BulkDeleteCollectionsDocument = `
    mutation bulkDeleteCollections($collectionIds: [uuid!]!, $now: timestamptz!, $updatedByProfileId: uuid!) {
  update_app_collections(
    where: {id: {_in: $collectionIds}, is_deleted: {_eq: false}}
    _set: {is_deleted: true, updated_at: $now, updated_by_profile_id: $updatedByProfileId}
  ) {
    affected_rows
  }
}
    `;
export const useBulkDeleteCollectionsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<BulkDeleteCollectionsMutation, TError, BulkDeleteCollectionsMutationVariables, TContext>) =>
    useMutation<BulkDeleteCollectionsMutation, TError, BulkDeleteCollectionsMutationVariables, TContext>(
      ['bulkDeleteCollections'],
      (variables?: BulkDeleteCollectionsMutationVariables) => fetchData<BulkDeleteCollectionsMutation, BulkDeleteCollectionsMutationVariables>(BulkDeleteCollectionsDocument, variables)(),
      options
    );
export const BulkDeleteLabelsFromCollectionsDocument = `
    mutation bulkDeleteLabelsFromCollections($labels: [String!]!, $collectionIds: [uuid!]!) {
  delete_app_collection_labels(
    where: {label: {_in: $labels}, collection_uuid: {_in: $collectionIds}}
  ) {
    affected_rows
  }
}
    `;
export const useBulkDeleteLabelsFromCollectionsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<BulkDeleteLabelsFromCollectionsMutation, TError, BulkDeleteLabelsFromCollectionsMutationVariables, TContext>) =>
    useMutation<BulkDeleteLabelsFromCollectionsMutation, TError, BulkDeleteLabelsFromCollectionsMutationVariables, TContext>(
      ['bulkDeleteLabelsFromCollections'],
      (variables?: BulkDeleteLabelsFromCollectionsMutationVariables) => fetchData<BulkDeleteLabelsFromCollectionsMutation, BulkDeleteLabelsFromCollectionsMutationVariables>(BulkDeleteLabelsFromCollectionsDocument, variables)(),
      options
    );
export const BulkUpdateAuthorForCollectionsDocument = `
    mutation bulkUpdateAuthorForCollections($authorId: uuid!, $collectionIds: [uuid!]!, $now: timestamptz!, $updatedByProfileId: uuid!) {
  update_app_collections(
    where: {id: {_in: $collectionIds}, is_deleted: {_eq: false}}
    _set: {owner_profile_id: $authorId, updated_at: $now, updated_by_profile_id: $updatedByProfileId}
  ) {
    affected_rows
  }
}
    `;
export const useBulkUpdateAuthorForCollectionsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<BulkUpdateAuthorForCollectionsMutation, TError, BulkUpdateAuthorForCollectionsMutationVariables, TContext>) =>
    useMutation<BulkUpdateAuthorForCollectionsMutation, TError, BulkUpdateAuthorForCollectionsMutationVariables, TContext>(
      ['bulkUpdateAuthorForCollections'],
      (variables?: BulkUpdateAuthorForCollectionsMutationVariables) => fetchData<BulkUpdateAuthorForCollectionsMutation, BulkUpdateAuthorForCollectionsMutationVariables>(BulkUpdateAuthorForCollectionsDocument, variables)(),
      options
    );
export const BulkUpdateDateAndLastAuthorCollectionsDocument = `
    mutation bulkUpdateDateAndLastAuthorCollections($collectionIds: [uuid!]!, $now: timestamptz!, $updatedByProfileId: uuid!) {
  update_app_collections(
    where: {id: {_in: $collectionIds}, is_deleted: {_eq: false}}
    _set: {updated_at: $now, updated_by_profile_id: $updatedByProfileId}
  ) {
    affected_rows
  }
}
    `;
export const useBulkUpdateDateAndLastAuthorCollectionsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<BulkUpdateDateAndLastAuthorCollectionsMutation, TError, BulkUpdateDateAndLastAuthorCollectionsMutationVariables, TContext>) =>
    useMutation<BulkUpdateDateAndLastAuthorCollectionsMutation, TError, BulkUpdateDateAndLastAuthorCollectionsMutationVariables, TContext>(
      ['bulkUpdateDateAndLastAuthorCollections'],
      (variables?: BulkUpdateDateAndLastAuthorCollectionsMutationVariables) => fetchData<BulkUpdateDateAndLastAuthorCollectionsMutation, BulkUpdateDateAndLastAuthorCollectionsMutationVariables>(BulkUpdateDateAndLastAuthorCollectionsDocument, variables)(),
      options
    );
export const BulkUpdatePublishStateForCollectionsDocument = `
    mutation bulkUpdatePublishStateForCollections($isPublic: Boolean!, $collectionIds: [uuid!]!, $now: timestamptz!, $updatedByProfileId: uuid!) {
  update_app_collections(
    where: {id: {_in: $collectionIds}, is_deleted: {_eq: false}}
    _set: {is_public: $isPublic, updated_at: $now, updated_by_profile_id: $updatedByProfileId}
  ) {
    affected_rows
  }
}
    `;
export const useBulkUpdatePublishStateForCollectionsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<BulkUpdatePublishStateForCollectionsMutation, TError, BulkUpdatePublishStateForCollectionsMutationVariables, TContext>) =>
    useMutation<BulkUpdatePublishStateForCollectionsMutation, TError, BulkUpdatePublishStateForCollectionsMutationVariables, TContext>(
      ['bulkUpdatePublishStateForCollections'],
      (variables?: BulkUpdatePublishStateForCollectionsMutationVariables) => fetchData<BulkUpdatePublishStateForCollectionsMutation, BulkUpdatePublishStateForCollectionsMutationVariables>(BulkUpdatePublishStateForCollectionsDocument, variables)(),
      options
    );
export const DeleteInteractiveTourDocument = `
    mutation deleteInteractiveTour($interactiveTourId: Int!) {
  delete_app_interactive_tour(where: {id: {_eq: $interactiveTourId}}) {
    affected_rows
  }
}
    `;
export const useDeleteInteractiveTourMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteInteractiveTourMutation, TError, DeleteInteractiveTourMutationVariables, TContext>) =>
    useMutation<DeleteInteractiveTourMutation, TError, DeleteInteractiveTourMutationVariables, TContext>(
      ['deleteInteractiveTour'],
      (variables?: DeleteInteractiveTourMutationVariables) => fetchData<DeleteInteractiveTourMutation, DeleteInteractiveTourMutationVariables>(DeleteInteractiveTourDocument, variables)(),
      options
    );
export const GetInteractiveTourByIdDocument = `
    query getInteractiveTourById($id: Int!) {
  app_interactive_tour(where: {id: {_eq: $id}}) {
    name
    id
    page_id: page
    created_at
    updated_at
    steps
  }
}
    `;
export const useGetInteractiveTourByIdQuery = <
      TData = GetInteractiveTourByIdQuery,
      TError = unknown
    >(
      variables: GetInteractiveTourByIdQueryVariables,
      options?: UseQueryOptions<GetInteractiveTourByIdQuery, TError, TData>
    ) =>
    useQuery<GetInteractiveTourByIdQuery, TError, TData>(
      ['getInteractiveTourById', variables],
      fetchData<GetInteractiveTourByIdQuery, GetInteractiveTourByIdQueryVariables>(GetInteractiveTourByIdDocument, variables),
      options
    );
export const GetInteractiveToursDocument = `
    query getInteractiveTours($limit: Int!, $offset: Int!, $orderBy: [app_interactive_tour_order_by!]!, $where: app_interactive_tour_bool_exp) {
  app_interactive_tour(
    limit: $limit
    offset: $offset
    order_by: $orderBy
    where: $where
  ) {
    name
    id
    page_id: page
    created_at
    updated_at
  }
  app_interactive_tour_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
    `;
export const useGetInteractiveToursQuery = <
      TData = GetInteractiveToursQuery,
      TError = unknown
    >(
      variables: GetInteractiveToursQueryVariables,
      options?: UseQueryOptions<GetInteractiveToursQuery, TError, TData>
    ) =>
    useQuery<GetInteractiveToursQuery, TError, TData>(
      ['getInteractiveTours', variables],
      fetchData<GetInteractiveToursQuery, GetInteractiveToursQueryVariables>(GetInteractiveToursDocument, variables),
      options
    );
export const InsertInteractiveTourDocument = `
    mutation insertInteractiveTour($interactiveTour: app_interactive_tour_insert_input!) {
  insert_app_interactive_tour(objects: [$interactiveTour]) {
    returning {
      id
    }
  }
}
    `;
export const useInsertInteractiveTourMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertInteractiveTourMutation, TError, InsertInteractiveTourMutationVariables, TContext>) =>
    useMutation<InsertInteractiveTourMutation, TError, InsertInteractiveTourMutationVariables, TContext>(
      ['insertInteractiveTour'],
      (variables?: InsertInteractiveTourMutationVariables) => fetchData<InsertInteractiveTourMutation, InsertInteractiveTourMutationVariables>(InsertInteractiveTourDocument, variables)(),
      options
    );
export const UpdateInteractiveTourDocument = `
    mutation updateInteractiveTour($interactiveTour: app_interactive_tour_set_input!, $interactiveTourId: Int!) {
  update_app_interactive_tour(
    where: {id: {_eq: $interactiveTourId}}
    _set: $interactiveTour
  ) {
    affected_rows
  }
}
    `;
export const useUpdateInteractiveTourMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateInteractiveTourMutation, TError, UpdateInteractiveTourMutationVariables, TContext>) =>
    useMutation<UpdateInteractiveTourMutation, TError, UpdateInteractiveTourMutationVariables, TContext>(
      ['updateInteractiveTour'],
      (variables?: UpdateInteractiveTourMutationVariables) => fetchData<UpdateInteractiveTourMutation, UpdateInteractiveTourMutationVariables>(UpdateInteractiveTourDocument, variables)(),
      options
    );
export const DeleteItemFromCollectionBookmarksAndAssignmentsDocument = `
    mutation deleteItemFromCollectionBookmarksAndAssignments($itemExternalId: bpchar!, $itemUid: uuid!) {
  delete_app_collection_fragments(where: {external_id: {_eq: $itemExternalId}}) {
    affected_rows
  }
  delete_app_item_bookmarks(where: {item_id: {_eq: $itemUid}}) {
    affected_rows
  }
}
    `;
export const useDeleteItemFromCollectionBookmarksAndAssignmentsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteItemFromCollectionBookmarksAndAssignmentsMutation, TError, DeleteItemFromCollectionBookmarksAndAssignmentsMutationVariables, TContext>) =>
    useMutation<DeleteItemFromCollectionBookmarksAndAssignmentsMutation, TError, DeleteItemFromCollectionBookmarksAndAssignmentsMutationVariables, TContext>(
      ['deleteItemFromCollectionBookmarksAndAssignments'],
      (variables?: DeleteItemFromCollectionBookmarksAndAssignmentsMutationVariables) => fetchData<DeleteItemFromCollectionBookmarksAndAssignmentsMutation, DeleteItemFromCollectionBookmarksAndAssignmentsMutationVariables>(DeleteItemFromCollectionBookmarksAndAssignmentsDocument, variables)(),
      options
    );
export const GetDistinctSeriesDocument = `
    query getDistinctSeries {
  app_item_meta(distinct_on: series, where: {series: {_is_null: false}}) {
    series
    is_published
    is_deleted
  }
}
    `;
export const useGetDistinctSeriesQuery = <
      TData = GetDistinctSeriesQuery,
      TError = unknown
    >(
      variables?: GetDistinctSeriesQueryVariables,
      options?: UseQueryOptions<GetDistinctSeriesQuery, TError, TData>
    ) =>
    useQuery<GetDistinctSeriesQuery, TError, TData>(
      variables === undefined ? ['getDistinctSeries'] : ['getDistinctSeries', variables],
      fetchData<GetDistinctSeriesQuery, GetDistinctSeriesQueryVariables>(GetDistinctSeriesDocument, variables),
      options
    );
export const GetItemDepublishReasonByExternalIdDocument = `
    query getItemDepublishReasonByExternalId($externalId: bpchar!) {
  app_item_meta(
    where: {external_id: {_eq: $externalId}, is_deleted: {_eq: false}, is_published: {_eq: false}}
  ) {
    depublish_reason
    is_published
    is_deleted
  }
}
    `;
export const useGetItemDepublishReasonByExternalIdQuery = <
      TData = GetItemDepublishReasonByExternalIdQuery,
      TError = unknown
    >(
      variables: GetItemDepublishReasonByExternalIdQueryVariables,
      options?: UseQueryOptions<GetItemDepublishReasonByExternalIdQuery, TError, TData>
    ) =>
    useQuery<GetItemDepublishReasonByExternalIdQuery, TError, TData>(
      ['getItemDepublishReasonByExternalId', variables],
      fetchData<GetItemDepublishReasonByExternalIdQuery, GetItemDepublishReasonByExternalIdQueryVariables>(GetItemDepublishReasonByExternalIdDocument, variables),
      options
    );
export const GetPublicItemsDocument = `
    query getPublicItems($limit: Int!) {
  app_item_meta(
    order_by: {title: asc}
    limit: $limit
    where: {is_published: {_eq: true}}
  ) {
    external_id
    title
    is_published
    is_deleted
  }
}
    `;
export const useGetPublicItemsQuery = <
      TData = GetPublicItemsQuery,
      TError = unknown
    >(
      variables: GetPublicItemsQueryVariables,
      options?: UseQueryOptions<GetPublicItemsQuery, TError, TData>
    ) =>
    useQuery<GetPublicItemsQuery, TError, TData>(
      ['getPublicItems', variables],
      fetchData<GetPublicItemsQuery, GetPublicItemsQueryVariables>(GetPublicItemsDocument, variables),
      options
    );
export const GetPublicItemsByTitleOrExternalIdDocument = `
    query getPublicItemsByTitleOrExternalId($title: String!, $externalId: bpchar!, $limit: Int!) {
  itemsByTitle: app_item_meta(
    order_by: {title: asc}
    limit: $limit
    where: {title: {_ilike: $title}, is_published: {_eq: true}}
  ) {
    external_id
    title
    is_published
    is_deleted
  }
  itemsByExternalId: app_item_meta(
    order_by: {title: asc}
    limit: $limit
    where: {external_id: {_eq: $externalId}, is_published: {_eq: true}}
  ) {
    external_id
    title
    is_published
    is_deleted
  }
}
    `;
export const useGetPublicItemsByTitleOrExternalIdQuery = <
      TData = GetPublicItemsByTitleOrExternalIdQuery,
      TError = unknown
    >(
      variables: GetPublicItemsByTitleOrExternalIdQueryVariables,
      options?: UseQueryOptions<GetPublicItemsByTitleOrExternalIdQuery, TError, TData>
    ) =>
    useQuery<GetPublicItemsByTitleOrExternalIdQuery, TError, TData>(
      ['getPublicItemsByTitleOrExternalId', variables],
      fetchData<GetPublicItemsByTitleOrExternalIdQuery, GetPublicItemsByTitleOrExternalIdQueryVariables>(GetPublicItemsByTitleOrExternalIdDocument, variables),
      options
    );
export const GetUnpublishedItemPidsDocument = `
    query getUnpublishedItemPids($where: shared_items_bool_exp!) {
  shared_items(where: $where) {
    pid
  }
}
    `;
export const useGetUnpublishedItemPidsQuery = <
      TData = GetUnpublishedItemPidsQuery,
      TError = unknown
    >(
      variables: GetUnpublishedItemPidsQueryVariables,
      options?: UseQueryOptions<GetUnpublishedItemPidsQuery, TError, TData>
    ) =>
    useQuery<GetUnpublishedItemPidsQuery, TError, TData>(
      ['getUnpublishedItemPids', variables],
      fetchData<GetUnpublishedItemPidsQuery, GetUnpublishedItemPidsQueryVariables>(GetUnpublishedItemPidsDocument, variables),
      options
    );
export const GetUnpublishedItemsWithFiltersDocument = `
    query getUnpublishedItemsWithFilters($where: shared_items_bool_exp!, $orderBy: [shared_items_order_by!], $offset: Int!, $limit: Int!) {
  shared_items(where: $where, order_by: $orderBy, offset: $offset, limit: $limit) {
    id
    pid
    updated_at
    title
    status
    item_meta {
      id
      external_id
      uid
      is_published
      is_deleted
    }
  }
  shared_items_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
    `;
export const useGetUnpublishedItemsWithFiltersQuery = <
      TData = GetUnpublishedItemsWithFiltersQuery,
      TError = unknown
    >(
      variables: GetUnpublishedItemsWithFiltersQueryVariables,
      options?: UseQueryOptions<GetUnpublishedItemsWithFiltersQuery, TError, TData>
    ) =>
    useQuery<GetUnpublishedItemsWithFiltersQuery, TError, TData>(
      ['getUnpublishedItemsWithFilters', variables],
      fetchData<GetUnpublishedItemsWithFiltersQuery, GetUnpublishedItemsWithFiltersQueryVariables>(GetUnpublishedItemsWithFiltersDocument, variables),
      options
    );
export const GetUserWithEitherBookmarkDocument = `
    query getUserWithEitherBookmark($oldItemUid: uuid!, $newItemUid: uuid!) {
  users_profiles(
    where: {item_bookmarks: {item_id: {_in: [$oldItemUid, $newItemUid]}}}
  ) {
    id
    item_bookmarks_aggregate(where: {item_id: {_in: [$oldItemUid, $newItemUid]}}) {
      aggregate {
        count
      }
    }
  }
}
    `;
export const useGetUserWithEitherBookmarkQuery = <
      TData = GetUserWithEitherBookmarkQuery,
      TError = unknown
    >(
      variables: GetUserWithEitherBookmarkQueryVariables,
      options?: UseQueryOptions<GetUserWithEitherBookmarkQuery, TError, TData>
    ) =>
    useQuery<GetUserWithEitherBookmarkQuery, TError, TData>(
      ['getUserWithEitherBookmark', variables],
      fetchData<GetUserWithEitherBookmarkQuery, GetUserWithEitherBookmarkQueryVariables>(GetUserWithEitherBookmarkDocument, variables),
      options
    );
export const ReplaceItemInCollectionsBookmarksAndAssignmentsDocument = `
    mutation replaceItemInCollectionsBookmarksAndAssignments($oldItemUid: uuid!, $oldItemExternalId: bpchar!, $newItemUid: uuid!, $newItemExternalId: bpchar!, $usersWithBothBookmarks: [uuid!]!) {
  update_app_collection_fragments(
    where: {external_id: {_eq: $oldItemExternalId}}
    _set: {external_id: $newItemExternalId, start_oc: null, end_oc: null}
  ) {
    affected_rows
  }
  update_app_item_bookmarks(
    where: {item_id: {_eq: $oldItemUid}, _not: {profile_id: {_in: $usersWithBothBookmarks}}}
    _set: {item_id: $newItemUid}
  ) {
    affected_rows
  }
  delete_app_item_bookmarks(
    where: {item_id: {_eq: $oldItemUid}, profile_id: {_in: $usersWithBothBookmarks}}
  ) {
    affected_rows
  }
  update_app_assignment_blocks_v2(
    where: {fragment_id: {_eq: $oldItemExternalId}, type: {_eq: "ITEM"}}
    _set: {fragment_id: $newItemExternalId}
  ) {
    affected_rows
  }
  update_app_pupil_collection_blocks(
    where: {fragment_id: {_eq: $oldItemExternalId}, type: {_eq: "ITEM"}}
    _set: {fragment_id: $newItemExternalId}
  ) {
    affected_rows
  }
}
    `;
export const useReplaceItemInCollectionsBookmarksAndAssignmentsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ReplaceItemInCollectionsBookmarksAndAssignmentsMutation, TError, ReplaceItemInCollectionsBookmarksAndAssignmentsMutationVariables, TContext>) =>
    useMutation<ReplaceItemInCollectionsBookmarksAndAssignmentsMutation, TError, ReplaceItemInCollectionsBookmarksAndAssignmentsMutationVariables, TContext>(
      ['replaceItemInCollectionsBookmarksAndAssignments'],
      (variables?: ReplaceItemInCollectionsBookmarksAndAssignmentsMutationVariables) => fetchData<ReplaceItemInCollectionsBookmarksAndAssignmentsMutation, ReplaceItemInCollectionsBookmarksAndAssignmentsMutationVariables>(ReplaceItemInCollectionsBookmarksAndAssignmentsDocument, variables)(),
      options
    );
export const SetSharedItemsStatusDocument = `
    mutation setSharedItemsStatus($pids: [String!]!, $status: item_publishing_status) {
  update_shared_items(where: {pid: {_in: $pids}}, _set: {status: $status}) {
    affected_rows
  }
}
    `;
export const useSetSharedItemsStatusMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<SetSharedItemsStatusMutation, TError, SetSharedItemsStatusMutationVariables, TContext>) =>
    useMutation<SetSharedItemsStatusMutation, TError, SetSharedItemsStatusMutationVariables, TContext>(
      ['setSharedItemsStatus'],
      (variables?: SetSharedItemsStatusMutationVariables) => fetchData<SetSharedItemsStatusMutation, SetSharedItemsStatusMutationVariables>(SetSharedItemsStatusDocument, variables)(),
      options
    );
export const UpdateItemDepublishReasonDocument = `
    mutation updateItemDepublishReason($itemUuid: uuid!, $reason: String) {
  update_app_item_meta(
    where: {uid: {_eq: $itemUuid}}
    _set: {depublish_reason: $reason}
  ) {
    affected_rows
  }
}
    `;
export const useUpdateItemDepublishReasonMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateItemDepublishReasonMutation, TError, UpdateItemDepublishReasonMutationVariables, TContext>) =>
    useMutation<UpdateItemDepublishReasonMutation, TError, UpdateItemDepublishReasonMutationVariables, TContext>(
      ['updateItemDepublishReason'],
      (variables?: UpdateItemDepublishReasonMutationVariables) => fetchData<UpdateItemDepublishReasonMutation, UpdateItemDepublishReasonMutationVariables>(UpdateItemDepublishReasonDocument, variables)(),
      options
    );
export const UpdateItemPublishedStateDocument = `
    mutation updateItemPublishedState($itemUuid: uuid!, $isPublished: Boolean!) {
  update_app_item_meta(
    where: {uid: {_eq: $itemUuid}}
    _set: {is_published: $isPublished}
  ) {
    affected_rows
  }
}
    `;
export const useUpdateItemPublishedStateMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateItemPublishedStateMutation, TError, UpdateItemPublishedStateMutationVariables, TContext>) =>
    useMutation<UpdateItemPublishedStateMutation, TError, UpdateItemPublishedStateMutationVariables, TContext>(
      ['updateItemPublishedState'],
      (variables?: UpdateItemPublishedStateMutationVariables) => fetchData<UpdateItemPublishedStateMutation, UpdateItemPublishedStateMutationVariables>(UpdateItemPublishedStateDocument, variables)(),
      options
    );
export const GetTranslationsDocument = `
    query getTranslations {
  app_site_variables(where: {name: {_ilike: "translations-%"}}) {
    name
    value
  }
}
    `;
export const useGetTranslationsQuery = <
      TData = GetTranslationsQuery,
      TError = unknown
    >(
      variables?: GetTranslationsQueryVariables,
      options?: UseQueryOptions<GetTranslationsQuery, TError, TData>
    ) =>
    useQuery<GetTranslationsQuery, TError, TData>(
      variables === undefined ? ['getTranslations'] : ['getTranslations', variables],
      fetchData<GetTranslationsQuery, GetTranslationsQueryVariables>(GetTranslationsDocument, variables),
      options
    );
export const UpdateTranslationsDocument = `
    mutation updateTranslations($name: String!, $translations: app_site_variables_set_input!) {
  update_app_site_variables(where: {name: {_eq: $name}}, _set: $translations) {
    affected_rows
  }
}
    `;
export const useUpdateTranslationsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateTranslationsMutation, TError, UpdateTranslationsMutationVariables, TContext>) =>
    useMutation<UpdateTranslationsMutation, TError, UpdateTranslationsMutationVariables, TContext>(
      ['updateTranslations'],
      (variables?: UpdateTranslationsMutationVariables) => fetchData<UpdateTranslationsMutation, UpdateTranslationsMutationVariables>(UpdateTranslationsDocument, variables)(),
      options
    );
export const GetUserGroupsWithFiltersDocument = `
    query getUserGroupsWithFilters($limit: Int!, $offset: Int!, $orderBy: [users_groups_order_by!]!, $where: users_groups_bool_exp!) {
  users_groups(limit: $limit, offset: $offset, order_by: $orderBy, where: $where) {
    label
    id
    created_at
    description
    updated_at
  }
  users_groups_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
    `;
export const useGetUserGroupsWithFiltersQuery = <
      TData = GetUserGroupsWithFiltersQuery,
      TError = unknown
    >(
      variables: GetUserGroupsWithFiltersQueryVariables,
      options?: UseQueryOptions<GetUserGroupsWithFiltersQuery, TError, TData>
    ) =>
    useQuery<GetUserGroupsWithFiltersQuery, TError, TData>(
      ['getUserGroupsWithFilters', variables],
      fetchData<GetUserGroupsWithFiltersQuery, GetUserGroupsWithFiltersQueryVariables>(GetUserGroupsWithFiltersDocument, variables),
      options
    );
export const GetProfileIdsDocument = `
    query getProfileIds($where: users_summary_view_bool_exp!) {
  users_summary_view(where: $where) {
    profile_id
  }
}
    `;
export const useGetProfileIdsQuery = <
      TData = GetProfileIdsQuery,
      TError = unknown
    >(
      variables: GetProfileIdsQueryVariables,
      options?: UseQueryOptions<GetProfileIdsQuery, TError, TData>
    ) =>
    useQuery<GetProfileIdsQuery, TError, TData>(
      ['getProfileIds', variables],
      fetchData<GetProfileIdsQuery, GetProfileIdsQueryVariables>(GetProfileIdsDocument, variables),
      options
    );
export const UpdateUserTempAccessByIdDocument = `
    mutation updateUserTempAccessById($profile_id: uuid!, $from: date, $until: date!) {
  insert_shared_user_temp_access_v2_one(
    object: {profile_id: $profile_id, from: $from, until: $until}
    on_conflict: {constraint: user_temp_access_v2_pkey, update_columns: [from, until]}
  ) {
    profile_id
  }
}
    `;
export const useUpdateUserTempAccessByIdMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateUserTempAccessByIdMutation, TError, UpdateUserTempAccessByIdMutationVariables, TContext>) =>
    useMutation<UpdateUserTempAccessByIdMutation, TError, UpdateUserTempAccessByIdMutationVariables, TContext>(
      ['updateUserTempAccessById'],
      (variables?: UpdateUserTempAccessByIdMutationVariables) => fetchData<UpdateUserTempAccessByIdMutation, UpdateUserTempAccessByIdMutationVariables>(UpdateUserTempAccessByIdDocument, variables)(),
      options
    );
export const GetAssignmentWithResponseDocument = `
    query getAssignmentWithResponse($assignmentId: uuid!, $pupilUuid: uuid!) {
  app_assignments_v2(
    where: {id: {_eq: $assignmentId}, is_deleted: {_eq: false}}
    order_by: [{deadline_at: desc}]
  ) {
    id
    title
    description
    answer_url
    created_at
    updated_at
    available_at
    deadline_at
    is_collaborative
    is_deleted
    is_public
    is_managed
    thumbnail_path
    owner_profile_id
    owner {
      full_name
    }
    profile {
      id
      avatar
      user: usersByuserId {
        first_name
        last_name
        id
      }
      organisation {
        logo_url
        name
        or_id
      }
      profile_user_group {
        group {
          label
          id
        }
      }
    }
    labels(order_by: {assignment_label: {label: asc}}) {
      id
      assignment_label {
        color_enum_value
        color_override
        enum_color {
          label
          value
        }
        id
        label
        type
        owner_profile_id
      }
    }
    responses(where: {owner_profile_id: {_eq: $pupilUuid}}) {
      id
      assignment_id
      collection_title
      created_at
      updated_at
      owner_profile_id
      owner {
        full_name
      }
      assignment {
        id
        title
        deadline_at
        owner {
          full_name
        }
        owner_profile_id
      }
      pupil_collection_blocks(
        where: {is_deleted: {_eq: false}}
        order_by: {position: asc}
      ) {
        id
        position
        type
        custom_title
        thumbnail_path
        use_custom_fields
        custom_description
        created_at
        updated_at
        fragment_id
        start_oc
        end_oc
        assignment_response_id
      }
    }
    contributors {
      profile {
        avatar
        user_id
        user {
          last_name
          first_name
          mail
          full_name
        }
        id: profile_id
        organisation {
          name
          logo_url
          or_id
        }
        loms {
          lom_id
        }
      }
      id
      profile_id
      rights
    }
    loms {
      lom {
        id
        label
        scheme
        broader
      }
    }
    lom_learning_resource_type
    education_level_id
    education_level {
      label
    }
  }
}
    `;
export const useGetAssignmentWithResponseQuery = <
      TData = GetAssignmentWithResponseQuery,
      TError = unknown
    >(
      variables: GetAssignmentWithResponseQueryVariables,
      options?: UseQueryOptions<GetAssignmentWithResponseQuery, TError, TData>
    ) =>
    useQuery<GetAssignmentWithResponseQuery, TError, TData>(
      ['getAssignmentWithResponse', variables],
      fetchData<GetAssignmentWithResponseQuery, GetAssignmentWithResponseQueryVariables>(GetAssignmentWithResponseDocument, variables),
      options
    );
export const GetContributorsByAssignmentUuidDocument = `
    query getContributorsByAssignmentUuid($id: uuid!) {
  app_assignments_v2_contributors(where: {assignment_id: {_eq: $id}}) {
    assignment_id
    invite_email
    invite_token
    rights
    profile_id
    id
    profile {
      avatar
      user {
        first_name
        full_name
        last_name
        mail
      }
      organisation {
        name
        logo_url
        or_id
      }
      loms {
        lom_id
      }
    }
  }
}
    `;
export const useGetContributorsByAssignmentUuidQuery = <
      TData = GetContributorsByAssignmentUuidQuery,
      TError = unknown
    >(
      variables: GetContributorsByAssignmentUuidQueryVariables,
      options?: UseQueryOptions<GetContributorsByAssignmentUuidQuery, TError, TData>
    ) =>
    useQuery<GetContributorsByAssignmentUuidQuery, TError, TData>(
      ['getContributorsByAssignmentUuid', variables],
      fetchData<GetContributorsByAssignmentUuidQuery, GetContributorsByAssignmentUuidQueryVariables>(GetContributorsByAssignmentUuidDocument, variables),
      options
    );
export const InsertAssignmentBlocksDocument = `
    mutation insertAssignmentBlocks($assignmentBlocks: [app_assignment_blocks_v2_insert_input!]!) {
  insert_app_assignment_blocks_v2(objects: $assignmentBlocks) {
    affected_rows
  }
}
    `;
export const useInsertAssignmentBlocksMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertAssignmentBlocksMutation, TError, InsertAssignmentBlocksMutationVariables, TContext>) =>
    useMutation<InsertAssignmentBlocksMutation, TError, InsertAssignmentBlocksMutationVariables, TContext>(
      ['insertAssignmentBlocks'],
      (variables?: InsertAssignmentBlocksMutationVariables) => fetchData<InsertAssignmentBlocksMutation, InsertAssignmentBlocksMutationVariables>(InsertAssignmentBlocksDocument, variables)(),
      options
    );
export const InsertAssignmentResponseDocument = `
    mutation insertAssignmentResponse($assignmentResponses: [app_assignment_responses_v2_insert_input!]!) {
  insert_app_assignment_responses_v2(objects: $assignmentResponses) {
    affected_rows
    returning {
      id
      created_at
      owner_profile_id
      assignment_id
      collection_title
      updated_at
      owner {
        full_name
      }
      assignment {
        id
        title
        deadline_at
        owner {
          full_name
        }
        owner_profile_id
      }
      pupil_collection_blocks(
        where: {is_deleted: {_eq: false}}
        order_by: {position: asc}
      ) {
        id
        fragment_id
        use_custom_fields
        custom_title
        custom_description
        start_oc
        end_oc
        position
        created_at
        updated_at
        type
        thumbnail_path
        assignment_response_id
      }
    }
  }
}
    `;
export const useInsertAssignmentResponseMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertAssignmentResponseMutation, TError, InsertAssignmentResponseMutationVariables, TContext>) =>
    useMutation<InsertAssignmentResponseMutation, TError, InsertAssignmentResponseMutationVariables, TContext>(
      ['insertAssignmentResponse'],
      (variables?: InsertAssignmentResponseMutationVariables) => fetchData<InsertAssignmentResponseMutation, InsertAssignmentResponseMutationVariables>(InsertAssignmentResponseDocument, variables)(),
      options
    );
export const DeleteManagementEntryByCollectionIdDocument = `
    mutation deleteManagementEntryByCollectionId($collection_id: uuid!) {
  delete_app_collection_management(where: {collection_id: {_eq: $collection_id}}) {
    affected_rows
  }
}
    `;
export const useDeleteManagementEntryByCollectionIdMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteManagementEntryByCollectionIdMutation, TError, DeleteManagementEntryByCollectionIdMutationVariables, TContext>) =>
    useMutation<DeleteManagementEntryByCollectionIdMutation, TError, DeleteManagementEntryByCollectionIdMutationVariables, TContext>(
      ['deleteManagementEntryByCollectionId'],
      (variables?: DeleteManagementEntryByCollectionIdMutationVariables) => fetchData<DeleteManagementEntryByCollectionIdMutation, DeleteManagementEntryByCollectionIdMutationVariables>(DeleteManagementEntryByCollectionIdDocument, variables)(),
      options
    );
export const DeleteCollectionFragmentByIdDocument = `
    mutation deleteCollectionFragmentById($id: Int!) {
  delete_app_collection_fragments(where: {id: {_eq: $id}}) {
    affected_rows
  }
}
    `;
export const useDeleteCollectionFragmentByIdMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteCollectionFragmentByIdMutation, TError, DeleteCollectionFragmentByIdMutationVariables, TContext>) =>
    useMutation<DeleteCollectionFragmentByIdMutation, TError, DeleteCollectionFragmentByIdMutationVariables, TContext>(
      ['deleteCollectionFragmentById'],
      (variables?: DeleteCollectionFragmentByIdMutationVariables) => fetchData<DeleteCollectionFragmentByIdMutation, DeleteCollectionFragmentByIdMutationVariables>(DeleteCollectionFragmentByIdDocument, variables)(),
      options
    );
export const DeleteCollectionLabelsDocument = `
    mutation deleteCollectionLabels($labels: [String!]!, $collectionId: uuid!) {
  delete_app_collection_labels(
    where: {label: {_in: $labels}, collection_uuid: {_eq: $collectionId}}
  ) {
    affected_rows
  }
}
    `;
export const useDeleteCollectionLabelsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteCollectionLabelsMutation, TError, DeleteCollectionLabelsMutationVariables, TContext>) =>
    useMutation<DeleteCollectionLabelsMutation, TError, DeleteCollectionLabelsMutationVariables, TContext>(
      ['deleteCollectionLabels'],
      (variables?: DeleteCollectionLabelsMutationVariables) => fetchData<DeleteCollectionLabelsMutation, DeleteCollectionLabelsMutationVariables>(DeleteCollectionLabelsDocument, variables)(),
      options
    );
export const DeleteCollectionLomLinksDocument = `
    mutation deleteCollectionLomLinks($collectionId: uuid!) {
  delete_app_collections_lom_links(where: {collection_id: {_eq: $collectionId}}) {
    affected_rows
  }
}
    `;
export const useDeleteCollectionLomLinksMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteCollectionLomLinksMutation, TError, DeleteCollectionLomLinksMutationVariables, TContext>) =>
    useMutation<DeleteCollectionLomLinksMutation, TError, DeleteCollectionLomLinksMutationVariables, TContext>(
      ['deleteCollectionLomLinks'],
      (variables?: DeleteCollectionLomLinksMutationVariables) => fetchData<DeleteCollectionLomLinksMutation, DeleteCollectionLomLinksMutationVariables>(DeleteCollectionLomLinksDocument, variables)(),
      options
    );
export const DeleteCollectionOrBundleByUuidDocument = `
    mutation deleteCollectionOrBundleByUuid($collectionOrBundleUuid: uuid!, $collectionOrBundleUuidAsText: bpchar!) {
  update_app_collections(
    where: {id: {_eq: $collectionOrBundleUuid}}
    _set: {is_deleted: true}
  ) {
    affected_rows
  }
  delete_app_collection_fragments(
    where: {type: {_eq: "COLLECTION"}, external_id: {_eq: $collectionOrBundleUuidAsText}}
  ) {
    affected_rows
  }
  delete_app_collection_bookmarks(
    where: {collection_uuid: {_eq: $collectionOrBundleUuid}}
  ) {
    affected_rows
  }
}
    `;
export const useDeleteCollectionOrBundleByUuidMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteCollectionOrBundleByUuidMutation, TError, DeleteCollectionOrBundleByUuidMutationVariables, TContext>) =>
    useMutation<DeleteCollectionOrBundleByUuidMutation, TError, DeleteCollectionOrBundleByUuidMutationVariables, TContext>(
      ['deleteCollectionOrBundleByUuid'],
      (variables?: DeleteCollectionOrBundleByUuidMutationVariables) => fetchData<DeleteCollectionOrBundleByUuidMutation, DeleteCollectionOrBundleByUuidMutationVariables>(DeleteCollectionOrBundleByUuidDocument, variables)(),
      options
    );
export const DeleteMarcomEntriesByParentCollectionIdDocument = `
    mutation deleteMarcomEntriesByParentCollectionId($parentCollectionId: uuid, $channelName: String, $channelType: String, $publishDateGte: timestamptz, $publishDateLte: timestamptz) {
  delete_app_collection_marcom_log(
    where: {parent_collection_id: {_eq: $parentCollectionId}, publish_date: {_gte: $publishDateGte, _lte: $publishDateLte}, channel_name: {_eq: $channelName}, channel_type: {_eq: $channelType}}
  ) {
    affected_rows
  }
}
    `;
export const useDeleteMarcomEntriesByParentCollectionIdMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteMarcomEntriesByParentCollectionIdMutation, TError, DeleteMarcomEntriesByParentCollectionIdMutationVariables, TContext>) =>
    useMutation<DeleteMarcomEntriesByParentCollectionIdMutation, TError, DeleteMarcomEntriesByParentCollectionIdMutationVariables, TContext>(
      ['deleteMarcomEntriesByParentCollectionId'],
      (variables?: DeleteMarcomEntriesByParentCollectionIdMutationVariables) => fetchData<DeleteMarcomEntriesByParentCollectionIdMutation, DeleteMarcomEntriesByParentCollectionIdMutationVariables>(DeleteMarcomEntriesByParentCollectionIdDocument, variables)(),
      options
    );
export const DeleteMarcomEntryDocument = `
    mutation deleteMarcomEntry($id: Int) {
  delete_app_collection_marcom_log(where: {id: {_eq: $id}}) {
    affected_rows
  }
}
    `;
export const useDeleteMarcomEntryMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteMarcomEntryMutation, TError, DeleteMarcomEntryMutationVariables, TContext>) =>
    useMutation<DeleteMarcomEntryMutation, TError, DeleteMarcomEntryMutationVariables, TContext>(
      ['deleteMarcomEntry'],
      (variables?: DeleteMarcomEntryMutationVariables) => fetchData<DeleteMarcomEntryMutation, DeleteMarcomEntryMutationVariables>(DeleteMarcomEntryDocument, variables)(),
      options
    );
export const GetBookmarkedCollectionsByOwnerDocument = `
    query getBookmarkedCollectionsByOwner($owner_profile_id: uuid, $offset: Int = 0, $limit: Int, $order: [app_collection_bookmarks_order_by!] = {updated_at: desc}, $where: [app_collection_bookmarks_bool_exp!] = []) {
  app_collection_bookmarks(
    where: {profile_id: {_eq: $owner_profile_id}, bookmarkedCollection: {}, _and: $where}
    offset: $offset
    limit: $limit
    order_by: $order
  ) {
    bookmarkedCollection {
      id
      updated_at
      type_id
      type {
        label
        id
      }
      title
      publish_at
      owner_profile_id
      profile {
        id
        alias
        title
        alternative_email
        avatar
        organisation {
          logo_url
          name
          or_id
        }
        created_at
        stamboek
        updated_at
        user_id
        user: usersByuserId {
          id
          first_name
          last_name
          profile {
            profile_user_group {
              group {
                label
                id
              }
            }
          }
        }
      }
      is_public
      external_id
      depublish_at
      created_at
      thumbnail_path
      view_count {
        count
      }
    }
  }
}
    `;
export const useGetBookmarkedCollectionsByOwnerQuery = <
      TData = GetBookmarkedCollectionsByOwnerQuery,
      TError = unknown
    >(
      variables?: GetBookmarkedCollectionsByOwnerQueryVariables,
      options?: UseQueryOptions<GetBookmarkedCollectionsByOwnerQuery, TError, TData>
    ) =>
    useQuery<GetBookmarkedCollectionsByOwnerQuery, TError, TData>(
      variables === undefined ? ['getBookmarkedCollectionsByOwner'] : ['getBookmarkedCollectionsByOwner', variables],
      fetchData<GetBookmarkedCollectionsByOwnerQuery, GetBookmarkedCollectionsByOwnerQueryVariables>(GetBookmarkedCollectionsByOwnerDocument, variables),
      options
    );
export const GetBundleTitlesByOwnerDocument = `
    query getBundleTitlesByOwner($owner_profile_id: uuid) {
  app_collections(
    where: {type_id: {_eq: 4}, owner_profile_id: {_eq: $owner_profile_id}, is_deleted: {_eq: false}}
    order_by: {updated_at: desc}
  ) {
    id
    title
  }
}
    `;
export const useGetBundleTitlesByOwnerQuery = <
      TData = GetBundleTitlesByOwnerQuery,
      TError = unknown
    >(
      variables?: GetBundleTitlesByOwnerQueryVariables,
      options?: UseQueryOptions<GetBundleTitlesByOwnerQuery, TError, TData>
    ) =>
    useQuery<GetBundleTitlesByOwnerQuery, TError, TData>(
      variables === undefined ? ['getBundleTitlesByOwner'] : ['getBundleTitlesByOwner', variables],
      fetchData<GetBundleTitlesByOwnerQuery, GetBundleTitlesByOwnerQueryVariables>(GetBundleTitlesByOwnerDocument, variables),
      options
    );
export const GetCollectionByTitleOrDescriptionDocument = `
    query getCollectionByTitleOrDescription($title: String!, $description: String!, $collectionId: uuid!, $typeId: Int) {
  collectionByTitle: app_collections(
    where: {title: {_eq: $title}, is_deleted: {_eq: false}, is_public: {_eq: true}, id: {_neq: $collectionId}, type_id: {_eq: $typeId}}
    limit: 1
  ) {
    id
  }
  collectionByDescription: app_collections(
    where: {description: {_eq: $description}, is_deleted: {_eq: false}, is_public: {_eq: true}, id: {_neq: $collectionId}, type_id: {_eq: $typeId}}
    limit: 1
  ) {
    id
  }
}
    `;
export const useGetCollectionByTitleOrDescriptionQuery = <
      TData = GetCollectionByTitleOrDescriptionQuery,
      TError = unknown
    >(
      variables: GetCollectionByTitleOrDescriptionQueryVariables,
      options?: UseQueryOptions<GetCollectionByTitleOrDescriptionQuery, TError, TData>
    ) =>
    useQuery<GetCollectionByTitleOrDescriptionQuery, TError, TData>(
      ['getCollectionByTitleOrDescription', variables],
      fetchData<GetCollectionByTitleOrDescriptionQuery, GetCollectionByTitleOrDescriptionQueryVariables>(GetCollectionByTitleOrDescriptionDocument, variables),
      options
    );
export const GetCollectionMarcomEntriesDocument = `
    query getCollectionMarcomEntries($collectionUuid: uuid!) {
  app_collection_marcom_log(
    where: {collection_id: {_eq: $collectionUuid}}
    limit: 10
    order_by: [{created_at: desc_nulls_last}]
  ) {
    id
    channel_name
    channel_type
    external_link
    publish_date
    collection_id
    parent_collection {
      id
      title
    }
  }
}
    `;
export const useGetCollectionMarcomEntriesQuery = <
      TData = GetCollectionMarcomEntriesQuery,
      TError = unknown
    >(
      variables: GetCollectionMarcomEntriesQueryVariables,
      options?: UseQueryOptions<GetCollectionMarcomEntriesQuery, TError, TData>
    ) =>
    useQuery<GetCollectionMarcomEntriesQuery, TError, TData>(
      ['getCollectionMarcomEntries', variables],
      fetchData<GetCollectionMarcomEntriesQuery, GetCollectionMarcomEntriesQueryVariables>(GetCollectionMarcomEntriesDocument, variables),
      options
    );
export const GetCollectionTitlesByOwnerDocument = `
    query getCollectionTitlesByOwner($owner_profile_id: uuid) {
  app_collections(
    where: {type_id: {_eq: 3}, owner_profile_id: {_eq: $owner_profile_id}, is_deleted: {_eq: false}}
    order_by: {updated_at: desc}
  ) {
    id
    title
  }
}
    `;
export const useGetCollectionTitlesByOwnerQuery = <
      TData = GetCollectionTitlesByOwnerQuery,
      TError = unknown
    >(
      variables?: GetCollectionTitlesByOwnerQueryVariables,
      options?: UseQueryOptions<GetCollectionTitlesByOwnerQuery, TError, TData>
    ) =>
    useQuery<GetCollectionTitlesByOwnerQuery, TError, TData>(
      variables === undefined ? ['getCollectionTitlesByOwner'] : ['getCollectionTitlesByOwner', variables],
      fetchData<GetCollectionTitlesByOwnerQuery, GetCollectionTitlesByOwnerQueryVariables>(GetCollectionTitlesByOwnerDocument, variables),
      options
    );
export const GetCollectionsByItemUuidDocument = `
    query getCollectionsByItemUuid($fragmentId: bpchar!) {
  app_collections(
    where: {collection_fragments: {external_id: {_eq: $fragmentId}}, is_deleted: {_eq: false}}
  ) {
    id
    title
    is_public
    profile {
      user: usersByuserId {
        first_name
        last_name
        id
      }
      id
      organisation {
        name
      }
    }
  }
}
    `;
export const useGetCollectionsByItemUuidQuery = <
      TData = GetCollectionsByItemUuidQuery,
      TError = unknown
    >(
      variables: GetCollectionsByItemUuidQueryVariables,
      options?: UseQueryOptions<GetCollectionsByItemUuidQuery, TError, TData>
    ) =>
    useQuery<GetCollectionsByItemUuidQuery, TError, TData>(
      ['getCollectionsByItemUuid', variables],
      fetchData<GetCollectionsByItemUuidQuery, GetCollectionsByItemUuidQueryVariables>(GetCollectionsByItemUuidDocument, variables),
      options
    );
export const GetCollectionsByOwnerOrContributorDocument = `
    query getCollectionsByOwnerOrContributor($collaborator_profile_id: uuid, $type_id: Int, $offset: Int = 0, $limit: Int, $order: [app_collections_overview_order_by!] = {updated_at: desc}, $where: [app_collections_overview_bool_exp!] = []) {
  app_collections_overview(
    where: {type_id: {_eq: $type_id}, collaborator_profile_id: {_eq: $collaborator_profile_id}, is_deleted: {_eq: false}, _and: $where}
    offset: $offset
    limit: $limit
    order_by: $order
  ) {
    id
    updated_at
    type_id
    type {
      label
      id
    }
    title
    published_at
    owner_profile_id
    collaborator_profile_id
    profile {
      id
      alias
      title
      alternative_email
      avatar
      organisation {
        logo_url
        name
        or_id
      }
      created_at
      stamboek
      updated_at
      user_id
      user: usersByuserId {
        id
        first_name
        last_name
        profile {
          profile_user_group {
            group {
              label
              id
            }
          }
        }
      }
    }
    is_public
    external_id
    depublish_at
    created_at
    thumbnail_path
    view_count {
      count
    }
    share_type
    contributors {
      profile_id
      rights
      enum_right_type {
        value
      }
      profile {
        user {
          full_name
          first_name
          last_name
          uid
        }
        organisation {
          name
          logo_url
          or_id
        }
        loms {
          lom_id
        }
      }
      collection {
        id
      }
    }
  }
}
    `;
export const useGetCollectionsByOwnerOrContributorQuery = <
      TData = GetCollectionsByOwnerOrContributorQuery,
      TError = unknown
    >(
      variables?: GetCollectionsByOwnerOrContributorQueryVariables,
      options?: UseQueryOptions<GetCollectionsByOwnerOrContributorQuery, TError, TData>
    ) =>
    useQuery<GetCollectionsByOwnerOrContributorQuery, TError, TData>(
      variables === undefined ? ['getCollectionsByOwnerOrContributor'] : ['getCollectionsByOwnerOrContributor', variables],
      fetchData<GetCollectionsByOwnerOrContributorQuery, GetCollectionsByOwnerOrContributorQueryVariables>(GetCollectionsByOwnerOrContributorDocument, variables),
      options
    );
export const GetContributorsByCollectionUuidDocument = `
    query getContributorsByCollectionUuid($id: uuid!) {
  app_collections_contributors(where: {collection_id: {_eq: $id}}) {
    collection_id
    invite_email
    invite_token
    rights
    profile_id
    id
    profile {
      avatar
      organisation {
        name
        logo_url
        or_id
      }
      user {
        first_name
        full_name
        last_name
        mail
      }
    }
  }
}
    `;
export const useGetContributorsByCollectionUuidQuery = <
      TData = GetContributorsByCollectionUuidQuery,
      TError = unknown
    >(
      variables: GetContributorsByCollectionUuidQueryVariables,
      options?: UseQueryOptions<GetContributorsByCollectionUuidQuery, TError, TData>
    ) =>
    useQuery<GetContributorsByCollectionUuidQuery, TError, TData>(
      ['getContributorsByCollectionUuid', variables],
      fetchData<GetContributorsByCollectionUuidQuery, GetContributorsByCollectionUuidQueryVariables>(GetContributorsByCollectionUuidDocument, variables),
      options
    );
export const GetOrganisationContentDocument = `
    query getOrganisationContent($offset: Int = 0, $limit: Int, $order: [app_collections_order_by!] = {updated_at: desc}, $company_id: String!) {
  app_collections(
    where: {owner: {company_id: {_eq: $company_id}}, is_deleted: {_eq: false}, is_public: {_eq: true}}
    offset: $offset
    limit: $limit
    order_by: $order
  ) {
    id
    created_at
    title
    updated_at
    type {
      label
    }
    last_editor {
      full_name
    }
    owner {
      full_name
    }
  }
}
    `;
export const useGetOrganisationContentQuery = <
      TData = GetOrganisationContentQuery,
      TError = unknown
    >(
      variables: GetOrganisationContentQueryVariables,
      options?: UseQueryOptions<GetOrganisationContentQuery, TError, TData>
    ) =>
    useQuery<GetOrganisationContentQuery, TError, TData>(
      ['getOrganisationContent', variables],
      fetchData<GetOrganisationContentQuery, GetOrganisationContentQueryVariables>(GetOrganisationContentDocument, variables),
      options
    );
export const GetPublicCollectionsDocument = `
    query getPublicCollections($limit: Int!, $typeId: Int!) {
  app_collections_overview(
    order_by: {title: asc}
    where: {type_id: {_eq: $typeId}, is_public: {_eq: true}, is_deleted: {_eq: false}}
    limit: $limit
  ) {
    id
    title
    share_type
    contributors {
      enum_right_type {
        value
      }
      profile {
        organisation {
          name
          logo_url
          or_id
        }
        user {
          first_name
          full_name
          last_name
        }
        loms {
          lom_id
        }
      }
    }
    updated_at
    is_public
    thumbnail_path
    created_at
  }
}
    `;
export const useGetPublicCollectionsQuery = <
      TData = GetPublicCollectionsQuery,
      TError = unknown
    >(
      variables: GetPublicCollectionsQueryVariables,
      options?: UseQueryOptions<GetPublicCollectionsQuery, TError, TData>
    ) =>
    useQuery<GetPublicCollectionsQuery, TError, TData>(
      ['getPublicCollections', variables],
      fetchData<GetPublicCollectionsQuery, GetPublicCollectionsQueryVariables>(GetPublicCollectionsDocument, variables),
      options
    );
export const GetPublicCollectionsByIdDocument = `
    query getPublicCollectionsById($id: uuid!, $typeId: Int!, $limit: Int!) {
  app_collections_overview(
    order_by: {title: asc}
    where: {type_id: {_eq: $typeId}, id: {_eq: $id}, is_public: {_eq: true}, is_deleted: {_eq: false}}
    limit: $limit
  ) {
    id
    title
    share_type
    updated_at
    is_public
    thumbnail_path
    created_at
    view_count {
      count
    }
    contributors {
      enum_right_type {
        value
      }
      profile {
        user {
          first_name
          full_name
          last_name
        }
        organisation {
          name
          logo_url
          or_id
        }
        loms {
          lom_id
        }
      }
    }
  }
}
    `;
export const useGetPublicCollectionsByIdQuery = <
      TData = GetPublicCollectionsByIdQuery,
      TError = unknown
    >(
      variables: GetPublicCollectionsByIdQueryVariables,
      options?: UseQueryOptions<GetPublicCollectionsByIdQuery, TError, TData>
    ) =>
    useQuery<GetPublicCollectionsByIdQuery, TError, TData>(
      ['getPublicCollectionsById', variables],
      fetchData<GetPublicCollectionsByIdQuery, GetPublicCollectionsByIdQueryVariables>(GetPublicCollectionsByIdDocument, variables),
      options
    );
export const GetPublicCollectionsByTitleDocument = `
    query getPublicCollectionsByTitle($title: String!, $typeId: Int!, $limit: Int!) {
  app_collections_overview(
    order_by: {title: asc}
    where: {type_id: {_eq: $typeId}, title: {_ilike: $title}, is_public: {_eq: true}, is_deleted: {_eq: false}}
    limit: $limit
  ) {
    id
    title
    share_type
    updated_at
    is_public
    thumbnail_path
    created_at
    view_count {
      count
    }
    contributors {
      enum_right_type {
        value
      }
      profile {
        organisation {
          name
          logo_url
          or_id
        }
        user {
          first_name
          full_name
          last_name
        }
        loms {
          lom_id
        }
      }
    }
  }
}
    `;
export const useGetPublicCollectionsByTitleQuery = <
      TData = GetPublicCollectionsByTitleQuery,
      TError = unknown
    >(
      variables: GetPublicCollectionsByTitleQueryVariables,
      options?: UseQueryOptions<GetPublicCollectionsByTitleQuery, TError, TData>
    ) =>
    useQuery<GetPublicCollectionsByTitleQuery, TError, TData>(
      ['getPublicCollectionsByTitle', variables],
      fetchData<GetPublicCollectionsByTitleQuery, GetPublicCollectionsByTitleQueryVariables>(GetPublicCollectionsByTitleDocument, variables),
      options
    );
export const InsertCollectionDocument = `
    mutation insertCollection($collection: app_collections_insert_input!) {
  insert_app_collections(objects: [$collection]) {
    affected_rows
    returning {
      id
      title
      collection_fragments(order_by: {position: asc}) {
        id
      }
    }
  }
}
    `;
export const useInsertCollectionMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertCollectionMutation, TError, InsertCollectionMutationVariables, TContext>) =>
    useMutation<InsertCollectionMutation, TError, InsertCollectionMutationVariables, TContext>(
      ['insertCollection'],
      (variables?: InsertCollectionMutationVariables) => fetchData<InsertCollectionMutation, InsertCollectionMutationVariables>(InsertCollectionDocument, variables)(),
      options
    );
export const InsertCollectionFragmentsDocument = `
    mutation insertCollectionFragments($fragments: [app_collection_fragments_insert_input!]!) {
  insert_app_collection_fragments(objects: $fragments) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export const useInsertCollectionFragmentsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertCollectionFragmentsMutation, TError, InsertCollectionFragmentsMutationVariables, TContext>) =>
    useMutation<InsertCollectionFragmentsMutation, TError, InsertCollectionFragmentsMutationVariables, TContext>(
      ['insertCollectionFragments'],
      (variables?: InsertCollectionFragmentsMutationVariables) => fetchData<InsertCollectionFragmentsMutation, InsertCollectionFragmentsMutationVariables>(InsertCollectionFragmentsDocument, variables)(),
      options
    );
export const InsertCollectionLabelsDocument = `
    mutation insertCollectionLabels($objects: [app_collection_labels_insert_input!]!) {
  insert_app_collection_labels(objects: $objects) {
    affected_rows
  }
}
    `;
export const useInsertCollectionLabelsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertCollectionLabelsMutation, TError, InsertCollectionLabelsMutationVariables, TContext>) =>
    useMutation<InsertCollectionLabelsMutation, TError, InsertCollectionLabelsMutationVariables, TContext>(
      ['insertCollectionLabels'],
      (variables?: InsertCollectionLabelsMutationVariables) => fetchData<InsertCollectionLabelsMutation, InsertCollectionLabelsMutationVariables>(InsertCollectionLabelsDocument, variables)(),
      options
    );
export const InsertCollectionLomLinksDocument = `
    mutation insertCollectionLomLinks($lomObjects: [app_collections_lom_links_insert_input!]!) {
  insert_app_collections_lom_links(objects: $lomObjects) {
    affected_rows
  }
}
    `;
export const useInsertCollectionLomLinksMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertCollectionLomLinksMutation, TError, InsertCollectionLomLinksMutationVariables, TContext>) =>
    useMutation<InsertCollectionLomLinksMutation, TError, InsertCollectionLomLinksMutationVariables, TContext>(
      ['insertCollectionLomLinks'],
      (variables?: InsertCollectionLomLinksMutationVariables) => fetchData<InsertCollectionLomLinksMutation, InsertCollectionLomLinksMutationVariables>(InsertCollectionLomLinksDocument, variables)(),
      options
    );
export const InsertCollectionManagementEntryDocument = `
    mutation insertCollectionManagementEntry($collection_id: uuid!, $current_status: String, $manager_profile_id: uuid, $status_valid_until: timestamptz, $note: String, $updated_at: timestamptz) {
  delete_app_collection_management(where: {collection_id: {_eq: $collection_id}}) {
    affected_rows
  }
  insert_app_collection_management(
    objects: [{collection_id: $collection_id, current_status: $current_status, manager_profile_id: $manager_profile_id, status_valid_until: $status_valid_until, note: $note, updated_at: $updated_at}]
  ) {
    affected_rows
  }
}
    `;
export const useInsertCollectionManagementEntryMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertCollectionManagementEntryMutation, TError, InsertCollectionManagementEntryMutationVariables, TContext>) =>
    useMutation<InsertCollectionManagementEntryMutation, TError, InsertCollectionManagementEntryMutationVariables, TContext>(
      ['insertCollectionManagementEntry'],
      (variables?: InsertCollectionManagementEntryMutationVariables) => fetchData<InsertCollectionManagementEntryMutation, InsertCollectionManagementEntryMutationVariables>(InsertCollectionManagementEntryDocument, variables)(),
      options
    );
export const InsertCollectionManagementQualityCheckEntryDocument = `
    mutation insertCollectionManagementQualityCheckEntry($collection_id: uuid!, $comment: String, $assignee_profile_id: uuid, $qc_label: lookup_enum_collection_management_qc_label_enum, $qc_status: Boolean) {
  insert_app_collection_management_QC_one(
    object: {comment: $comment, assignee_profile_id: $assignee_profile_id, qc_label: $qc_label, qc_status: $qc_status, collection_id: $collection_id}
  ) {
    id
  }
}
    `;
export const useInsertCollectionManagementQualityCheckEntryMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertCollectionManagementQualityCheckEntryMutation, TError, InsertCollectionManagementQualityCheckEntryMutationVariables, TContext>) =>
    useMutation<InsertCollectionManagementQualityCheckEntryMutation, TError, InsertCollectionManagementQualityCheckEntryMutationVariables, TContext>(
      ['insertCollectionManagementQualityCheckEntry'],
      (variables?: InsertCollectionManagementQualityCheckEntryMutationVariables) => fetchData<InsertCollectionManagementQualityCheckEntryMutation, InsertCollectionManagementQualityCheckEntryMutationVariables>(InsertCollectionManagementQualityCheckEntryDocument, variables)(),
      options
    );
export const InsertMarcomEntryDocument = `
    mutation insertMarcomEntry($objects: [app_collection_marcom_log_insert_input!]!) {
  insert_app_collection_marcom_log(objects: $objects) {
    affected_rows
  }
}
    `;
export const useInsertMarcomEntryMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertMarcomEntryMutation, TError, InsertMarcomEntryMutationVariables, TContext>) =>
    useMutation<InsertMarcomEntryMutation, TError, InsertMarcomEntryMutationVariables, TContext>(
      ['insertMarcomEntry'],
      (variables?: InsertMarcomEntryMutationVariables) => fetchData<InsertMarcomEntryMutation, InsertMarcomEntryMutationVariables>(InsertMarcomEntryDocument, variables)(),
      options
    );
export const InsertMarcomNoteDocument = `
    mutation insertMarcomNote($collectionId: uuid, $note: String) {
  insert_app_collection_marcom_notes(
    objects: {note: $note, collection_id: $collectionId}
  ) {
    returning {
      id
    }
  }
}
    `;
export const useInsertMarcomNoteMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertMarcomNoteMutation, TError, InsertMarcomNoteMutationVariables, TContext>) =>
    useMutation<InsertMarcomNoteMutation, TError, InsertMarcomNoteMutationVariables, TContext>(
      ['insertMarcomNote'],
      (variables?: InsertMarcomNoteMutationVariables) => fetchData<InsertMarcomNoteMutation, InsertMarcomNoteMutationVariables>(InsertMarcomNoteDocument, variables)(),
      options
    );
export const UpdateCollectionByIdDocument = `
    mutation updateCollectionById($id: uuid!, $collection: app_collections_set_input!) {
  update_app_collections(
    where: {id: {_eq: $id}, is_deleted: {_eq: false}}
    _set: $collection
  ) {
    affected_rows
    returning {
      id
      title
      collection_labels {
        label
        id
      }
    }
  }
}
    `;
export const useUpdateCollectionByIdMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateCollectionByIdMutation, TError, UpdateCollectionByIdMutationVariables, TContext>) =>
    useMutation<UpdateCollectionByIdMutation, TError, UpdateCollectionByIdMutationVariables, TContext>(
      ['updateCollectionById'],
      (variables?: UpdateCollectionByIdMutationVariables) => fetchData<UpdateCollectionByIdMutation, UpdateCollectionByIdMutationVariables>(UpdateCollectionByIdDocument, variables)(),
      options
    );
export const UpdateCollectionFragmentByIdDocument = `
    mutation updateCollectionFragmentById($id: Int!, $fragment: app_collection_fragments_set_input!) {
  update_app_collection_fragments(where: {id: {_eq: $id}}, _set: $fragment) {
    affected_rows
  }
}
    `;
export const useUpdateCollectionFragmentByIdMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateCollectionFragmentByIdMutation, TError, UpdateCollectionFragmentByIdMutationVariables, TContext>) =>
    useMutation<UpdateCollectionFragmentByIdMutation, TError, UpdateCollectionFragmentByIdMutationVariables, TContext>(
      ['updateCollectionFragmentById'],
      (variables?: UpdateCollectionFragmentByIdMutationVariables) => fetchData<UpdateCollectionFragmentByIdMutation, UpdateCollectionFragmentByIdMutationVariables>(UpdateCollectionFragmentByIdDocument, variables)(),
      options
    );
export const UpdateCollectionManagementEntryDocument = `
    mutation updateCollectionManagementEntry($collection_id: uuid!, $current_status: String, $manager_profile_id: uuid, $status_valid_until: timestamptz, $note: String, $updated_at: timestamptz) {
  update_app_collection_management(
    where: {collection_id: {_eq: $collection_id}}
    _set: {current_status: $current_status, manager_profile_id: $manager_profile_id, status_valid_until: $status_valid_until, note: $note, updated_at: $updated_at}
  ) {
    affected_rows
  }
}
    `;
export const useUpdateCollectionManagementEntryMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateCollectionManagementEntryMutation, TError, UpdateCollectionManagementEntryMutationVariables, TContext>) =>
    useMutation<UpdateCollectionManagementEntryMutation, TError, UpdateCollectionManagementEntryMutationVariables, TContext>(
      ['updateCollectionManagementEntry'],
      (variables?: UpdateCollectionManagementEntryMutationVariables) => fetchData<UpdateCollectionManagementEntryMutation, UpdateCollectionManagementEntryMutationVariables>(UpdateCollectionManagementEntryDocument, variables)(),
      options
    );
export const UpdateMarcomNoteDocument = `
    mutation updateMarcomNote($id: Int, $note: String) {
  update_app_collection_marcom_notes(where: {id: {_eq: $id}}, _set: {note: $note}) {
    returning {
      id
    }
  }
}
    `;
export const useUpdateMarcomNoteMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateMarcomNoteMutation, TError, UpdateMarcomNoteMutationVariables, TContext>) =>
    useMutation<UpdateMarcomNoteMutation, TError, UpdateMarcomNoteMutationVariables, TContext>(
      ['updateMarcomNote'],
      (variables?: UpdateMarcomNoteMutationVariables) => fetchData<UpdateMarcomNoteMutation, UpdateMarcomNoteMutationVariables>(UpdateMarcomNoteDocument, variables)(),
      options
    );
export const GetQuickLaneByContentAndOwnerDocument = `
    query getQuickLaneByContentAndOwner($contentId: uuid = "", $contentLabel: String = "", $profileId: uuid = "") {
  app_quick_lanes(
    where: {content_id: {_eq: $contentId}, content_label: {_eq: $contentLabel}, owner_profile_id: {_eq: $profileId}}
  ) {
    id
    content_id
    content_label
    title
    view_mode
    created_at
    updated_at
    start_oc
    end_oc
    owner {
      first_name
      last_name
      full_name
      profile_id
      mail
      avatar
      organisation {
        name
        logo_url
        or_id
      }
    }
  }
}
    `;
export const useGetQuickLaneByContentAndOwnerQuery = <
      TData = GetQuickLaneByContentAndOwnerQuery,
      TError = unknown
    >(
      variables?: GetQuickLaneByContentAndOwnerQueryVariables,
      options?: UseQueryOptions<GetQuickLaneByContentAndOwnerQuery, TError, TData>
    ) =>
    useQuery<GetQuickLaneByContentAndOwnerQuery, TError, TData>(
      variables === undefined ? ['getQuickLaneByContentAndOwner'] : ['getQuickLaneByContentAndOwner', variables],
      fetchData<GetQuickLaneByContentAndOwnerQuery, GetQuickLaneByContentAndOwnerQueryVariables>(GetQuickLaneByContentAndOwnerDocument, variables),
      options
    );
export const GetQuickLaneByIdDocument = `
    query getQuickLaneById($id: uuid = "") {
  app_quick_lanes(where: {id: {_eq: $id}}) {
    id
    content_id
    content_label
    title
    view_mode
    start_oc
    end_oc
    created_at
    updated_at
    owner {
      first_name
      last_name
      full_name
      profile_id
      mail
      avatar
      organisation {
        name
        logo_url
        or_id
      }
    }
  }
}
    `;
export const useGetQuickLaneByIdQuery = <
      TData = GetQuickLaneByIdQuery,
      TError = unknown
    >(
      variables?: GetQuickLaneByIdQueryVariables,
      options?: UseQueryOptions<GetQuickLaneByIdQuery, TError, TData>
    ) =>
    useQuery<GetQuickLaneByIdQuery, TError, TData>(
      variables === undefined ? ['getQuickLaneById'] : ['getQuickLaneById', variables],
      fetchData<GetQuickLaneByIdQuery, GetQuickLaneByIdQueryVariables>(GetQuickLaneByIdDocument, variables),
      options
    );
export const InsertQuickLanesDocument = `
    mutation insertQuickLanes($objects: [app_quick_lanes_insert_input!]!) {
  insert_app_quick_lanes(objects: $objects) {
    affected_rows
    returning {
      id
      content_id
      content_label
      title
      view_mode
      start_oc
      end_oc
      created_at
      updated_at
      owner {
        first_name
        last_name
        full_name
        profile_id
        mail
        avatar
        organisation {
          name
          logo_url
          or_id
        }
      }
    }
  }
}
    `;
export const useInsertQuickLanesMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertQuickLanesMutation, TError, InsertQuickLanesMutationVariables, TContext>) =>
    useMutation<InsertQuickLanesMutation, TError, InsertQuickLanesMutationVariables, TContext>(
      ['insertQuickLanes'],
      (variables?: InsertQuickLanesMutationVariables) => fetchData<InsertQuickLanesMutation, InsertQuickLanesMutationVariables>(InsertQuickLanesDocument, variables)(),
      options
    );
export const RemoveQuickLanesDocument = `
    mutation removeQuickLanes($ids: [uuid!]!, $profileId: uuid!) {
  delete_app_quick_lanes(
    where: {id: {_in: $ids}, owner_profile_id: {_eq: $profileId}}
  ) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export const useRemoveQuickLanesMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RemoveQuickLanesMutation, TError, RemoveQuickLanesMutationVariables, TContext>) =>
    useMutation<RemoveQuickLanesMutation, TError, RemoveQuickLanesMutationVariables, TContext>(
      ['removeQuickLanes'],
      (variables?: RemoveQuickLanesMutationVariables) => fetchData<RemoveQuickLanesMutation, RemoveQuickLanesMutationVariables>(RemoveQuickLanesDocument, variables)(),
      options
    );
export const UpdateQuickLaneByIdDocument = `
    mutation updateQuickLaneById($id: uuid!, $object: app_quick_lanes_set_input!) {
  update_app_quick_lanes(where: {id: {_eq: $id}}, _set: $object) {
    affected_rows
    returning {
      id
      content_id
      content_label
      title
      view_mode
      start_oc
      end_oc
      created_at
      updated_at
      owner {
        first_name
        last_name
        full_name
        profile_id
        mail
        avatar
        organisation {
          name
          logo_url
          or_id
        }
      }
    }
  }
}
    `;
export const useUpdateQuickLaneByIdMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateQuickLaneByIdMutation, TError, UpdateQuickLaneByIdMutationVariables, TContext>) =>
    useMutation<UpdateQuickLaneByIdMutation, TError, UpdateQuickLaneByIdMutationVariables, TContext>(
      ['updateQuickLaneById'],
      (variables?: UpdateQuickLaneByIdMutationVariables) => fetchData<UpdateQuickLaneByIdMutation, UpdateQuickLaneByIdMutationVariables>(UpdateQuickLaneByIdDocument, variables)(),
      options
    );
export const GetProfilePreferenceDocument = `
    query getProfilePreference($profileId: uuid!, $key: lookup_enum_profile_preferences_keys_enum!) {
  users_profile_preferences(
    where: {_and: {key: {_eq: $key}, profile_id: {_eq: $profileId}}}
  ) {
    id
    profile_id
    key
  }
}
    `;
export const useGetProfilePreferenceQuery = <
      TData = GetProfilePreferenceQuery,
      TError = unknown
    >(
      variables: GetProfilePreferenceQueryVariables,
      options?: UseQueryOptions<GetProfilePreferenceQuery, TError, TData>
    ) =>
    useQuery<GetProfilePreferenceQuery, TError, TData>(
      ['getProfilePreference', variables],
      fetchData<GetProfilePreferenceQuery, GetProfilePreferenceQueryVariables>(GetProfilePreferenceDocument, variables),
      options
    );
export const SetProfilePreferenceDocument = `
    mutation setProfilePreference($profileId: uuid!, $key: lookup_enum_profile_preferences_keys_enum!) {
  insert_users_profile_preferences(objects: {key: $key, profile_id: $profileId}) {
    affected_rows
  }
}
    `;
export const useSetProfilePreferenceMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<SetProfilePreferenceMutation, TError, SetProfilePreferenceMutationVariables, TContext>) =>
    useMutation<SetProfilePreferenceMutation, TError, SetProfilePreferenceMutationVariables, TContext>(
      ['setProfilePreference'],
      (variables?: SetProfilePreferenceMutationVariables) => fetchData<SetProfilePreferenceMutation, SetProfilePreferenceMutationVariables>(SetProfilePreferenceDocument, variables)(),
      options
    );
export const GetQualityLabelsDocument = `
    query getQualityLabels {
  lookup_enum_collection_labels {
    description
    value
  }
}
    `;
export const useGetQualityLabelsQuery = <
      TData = GetQualityLabelsQuery,
      TError = unknown
    >(
      variables?: GetQualityLabelsQueryVariables,
      options?: UseQueryOptions<GetQualityLabelsQuery, TError, TData>
    ) =>
    useQuery<GetQualityLabelsQuery, TError, TData>(
      variables === undefined ? ['getQualityLabels'] : ['getQualityLabels', variables],
      fetchData<GetQualityLabelsQuery, GetQualityLabelsQueryVariables>(GetQualityLabelsDocument, variables),
      options
    );
export const GetQuickLanesByContentIdDocument = `
    query getQuickLanesByContentId($contentId: uuid) {
  app_quick_lanes(where: {content_id: {_eq: $contentId}}) {
    id
    content_id
    content_label
    title
    view_mode
    start_oc
    end_oc
    created_at
    updated_at
    owner {
      first_name
      last_name
      full_name
      profile_id
      mail
      avatar
      organisation {
        name
        logo_url
        or_id
      }
    }
  }
}
    `;
export const useGetQuickLanesByContentIdQuery = <
      TData = GetQuickLanesByContentIdQuery,
      TError = unknown
    >(
      variables?: GetQuickLanesByContentIdQueryVariables,
      options?: UseQueryOptions<GetQuickLanesByContentIdQuery, TError, TData>
    ) =>
    useQuery<GetQuickLanesByContentIdQuery, TError, TData>(
      variables === undefined ? ['getQuickLanesByContentId'] : ['getQuickLanesByContentId', variables],
      fetchData<GetQuickLanesByContentIdQuery, GetQuickLanesByContentIdQueryVariables>(GetQuickLanesByContentIdDocument, variables),
      options
    );
export const GetQuickLanesWithFiltersDocument = `
    query getQuickLanesWithFilters($filterString: String, $filters: [app_quick_lanes_bool_exp!], $orderBy: [app_quick_lanes_order_by!], $limit: Int = 100, $offset: Int = 0) {
  app_quick_lanes(
    where: {_and: [{_or: [{title: {_ilike: $filterString}}, {owner: {_or: [{first_name: {_ilike: $filterString}}, {last_name: {_ilike: $filterString}}]}}]}, {_and: $filters}]}
    order_by: $orderBy
    offset: $offset
    limit: $limit
  ) {
    id
    content_id
    content_label
    title
    view_mode
    start_oc
    end_oc
    created_at
    updated_at
    owner {
      first_name
      last_name
      full_name
      profile_id
      mail
      avatar
      organisation {
        name
        logo_url
        or_id
      }
    }
  }
  app_quick_lanes_aggregate(
    where: {_and: [{_or: [{title: {_ilike: $filterString}}, {owner: {_or: [{first_name: {_ilike: $filterString}}, {last_name: {_ilike: $filterString}}]}}]}, {_and: $filters}]}
  ) {
    aggregate {
      count
    }
  }
}
    `;
export const useGetQuickLanesWithFiltersQuery = <
      TData = GetQuickLanesWithFiltersQuery,
      TError = unknown
    >(
      variables?: GetQuickLanesWithFiltersQueryVariables,
      options?: UseQueryOptions<GetQuickLanesWithFiltersQuery, TError, TData>
    ) =>
    useQuery<GetQuickLanesWithFiltersQuery, TError, TData>(
      variables === undefined ? ['getQuickLanesWithFilters'] : ['getQuickLanesWithFilters', variables],
      fetchData<GetQuickLanesWithFiltersQuery, GetQuickLanesWithFiltersQueryVariables>(GetQuickLanesWithFiltersDocument, variables),
      options
    );
export const DeleteAssignmentLabelsDocument = `
    mutation deleteAssignmentLabels($profileId: uuid!, $labelIds: [uuid!]!) {
  delete_app_assignment_labels_v2(
    where: {owner_profile_id: {_eq: $profileId}, id: {_in: $labelIds}}
  ) {
    affected_rows
  }
}
    `;
export const useDeleteAssignmentLabelsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteAssignmentLabelsMutation, TError, DeleteAssignmentLabelsMutationVariables, TContext>) =>
    useMutation<DeleteAssignmentLabelsMutation, TError, DeleteAssignmentLabelsMutationVariables, TContext>(
      ['deleteAssignmentLabels'],
      (variables?: DeleteAssignmentLabelsMutationVariables) => fetchData<DeleteAssignmentLabelsMutation, DeleteAssignmentLabelsMutationVariables>(DeleteAssignmentLabelsDocument, variables)(),
      options
    );
export const GetAllAssignmentLabelColorsDocument = `
    query getAllAssignmentLabelColors {
  lookup_enum_colors {
    label
    value
  }
}
    `;
export const useGetAllAssignmentLabelColorsQuery = <
      TData = GetAllAssignmentLabelColorsQuery,
      TError = unknown
    >(
      variables?: GetAllAssignmentLabelColorsQueryVariables,
      options?: UseQueryOptions<GetAllAssignmentLabelColorsQuery, TError, TData>
    ) =>
    useQuery<GetAllAssignmentLabelColorsQuery, TError, TData>(
      variables === undefined ? ['getAllAssignmentLabelColors'] : ['getAllAssignmentLabelColors', variables],
      fetchData<GetAllAssignmentLabelColorsQuery, GetAllAssignmentLabelColorsQueryVariables>(GetAllAssignmentLabelColorsDocument, variables),
      options
    );
export const GetAssignmentLabelsDocument = `
    query getAssignmentLabels {
  app_assignment_labels_v2(order_by: {label: asc}) {
    color_enum_value
    color_override
    label
    id
    enum_color {
      label
      value
    }
    type
    owner_profile_id
  }
}
    `;
export const useGetAssignmentLabelsQuery = <
      TData = GetAssignmentLabelsQuery,
      TError = unknown
    >(
      variables?: GetAssignmentLabelsQueryVariables,
      options?: UseQueryOptions<GetAssignmentLabelsQuery, TError, TData>
    ) =>
    useQuery<GetAssignmentLabelsQuery, TError, TData>(
      variables === undefined ? ['getAssignmentLabels'] : ['getAssignmentLabels', variables],
      fetchData<GetAssignmentLabelsQuery, GetAssignmentLabelsQueryVariables>(GetAssignmentLabelsDocument, variables),
      options
    );
export const GetAssignmentLabelsByProfileIdDocument = `
    query getAssignmentLabelsByProfileId($profileId: uuid!, $filters: [app_assignment_labels_v2_bool_exp!]) {
  app_assignment_labels_v2(
    where: {_and: [{owner_profile_id: {_eq: $profileId}}, {_and: $filters}]}
    order_by: {label: asc}
  ) {
    color_enum_value
    color_override
    label
    id
    enum_color {
      label
      value
    }
    type
    owner_profile_id
  }
}
    `;
export const useGetAssignmentLabelsByProfileIdQuery = <
      TData = GetAssignmentLabelsByProfileIdQuery,
      TError = unknown
    >(
      variables: GetAssignmentLabelsByProfileIdQueryVariables,
      options?: UseQueryOptions<GetAssignmentLabelsByProfileIdQuery, TError, TData>
    ) =>
    useQuery<GetAssignmentLabelsByProfileIdQuery, TError, TData>(
      ['getAssignmentLabelsByProfileId', variables],
      fetchData<GetAssignmentLabelsByProfileIdQuery, GetAssignmentLabelsByProfileIdQueryVariables>(GetAssignmentLabelsByProfileIdDocument, variables),
      options
    );
export const InsertAssignmentLabelsDocument = `
    mutation insertAssignmentLabels($objects: [app_assignment_labels_v2_insert_input!]!) {
  insert_app_assignment_labels_v2(objects: $objects) {
    returning {
      id
    }
  }
}
    `;
export const useInsertAssignmentLabelsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertAssignmentLabelsMutation, TError, InsertAssignmentLabelsMutationVariables, TContext>) =>
    useMutation<InsertAssignmentLabelsMutation, TError, InsertAssignmentLabelsMutationVariables, TContext>(
      ['insertAssignmentLabels'],
      (variables?: InsertAssignmentLabelsMutationVariables) => fetchData<InsertAssignmentLabelsMutation, InsertAssignmentLabelsMutationVariables>(InsertAssignmentLabelsDocument, variables)(),
      options
    );
export const UpdateAssignmentLabelsDocument = `
    mutation updateAssignmentLabels($label: String!, $colorEnumValue: lookup_enum_colors_enum!, $profileId: uuid!, $labelId: uuid!) {
  update_app_assignment_labels_v2(
    _set: {label: $label, color_enum_value: $colorEnumValue}
    where: {owner_profile_id: {_eq: $profileId}, id: {_eq: $labelId}}
  ) {
    affected_rows
  }
}
    `;
export const useUpdateAssignmentLabelsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateAssignmentLabelsMutation, TError, UpdateAssignmentLabelsMutationVariables, TContext>) =>
    useMutation<UpdateAssignmentLabelsMutation, TError, UpdateAssignmentLabelsMutationVariables, TContext>(
      ['updateAssignmentLabels'],
      (variables?: UpdateAssignmentLabelsMutationVariables) => fetchData<UpdateAssignmentLabelsMutation, UpdateAssignmentLabelsMutationVariables>(UpdateAssignmentLabelsDocument, variables)(),
      options
    );
export const DeleteAssignmentBookmarksForUserDocument = `
    mutation deleteAssignmentBookmarksForUser($assignmentUuid: uuid!, $profileId: uuid) {
  delete_app_assignments_v2_bookmarks(
    where: {assignment_id: {_eq: $assignmentUuid}, profile_id: {_eq: $profileId}}
  ) {
    affected_rows
  }
}
    `;
export const useDeleteAssignmentBookmarksForUserMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteAssignmentBookmarksForUserMutation, TError, DeleteAssignmentBookmarksForUserMutationVariables, TContext>) =>
    useMutation<DeleteAssignmentBookmarksForUserMutation, TError, DeleteAssignmentBookmarksForUserMutationVariables, TContext>(
      ['deleteAssignmentBookmarksForUser'],
      (variables?: DeleteAssignmentBookmarksForUserMutationVariables) => fetchData<DeleteAssignmentBookmarksForUserMutation, DeleteAssignmentBookmarksForUserMutationVariables>(DeleteAssignmentBookmarksForUserDocument, variables)(),
      options
    );
export const DeleteCollectionBookmarksForUserDocument = `
    mutation deleteCollectionBookmarksForUser($collectionUuid: uuid!, $profileId: uuid) {
  delete_app_collection_bookmarks(
    where: {collection_uuid: {_eq: $collectionUuid}, profile_id: {_eq: $profileId}}
  ) {
    affected_rows
  }
}
    `;
export const useDeleteCollectionBookmarksForUserMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteCollectionBookmarksForUserMutation, TError, DeleteCollectionBookmarksForUserMutationVariables, TContext>) =>
    useMutation<DeleteCollectionBookmarksForUserMutation, TError, DeleteCollectionBookmarksForUserMutationVariables, TContext>(
      ['deleteCollectionBookmarksForUser'],
      (variables?: DeleteCollectionBookmarksForUserMutationVariables) => fetchData<DeleteCollectionBookmarksForUserMutation, DeleteCollectionBookmarksForUserMutationVariables>(DeleteCollectionBookmarksForUserDocument, variables)(),
      options
    );
export const DeleteItemBookmarkDocument = `
    mutation deleteItemBookmark($itemUuid: uuid!, $profileId: uuid) {
  delete_app_item_bookmarks(
    where: {item_id: {_eq: $itemUuid}, profile_id: {_eq: $profileId}}
  ) {
    affected_rows
  }
}
    `;
export const useDeleteItemBookmarkMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteItemBookmarkMutation, TError, DeleteItemBookmarkMutationVariables, TContext>) =>
    useMutation<DeleteItemBookmarkMutation, TError, DeleteItemBookmarkMutationVariables, TContext>(
      ['deleteItemBookmark'],
      (variables?: DeleteItemBookmarkMutationVariables) => fetchData<DeleteItemBookmarkMutation, DeleteItemBookmarkMutationVariables>(DeleteItemBookmarkDocument, variables)(),
      options
    );
export const GetAssignmentBookmarkViewCountsDocument = `
    query getAssignmentBookmarkViewCounts($assignmentUuid: uuid!, $profileId: uuid!) {
  app_assignments_v2_bookmarks_aggregate(
    where: {assignment_id: {_eq: $assignmentUuid}}
  ) {
    aggregate {
      count
    }
  }
  app_assignment_v2_views(where: {assignment_uuid: {_eq: $assignmentUuid}}) {
    count
  }
  app_assignments_v2_bookmarks(
    where: {assignment_id: {_eq: $assignmentUuid}, profile_id: {_eq: $profileId}}
  ) {
    id
  }
}
    `;
export const useGetAssignmentBookmarkViewCountsQuery = <
      TData = GetAssignmentBookmarkViewCountsQuery,
      TError = unknown
    >(
      variables: GetAssignmentBookmarkViewCountsQueryVariables,
      options?: UseQueryOptions<GetAssignmentBookmarkViewCountsQuery, TError, TData>
    ) =>
    useQuery<GetAssignmentBookmarkViewCountsQuery, TError, TData>(
      ['getAssignmentBookmarkViewCounts', variables],
      fetchData<GetAssignmentBookmarkViewCountsQuery, GetAssignmentBookmarkViewCountsQueryVariables>(GetAssignmentBookmarkViewCountsDocument, variables),
      options
    );
export const GetAssignmentViewCountDocument = `
    query getAssignmentViewCount($assignmentUuid: uuid!) {
  app_assignments_v2(where: {id: {_eq: $assignmentUuid}}) {
    view_count {
      count
    }
  }
}
    `;
export const useGetAssignmentViewCountQuery = <
      TData = GetAssignmentViewCountQuery,
      TError = unknown
    >(
      variables: GetAssignmentViewCountQueryVariables,
      options?: UseQueryOptions<GetAssignmentViewCountQuery, TError, TData>
    ) =>
    useQuery<GetAssignmentViewCountQuery, TError, TData>(
      ['getAssignmentViewCount', variables],
      fetchData<GetAssignmentViewCountQuery, GetAssignmentViewCountQueryVariables>(GetAssignmentViewCountDocument, variables),
      options
    );
export const GetBookmarkStatusesDocument = `
    query getBookmarkStatuses($profileId: uuid!, $itemUuids: [uuid!]!, $collectionUuids: [uuid!]!, $assignmentUuids: [uuid!]!) {
  app_collection_bookmarks(
    where: {profile_id: {_eq: $profileId}, collection_uuid: {_in: $collectionUuids}}
  ) {
    collection_uuid
  }
  app_item_bookmarks(
    where: {profile_id: {_eq: $profileId}, item_id: {_in: $itemUuids}}
  ) {
    item_id
  }
  app_assignments_v2_bookmarks(
    where: {profile_id: {_eq: $profileId}, assignment_id: {_in: $assignmentUuids}}
  ) {
    assignment_id
  }
}
    `;
export const useGetBookmarkStatusesQuery = <
      TData = GetBookmarkStatusesQuery,
      TError = unknown
    >(
      variables: GetBookmarkStatusesQueryVariables,
      options?: UseQueryOptions<GetBookmarkStatusesQuery, TError, TData>
    ) =>
    useQuery<GetBookmarkStatusesQuery, TError, TData>(
      ['getBookmarkStatuses', variables],
      fetchData<GetBookmarkStatusesQuery, GetBookmarkStatusesQueryVariables>(GetBookmarkStatusesDocument, variables),
      options
    );
export const GetCollectionBookmarkViewPlayCountsDocument = `
    query getCollectionBookmarkViewPlayCounts($collectionUuid: uuid!, $profileId: uuid) {
  app_collection_views(where: {collection_uuid: {_eq: $collectionUuid}}, limit: 1) {
    count
  }
  app_collection_plays(where: {collection_uuid: {_eq: $collectionUuid}}, limit: 1) {
    count
  }
  app_collection_bookmarks_aggregate(
    where: {collection_uuid: {_eq: $collectionUuid}}
  ) {
    aggregate {
      count
    }
  }
  app_collection_bookmarks(
    where: {profile_id: {_eq: $profileId}, collection_uuid: {_eq: $collectionUuid}}
    limit: 1
  ) {
    id
  }
}
    `;
export const useGetCollectionBookmarkViewPlayCountsQuery = <
      TData = GetCollectionBookmarkViewPlayCountsQuery,
      TError = unknown
    >(
      variables: GetCollectionBookmarkViewPlayCountsQueryVariables,
      options?: UseQueryOptions<GetCollectionBookmarkViewPlayCountsQuery, TError, TData>
    ) =>
    useQuery<GetCollectionBookmarkViewPlayCountsQuery, TError, TData>(
      ['getCollectionBookmarkViewPlayCounts', variables],
      fetchData<GetCollectionBookmarkViewPlayCountsQuery, GetCollectionBookmarkViewPlayCountsQueryVariables>(GetCollectionBookmarkViewPlayCountsDocument, variables),
      options
    );
export const GetCollectionPlayCountDocument = `
    query getCollectionPlayCount($collectionUuid: uuid!) {
  app_collections(where: {id: {_eq: $collectionUuid}}) {
    play_count {
      count
    }
  }
}
    `;
export const useGetCollectionPlayCountQuery = <
      TData = GetCollectionPlayCountQuery,
      TError = unknown
    >(
      variables: GetCollectionPlayCountQueryVariables,
      options?: UseQueryOptions<GetCollectionPlayCountQuery, TError, TData>
    ) =>
    useQuery<GetCollectionPlayCountQuery, TError, TData>(
      ['getCollectionPlayCount', variables],
      fetchData<GetCollectionPlayCountQuery, GetCollectionPlayCountQueryVariables>(GetCollectionPlayCountDocument, variables),
      options
    );
export const GetCollectionViewCountDocument = `
    query getCollectionViewCount($collectionUuid: uuid!) {
  app_collections(where: {id: {_eq: $collectionUuid}}) {
    view_count {
      count
    }
  }
}
    `;
export const useGetCollectionViewCountQuery = <
      TData = GetCollectionViewCountQuery,
      TError = unknown
    >(
      variables: GetCollectionViewCountQueryVariables,
      options?: UseQueryOptions<GetCollectionViewCountQuery, TError, TData>
    ) =>
    useQuery<GetCollectionViewCountQuery, TError, TData>(
      ['getCollectionViewCount', variables],
      fetchData<GetCollectionViewCountQuery, GetCollectionViewCountQueryVariables>(GetCollectionViewCountDocument, variables),
      options
    );
export const GetItemBookmarkViewPlayCountsDocument = `
    query getItemBookmarkViewPlayCounts($itemUuid: uuid!, $profileId: uuid) {
  app_item_plays(where: {item_id: {_eq: $itemUuid}}, limit: 1) {
    count
  }
  app_item_views(where: {item_id: {_eq: $itemUuid}}, limit: 1) {
    count
  }
  app_item_bookmarks_aggregate(where: {item_id: {_eq: $itemUuid}}) {
    aggregate {
      count
    }
  }
  app_item_bookmarks(
    where: {profile_id: {_eq: $profileId}, item_id: {_eq: $itemUuid}}
    limit: 1
  ) {
    id
  }
}
    `;
export const useGetItemBookmarkViewPlayCountsQuery = <
      TData = GetItemBookmarkViewPlayCountsQuery,
      TError = unknown
    >(
      variables: GetItemBookmarkViewPlayCountsQueryVariables,
      options?: UseQueryOptions<GetItemBookmarkViewPlayCountsQuery, TError, TData>
    ) =>
    useQuery<GetItemBookmarkViewPlayCountsQuery, TError, TData>(
      ['getItemBookmarkViewPlayCounts', variables],
      fetchData<GetItemBookmarkViewPlayCountsQuery, GetItemBookmarkViewPlayCountsQueryVariables>(GetItemBookmarkViewPlayCountsDocument, variables),
      options
    );
export const GetItemBookmarksForUserDocument = `
    query getItemBookmarksForUser($profileId: uuid!, $filter: [app_item_bookmarks_bool_exp!], $order: [app_item_bookmarks_order_by!]! = [{created_at: desc}]) {
  app_item_bookmarks(
    where: {profile_id: {_eq: $profileId}, _and: $filter}
    order_by: $order
  ) {
    bookmarkedItem {
      title
      thumbnail_path
      duration
      issued
      item {
        external_id
        item_meta {
          organisation {
            name
          }
          is_deleted
          is_published
          type_id
          type {
            id
            label
          }
        }
      }
      view_count {
        count
      }
    }
    item_id
    created_at
  }
}
    `;
export const useGetItemBookmarksForUserQuery = <
      TData = GetItemBookmarksForUserQuery,
      TError = unknown
    >(
      variables: GetItemBookmarksForUserQueryVariables,
      options?: UseQueryOptions<GetItemBookmarksForUserQuery, TError, TData>
    ) =>
    useQuery<GetItemBookmarksForUserQuery, TError, TData>(
      ['getItemBookmarksForUser', variables],
      fetchData<GetItemBookmarksForUserQuery, GetItemBookmarksForUserQueryVariables>(GetItemBookmarksForUserDocument, variables),
      options
    );
export const GetItemPlayCountDocument = `
    query getItemPlayCount($itemUuid: uuid!) {
  app_item_meta(where: {uid: {_eq: $itemUuid}}) {
    play_count {
      count
    }
    is_published
    is_deleted
  }
}
    `;
export const useGetItemPlayCountQuery = <
      TData = GetItemPlayCountQuery,
      TError = unknown
    >(
      variables: GetItemPlayCountQueryVariables,
      options?: UseQueryOptions<GetItemPlayCountQuery, TError, TData>
    ) =>
    useQuery<GetItemPlayCountQuery, TError, TData>(
      ['getItemPlayCount', variables],
      fetchData<GetItemPlayCountQuery, GetItemPlayCountQueryVariables>(GetItemPlayCountDocument, variables),
      options
    );
export const GetItemViewCountDocument = `
    query getItemViewCount($itemUuid: uuid!) {
  app_item_meta(where: {uid: {_eq: $itemUuid}}) {
    view_count {
      count
    }
    is_deleted
    is_published
  }
}
    `;
export const useGetItemViewCountQuery = <
      TData = GetItemViewCountQuery,
      TError = unknown
    >(
      variables: GetItemViewCountQueryVariables,
      options?: UseQueryOptions<GetItemViewCountQuery, TError, TData>
    ) =>
    useQuery<GetItemViewCountQuery, TError, TData>(
      ['getItemViewCount', variables],
      fetchData<GetItemViewCountQuery, GetItemViewCountQueryVariables>(GetItemViewCountDocument, variables),
      options
    );
export const GetMultipleAssignmentViewCountsDocument = `
    query getMultipleAssignmentViewCounts($uuids: [uuid!]) {
  items: app_assignment_v2_views(where: {assignment_uuid: {_in: $uuids}}) {
    count
    id: assignment_uuid
  }
}
    `;
export const useGetMultipleAssignmentViewCountsQuery = <
      TData = GetMultipleAssignmentViewCountsQuery,
      TError = unknown
    >(
      variables?: GetMultipleAssignmentViewCountsQueryVariables,
      options?: UseQueryOptions<GetMultipleAssignmentViewCountsQuery, TError, TData>
    ) =>
    useQuery<GetMultipleAssignmentViewCountsQuery, TError, TData>(
      variables === undefined ? ['getMultipleAssignmentViewCounts'] : ['getMultipleAssignmentViewCounts', variables],
      fetchData<GetMultipleAssignmentViewCountsQuery, GetMultipleAssignmentViewCountsQueryVariables>(GetMultipleAssignmentViewCountsDocument, variables),
      options
    );
export const GetMultipleCollectionViewCountsDocument = `
    query getMultipleCollectionViewCounts($uuids: [uuid!]) {
  items: app_collection_views(where: {collection_uuid: {_in: $uuids}}) {
    count
    id: collection_uuid
  }
}
    `;
export const useGetMultipleCollectionViewCountsQuery = <
      TData = GetMultipleCollectionViewCountsQuery,
      TError = unknown
    >(
      variables?: GetMultipleCollectionViewCountsQueryVariables,
      options?: UseQueryOptions<GetMultipleCollectionViewCountsQuery, TError, TData>
    ) =>
    useQuery<GetMultipleCollectionViewCountsQuery, TError, TData>(
      variables === undefined ? ['getMultipleCollectionViewCounts'] : ['getMultipleCollectionViewCounts', variables],
      fetchData<GetMultipleCollectionViewCountsQuery, GetMultipleCollectionViewCountsQueryVariables>(GetMultipleCollectionViewCountsDocument, variables),
      options
    );
export const GetMultipleItemViewCountsDocument = `
    query getMultipleItemViewCounts($uuids: [uuid!]) {
  items: app_item_views(where: {item_id: {_in: $uuids}}) {
    count
    id: item_id
  }
}
    `;
export const useGetMultipleItemViewCountsQuery = <
      TData = GetMultipleItemViewCountsQuery,
      TError = unknown
    >(
      variables?: GetMultipleItemViewCountsQueryVariables,
      options?: UseQueryOptions<GetMultipleItemViewCountsQuery, TError, TData>
    ) =>
    useQuery<GetMultipleItemViewCountsQuery, TError, TData>(
      variables === undefined ? ['getMultipleItemViewCounts'] : ['getMultipleItemViewCounts', variables],
      fetchData<GetMultipleItemViewCountsQuery, GetMultipleItemViewCountsQueryVariables>(GetMultipleItemViewCountsDocument, variables),
      options
    );
export const IncrementAssignmentViewsDocument = `
    mutation incrementAssignmentViews($assignmentUuid: uuid!) {
  update_app_assignment_v2_views(
    where: {assignment_uuid: {_eq: $assignmentUuid}}
    _inc: {count: 1}
  ) {
    affected_rows
  }
}
    `;
export const useIncrementAssignmentViewsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<IncrementAssignmentViewsMutation, TError, IncrementAssignmentViewsMutationVariables, TContext>) =>
    useMutation<IncrementAssignmentViewsMutation, TError, IncrementAssignmentViewsMutationVariables, TContext>(
      ['incrementAssignmentViews'],
      (variables?: IncrementAssignmentViewsMutationVariables) => fetchData<IncrementAssignmentViewsMutation, IncrementAssignmentViewsMutationVariables>(IncrementAssignmentViewsDocument, variables)(),
      options
    );
export const IncrementCollectionPlaysDocument = `
    mutation incrementCollectionPlays($collectionUuid: uuid!) {
  update_app_collection_plays(
    where: {collection_uuid: {_eq: $collectionUuid}}
    _inc: {count: 1}
  ) {
    affected_rows
  }
}
    `;
export const useIncrementCollectionPlaysMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<IncrementCollectionPlaysMutation, TError, IncrementCollectionPlaysMutationVariables, TContext>) =>
    useMutation<IncrementCollectionPlaysMutation, TError, IncrementCollectionPlaysMutationVariables, TContext>(
      ['incrementCollectionPlays'],
      (variables?: IncrementCollectionPlaysMutationVariables) => fetchData<IncrementCollectionPlaysMutation, IncrementCollectionPlaysMutationVariables>(IncrementCollectionPlaysDocument, variables)(),
      options
    );
export const IncrementCollectionViewsDocument = `
    mutation incrementCollectionViews($collectionUuid: uuid!) {
  update_app_collection_views(
    where: {collection_uuid: {_eq: $collectionUuid}}
    _inc: {count: 1}
  ) {
    affected_rows
  }
}
    `;
export const useIncrementCollectionViewsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<IncrementCollectionViewsMutation, TError, IncrementCollectionViewsMutationVariables, TContext>) =>
    useMutation<IncrementCollectionViewsMutation, TError, IncrementCollectionViewsMutationVariables, TContext>(
      ['incrementCollectionViews'],
      (variables?: IncrementCollectionViewsMutationVariables) => fetchData<IncrementCollectionViewsMutation, IncrementCollectionViewsMutationVariables>(IncrementCollectionViewsDocument, variables)(),
      options
    );
export const IncrementItemPlaysDocument = `
    mutation incrementItemPlays($itemUuid: uuid!) {
  update_app_item_plays(where: {item_id: {_eq: $itemUuid}}, _inc: {count: 1}) {
    affected_rows
  }
}
    `;
export const useIncrementItemPlaysMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<IncrementItemPlaysMutation, TError, IncrementItemPlaysMutationVariables, TContext>) =>
    useMutation<IncrementItemPlaysMutation, TError, IncrementItemPlaysMutationVariables, TContext>(
      ['incrementItemPlays'],
      (variables?: IncrementItemPlaysMutationVariables) => fetchData<IncrementItemPlaysMutation, IncrementItemPlaysMutationVariables>(IncrementItemPlaysDocument, variables)(),
      options
    );
export const IncrementItemViewsDocument = `
    mutation incrementItemViews($itemUuid: uuid!) {
  update_app_item_views(where: {item_id: {_eq: $itemUuid}}, _inc: {count: 1}) {
    affected_rows
  }
}
    `;
export const useIncrementItemViewsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<IncrementItemViewsMutation, TError, IncrementItemViewsMutationVariables, TContext>) =>
    useMutation<IncrementItemViewsMutation, TError, IncrementItemViewsMutationVariables, TContext>(
      ['incrementItemViews'],
      (variables?: IncrementItemViewsMutationVariables) => fetchData<IncrementItemViewsMutation, IncrementItemViewsMutationVariables>(IncrementItemViewsDocument, variables)(),
      options
    );
export const InsertAssignmentBookmarkDocument = `
    mutation insertAssignmentBookmark($bookmarkAssignment: app_assignments_v2_bookmarks_insert_input!) {
  insert_app_assignments_v2_bookmarks_one(object: $bookmarkAssignment) {
    id
  }
}
    `;
export const useInsertAssignmentBookmarkMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertAssignmentBookmarkMutation, TError, InsertAssignmentBookmarkMutationVariables, TContext>) =>
    useMutation<InsertAssignmentBookmarkMutation, TError, InsertAssignmentBookmarkMutationVariables, TContext>(
      ['insertAssignmentBookmark'],
      (variables?: InsertAssignmentBookmarkMutationVariables) => fetchData<InsertAssignmentBookmarkMutation, InsertAssignmentBookmarkMutationVariables>(InsertAssignmentBookmarkDocument, variables)(),
      options
    );
export const InsertCollectionBookmarkDocument = `
    mutation insertCollectionBookmark($bookmarkItem: app_collection_bookmarks_insert_input!) {
  insert_app_collection_bookmarks(objects: [$bookmarkItem]) {
    affected_rows
  }
}
    `;
export const useInsertCollectionBookmarkMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertCollectionBookmarkMutation, TError, InsertCollectionBookmarkMutationVariables, TContext>) =>
    useMutation<InsertCollectionBookmarkMutation, TError, InsertCollectionBookmarkMutationVariables, TContext>(
      ['insertCollectionBookmark'],
      (variables?: InsertCollectionBookmarkMutationVariables) => fetchData<InsertCollectionBookmarkMutation, InsertCollectionBookmarkMutationVariables>(InsertCollectionBookmarkDocument, variables)(),
      options
    );
export const InsertItemBookmarkDocument = `
    mutation insertItemBookmark($bookmarkItem: app_item_bookmarks_insert_input!) {
  insert_app_item_bookmarks(objects: [$bookmarkItem]) {
    affected_rows
  }
}
    `;
export const useInsertItemBookmarkMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertItemBookmarkMutation, TError, InsertItemBookmarkMutationVariables, TContext>) =>
    useMutation<InsertItemBookmarkMutation, TError, InsertItemBookmarkMutationVariables, TContext>(
      ['insertItemBookmark'],
      (variables?: InsertItemBookmarkMutationVariables) => fetchData<InsertItemBookmarkMutation, InsertItemBookmarkMutationVariables>(InsertItemBookmarkDocument, variables)(),
      options
    );
export const GetAllOrganisationsDocument = `
    query getAllOrganisations {
  shared_organisations(order_by: {name: asc}) {
    or_id
    name
    logo_url
  }
}
    `;
export const useGetAllOrganisationsQuery = <
      TData = GetAllOrganisationsQuery,
      TError = unknown
    >(
      variables?: GetAllOrganisationsQueryVariables,
      options?: UseQueryOptions<GetAllOrganisationsQuery, TError, TData>
    ) =>
    useQuery<GetAllOrganisationsQuery, TError, TData>(
      variables === undefined ? ['getAllOrganisations'] : ['getAllOrganisations', variables],
      fetchData<GetAllOrganisationsQuery, GetAllOrganisationsQueryVariables>(GetAllOrganisationsDocument, variables),
      options
    );
export const GetDistinctOrganisationsDocument = `
    query getDistinctOrganisations {
  app_item_meta(distinct_on: org_id, where: {organisation: {}}) {
    organisation {
      or_id
      name
      logo_url
    }
    is_published
    is_deleted
  }
}
    `;
export const useGetDistinctOrganisationsQuery = <
      TData = GetDistinctOrganisationsQuery,
      TError = unknown
    >(
      variables?: GetDistinctOrganisationsQueryVariables,
      options?: UseQueryOptions<GetDistinctOrganisationsQuery, TError, TData>
    ) =>
    useQuery<GetDistinctOrganisationsQuery, TError, TData>(
      variables === undefined ? ['getDistinctOrganisations'] : ['getDistinctOrganisations', variables],
      fetchData<GetDistinctOrganisationsQuery, GetDistinctOrganisationsQueryVariables>(GetDistinctOrganisationsDocument, variables),
      options
    );
export const GetNotificationDocument = `
    query getNotification($key: String!, $profileId: uuid!) {
  users_notifications(where: {profile_id: {_eq: $profileId}, key: {_eq: $key}}) {
    through_email
    through_platform
  }
}
    `;
export const useGetNotificationQuery = <
      TData = GetNotificationQuery,
      TError = unknown
    >(
      variables: GetNotificationQueryVariables,
      options?: UseQueryOptions<GetNotificationQuery, TError, TData>
    ) =>
    useQuery<GetNotificationQuery, TError, TData>(
      ['getNotification', variables],
      fetchData<GetNotificationQuery, GetNotificationQueryVariables>(GetNotificationDocument, variables),
      options
    );
export const GetOrganisationsWithUsersDocument = `
    query getOrganisationsWithUsers {
  shared_organisations_with_users {
    or_id: company_id
    name
  }
}
    `;
export const useGetOrganisationsWithUsersQuery = <
      TData = GetOrganisationsWithUsersQuery,
      TError = unknown
    >(
      variables?: GetOrganisationsWithUsersQueryVariables,
      options?: UseQueryOptions<GetOrganisationsWithUsersQuery, TError, TData>
    ) =>
    useQuery<GetOrganisationsWithUsersQuery, TError, TData>(
      variables === undefined ? ['getOrganisationsWithUsers'] : ['getOrganisationsWithUsers', variables],
      fetchData<GetOrganisationsWithUsersQuery, GetOrganisationsWithUsersQueryVariables>(GetOrganisationsWithUsersDocument, variables),
      options
    );
export const GetUsersByCompanyIdDocument = `
    query getUsersByCompanyId($companyId: String!) {
  users_profiles(
    order_by: {usersByuserId: {first_name: asc}}
    where: {company_id: {_eq: $companyId}, is_deleted: {_eq: false}}
  ) {
    id
    user: usersByuserId {
      uid
      full_name
      mail
      is_blocked
      last_access_at
    }
    temp_access {
      from
      until
      has_currently_access {
        status
      }
    }
    profile_user_group {
      group {
        id
        label
      }
    }
  }
}
    `;
export const useGetUsersByCompanyIdQuery = <
      TData = GetUsersByCompanyIdQuery,
      TError = unknown
    >(
      variables: GetUsersByCompanyIdQueryVariables,
      options?: UseQueryOptions<GetUsersByCompanyIdQuery, TError, TData>
    ) =>
    useQuery<GetUsersByCompanyIdQuery, TError, TData>(
      ['getUsersByCompanyId', variables],
      fetchData<GetUsersByCompanyIdQuery, GetUsersByCompanyIdQueryVariables>(GetUsersByCompanyIdDocument, variables),
      options
    );
export const InsertNotificationDocument = `
    mutation insertNotification($key: String!, $profileId: uuid!, $throughEmail: Boolean!, $throughPlatform: Boolean!) {
  insert_users_notifications(
    objects: {key: $key, profile_id: $profileId, through_email: $throughEmail, through_platform: $throughPlatform}
  ) {
    affected_rows
  }
}
    `;
export const useInsertNotificationMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<InsertNotificationMutation, TError, InsertNotificationMutationVariables, TContext>) =>
    useMutation<InsertNotificationMutation, TError, InsertNotificationMutationVariables, TContext>(
      ['insertNotification'],
      (variables?: InsertNotificationMutationVariables) => fetchData<InsertNotificationMutation, InsertNotificationMutationVariables>(InsertNotificationDocument, variables)(),
      options
    );
export const UpdateNotificationDocument = `
    mutation updateNotification($key: String!, $profileId: uuid!, $throughEmail: Boolean!, $throughPlatform: Boolean!) {
  update_users_notifications(
    where: {profile_id: {_eq: $profileId}, key: {_eq: $key}}
    _set: {through_email: $throughEmail, through_platform: $throughPlatform}
  ) {
    affected_rows
  }
}
    `;
export const useUpdateNotificationMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateNotificationMutation, TError, UpdateNotificationMutationVariables, TContext>) =>
    useMutation<UpdateNotificationMutation, TError, UpdateNotificationMutationVariables, TContext>(
      ['updateNotification'],
      (variables?: UpdateNotificationMutationVariables) => fetchData<UpdateNotificationMutation, UpdateNotificationMutationVariables>(UpdateNotificationDocument, variables)(),
      options
    );