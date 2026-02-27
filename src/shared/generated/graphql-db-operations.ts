// @ts-nocheck
export type BulkAddLabelsToCollectionsMutationVariables = Exact<{
  labels: Array<App_Collection_Labels_Insert_Input> | App_Collection_Labels_Insert_Input;
}>;


export type BulkAddLabelsToCollectionsMutation = { __typename?: 'mutation_root', insert_app_collection_labels?: { __typename?: 'app_collection_labels_mutation_response', affected_rows: number } | null };

export type BulkDeleteCollectionsMutationVariables = Exact<{
  collectionIds: Array<Scalars['uuid']> | Scalars['uuid'];
  now: Scalars['timestamptz'];
  updatedByProfileId: Scalars['uuid'];
}>;


export type BulkDeleteCollectionsMutation = { __typename?: 'mutation_root', update_app_collections?: { __typename?: 'app_collections_mutation_response', affected_rows: number } | null };

export type BulkDeleteLabelsFromCollectionsMutationVariables = Exact<{
  labels: Array<Scalars['String']> | Scalars['String'];
  collectionIds: Array<Scalars['uuid']> | Scalars['uuid'];
}>;


export type BulkDeleteLabelsFromCollectionsMutation = { __typename?: 'mutation_root', delete_app_collection_labels?: { __typename?: 'app_collection_labels_mutation_response', affected_rows: number } | null };

export type BulkUpdateAuthorForCollectionsMutationVariables = Exact<{
  authorId: Scalars['uuid'];
  collectionIds: Array<Scalars['uuid']> | Scalars['uuid'];
  now: Scalars['timestamptz'];
  updatedByProfileId: Scalars['uuid'];
}>;


export type BulkUpdateAuthorForCollectionsMutation = { __typename?: 'mutation_root', update_app_collections?: { __typename?: 'app_collections_mutation_response', affected_rows: number } | null };

export type BulkUpdateDateAndLastAuthorCollectionsMutationVariables = Exact<{
  collectionIds: Array<Scalars['uuid']> | Scalars['uuid'];
  now: Scalars['timestamptz'];
  updatedByProfileId: Scalars['uuid'];
}>;


export type BulkUpdateDateAndLastAuthorCollectionsMutation = { __typename?: 'mutation_root', update_app_collections?: { __typename?: 'app_collections_mutation_response', affected_rows: number } | null };

export type BulkUpdatePublishStateForCollectionsMutationVariables = Exact<{
  isPublic: Scalars['Boolean'];
  collectionIds: Array<Scalars['uuid']> | Scalars['uuid'];
  now: Scalars['timestamptz'];
  updatedByProfileId: Scalars['uuid'];
}>;


export type BulkUpdatePublishStateForCollectionsMutation = { __typename?: 'mutation_root', update_app_collections?: { __typename?: 'app_collections_mutation_response', affected_rows: number } | null };

export type DeleteInteractiveTourMutationVariables = Exact<{
  interactiveTourId: Scalars['Int'];
}>;


export type DeleteInteractiveTourMutation = { __typename?: 'mutation_root', delete_app_interactive_tour?: { __typename?: 'app_interactive_tour_mutation_response', affected_rows: number } | null };

export type GetInteractiveTourByIdQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetInteractiveTourByIdQuery = { __typename?: 'query_root', app_interactive_tour: Array<{ __typename?: 'app_interactive_tour', name?: string | null, id: number, created_at: any, updated_at: any, steps?: any | null, page_id: string }> };

export type GetInteractiveToursQueryVariables = Exact<{
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  orderBy: Array<App_Interactive_Tour_Order_By> | App_Interactive_Tour_Order_By;
  where?: InputMaybe<App_Interactive_Tour_Bool_Exp>;
}>;


export type GetInteractiveToursQuery = { __typename?: 'query_root', app_interactive_tour: Array<{ __typename?: 'app_interactive_tour', name?: string | null, id: number, created_at: any, updated_at: any, page_id: string }>, app_interactive_tour_aggregate: { __typename?: 'app_interactive_tour_aggregate', aggregate?: { __typename?: 'app_interactive_tour_aggregate_fields', count: number } | null } };

export type InsertInteractiveTourMutationVariables = Exact<{
  interactiveTour: App_Interactive_Tour_Insert_Input;
}>;


export type InsertInteractiveTourMutation = { __typename?: 'mutation_root', insert_app_interactive_tour?: { __typename?: 'app_interactive_tour_mutation_response', returning: Array<{ __typename?: 'app_interactive_tour', id: number }> } | null };

export type UpdateInteractiveTourMutationVariables = Exact<{
  interactiveTour: App_Interactive_Tour_Set_Input;
  interactiveTourId: Scalars['Int'];
}>;


export type UpdateInteractiveTourMutation = { __typename?: 'mutation_root', update_app_interactive_tour?: { __typename?: 'app_interactive_tour_mutation_response', affected_rows: number } | null };

export type DeleteItemFromCollectionBookmarksAndAssignmentsMutationVariables = Exact<{
  itemExternalId: Scalars['bpchar'];
  itemUid: Scalars['uuid'];
}>;


export type DeleteItemFromCollectionBookmarksAndAssignmentsMutation = { __typename?: 'mutation_root', delete_app_collection_fragments?: { __typename?: 'app_collection_fragments_mutation_response', affected_rows: number } | null, delete_app_item_bookmarks?: { __typename?: 'app_item_bookmarks_mutation_response', affected_rows: number } | null };

export type GetDistinctSeriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDistinctSeriesQuery = { __typename?: 'query_root', app_item_meta: Array<{ __typename?: 'app_item_meta', series?: string | null, is_published?: boolean | null, is_deleted?: boolean | null }> };

export type GetItemDepublishReasonByExternalIdQueryVariables = Exact<{
  externalId: Scalars['bpchar'];
}>;


export type GetItemDepublishReasonByExternalIdQuery = { __typename?: 'query_root', app_item_meta: Array<{ __typename?: 'app_item_meta', depublish_reason?: string | null, is_published?: boolean | null, is_deleted?: boolean | null }> };

export type GetPublicItemsQueryVariables = Exact<{
  limit: Scalars['Int'];
}>;


export type GetPublicItemsQuery = { __typename?: 'query_root', app_item_meta: Array<{ __typename?: 'app_item_meta', external_id: any, title: string, is_published?: boolean | null, is_deleted?: boolean | null }> };

export type GetPublicItemsByTitleOrExternalIdQueryVariables = Exact<{
  title: Scalars['String'];
  externalId: Scalars['bpchar'];
  limit: Scalars['Int'];
}>;


export type GetPublicItemsByTitleOrExternalIdQuery = { __typename?: 'query_root', itemsByTitle: Array<{ __typename?: 'app_item_meta', external_id: any, title: string, is_published?: boolean | null, is_deleted?: boolean | null }>, itemsByExternalId: Array<{ __typename?: 'app_item_meta', external_id: any, title: string, is_published?: boolean | null, is_deleted?: boolean | null }> };

export type GetUnpublishedItemPidsQueryVariables = Exact<{
  where: Shared_Items_Bool_Exp;
}>;


export type GetUnpublishedItemPidsQuery = { __typename?: 'query_root', shared_items: Array<{ __typename?: 'shared_items', pid: string }> };

export type GetUnpublishedItemsWithFiltersQueryVariables = Exact<{
  where: Shared_Items_Bool_Exp;
  orderBy?: InputMaybe<Array<Shared_Items_Order_By> | Shared_Items_Order_By>;
  offset: Scalars['Int'];
  limit: Scalars['Int'];
}>;


export type GetUnpublishedItemsWithFiltersQuery = { __typename?: 'query_root', shared_items: Array<{ __typename?: 'shared_items', id: number, pid: string, updated_at: any, title?: string | null, status?: any | null, item_meta?: { __typename?: 'app_item_meta', id: number, external_id: any, uid: any, is_published?: boolean | null, is_deleted?: boolean | null } | null }>, shared_items_aggregate: { __typename?: 'shared_items_aggregate', aggregate?: { __typename?: 'shared_items_aggregate_fields', count: number } | null } };

export type GetUserWithEitherBookmarkQueryVariables = Exact<{
  oldItemUid: Scalars['uuid'];
  newItemUid: Scalars['uuid'];
}>;


export type GetUserWithEitherBookmarkQuery = { __typename?: 'query_root', users_profiles: Array<{ __typename?: 'users_profiles', id: any, item_bookmarks_aggregate: { __typename?: 'app_item_bookmarks_aggregate', aggregate?: { __typename?: 'app_item_bookmarks_aggregate_fields', count: number } | null } }> };

export type ReplaceItemInCollectionsBookmarksAndAssignmentsMutationVariables = Exact<{
  oldItemUid: Scalars['uuid'];
  oldItemExternalId: Scalars['bpchar'];
  newItemUid: Scalars['uuid'];
  newItemExternalId: Scalars['bpchar'];
  usersWithBothBookmarks: Array<Scalars['uuid']> | Scalars['uuid'];
}>;


export type ReplaceItemInCollectionsBookmarksAndAssignmentsMutation = { __typename?: 'mutation_root', update_app_collection_fragments?: { __typename?: 'app_collection_fragments_mutation_response', affected_rows: number } | null, update_app_item_bookmarks?: { __typename?: 'app_item_bookmarks_mutation_response', affected_rows: number } | null, delete_app_item_bookmarks?: { __typename?: 'app_item_bookmarks_mutation_response', affected_rows: number } | null, update_app_assignment_blocks_v2?: { __typename?: 'app_assignment_blocks_v2_mutation_response', affected_rows: number } | null, update_app_pupil_collection_blocks?: { __typename?: 'app_pupil_collection_blocks_mutation_response', affected_rows: number } | null };

export type SetSharedItemsStatusMutationVariables = Exact<{
  pids: Array<Scalars['String']> | Scalars['String'];
  status?: InputMaybe<Scalars['item_publishing_status']>;
}>;


export type SetSharedItemsStatusMutation = { __typename?: 'mutation_root', update_shared_items?: { __typename?: 'shared_items_mutation_response', affected_rows: number } | null };

export type UpdateItemDepublishReasonMutationVariables = Exact<{
  itemUuid: Scalars['uuid'];
  reason?: InputMaybe<Scalars['String']>;
}>;


export type UpdateItemDepublishReasonMutation = { __typename?: 'mutation_root', update_app_item_meta?: { __typename?: 'app_item_meta_mutation_response', affected_rows: number } | null };

export type UpdateItemPublishedStateMutationVariables = Exact<{
  itemUuid: Scalars['uuid'];
  isPublished: Scalars['Boolean'];
}>;


export type UpdateItemPublishedStateMutation = { __typename?: 'mutation_root', update_app_item_meta?: { __typename?: 'app_item_meta_mutation_response', affected_rows: number } | null };

export type GetTranslationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTranslationsQuery = { __typename?: 'query_root', app_site_variables: Array<{ __typename?: 'app_site_variables', name: string, value: any }> };

export type UpdateTranslationsMutationVariables = Exact<{
  name: Scalars['String'];
  translations: App_Site_Variables_Set_Input;
}>;


export type UpdateTranslationsMutation = { __typename?: 'mutation_root', update_app_site_variables?: { __typename?: 'app_site_variables_mutation_response', affected_rows: number } | null };

export type GetUserGroupsWithFiltersQueryVariables = Exact<{
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  orderBy: Array<Users_Groups_Order_By> | Users_Groups_Order_By;
  where: Users_Groups_Bool_Exp;
}>;


export type GetUserGroupsWithFiltersQuery = { __typename?: 'query_root', users_groups: Array<{ __typename?: 'users_groups', label: string, id: number, created_at: any, description?: string | null, updated_at: any }>, users_groups_aggregate: { __typename?: 'users_groups_aggregate', aggregate?: { __typename?: 'users_groups_aggregate_fields', count: number } | null } };

export type GetProfileIdsQueryVariables = Exact<{
  where: Users_Summary_View_Bool_Exp;
}>;


export type GetProfileIdsQuery = { __typename?: 'query_root', users_summary_view: Array<{ __typename?: 'users_summary_view', profile_id?: any | null }> };

export type UpdateUserTempAccessByIdMutationVariables = Exact<{
  profile_id: Scalars['uuid'];
  from?: InputMaybe<Scalars['date']>;
  until: Scalars['date'];
}>;


export type UpdateUserTempAccessByIdMutation = { __typename?: 'mutation_root', insert_shared_user_temp_access_v2_one?: { __typename?: 'shared_user_temp_access_v2', profile_id: any } | null };

export type GetContributorsByAssignmentUuidQueryVariables = Exact<{
  id: Scalars['uuid'];
}>;


export type GetContributorsByAssignmentUuidQuery = { __typename?: 'query_root', app_assignments_v2_contributors: Array<{ __typename?: 'app_assignments_v2_contributors', assignment_id: any, invite_email?: string | null, invite_token?: any | null, rights: Lookup_Enum_Right_Types_Enum, profile_id?: any | null, id: any, profile?: { __typename?: 'users_common_users', avatar?: string | null, user?: { __typename?: 'shared_users', first_name?: string | null, full_name?: string | null, last_name?: string | null, mail?: string | null } | null, organisation?: { __typename?: 'shared_organisations', name: string, logo_url?: string | null, or_id: string } | null, loms: Array<{ __typename?: 'users_profiles_lom_links', lom_id: string }> } | null }> };

export type InsertAssignmentBlocksMutationVariables = Exact<{
  assignmentBlocks: Array<App_Assignment_Blocks_V2_Insert_Input> | App_Assignment_Blocks_V2_Insert_Input;
}>;


export type InsertAssignmentBlocksMutation = { __typename?: 'mutation_root', insert_app_assignment_blocks_v2?: { __typename?: 'app_assignment_blocks_v2_mutation_response', affected_rows: number } | null };

export type InsertAssignmentResponseMutationVariables = Exact<{
  assignmentResponses: Array<App_Assignment_Responses_V2_Insert_Input> | App_Assignment_Responses_V2_Insert_Input;
}>;


export type InsertAssignmentResponseMutation = { __typename?: 'mutation_root', insert_app_assignment_responses_v2?: { __typename?: 'app_assignment_responses_v2_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'app_assignment_responses_v2', id: any, created_at: any, owner_profile_id: any, assignment_id: any, collection_title?: string | null, updated_at: any, owner?: { __typename?: 'users_common_users', full_name?: string | null } | null, assignment: { __typename?: 'app_assignments_v2', id: any, title?: string | null, deadline_at?: any | null, owner_profile_id: any, owner?: { __typename?: 'users_common_users', full_name?: string | null } | null }, pupil_collection_blocks: Array<{ __typename?: 'app_pupil_collection_blocks', id: any, fragment_id?: any | null, use_custom_fields: boolean, custom_title?: string | null, custom_description?: string | null, start_oc?: number | null, end_oc?: number | null, position: number, created_at: any, updated_at: any, type: string, thumbnail_path?: string | null, assignment_response_id: any }> }> } | null };

export type DeleteManagementEntryByCollectionIdMutationVariables = Exact<{
  collection_id: Scalars['uuid'];
}>;


export type DeleteManagementEntryByCollectionIdMutation = { __typename?: 'mutation_root', delete_app_collection_management?: { __typename?: 'app_collection_management_mutation_response', affected_rows: number } | null };

export type DeleteCollectionFragmentByIdMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteCollectionFragmentByIdMutation = { __typename?: 'mutation_root', delete_app_collection_fragments?: { __typename?: 'app_collection_fragments_mutation_response', affected_rows: number } | null };

export type DeleteCollectionLabelsMutationVariables = Exact<{
  labels: Array<Scalars['String']> | Scalars['String'];
  collectionId: Scalars['uuid'];
}>;


export type DeleteCollectionLabelsMutation = { __typename?: 'mutation_root', delete_app_collection_labels?: { __typename?: 'app_collection_labels_mutation_response', affected_rows: number } | null };

export type DeleteCollectionLomLinksMutationVariables = Exact<{
  collectionId: Scalars['uuid'];
}>;


export type DeleteCollectionLomLinksMutation = { __typename?: 'mutation_root', delete_app_collections_lom_links?: { __typename?: 'app_collections_lom_links_mutation_response', affected_rows: number } | null };

export type DeleteCollectionOrBundleByUuidMutationVariables = Exact<{
  collectionOrBundleUuid: Scalars['uuid'];
  collectionOrBundleUuidAsText: Scalars['bpchar'];
}>;


export type DeleteCollectionOrBundleByUuidMutation = { __typename?: 'mutation_root', update_app_collections?: { __typename?: 'app_collections_mutation_response', affected_rows: number } | null, delete_app_collection_fragments?: { __typename?: 'app_collection_fragments_mutation_response', affected_rows: number } | null, delete_app_collection_bookmarks?: { __typename?: 'app_collection_bookmarks_mutation_response', affected_rows: number } | null };

export type DeleteMarcomEntriesByParentCollectionIdMutationVariables = Exact<{
  parentCollectionId?: InputMaybe<Scalars['uuid']>;
  channelName?: InputMaybe<Scalars['String']>;
  channelType?: InputMaybe<Scalars['String']>;
  publishDateGte?: InputMaybe<Scalars['timestamptz']>;
  publishDateLte?: InputMaybe<Scalars['timestamptz']>;
}>;


export type DeleteMarcomEntriesByParentCollectionIdMutation = { __typename?: 'mutation_root', delete_app_collection_marcom_log?: { __typename?: 'app_collection_marcom_log_mutation_response', affected_rows: number } | null };

export type DeleteMarcomEntryMutationVariables = Exact<{
  id?: InputMaybe<Scalars['Int']>;
}>;


export type DeleteMarcomEntryMutation = { __typename?: 'mutation_root', delete_app_collection_marcom_log?: { __typename?: 'app_collection_marcom_log_mutation_response', affected_rows: number } | null };

export type GetBookmarkedCollectionsByOwnerQueryVariables = Exact<{
  owner_profile_id?: InputMaybe<Scalars['uuid']>;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<App_Collection_Bookmarks_Order_By> | App_Collection_Bookmarks_Order_By>;
  where?: InputMaybe<Array<App_Collection_Bookmarks_Bool_Exp> | App_Collection_Bookmarks_Bool_Exp>;
}>;


export type GetBookmarkedCollectionsByOwnerQuery = { __typename?: 'query_root', app_collection_bookmarks: Array<{ __typename?: 'app_collection_bookmarks', bookmarkedCollection?: { __typename?: 'app_collections', id: any, updated_at: any, type_id: number, title: string, publish_at?: any | null, owner_profile_id?: any | null, is_public: boolean, external_id?: string | null, depublish_at?: any | null, created_at: any, thumbnail_path?: string | null, type: { __typename?: 'shared_types', label: string, id: number }, profile?: { __typename?: 'users_profiles', id: any, alias?: string | null, title?: string | null, alternative_email?: string | null, avatar?: string | null, created_at: any, stamboek?: string | null, updated_at: any, user_id?: any | null, organisation?: { __typename?: 'shared_organisations', logo_url?: string | null, name: string, or_id: string } | null, user?: { __typename?: 'shared_users', id: number, first_name?: string | null, last_name?: string | null, profile?: { __typename?: 'users_profiles', profile_user_group?: { __typename?: 'users_profile_user_groups', group: { __typename?: 'users_groups', label: string, id: number } } | null } | null } | null } | null, view_count?: { __typename?: 'app_collection_views', count?: number | null } | null } | null }> };

export type GetBundleTitlesByOwnerQueryVariables = Exact<{
  owner_profile_id?: InputMaybe<Scalars['uuid']>;
}>;


export type GetBundleTitlesByOwnerQuery = { __typename?: 'query_root', app_collections: Array<{ __typename?: 'app_collections', id: any, title: string }> };

export type GetCollectionByTitleOrDescriptionQueryVariables = Exact<{
  title: Scalars['String'];
  description: Scalars['String'];
  collectionId: Scalars['uuid'];
  typeId?: InputMaybe<Scalars['Int']>;
}>;


export type GetCollectionByTitleOrDescriptionQuery = { __typename?: 'query_root', collectionByTitle: Array<{ __typename?: 'app_collections', id: any }>, collectionByDescription: Array<{ __typename?: 'app_collections', id: any }> };

export type GetCollectionMarcomEntriesQueryVariables = Exact<{
  collectionUuid: Scalars['uuid'];
}>;


export type GetCollectionMarcomEntriesQuery = { __typename?: 'query_root', app_collection_marcom_log: Array<{ __typename?: 'app_collection_marcom_log', id: number, channel_name?: string | null, channel_type?: string | null, external_link?: string | null, publish_date?: any | null, collection_id: any, parent_collection?: { __typename?: 'app_collections', id: any, title: string } | null }> };

export type GetCollectionTitlesByOwnerQueryVariables = Exact<{
  owner_profile_id?: InputMaybe<Scalars['uuid']>;
}>;


export type GetCollectionTitlesByOwnerQuery = { __typename?: 'query_root', app_collections: Array<{ __typename?: 'app_collections', id: any, title: string }> };

export type GetCollectionsByItemUuidQueryVariables = Exact<{
  fragmentId: Scalars['bpchar'];
}>;


export type GetCollectionsByItemUuidQuery = { __typename?: 'query_root', app_collections: Array<{ __typename?: 'app_collections', id: any, title: string, is_public: boolean, profile?: { __typename?: 'users_profiles', id: any, user?: { __typename?: 'shared_users', first_name?: string | null, last_name?: string | null, id: number } | null, organisation?: { __typename?: 'shared_organisations', name: string } | null } | null }> };

export type GetCollectionsByOwnerOrContributorQueryVariables = Exact<{
  collaborator_profile_id?: InputMaybe<Scalars['uuid']>;
  type_id?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<App_Collections_Overview_Order_By> | App_Collections_Overview_Order_By>;
  where?: InputMaybe<Array<App_Collections_Overview_Bool_Exp> | App_Collections_Overview_Bool_Exp>;
}>;


export type GetCollectionsByOwnerOrContributorQuery = { __typename?: 'query_root', app_collections_overview: Array<{ __typename?: 'app_collections_overview', id?: any | null, updated_at?: any | null, type_id?: number | null, title?: string | null, published_at?: any | null, owner_profile_id?: any | null, collaborator_profile_id?: any | null, is_public?: boolean | null, external_id?: string | null, depublish_at?: any | null, created_at?: any | null, thumbnail_path?: string | null, share_type?: string | null, type?: { __typename?: 'shared_types', label: string, id: number } | null, profile?: { __typename?: 'users_profiles', id: any, alias?: string | null, title?: string | null, alternative_email?: string | null, avatar?: string | null, created_at: any, stamboek?: string | null, updated_at: any, user_id?: any | null, organisation?: { __typename?: 'shared_organisations', logo_url?: string | null, name: string, or_id: string } | null, user?: { __typename?: 'shared_users', id: number, first_name?: string | null, last_name?: string | null, profile?: { __typename?: 'users_profiles', profile_user_group?: { __typename?: 'users_profile_user_groups', group: { __typename?: 'users_groups', label: string, id: number } } | null } | null } | null } | null, view_count?: { __typename?: 'app_collection_views', count?: number | null } | null, contributors: Array<{ __typename?: 'app_collections_contributors', profile_id?: any | null, rights: Lookup_Enum_Right_Types_Enum, enum_right_type: { __typename?: 'lookup_enum_right_types', value: string }, profile?: { __typename?: 'users_common_users', user?: { __typename?: 'shared_users', full_name?: string | null, first_name?: string | null, last_name?: string | null, uid: any } | null, organisation?: { __typename?: 'shared_organisations', name: string, logo_url?: string | null, or_id: string } | null, loms: Array<{ __typename?: 'users_profiles_lom_links', lom_id: string }> } | null, collection: { __typename?: 'app_collections', id: any } }> }> };

export type GetContributorsByCollectionUuidQueryVariables = Exact<{
  id: Scalars['uuid'];
}>;


export type GetContributorsByCollectionUuidQuery = { __typename?: 'query_root', app_collections_contributors: Array<{ __typename?: 'app_collections_contributors', collection_id: any, invite_email?: string | null, invite_token?: any | null, rights: Lookup_Enum_Right_Types_Enum, profile_id?: any | null, id: any, profile?: { __typename?: 'users_common_users', avatar?: string | null, organisation?: { __typename?: 'shared_organisations', name: string, logo_url?: string | null, or_id: string } | null, user?: { __typename?: 'shared_users', first_name?: string | null, full_name?: string | null, last_name?: string | null, mail?: string | null } | null } | null }> };

export type GetOrganisationContentQueryVariables = Exact<{
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<App_Collections_Order_By> | App_Collections_Order_By>;
  company_id: Scalars['String'];
}>;


export type GetOrganisationContentQuery = { __typename?: 'query_root', app_collections: Array<{ __typename?: 'app_collections', id: any, created_at: any, title: string, updated_at: any, type: { __typename?: 'shared_types', label: string }, last_editor?: { __typename?: 'users_common_users', full_name?: string | null } | null, owner?: { __typename?: 'users_common_users', full_name?: string | null } | null }> };

export type GetPublicCollectionsQueryVariables = Exact<{
  limit: Scalars['Int'];
  typeId: Scalars['Int'];
}>;


export type GetPublicCollectionsQuery = { __typename?: 'query_root', app_collections_overview: Array<{ __typename?: 'app_collections_overview', id?: any | null, title?: string | null, share_type?: string | null, updated_at?: any | null, is_public?: boolean | null, thumbnail_path?: string | null, created_at?: any | null, contributors: Array<{ __typename?: 'app_collections_contributors', enum_right_type: { __typename?: 'lookup_enum_right_types', value: string }, profile?: { __typename?: 'users_common_users', organisation?: { __typename?: 'shared_organisations', name: string, logo_url?: string | null, or_id: string } | null, user?: { __typename?: 'shared_users', first_name?: string | null, full_name?: string | null, last_name?: string | null } | null, loms: Array<{ __typename?: 'users_profiles_lom_links', lom_id: string }> } | null }> }> };

export type GetPublicCollectionsByIdQueryVariables = Exact<{
  id: Scalars['uuid'];
  typeId: Scalars['Int'];
  limit: Scalars['Int'];
}>;


export type GetPublicCollectionsByIdQuery = { __typename?: 'query_root', app_collections_overview: Array<{ __typename?: 'app_collections_overview', id?: any | null, title?: string | null, share_type?: string | null, updated_at?: any | null, is_public?: boolean | null, thumbnail_path?: string | null, created_at?: any | null, view_count?: { __typename?: 'app_collection_views', count?: number | null } | null, contributors: Array<{ __typename?: 'app_collections_contributors', enum_right_type: { __typename?: 'lookup_enum_right_types', value: string }, profile?: { __typename?: 'users_common_users', user?: { __typename?: 'shared_users', first_name?: string | null, full_name?: string | null, last_name?: string | null } | null, organisation?: { __typename?: 'shared_organisations', name: string, logo_url?: string | null, or_id: string } | null, loms: Array<{ __typename?: 'users_profiles_lom_links', lom_id: string }> } | null }> }> };

export type GetPublicCollectionsByTitleQueryVariables = Exact<{
  title: Scalars['String'];
  typeId: Scalars['Int'];
  limit: Scalars['Int'];
}>;


export type GetPublicCollectionsByTitleQuery = { __typename?: 'query_root', app_collections_overview: Array<{ __typename?: 'app_collections_overview', id?: any | null, title?: string | null, share_type?: string | null, updated_at?: any | null, is_public?: boolean | null, thumbnail_path?: string | null, created_at?: any | null, view_count?: { __typename?: 'app_collection_views', count?: number | null } | null, contributors: Array<{ __typename?: 'app_collections_contributors', enum_right_type: { __typename?: 'lookup_enum_right_types', value: string }, profile?: { __typename?: 'users_common_users', organisation?: { __typename?: 'shared_organisations', name: string, logo_url?: string | null, or_id: string } | null, user?: { __typename?: 'shared_users', first_name?: string | null, full_name?: string | null, last_name?: string | null } | null, loms: Array<{ __typename?: 'users_profiles_lom_links', lom_id: string }> } | null }> }> };

export type InsertCollectionMutationVariables = Exact<{
  collection: App_Collections_Insert_Input;
}>;


export type InsertCollectionMutation = { __typename?: 'mutation_root', insert_app_collections?: { __typename?: 'app_collections_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'app_collections', id: any, title: string, collection_fragments: Array<{ __typename?: 'app_collection_fragments', id: number }> }> } | null };

export type InsertCollectionFragmentsMutationVariables = Exact<{
  fragments: Array<App_Collection_Fragments_Insert_Input> | App_Collection_Fragments_Insert_Input;
}>;


export type InsertCollectionFragmentsMutation = { __typename?: 'mutation_root', insert_app_collection_fragments?: { __typename?: 'app_collection_fragments_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'app_collection_fragments', id: number }> } | null };

export type InsertCollectionLabelsMutationVariables = Exact<{
  objects: Array<App_Collection_Labels_Insert_Input> | App_Collection_Labels_Insert_Input;
}>;


export type InsertCollectionLabelsMutation = { __typename?: 'mutation_root', insert_app_collection_labels?: { __typename?: 'app_collection_labels_mutation_response', affected_rows: number } | null };

export type InsertCollectionLomLinksMutationVariables = Exact<{
  lomObjects: Array<App_Collections_Lom_Links_Insert_Input> | App_Collections_Lom_Links_Insert_Input;
}>;


export type InsertCollectionLomLinksMutation = { __typename?: 'mutation_root', insert_app_collections_lom_links?: { __typename?: 'app_collections_lom_links_mutation_response', affected_rows: number } | null };

export type InsertCollectionManagementEntryMutationVariables = Exact<{
  collection_id: Scalars['uuid'];
  current_status?: InputMaybe<Scalars['String']>;
  manager_profile_id?: InputMaybe<Scalars['uuid']>;
  status_valid_until?: InputMaybe<Scalars['timestamptz']>;
  note?: InputMaybe<Scalars['String']>;
  updated_at?: InputMaybe<Scalars['timestamptz']>;
}>;


export type InsertCollectionManagementEntryMutation = { __typename?: 'mutation_root', delete_app_collection_management?: { __typename?: 'app_collection_management_mutation_response', affected_rows: number } | null, insert_app_collection_management?: { __typename?: 'app_collection_management_mutation_response', affected_rows: number } | null };

export type InsertCollectionManagementQualityCheckEntryMutationVariables = Exact<{
  collection_id: Scalars['uuid'];
  comment?: InputMaybe<Scalars['String']>;
  assignee_profile_id?: InputMaybe<Scalars['uuid']>;
  qc_label?: InputMaybe<Lookup_Enum_Collection_Management_Qc_Label_Enum>;
  qc_status?: InputMaybe<Scalars['Boolean']>;
}>;


export type InsertCollectionManagementQualityCheckEntryMutation = { __typename?: 'mutation_root', insert_app_collection_management_QC_one?: { __typename?: 'app_collection_management_QC', id: number } | null };

export type InsertMarcomEntryMutationVariables = Exact<{
  objects: Array<App_Collection_Marcom_Log_Insert_Input> | App_Collection_Marcom_Log_Insert_Input;
}>;


export type InsertMarcomEntryMutation = { __typename?: 'mutation_root', insert_app_collection_marcom_log?: { __typename?: 'app_collection_marcom_log_mutation_response', affected_rows: number } | null };

export type InsertMarcomNoteMutationVariables = Exact<{
  collectionId?: InputMaybe<Scalars['uuid']>;
  note?: InputMaybe<Scalars['String']>;
}>;


export type InsertMarcomNoteMutation = { __typename?: 'mutation_root', insert_app_collection_marcom_notes?: { __typename?: 'app_collection_marcom_notes_mutation_response', returning: Array<{ __typename?: 'app_collection_marcom_notes', id: number }> } | null };

export type UpdateCollectionByIdMutationVariables = Exact<{
  id: Scalars['uuid'];
  collection: App_Collections_Set_Input;
}>;


export type UpdateCollectionByIdMutation = { __typename?: 'mutation_root', update_app_collections?: { __typename?: 'app_collections_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'app_collections', id: any, title: string, labels: Array<{ __typename?: 'app_collection_labels', label: string, id: number }> }> } | null };

export type UpdateCollectionFragmentByIdMutationVariables = Exact<{
  id: Scalars['Int'];
  fragment: App_Collection_Fragments_Set_Input;
}>;


export type UpdateCollectionFragmentByIdMutation = { __typename?: 'mutation_root', update_app_collection_fragments?: { __typename?: 'app_collection_fragments_mutation_response', affected_rows: number } | null };

export type UpdateCollectionManagementEntryMutationVariables = Exact<{
  collection_id: Scalars['uuid'];
  current_status?: InputMaybe<Scalars['String']>;
  manager_profile_id?: InputMaybe<Scalars['uuid']>;
  status_valid_until?: InputMaybe<Scalars['timestamptz']>;
  note?: InputMaybe<Scalars['String']>;
  updated_at?: InputMaybe<Scalars['timestamptz']>;
}>;


export type UpdateCollectionManagementEntryMutation = { __typename?: 'mutation_root', update_app_collection_management?: { __typename?: 'app_collection_management_mutation_response', affected_rows: number } | null };

export type UpdateMarcomNoteMutationVariables = Exact<{
  id?: InputMaybe<Scalars['Int']>;
  note?: InputMaybe<Scalars['String']>;
}>;


export type UpdateMarcomNoteMutation = { __typename?: 'mutation_root', update_app_collection_marcom_notes?: { __typename?: 'app_collection_marcom_notes_mutation_response', returning: Array<{ __typename?: 'app_collection_marcom_notes', id: number }> } | null };

export type GetQuickLaneByContentAndOwnerQueryVariables = Exact<{
  contentId?: InputMaybe<Scalars['uuid']>;
  contentLabel?: InputMaybe<Scalars['String']>;
  profileId?: InputMaybe<Scalars['uuid']>;
}>;


export type GetQuickLaneByContentAndOwnerQuery = { __typename?: 'query_root', app_quick_lanes: Array<{ __typename?: 'app_quick_lanes', id: any, content_id: any, content_label: string, title: string, view_mode: string, created_at: any, updated_at: any, start_oc?: number | null, end_oc?: number | null, owner?: { __typename?: 'users_common_users', first_name?: string | null, last_name?: string | null, full_name?: string | null, profile_id?: any | null, mail?: string | null, avatar?: string | null, organisation?: { __typename?: 'shared_organisations', name: string, logo_url?: string | null, or_id: string } | null } | null }> };

export type GetQuickLaneByIdQueryVariables = Exact<{
  id?: InputMaybe<Scalars['uuid']>;
}>;


export type GetQuickLaneByIdQuery = { __typename?: 'query_root', app_quick_lanes: Array<{ __typename?: 'app_quick_lanes', id: any, content_id: any, content_label: string, title: string, view_mode: string, start_oc?: number | null, end_oc?: number | null, created_at: any, updated_at: any, owner?: { __typename?: 'users_common_users', first_name?: string | null, last_name?: string | null, full_name?: string | null, profile_id?: any | null, mail?: string | null, avatar?: string | null, organisation?: { __typename?: 'shared_organisations', name: string, logo_url?: string | null, or_id: string } | null } | null }> };

export type InsertQuickLanesMutationVariables = Exact<{
  objects: Array<App_Quick_Lanes_Insert_Input> | App_Quick_Lanes_Insert_Input;
}>;


export type InsertQuickLanesMutation = { __typename?: 'mutation_root', insert_app_quick_lanes?: { __typename?: 'app_quick_lanes_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'app_quick_lanes', id: any, content_id: any, content_label: string, title: string, view_mode: string, start_oc?: number | null, end_oc?: number | null, created_at: any, updated_at: any, owner?: { __typename?: 'users_common_users', first_name?: string | null, last_name?: string | null, full_name?: string | null, profile_id?: any | null, mail?: string | null, avatar?: string | null, organisation?: { __typename?: 'shared_organisations', name: string, logo_url?: string | null, or_id: string } | null } | null }> } | null };

export type RemoveQuickLanesMutationVariables = Exact<{
  ids: Array<Scalars['uuid']> | Scalars['uuid'];
  profileId: Scalars['uuid'];
}>;


export type RemoveQuickLanesMutation = { __typename?: 'mutation_root', delete_app_quick_lanes?: { __typename?: 'app_quick_lanes_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'app_quick_lanes', id: any }> } | null };

export type UpdateQuickLaneByIdMutationVariables = Exact<{
  id: Scalars['uuid'];
  object: App_Quick_Lanes_Set_Input;
}>;


export type UpdateQuickLaneByIdMutation = { __typename?: 'mutation_root', update_app_quick_lanes?: { __typename?: 'app_quick_lanes_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'app_quick_lanes', id: any, content_id: any, content_label: string, title: string, view_mode: string, start_oc?: number | null, end_oc?: number | null, created_at: any, updated_at: any, owner?: { __typename?: 'users_common_users', first_name?: string | null, last_name?: string | null, full_name?: string | null, profile_id?: any | null, mail?: string | null, avatar?: string | null, organisation?: { __typename?: 'shared_organisations', name: string, logo_url?: string | null, or_id: string } | null } | null }> } | null };

export type GetProfilePreferenceQueryVariables = Exact<{
  profileId: Scalars['uuid'];
  key: Lookup_Enum_Profile_Preferences_Keys_Enum;
}>;


export type GetProfilePreferenceQuery = { __typename?: 'query_root', users_profile_preferences: Array<{ __typename?: 'users_profile_preferences', id: number, profile_id: any, key: Lookup_Enum_Profile_Preferences_Keys_Enum }> };

export type SetProfilePreferenceMutationVariables = Exact<{
  profileId: Scalars['uuid'];
  key: Lookup_Enum_Profile_Preferences_Keys_Enum;
}>;


export type SetProfilePreferenceMutation = { __typename?: 'mutation_root', insert_users_profile_preferences?: { __typename?: 'users_profile_preferences_mutation_response', affected_rows: number } | null };

export type GetQualityLabelsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetQualityLabelsQuery = { __typename?: 'query_root', lookup_enum_collection_labels: Array<{ __typename?: 'lookup_enum_collection_labels', description?: string | null, value: string }> };

export type GetQuickLanesByContentIdQueryVariables = Exact<{
  contentId?: InputMaybe<Scalars['uuid']>;
}>;


export type GetQuickLanesByContentIdQuery = { __typename?: 'query_root', app_quick_lanes: Array<{ __typename?: 'app_quick_lanes', id: any, content_id: any, content_label: string, title: string, view_mode: string, start_oc?: number | null, end_oc?: number | null, created_at: any, updated_at: any, owner?: { __typename?: 'users_common_users', first_name?: string | null, last_name?: string | null, full_name?: string | null, profile_id?: any | null, mail?: string | null, avatar?: string | null, organisation?: { __typename?: 'shared_organisations', name: string, logo_url?: string | null, or_id: string } | null } | null }> };

export type GetQuickLanesWithFiltersQueryVariables = Exact<{
  filterString?: InputMaybe<Scalars['String']>;
  filters?: InputMaybe<Array<App_Quick_Lanes_Bool_Exp> | App_Quick_Lanes_Bool_Exp>;
  orderBy?: InputMaybe<Array<App_Quick_Lanes_Order_By> | App_Quick_Lanes_Order_By>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
}>;


export type GetQuickLanesWithFiltersQuery = { __typename?: 'query_root', app_quick_lanes: Array<{ __typename?: 'app_quick_lanes', id: any, content_id: any, content_label: string, title: string, view_mode: string, start_oc?: number | null, end_oc?: number | null, created_at: any, updated_at: any, owner?: { __typename?: 'users_common_users', first_name?: string | null, last_name?: string | null, full_name?: string | null, profile_id?: any | null, mail?: string | null, avatar?: string | null, organisation?: { __typename?: 'shared_organisations', name: string, logo_url?: string | null, or_id: string } | null } | null }>, app_quick_lanes_aggregate: { __typename?: 'app_quick_lanes_aggregate', aggregate?: { __typename?: 'app_quick_lanes_aggregate_fields', count: number } | null } };

export type DeleteAssignmentLabelsMutationVariables = Exact<{
  profileId: Scalars['uuid'];
  labelIds: Array<Scalars['uuid']> | Scalars['uuid'];
}>;


export type DeleteAssignmentLabelsMutation = { __typename?: 'mutation_root', delete_app_assignment_labels_v2?: { __typename?: 'app_assignment_labels_v2_mutation_response', affected_rows: number } | null };

export type GetAllAssignmentLabelColorsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllAssignmentLabelColorsQuery = { __typename?: 'query_root', lookup_enum_colors: Array<{ __typename?: 'lookup_enum_colors', label: string, value: string }> };

export type GetAssignmentLabelsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAssignmentLabelsQuery = { __typename?: 'query_root', app_assignment_labels_v2: Array<{ __typename?: 'app_assignment_labels_v2', color_enum_value: Lookup_Enum_Colors_Enum, color_override?: string | null, label?: string | null, id: any, type: string, owner_profile_id: any, enum_color: { __typename?: 'lookup_enum_colors', label: string, value: string } }> };

export type GetAssignmentLabelsByProfileIdQueryVariables = Exact<{
  profileId: Scalars['uuid'];
  filters?: InputMaybe<Array<App_Assignment_Labels_V2_Bool_Exp> | App_Assignment_Labels_V2_Bool_Exp>;
}>;


export type GetAssignmentLabelsByProfileIdQuery = { __typename?: 'query_root', app_assignment_labels_v2: Array<{ __typename?: 'app_assignment_labels_v2', color_enum_value: Lookup_Enum_Colors_Enum, color_override?: string | null, label?: string | null, id: any, type: string, owner_profile_id: any, enum_color: { __typename?: 'lookup_enum_colors', label: string, value: string } }> };

export type InsertAssignmentLabelsMutationVariables = Exact<{
  objects: Array<App_Assignment_Labels_V2_Insert_Input> | App_Assignment_Labels_V2_Insert_Input;
}>;


export type InsertAssignmentLabelsMutation = { __typename?: 'mutation_root', insert_app_assignment_labels_v2?: { __typename?: 'app_assignment_labels_v2_mutation_response', returning: Array<{ __typename?: 'app_assignment_labels_v2', id: any }> } | null };

export type UpdateAssignmentLabelsMutationVariables = Exact<{
  label: Scalars['String'];
  colorEnumValue: Lookup_Enum_Colors_Enum;
  profileId: Scalars['uuid'];
  labelId: Scalars['uuid'];
}>;


export type UpdateAssignmentLabelsMutation = { __typename?: 'mutation_root', update_app_assignment_labels_v2?: { __typename?: 'app_assignment_labels_v2_mutation_response', affected_rows: number } | null };

export type DeleteAssignmentBookmarksForUserMutationVariables = Exact<{
  assignmentUuid: Scalars['uuid'];
  profileId?: InputMaybe<Scalars['uuid']>;
}>;


export type DeleteAssignmentBookmarksForUserMutation = { __typename?: 'mutation_root', delete_app_assignments_v2_bookmarks?: { __typename?: 'app_assignments_v2_bookmarks_mutation_response', affected_rows: number } | null };

export type DeleteCollectionBookmarksForUserMutationVariables = Exact<{
  collectionUuid: Scalars['uuid'];
  profileId?: InputMaybe<Scalars['uuid']>;
}>;


export type DeleteCollectionBookmarksForUserMutation = { __typename?: 'mutation_root', delete_app_collection_bookmarks?: { __typename?: 'app_collection_bookmarks_mutation_response', affected_rows: number } | null };

export type DeleteItemBookmarkMutationVariables = Exact<{
  itemUuid: Scalars['uuid'];
  profileId?: InputMaybe<Scalars['uuid']>;
}>;


export type DeleteItemBookmarkMutation = { __typename?: 'mutation_root', delete_app_item_bookmarks?: { __typename?: 'app_item_bookmarks_mutation_response', affected_rows: number } | null };

export type GetAssignmentBookmarkViewCountsQueryVariables = Exact<{
  assignmentUuid: Scalars['uuid'];
  profileId: Scalars['uuid'];
}>;


export type GetAssignmentBookmarkViewCountsQuery = { __typename?: 'query_root', app_assignments_v2_bookmarks_aggregate: { __typename?: 'app_assignments_v2_bookmarks_aggregate', aggregate?: { __typename?: 'app_assignments_v2_bookmarks_aggregate_fields', count: number } | null }, app_assignment_v2_views: Array<{ __typename?: 'app_assignment_v2_views', count: number }>, app_assignments_v2_bookmarks: Array<{ __typename?: 'app_assignments_v2_bookmarks', id: any }> };

export type GetAssignmentViewCountQueryVariables = Exact<{
  assignmentUuid: Scalars['uuid'];
}>;


export type GetAssignmentViewCountQuery = { __typename?: 'query_root', app_assignments_v2: Array<{ __typename?: 'app_assignments_v2', view_count?: { __typename?: 'app_assignment_v2_views', count: number } | null }> };

export type GetBookmarkStatusesQueryVariables = Exact<{
  profileId: Scalars['uuid'];
  itemUuids: Array<Scalars['uuid']> | Scalars['uuid'];
  collectionUuids: Array<Scalars['uuid']> | Scalars['uuid'];
  assignmentUuids: Array<Scalars['uuid']> | Scalars['uuid'];
}>;


export type GetBookmarkStatusesQuery = { __typename?: 'query_root', app_collection_bookmarks: Array<{ __typename?: 'app_collection_bookmarks', collection_uuid: any }>, app_item_bookmarks: Array<{ __typename?: 'app_item_bookmarks', item_id: any }>, app_assignments_v2_bookmarks: Array<{ __typename?: 'app_assignments_v2_bookmarks', assignment_id: any }> };

export type GetCollectionBookmarkViewPlayCountsQueryVariables = Exact<{
  collectionUuid: Scalars['uuid'];
  profileId?: InputMaybe<Scalars['uuid']>;
}>;


export type GetCollectionBookmarkViewPlayCountsQuery = { __typename?: 'query_root', app_collection_views: Array<{ __typename?: 'app_collection_views', count?: number | null }>, app_collection_plays: Array<{ __typename?: 'app_collection_plays', count?: number | null }>, app_collection_bookmarks_aggregate: { __typename?: 'app_collection_bookmarks_aggregate', aggregate?: { __typename?: 'app_collection_bookmarks_aggregate_fields', count: number } | null }, app_collection_bookmarks: Array<{ __typename?: 'app_collection_bookmarks', id: number }> };

export type GetCollectionPlayCountQueryVariables = Exact<{
  collectionUuid: Scalars['uuid'];
}>;


export type GetCollectionPlayCountQuery = { __typename?: 'query_root', app_collections: Array<{ __typename?: 'app_collections', play_count?: { __typename?: 'app_collection_plays', count?: number | null } | null }> };

export type GetCollectionViewCountQueryVariables = Exact<{
  collectionUuid: Scalars['uuid'];
}>;


export type GetCollectionViewCountQuery = { __typename?: 'query_root', app_collections: Array<{ __typename?: 'app_collections', view_count?: { __typename?: 'app_collection_views', count?: number | null } | null }> };

export type GetItemBookmarkViewPlayCountsQueryVariables = Exact<{
  itemUuid: Scalars['uuid'];
  profileId?: InputMaybe<Scalars['uuid']>;
}>;


export type GetItemBookmarkViewPlayCountsQuery = { __typename?: 'query_root', app_item_plays: Array<{ __typename?: 'app_item_plays', count?: number | null }>, app_item_views: Array<{ __typename?: 'app_item_views', count?: number | null }>, app_item_bookmarks_aggregate: { __typename?: 'app_item_bookmarks_aggregate', aggregate?: { __typename?: 'app_item_bookmarks_aggregate_fields', count: number } | null }, app_item_bookmarks: Array<{ __typename?: 'app_item_bookmarks', id: number }> };

export type GetItemBookmarksForUserQueryVariables = Exact<{
  profileId: Scalars['uuid'];
  filter?: InputMaybe<Array<App_Item_Bookmarks_Bool_Exp> | App_Item_Bookmarks_Bool_Exp>;
  order?: Array<App_Item_Bookmarks_Order_By> | App_Item_Bookmarks_Order_By;
}>;


export type GetItemBookmarksForUserQuery = { __typename?: 'query_root', app_item_bookmarks: Array<{ __typename?: 'app_item_bookmarks', item_id: any, created_at: any, bookmarkedItem?: { __typename?: 'app_item_meta', title: string, thumbnail_path: string, duration?: any | null, issued?: any | null, item?: { __typename?: 'shared_items', external_id: string, item_meta?: { __typename?: 'app_item_meta', is_deleted?: boolean | null, is_published?: boolean | null, type_id: number, organisation?: { __typename?: 'shared_organisations', name: string } | null, type?: { __typename?: 'shared_types', id: number, label: string } | null } | null } | null, view_count?: { __typename?: 'app_item_views', count?: number | null } | null } | null }> };

export type GetItemPlayCountQueryVariables = Exact<{
  itemUuid: Scalars['uuid'];
}>;


export type GetItemPlayCountQuery = { __typename?: 'query_root', app_item_meta: Array<{ __typename?: 'app_item_meta', is_published?: boolean | null, is_deleted?: boolean | null, play_count?: { __typename?: 'app_item_plays', count?: number | null } | null }> };

export type GetItemViewCountQueryVariables = Exact<{
  itemUuid: Scalars['uuid'];
}>;


export type GetItemViewCountQuery = { __typename?: 'query_root', app_item_meta: Array<{ __typename?: 'app_item_meta', is_deleted?: boolean | null, is_published?: boolean | null, view_count?: { __typename?: 'app_item_views', count?: number | null } | null }> };

export type GetMultipleAssignmentViewCountsQueryVariables = Exact<{
  uuids?: InputMaybe<Array<Scalars['uuid']> | Scalars['uuid']>;
}>;


export type GetMultipleAssignmentViewCountsQuery = { __typename?: 'query_root', items: Array<{ __typename?: 'app_assignment_v2_views', count: number, id: any }> };

export type GetMultipleCollectionViewCountsQueryVariables = Exact<{
  uuids?: InputMaybe<Array<Scalars['uuid']> | Scalars['uuid']>;
}>;


export type GetMultipleCollectionViewCountsQuery = { __typename?: 'query_root', items: Array<{ __typename?: 'app_collection_views', count?: number | null, id: any }> };

export type GetMultipleItemViewCountsQueryVariables = Exact<{
  uuids?: InputMaybe<Array<Scalars['uuid']> | Scalars['uuid']>;
}>;


export type GetMultipleItemViewCountsQuery = { __typename?: 'query_root', items: Array<{ __typename?: 'app_item_views', count?: number | null, id?: any | null }> };

export type IncrementAssignmentViewsMutationVariables = Exact<{
  assignmentUuid: Scalars['uuid'];
}>;


export type IncrementAssignmentViewsMutation = { __typename?: 'mutation_root', update_app_assignment_v2_views?: { __typename?: 'app_assignment_v2_views_mutation_response', affected_rows: number } | null };

export type IncrementCollectionPlaysMutationVariables = Exact<{
  collectionUuid: Scalars['uuid'];
}>;


export type IncrementCollectionPlaysMutation = { __typename?: 'mutation_root', update_app_collection_plays?: { __typename?: 'app_collection_plays_mutation_response', affected_rows: number } | null };

export type IncrementCollectionViewsMutationVariables = Exact<{
  collectionUuid: Scalars['uuid'];
}>;


export type IncrementCollectionViewsMutation = { __typename?: 'mutation_root', update_app_collection_views?: { __typename?: 'app_collection_views_mutation_response', affected_rows: number } | null };

export type IncrementItemPlaysMutationVariables = Exact<{
  itemUuid: Scalars['uuid'];
}>;


export type IncrementItemPlaysMutation = { __typename?: 'mutation_root', update_app_item_plays?: { __typename?: 'app_item_plays_mutation_response', affected_rows: number } | null };

export type IncrementItemViewsMutationVariables = Exact<{
  itemUuid: Scalars['uuid'];
}>;


export type IncrementItemViewsMutation = { __typename?: 'mutation_root', update_app_item_views?: { __typename?: 'app_item_views_mutation_response', affected_rows: number } | null };

export type InsertAssignmentBookmarkMutationVariables = Exact<{
  bookmarkAssignment: App_Assignments_V2_Bookmarks_Insert_Input;
}>;


export type InsertAssignmentBookmarkMutation = { __typename?: 'mutation_root', insert_app_assignments_v2_bookmarks_one?: { __typename?: 'app_assignments_v2_bookmarks', id: any } | null };

export type InsertCollectionBookmarkMutationVariables = Exact<{
  bookmarkItem: App_Collection_Bookmarks_Insert_Input;
}>;


export type InsertCollectionBookmarkMutation = { __typename?: 'mutation_root', insert_app_collection_bookmarks?: { __typename?: 'app_collection_bookmarks_mutation_response', affected_rows: number } | null };

export type InsertItemBookmarkMutationVariables = Exact<{
  bookmarkItem: App_Item_Bookmarks_Insert_Input;
}>;


export type InsertItemBookmarkMutation = { __typename?: 'mutation_root', insert_app_item_bookmarks?: { __typename?: 'app_item_bookmarks_mutation_response', affected_rows: number } | null };

export type GetAllOrganisationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllOrganisationsQuery = { __typename?: 'query_root', shared_organisations: Array<{ __typename?: 'shared_organisations', or_id: string, name: string, logo_url?: string | null }> };

export type GetDistinctOrganisationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDistinctOrganisationsQuery = { __typename?: 'query_root', app_item_meta: Array<{ __typename?: 'app_item_meta', is_published?: boolean | null, is_deleted?: boolean | null, organisation?: { __typename?: 'shared_organisations', or_id: string, name: string, logo_url?: string | null } | null }> };

export type GetNotificationQueryVariables = Exact<{
  key: Scalars['String'];
  profileId: Scalars['uuid'];
}>;


export type GetNotificationQuery = { __typename?: 'query_root', users_notifications: Array<{ __typename?: 'users_notifications', through_email?: boolean | null, through_platform?: boolean | null }> };

export type GetOrganisationsWithUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOrganisationsWithUsersQuery = { __typename?: 'query_root', shared_organisations_with_users: Array<{ __typename?: 'shared_organisations_with_users', name?: string | null, or_id?: string | null }> };

export type GetUsersByCompanyIdQueryVariables = Exact<{
  companyId: Scalars['String'];
}>;


export type GetUsersByCompanyIdQuery = { __typename?: 'query_root', users_profiles: Array<{ __typename?: 'users_profiles', id: any, user?: { __typename?: 'shared_users', uid: any, full_name?: string | null, mail?: string | null, is_blocked?: boolean | null, last_access_at?: any | null } | null, temp_access?: { __typename?: 'shared_user_temp_access_v2', from?: any | null, until?: any | null, has_currently_access?: { __typename?: 'shared_user_temp_access_status_v2', status?: boolean | null } | null } | null, profile_user_group?: { __typename?: 'users_profile_user_groups', group: { __typename?: 'users_groups', id: number, label: string } } | null }> };

export type InsertNotificationMutationVariables = Exact<{
  key: Scalars['String'];
  profileId: Scalars['uuid'];
  throughEmail: Scalars['Boolean'];
  throughPlatform: Scalars['Boolean'];
}>;


export type InsertNotificationMutation = { __typename?: 'mutation_root', insert_users_notifications?: { __typename?: 'users_notifications_mutation_response', affected_rows: number } | null };

export type UpdateNotificationMutationVariables = Exact<{
  key: Scalars['String'];
  profileId: Scalars['uuid'];
  throughEmail: Scalars['Boolean'];
  throughPlatform: Scalars['Boolean'];
}>;


export type UpdateNotificationMutation = { __typename?: 'mutation_root', update_users_notifications?: { __typename?: 'users_notifications_mutation_response', affected_rows: number } | null };
