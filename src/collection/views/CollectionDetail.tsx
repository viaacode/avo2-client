import {
  Button,
  ButtonToolbar,
  Column,
  Container,
  Dropdown,
  Grid,
  Header,
  HeaderBottomRowLeft,
  HeaderBottomRowRight,
  HeaderMiddleRowRight,
  HeaderTopRowLeft,
  IconName,
  MenuContent,
  MoreOptionsDropdown,
  Spacer,
} from '@viaa/avo2-components';
import { Avo, PermissionName } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import { compact, isNil, noop } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import { useAtomValue } from 'jotai';
import React, {
  type FC,
  type ReactText,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import {
  BooleanParam,
  StringParam,
  useQueryParam,
  useQueryParams,
} from 'use-query-params';

import { AssignmentService } from '../../assignment/assignment.service';
import { ConfirmImportToAssignmentWithResponsesModal } from '../../assignment/modals/ConfirmImportToAssignmentWithResponsesModal';
import { CreateAssignmentModal } from '../../assignment/modals/CreateAssignmentModal';
import { ImportToAssignmentModal } from '../../assignment/modals/ImportToAssignmentModal';
import { commonUserAtom } from '../../authentication/authentication.store';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { RegisterOrLogin } from '../../authentication/views/RegisterOrLogin';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorNoAccess } from '../../error/components/ErrorNoAccess';
import { ErrorView } from '../../error/views/ErrorView';
import {
  ALL_SEARCH_FILTERS,
  type SearchFilter,
} from '../../search/search.const';
import { CommonMetadata } from '../../shared/components/CommonMetaData/CommonMetaData';
import { EditButton } from '../../shared/components/EditButton/EditButton';
import EducationLevelsTagList from '../../shared/components/EducationLevelsTagList/EducationLevelsTagList';
import { FullPageSpinner } from '../../shared/components/FullPageSpinner/FullPageSpinner';
import { HeaderOwnerAndContributors } from '../../shared/components/HeaderOwnerAndContributors/HeaderOwnerAndContributors';
import { InteractiveTour } from '../../shared/components/InteractiveTour/InteractiveTour';
import { JsonLd } from '../../shared/components/JsonLd/JsonLd';
import { type LoadingInfo } from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { MoreOptionsDropdownWrapper } from '../../shared/components/MoreOptionsDropdownWrapper/MoreOptionsDropdownWrapper';
import { QuickLaneTypeEnum } from '../../shared/components/QuickLaneContent/QuickLaneContent.types';
import { QuickLaneModal } from '../../shared/components/QuickLaneModal/QuickLaneModal';
import { ShareDropdown } from '../../shared/components/ShareDropdown/ShareDropdown';
import { ShareModal } from '../../shared/components/ShareModal/ShareModal';
import { ContributorInfoRight } from '../../shared/components/ShareWithColleagues/ShareWithColleagues.types';
import { StickyBar } from '../../shared/components/StickyBar/StickyBar';
import {
  EDIT_STATUS_REFETCH_TIME,
  getMoreOptionsLabel,
} from '../../shared/constants';
import { buildLink } from '../../shared/helpers/build-link';
import { transformContributorsToSimpleContributors } from '../../shared/helpers/contributors';
import { CustomError } from '../../shared/helpers/custom-error';
import { defaultRenderBookmarkButton } from '../../shared/helpers/default-render-bookmark-button';
import {
  defaultGoToDetailLink,
  defaultRenderDetailLink,
} from '../../shared/helpers/default-render-detail-link';
import { defaultRenderSearchLink } from '../../shared/helpers/default-render-search-link';
import { createDropdownMenuItem } from '../../shared/helpers/dropdown';
import { getFullName } from '../../shared/helpers/formatters/avatar';
import { generateContentLinkString, navigate } from '../../shared/helpers/link';
import { getGroupedLomsKeyValue } from '../../shared/helpers/lom';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';
import { isUuid } from '../../shared/helpers/uuid';
import { BookmarksViewsPlaysService } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service';
import { DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.const';
import { type BookmarkViewPlayCounts } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { trackEvents } from '../../shared/services/event-logging-service';
import {
  getRelatedItems,
  ObjectTypes,
  ObjectTypesAll,
} from '../../shared/services/related-items-service';
import { ToastService } from '../../shared/services/toast-service';
import { renderRelatedItems } from '../collection.helpers';
import { CollectionService } from '../collection.service';
import {
  CollectionCreateUpdateTab,
  CollectionMenuAction,
  CollectionOrBundle,
  type Relation,
} from '../collection.types';
import { FragmentList } from '../components/fragment/FragmentList';
import { AddToBundleModal } from '../components/modals/AddToBundleModal';
import { AutoplayCollectionModal } from '../components/modals/AutoplayCollectionModal';
import { DeleteCollectionModal } from '../components/modals/DeleteCollectionModal';
import { DeleteMyselfFromCollectionContributorsConfirmModal } from '../components/modals/DeleteContributorFromCollectionModal';
import { PublishCollectionModal } from '../components/modals/PublishCollectionModal';
import {
  onAddContributor,
  onDeleteContributor,
  onEditContributor,
} from '../helpers/collection-share-with-collegue-handlers';
import {
  deleteCollection,
  deleteSelfFromCollection,
} from '../helpers/delete-collection';
import { useGetCollectionsEditStatuses } from '../hooks/useGetCollectionsEditStatuses';
import {
  BundleSortProp,
  useGetCollectionsOrBundlesContainingFragment,
} from '../hooks/useGetCollectionsOrBundlesContainingFragment';
import { QUERY_PARAM_SHOW_PUBLISH_MODAL } from './CollectionDetail.const';
import './CollectionDetail.scss';
import { ROUTE_PARTS } from '../../shared/constants/routes.ts';

export const COLLECTION_COPY = 'Kopie %index%: ';
export const COLLECTION_COPY_REGEX = /^Kopie [0-9]+: /gi;

type CollectionDetailPermissions = Partial<{
  canEditCollections: boolean;
  canPublishCollections: boolean;
  canDeleteCollections: boolean;
  canCreateCollections: boolean;
  canViewAnyPublishedItems: boolean;
  canViewAnyPublishedCollections: boolean;
  canViewAnyUnpublishedCollections: boolean;
  canViewQuickLanes: boolean;
  canCreateQuickLane: boolean;
  canAutoplayCollection: boolean;
  canCreateAssignments: boolean;
  canCreateBundles: boolean;
}>;

type CollectionInfo = {
  collection: Avo.Collection.Collection | null;
  permissions: CollectionDetailPermissions;
  showLoginPopup: boolean;
  showNoAccessPopup: boolean;
};

type CollectionDetailProps = {
  id?: string; // Item id when component needs to be used inside another component and the id cannot come from the url (match.params.id)
  enabledMetaData?: SearchFilter[];
};

export const CollectionDetail: FC<CollectionDetailProps> = ({
  id,
  enabledMetaData = ALL_SEARCH_FILTERS,
}) => {
  const navigateFunc = useNavigate();

  const { id: collectionIdFromUrl } = useParams<{ id: string }>();

  const commonUser = useAtomValue(commonUserAtom);
  // State
  const [collectionId, setCollectionId] = useState(id || collectionIdFromUrl);

  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo | null>(
    null,
  );
  const permissions = collectionInfo?.permissions;
  const showLoginPopup = collectionInfo?.showLoginPopup;
  const showNoAccessPopup = collectionInfo?.showNoAccessPopup;
  const collection = collectionInfo?.collection;
  const isContributor = !!(collection?.contributors || []).find(
    (contributor) =>
      !!contributor.profile_id &&
      contributor.profile_id === commonUser?.profileId,
  );
  const isEditContributor = !!(collection?.contributors || []).find(
    (contributor) =>
      !!contributor.profile_id &&
      contributor.profile_id === commonUser?.profileId &&
      contributor.rights === 'CONTRIBUTOR',
  );
  const isPublic = !!collection && collection.is_public;
  const isOwner =
    !!collection?.owner_profile_id &&
    collection?.owner_profile_id === commonUser?.profileId;
  const isCollectionAdmin = PermissionService.hasPerm(
    commonUser,
    PermissionName.EDIT_ANY_COLLECTIONS,
  );
  const shouldDeleteSelfFromCollection =
    isContributor && !permissions?.canDeleteCollections;

  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleteContributorModalOpen, setIsDeleteContributorModalOpen] =
    useState<boolean>(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useQueryParam(
    QUERY_PARAM_SHOW_PUBLISH_MODAL,
    BooleanParam,
  );
  const [isAddToBundleModalOpen, setIsAddToBundleModalOpen] =
    useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isAutoplayCollectionModalOpen, setIsAutoplayCollectionModalOpen] =
    useState<boolean>(false);
  const [isQuickLaneModalOpen, setIsQuickLaneModalOpen] = useState(false);
  const [isCreateAssignmentDropdownOpen, setIsCreateAssignmentDropdownOpen] =
    useState<boolean>(false);
  const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] =
    useState<boolean>(false);
  const [isImportToAssignmentModalOpen, setIsImportToAssignmentModalOpen] =
    useState<boolean>(false);
  const [
    isConfirmImportToAssignmentWithResponsesModalOpen,
    setIsConfirmImportToAssignmentWithResponsesModalOpen,
  ] = useState<boolean>(false);

  const [isFirstRender, setIsFirstRender] = useState<boolean>(false);
  const [relatedCollections, setRelatedCollections] = useState<
    Avo.Search.ResultItem[] | null
  >(null);
  const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({
    state: 'loading',
  });
  const [bookmarkViewPlayCounts, setBookmarkViewPlayCounts] =
    useState<BookmarkViewPlayCounts>(DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS);

  const [assignmentId, setAssignmentId] = useState<string>();
  const [importWithDescription, setImportWithDescription] =
    useState<boolean>(false);

  const [query, setQuery] = useQueryParams({ inviteToken: StringParam });
  const { inviteToken } = query;

  const { data: editStatuses } = useGetCollectionsEditStatuses(
    [collectionId as string],
    {
      enabled: !!collectionId && !!permissions?.canEditCollections,
      refetchInterval: EDIT_STATUS_REFETCH_TIME,
      refetchIntervalInBackground: true,
    },
  );

  const {
    data: bundlesContainingCollection,
    refetch: refetchBundlesContainingCollection,
  } = useGetCollectionsOrBundlesContainingFragment(
    collectionId as string,
    BundleSortProp.title,
    Avo.Search.OrderDirection.ASC,
    {
      enabled:
        !!collectionId && !!collectionInfo?.collection && !showLoginPopup,
    },
  );

  const isBeingEdited =
    !!collectionId &&
    !!editStatuses &&
    !!editStatuses[collectionId] &&
    editStatuses[collectionId]?.editingUserId !== commonUser?.profileId;

  const getRelatedCollections = useCallback(async () => {
    try {
      if (!collectionId) {
        return;
      }
      if (isUuid(collectionId)) {
        setRelatedCollections(
          await getRelatedItems(
            collectionId,
            ObjectTypes.collections,
            ObjectTypesAll.all,
            4,
          ),
        );
      }
    } catch (err) {
      console.error('Failed to get related items', err, {
        collectionId,
        index: 'collections',
        limit: 4,
      });

      ToastService.danger(
        tHtml(
          'collection/views/collection-detail___het-ophalen-van-de-gerelateerde-collecties-is-mislukt',
        ),
      );
    }
  }, [collectionId]);

  const fetchContributors = useCallback(async () => {
    if (!collectionId || !collectionInfo || showLoginPopup) {
      return;
    }
    const response =
      await CollectionService.fetchContributorsByCollectionId(collectionId);

    setCollectionInfo({
      ...collectionInfo,
      collection: {
        ...collectionInfo.collection,
        contributors: response as Avo.Collection.Contributor[],
      },
    } as CollectionInfo);
  }, [collectionId, collectionInfo, showLoginPopup]);

  const triggerEvents = useCallback(async () => {
    // Do not trigger events when a search engine loads this page
    if (collectionId && commonUser && !showLoginPopup) {
      BookmarksViewsPlaysService.action(
        'view',
        'collection',
        collectionId,
        commonUser,
      ).then(noop);
      trackEvents(
        {
          object: collectionId,
          object_type: 'collection',
          action: 'view',
          resource: {
            is_public: collection?.is_public || false,
          },
        },
        commonUser,
      );
      try {
        setBookmarkViewPlayCounts(
          await BookmarksViewsPlaysService.getCollectionCounts(
            collectionId,
            commonUser || null,
          ),
        );
      } catch (err) {
        console.error(
          new CustomError('Failed to get getCollectionCounts', err, {
            uuid: collectionId,
          }),
        );
        ToastService.danger(
          tHtml(
            'collection/views/collection-detail___het-ophalen-van-het-aantal-keer-bekeken-gebookmarked-is-mislukt',
          ),
        );
      }
    }
  }, [collectionId, commonUser, showLoginPopup]);

  useEffect(() => {
    setCollectionId(id || collectionIdFromUrl);
  }, [id, collectionIdFromUrl]);

  useEffect(() => {
    if (!isFirstRender && collection) {
      setIsFirstRender(true);
    }
  }, [collection, isFirstRender, setIsFirstRender]);

  const getPermissions = async (
    collectionId: string,
    commonUser: Avo.User.CommonUser | undefined,
  ): Promise<CollectionDetailPermissions> => {
    if (!commonUser) {
      return {};
    }

    return await PermissionService.checkPermissions(
      {
        canEditCollections: [
          { name: PermissionName.EDIT_OWN_COLLECTIONS, obj: collectionId },
          { name: PermissionName.EDIT_ANY_COLLECTIONS },
        ],
        canPublishCollections: [
          { name: PermissionName.PUBLISH_OWN_COLLECTIONS, obj: collectionId },
          { name: PermissionName.PUBLISH_ANY_COLLECTIONS },
        ],
        canDeleteCollections: [
          { name: PermissionName.DELETE_OWN_COLLECTIONS, obj: collectionId },
          { name: PermissionName.DELETE_ANY_COLLECTIONS },
        ],
        canCreateCollections: [{ name: PermissionName.CREATE_COLLECTIONS }],
        canViewAnyPublishedItems: [
          { name: PermissionName.VIEW_ANY_PUBLISHED_ITEMS },
        ],
        canViewAnyPublishedCollections: [
          { name: PermissionName.VIEW_ANY_PUBLISHED_COLLECTIONS },
        ],
        canViewAnyUnpublishedCollections: [
          { name: PermissionName.VIEW_ANY_UNPUBLISHED_COLLECTIONS },
        ],
        canCreateQuickLane: [{ name: PermissionName.CREATE_QUICK_LANE }],
        canViewQuickLanes: [{ name: PermissionName.VIEW_QUICK_LANE_DETAIL }],
        canAutoplayCollection: [{ name: PermissionName.AUTOPLAY_COLLECTION }],
        canCreateAssignments: [{ name: PermissionName.CREATE_ASSIGNMENTS }],
        canCreateBundles: [{ name: PermissionName.CREATE_BUNDLES }],
      },
      commonUser,
    );
  };

  const checkPermissionsAndGetCollection = useCallback(async () => {
    try {
      if (!collectionId) {
        return;
      }
      setLoadingInfo({
        state: 'loading',
      });
      let uuid: string | null;
      if (isUuid(collectionId)) {
        uuid = collectionId;
      } else {
        uuid = await CollectionService.fetchUuidByAvo1Id(collectionId);

        if (!uuid) {
          setLoadingInfo({
            state: 'error',
            message: tHtml(
              'collection/views/collection-detail___de-collectie-kon-niet-worden-gevonden',
            ),
            icon: IconName.alertTriangle,
          });

          return;
        }

        // Redirect to new url that uses the collection uuid instead of the collection avo1 id
        // and continue loading the collection
        defaultGoToDetailLink(navigateFunc)(
          uuid,
          Avo.Core.ContentType.COLLECTIE,
        );
        return;
      }

      const permissionObj = await getPermissions(collectionId, commonUser);

      const showNoAccessPopup = false;

      if (!commonUser) {
        // Not logged in
        // If thr collection is public, we should still load the metadata
        let collectionObj: Avo.Collection.Collection | null = null;
        try {
          collectionObj =
            await CollectionService.fetchCollectionOrBundleByIdOrInviteToken(
              uuid,
              CollectionOrBundle.COLLECTION,
              undefined,
            );
        } catch (err) {
          // Ignore errors when fetching collections when user is not logged in
        }
        setCollectionInfo({
          showNoAccessPopup: false,
          showLoginPopup: true,
          permissions: permissionObj,
          collection: collectionObj,
        });
        setLoadingInfo({
          state: 'loaded',
        });
        return;
      }

      if (
        !permissionObj.canViewAnyUnpublishedCollections &&
        !permissionObj.canViewAnyPublishedCollections &&
        (!permissionObj.canViewQuickLanes ||
          (permissionObj.canViewQuickLanes &&
            !window.location.href.includes(ROUTE_PARTS.quickLane)))
      ) {
        setCollectionInfo({
          showNoAccessPopup: true,
          showLoginPopup: false,
          permissions: permissionObj,
          collection: null,
        });
        setLoadingInfo({
          state: 'loaded',
        });
        return;
      }

      const collectionObj = uuid
        ? await CollectionService.fetchCollectionOrBundleByIdOrInviteToken(
            uuid as string,
            CollectionOrBundle.COLLECTION,
            inviteToken || undefined,
          )
        : null;

      if (!collectionObj) {
        setLoadingInfo({
          state: 'error',
          message: tHtml(
            'collection/views/collection-detail___de-collectie-kon-niet-worden-gevonden',
          ),
          icon: IconName.search,
        });
        return;
      }

      setCollectionInfo({
        showNoAccessPopup: showNoAccessPopup,
        showLoginPopup: false,
        permissions: permissionObj,
        collection: collectionObj || null,
      });
    } catch (err) {
      if (
        (err as CustomError)?.innerException?.statusCode === 404 &&
        !commonUser
      ) {
        // If not logged in and the collection is not found => the collection might be private and the user might need to login to see it
        setCollectionInfo({
          showNoAccessPopup: false,
          showLoginPopup: true,
          permissions: {},
          collection: null,
        });
        setLoadingInfo({
          state: 'loaded',
        });
        return;
      }

      if ((err as CustomError)?.innerException?.statusCode === 403) {
        // If forbidden to access, show no acces error
        setCollectionInfo({
          showNoAccessPopup: false,
          showLoginPopup: false,
          permissions: {},
          collection: null,
        });
        setLoadingInfo({
          state: 'forbidden',
        });
        return;
      }

      console.error(
        new CustomError(
          'Failed to check permissions or get collection from the database',
          err,
          {
            collectionId,
          },
        ),
      );
      setLoadingInfo({
        state: 'error',
        message: tHtml(
          'collection/views/collection-detail___er-ging-iets-mis-tijdens-het-ophalen-van-de-collectie',
        ),
        icon: IconName.alertTriangle,
      });
    }
    // Ensure callback only runs once even if user object is set twice // TODO investigate why user object is set twice
  }, [
    collectionId,
    setCollectionInfo,
    commonUser,
    navigateFunc,
    defaultGoToDetailLink,
  ]);

  useEffect(() => {
    checkPermissionsAndGetCollection();
  }, [checkPermissionsAndGetCollection]);

  useEffect(() => {
    if (collectionInfo?.collection && !showLoginPopup) {
      getRelatedCollections();
      triggerEvents();
    }
  }, [collectionInfo, getRelatedCollections]);

  useEffect(() => {
    if (!isEmpty(permissions) && collection && !isNil(showLoginPopup)) {
      setLoadingInfo({
        state: 'loaded',
      });
    }
  }, [permissions, collection, setLoadingInfo, showLoginPopup]);

  // Listeners
  const onEditCollection = () => {
    navigateFunc(
      `${generateContentLinkString(Avo.Core.ContentType.COLLECTIE, `${collectionId}`)}/${
        ROUTE_PARTS.edit
      }/${CollectionCreateUpdateTab.CONTENT}`,
    );
  };

  const executeAction = async (item: ReactText) => {
    setIsOptionsMenuOpen(false);
    setIsCreateAssignmentDropdownOpen(false);
    switch (item) {
      case CollectionMenuAction.duplicate:
        try {
          if (!collection) {
            ToastService.danger(
              tHtml(
                'collection/views/collection-detail___de-collectie-kan-niet-gekopieerd-worden-omdat-deze-nog-niet-is-opgehaald-van-de-database',
              ),
            );
            return;
          }
          if (!commonUser) {
            ToastService.danger(
              tHtml(
                'collection/views/collection-detail___er-was-een-probleem-met-het-controleren-van-de-ingelogde-gebruiker-log-opnieuw-in-en-probeer-opnieuw',
              ),
            );
            return;
          }
          const duplicateCollection =
            await CollectionService.duplicateCollection(
              collection,
              commonUser,
              COLLECTION_COPY,
              COLLECTION_COPY_REGEX,
            );

          trackEvents(
            {
              object: collection.id,
              object_type: 'collection',
              action: 'copy',
            },
            commonUser,
          );

          defaultGoToDetailLink(navigateFunc)(
            duplicateCollection.id,
            Avo.Core.ContentType.COLLECTIE,
          );
          setCollectionId(duplicateCollection.id);
          ToastService.success(
            tHtml(
              'collection/views/collection-detail___de-collectie-is-gekopieerd-u-kijkt-nu-naar-de-kopie',
            ),
          );
        } catch (err) {
          console.error('Failed to copy collection', err, {
            originalCollection: collection,
          });
          ToastService.danger(
            tHtml(
              'collection/views/collection-detail___het-kopieren-van-de-collectie-is-mislukt',
            ),
          );
        }
        break;

      case CollectionMenuAction.addToBundle:
        setIsAddToBundleModalOpen(true);
        break;

      case CollectionMenuAction.deleteCollection:
        setIsDeleteModalOpen(true);
        break;

      case CollectionMenuAction.deleteContributor:
        setIsDeleteContributorModalOpen(true);
        break;

      case CollectionMenuAction.share:
        setIsShareModalOpen(true);
        break;

      case CollectionMenuAction.openPublishCollectionModal:
        setIsPublishModalOpen(!isPublishModalOpen || undefined, 'replaceIn');
        break;

      case CollectionMenuAction.toggleBookmark:
        await toggleBookmark();
        break;

      case CollectionMenuAction.createAssignment:
        setIsCreateAssignmentModalOpen(true);
        break;

      case CollectionMenuAction.importToAssignment:
        setIsImportToAssignmentModalOpen(true);
        break;

      case CollectionMenuAction.editCollection:
        onEditCollection();
        break;
      case CollectionMenuAction.openAutoplayCollectionModal:
        if (!collectionId) {
          return;
        }
        BookmarksViewsPlaysService.action(
          'play',
          'collection',
          collectionId,
          commonUser,
        ).then(noop);
        trackEvents(
          {
            object: collectionId,
            object_type: 'collection',
            action: 'play',
            resource: {
              is_public: collection?.is_public || false,
            },
          },
          commonUser,
        );
        setIsAutoplayCollectionModalOpen(!isAutoplayCollectionModalOpen);
        break;

      case CollectionMenuAction.openQuickLane:
        setIsQuickLaneModalOpen(true);
        break;

      default:
        console.warn(
          `An unhandled action "${item}" was executed without a binding.`,
        );
        return null;
    }
  };

  const toggleBookmark = async () => {
    try {
      if (!commonUser) {
        ToastService.danger(
          tHtml(
            'collection/views/collection-detail___er-was-een-probleem-met-het-controleren-van-de-ingelogde-gebruiker-log-opnieuw-in-en-probeer-opnieuw',
          ),
        );
        return;
      }
      if (!collectionId) {
        return;
      }
      await BookmarksViewsPlaysService.toggleBookmark(
        collectionId,
        commonUser,
        'collection',
        bookmarkViewPlayCounts.isBookmarked,
      );
      setBookmarkViewPlayCounts({
        ...bookmarkViewPlayCounts,
        isBookmarked: !bookmarkViewPlayCounts.isBookmarked,
      });
      ToastService.success(
        bookmarkViewPlayCounts.isBookmarked
          ? tHtml(
              'collection/views/collection-detail___de-bladwijzer-is-verwijderd',
            )
          : tHtml(
              'collection/views/collection-detail___de-bladwijzer-is-aangemaakt',
            ),
      );
    } catch (err) {
      console.error(
        new CustomError('Failed to toggle bookmark', err, {
          collectionId,
          commonUser,
          type: 'collection',
          isBookmarked: bookmarkViewPlayCounts.isBookmarked,
        }),
      );
      ToastService.danger(
        bookmarkViewPlayCounts.isBookmarked
          ? tHtml(
              'collection/views/collection-detail___het-verwijderen-van-de-bladwijzer-is-mislukt',
            )
          : tHtml(
              'collection/views/collection-detail___het-aanmaken-van-de-bladwijzer-is-mislukt',
            ),
      );
    }
  };

  const handleDeleteCollection = async (): Promise<void> => {
    if (!collectionId) {
      return;
    }
    await deleteCollection(
      collectionId,
      commonUser,
      true,
      async () =>
        await CollectionService.deleteCollectionOrBundle(collectionId),
      () => navigateFunc(APP_PATH.WORKSPACE.route),
    );
  };

  const handleDeleteSelfFromCollection = async (): Promise<void> => {
    await deleteSelfFromCollection(collectionId, commonUser, () =>
      navigateFunc(APP_PATH.WORKSPACE.route),
    );
  };

  const onCreateAssignment = async (
    withDescription: boolean,
  ): Promise<void> => {
    if (commonUser && collection) {
      const assignmentId =
        await AssignmentService.createAssignmentFromCollection(
          commonUser,
          collection,
          withDescription,
        );

      navigateFunc(
        buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, { id: assignmentId }),
      );
    }
  };

  const onImportToAssignment = async (
    importToAssignmentId: string,
    withDescription: boolean,
  ): Promise<void> => {
    if (!commonUser?.profileId) {
      console.error(
        'Failed to import collection to assignment: no user profile id',
      );
      return;
    }
    setAssignmentId(importToAssignmentId);

    setImportWithDescription(withDescription);

    // check if assignment has responses. If so: show additional confirmation modal
    const responses =
      await AssignmentService.getAssignmentResponses(importToAssignmentId);
    if (responses.length > 0) {
      setIsConfirmImportToAssignmentWithResponsesModalOpen(true);
    } else {
      await doImportToAssignment(importToAssignmentId, withDescription);
    }
  };

  const onConfirmImportAssignment = () => {
    if (!assignmentId) {
      return;
    }
    return doImportToAssignment(assignmentId, importWithDescription);
  };

  const doImportToAssignment = async (
    importToAssignmentId: string,
    withDescription: boolean,
  ): Promise<void> => {
    setIsConfirmImportToAssignmentWithResponsesModalOpen(false);
    if (collection && importToAssignmentId) {
      await AssignmentService.importCollectionToAssignment(
        collection,
        importToAssignmentId,
        withDescription,
      );

      // Track import collection into assignment event
      trackEvents(
        {
          object: importToAssignmentId,
          object_type: 'assignment',
          action: 'add',
          resource: {
            type: 'collection',
            id: collection.id,
          },
        },
        commonUser,
      );

      ToastService.success(
        tHtml(
          'collection/views/collection-detail___de-collectie-is-geimporteerd-naar-de-opdracht',
        ),
      );
    } else {
      ToastService.danger(
        tHtml(
          'collection/views/collection-detail___de-collectie-kon-niet-worden-geimporteerd-naar-de-opdracht',
        ),
      );
    }
  };

  const onAcceptShareCollection = async () => {
    if (!collection?.id || !inviteToken) {
      throw new CustomError(
        'There was no collection id or inviteToken present',
      );
    }

    try {
      const res = await CollectionService.acceptSharedCollection(
        collection.id as string,
        inviteToken,
      );

      setQuery({
        ...query,
        inviteToken: undefined,
      });
      await checkPermissionsAndGetCollection();

      ToastService.success(
        res.rights === 'CONTRIBUTOR'
          ? tText(
              'collection/views/collection-detail___je-kan-nu-deze-collectie-bewerken',
            )
          : tText(
              'collection/views/collection-detail___je-kan-nu-deze-collectie-bekijken',
            ),
      );
    } catch (err) {
      ToastService.danger(
        tText(
          'collection/views/collection-detail___er-liep-iets-fout-bij-het-accepteren-van-de-uitnodiging',
        ),
      );
    }
  };

  const onDeclineShareCollection = async () => {
    if (!collection?.id || !inviteToken) {
      throw new CustomError(
        'There was no collection id or inviteToken present',
      );
    }

    try {
      await CollectionService.declineSharedCollection(
        collection.id as string,
        inviteToken,
      );

      navigate(navigateFunc, APP_PATH.WORKSPACE_COLLECTIONS.route);

      ToastService.success(
        tText(
          'collection/views/collection-detail___de-uitnodiging-werd-afgewezen',
        ),
      );
    } catch (err) {
      ToastService.danger(
        tText(
          'collection/views/collection-detail___er-liep-iets-fout-bij-het-afwijzen-van-de-uitnodiging',
        ),
      );
    }
  };

  // Render functions

  const renderCollectionDropdownOptions = () => {
    if (!collectionId) {
      return null;
    }
    const COLLECTION_DROPDOWN_ITEMS = [
      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.addToBundle,
        tText('collection/views/collection-detail___voeg-toe-aan-bundel'),
        IconName.plus,
        !!permissions?.canCreateBundles &&
          (isOwner || isEditContributor || isCollectionAdmin || isPublic),
      ),
      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.openQuickLane,
        tText('collection/views/collection-detail___delen-met-leerlingen'),
        IconName.link2,
        !!permissions?.canCreateQuickLane &&
          (isOwner || isEditContributor || isCollectionAdmin || isPublic),
      ),
      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.duplicate,
        tText('collection/views/collection-detail___dupliceer'),
        IconName.copy,
        !!permissions?.canCreateCollections,
      ),

      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.deleteCollection,
        tText('collection/views/collection-detail___verwijderen'),
        IconName.trash,
        !!permissions?.canDeleteCollections && !shouldDeleteSelfFromCollection,
      ),

      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.deleteContributor,
        tText(
          'collection/views/collection-detail___verwijder-mij-van-deze-collectie',
        ),
        IconName.trash,
        shouldDeleteSelfFromCollection,
      ),
    ];

    return (
      <MoreOptionsDropdownWrapper
        isOpen={isOptionsMenuOpen}
        onOpen={() => setIsOptionsMenuOpen(true)}
        onClose={() => setIsOptionsMenuOpen(false)}
        label={getMoreOptionsLabel()}
        menuItems={COLLECTION_DROPDOWN_ITEMS}
        onOptionClicked={executeAction}
      />
    );
  };

  const renderHeaderButtons = () => {
    return (
      <ButtonToolbar>
        {(permissions?.canAutoplayCollection || inviteToken) && (
          <Button
            type="secondary"
            label={tText(
              'collection/views/collection-detail___speel-de-collectie-af',
            )}
            title={tText(
              'collection/views/collection-detail___speel-de-collectie-af',
            )}
            ariaLabel={tText(
              'collection/views/collection-detail___speelt-de-collectie-af',
            )}
            icon={IconName.play}
            onClick={() =>
              executeAction(CollectionMenuAction.openAutoplayCollectionModal)
            }
          />
        )}
        {permissions?.canCreateAssignments && !inviteToken && (
          <Dropdown
            label={tText(
              'collection/views/collection-detail___importeer-naar-opdracht',
            )}
            isOpen={isCreateAssignmentDropdownOpen}
            onClose={() => setIsCreateAssignmentDropdownOpen(false)}
            onOpen={() => setIsCreateAssignmentDropdownOpen(true)}
          >
            <MenuContent
              menuItems={[
                {
                  label: tText(
                    'collection/views/collection-detail___nieuwe-opdracht',
                  ),
                  id: CollectionMenuAction.createAssignment,
                },
                {
                  label: tText(
                    'collection/views/collection-detail___bestaande-opdracht',
                  ),
                  id: CollectionMenuAction.importToAssignment,
                },
              ]}
              onClick={executeAction}
            />
          </Dropdown>
        )}
        {(isOwner || isEditContributor || permissions?.canEditCollections) &&
          !inviteToken &&
          !!collectionId && (
            <ShareDropdown
              contributors={transformContributorsToSimpleContributors(
                {
                  ...collection?.profile?.user,
                  profile: collection?.profile,
                } as Avo.User.User,
                (collection?.contributors ||
                  []) as Avo.Collection.Contributor[],
              )}
              onDeleteContributor={(info) =>
                onDeleteContributor(info, collectionId, fetchContributors)
              }
              onEditContributorRights={(user, newRights) =>
                onEditContributor(
                  user,
                  newRights,
                  collectionId,
                  fetchContributors,
                  checkPermissionsAndGetCollection,
                )
              }
              onAddContributor={(info) =>
                onAddContributor(info, collectionId, fetchContributors)
              }
              withPupils={false}
              buttonProps={{
                type: 'secondary',
                title: tText(
                  'assignment/components/share-dropdown___deel-de-collectie-met-collegas',
                ),
                ariaLabel: tText(
                  'assignment/components/share-dropdown___deel-de-collectie-met-collegas',
                ),
              }}
              availableRights={{
                [ContributorInfoRight.CONTRIBUTOR]:
                  PermissionName.SHARE_COLLECTION_WITH_CONTRIBUTOR,
                [ContributorInfoRight.VIEWER]:
                  PermissionName.SHARE_COLLECTION_WITH_VIEWER,
              }}
              isAdmin={
                commonUser?.permissions?.includes(
                  PermissionName.EDIT_ANY_COLLECTIONS,
                ) || false
              }
            />
          )}
        {permissions?.canPublishCollections && !inviteToken && (
          <Button
            type="secondary"
            title={
              isPublic
                ? tText(
                    'collection/views/collection-detail___maak-deze-collectie-prive',
                  )
                : tText(
                    'collection/views/collection-detail___maak-deze-collectie-openbaar',
                  )
            }
            ariaLabel={
              isPublic
                ? tText(
                    'collection/views/collection-detail___maak-deze-collectie-prive',
                  )
                : tText(
                    'collection/views/collection-detail___maak-deze-collectie-openbaar',
                  )
            }
            icon={isPublic ? IconName.unlock3 : IconName.lock}
            onClick={() =>
              executeAction(CollectionMenuAction.openPublishCollectionModal)
            }
          />
        )}
        {!isOwner &&
          !isContributor &&
          !inviteToken &&
          defaultRenderBookmarkButton({
            active: bookmarkViewPlayCounts.isBookmarked,
            ariaLabel: tText('collection/views/collection-detail___bladwijzer'),
            title: tText('collection/views/collection-detail___bladwijzer'),
            onClick: () => executeAction(CollectionMenuAction.toggleBookmark),
            type: 'secondary',
          })}
        {!inviteToken && renderCollectionDropdownOptions()}
        {permissions?.canEditCollections && !inviteToken && (
          <Spacer margin="left-small">
            <EditButton
              type="primary"
              label={tText('collection/views/collection-detail___bewerken')}
              title={tText(
                'collection/views/collection-detail___pas-deze-collectie-aan',
              )}
              onClick={() => executeAction(CollectionMenuAction.editCollection)}
              disabled={isBeingEdited}
              toolTipContent={
                isBeingEdited &&
                tHtml(
                  'collection/views/collection-detail___deze-collectie-wordt-momenteel-bewerkt-door-een-andere-gebruiker-het-is-niet-mogelijk-met-met-meer-dan-1-gebruiker-simultaan-te-bewerken',
                )
              }
            />
          </Spacer>
        )}
      </ButtonToolbar>
    );
  };

  const renderHeaderButtonsMobile = () => {
    if (!collectionId) {
      return;
    }
    const COLLECTION_DROPDOWN_ITEMS_MOBILE = [
      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.editCollection,
        tText('collection/views/collection-detail___bewerken'),
        IconName.edit,
        permissions?.canEditCollections || false,
      ),
      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.createAssignment,
        tText(
          'collection/views/collection-detail___importeer-naar-nieuwe-opdracht',
        ),
        IconName.clipboard,
        permissions?.canCreateAssignments || false,
      ),
      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.importToAssignment,
        tText(
          'collection/views/collection-detail___importeer-naar-bestaande-opdracht',
        ),
        IconName.clipboard,
        permissions?.canCreateAssignments || false,
      ),
      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.openPublishCollectionModal,
        isPublic
          ? tText('collection/views/collection-detail___maak-prive')
          : tText('collection/views/collection-detail___publiceer'),
        isPublic ? IconName.unlock3 : IconName.lock,
        permissions?.canPublishCollections || false,
      ),
      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.share,
        tText('collection/views/collection-detail___deel-deze-collectie'),
        IconName.userGroup,
        true,
      ),
      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.toggleBookmark,
        bookmarkViewPlayCounts.isBookmarked
          ? tText('collection/views/collection-detail___verwijder-bladwijzer')
          : tText('collection/views/collection-detail___maak-bladwijzer'),
        bookmarkViewPlayCounts.isBookmarked
          ? IconName.bookmarkFilled
          : IconName.bookmark,
        !isOwner && !isContributor,
      ),
      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.openShareThroughEmail,
        tText('collection/views/collection-detail___deel'),
        IconName.share2,
        !!collection && collection.is_public,
      ),
      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.addToBundle,
        tText('collection/views/collection-detail___voeg-toe-aan-bundel'),
        IconName.plus,
        !!permissions?.canCreateBundles &&
          (isOwner || isEditContributor || isCollectionAdmin),
      ),
      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.openQuickLane,
        tText('collection/views/collection-detail___delen-met-leerlingen'),
        IconName.link2,
        !!permissions?.canCreateQuickLane &&
          (isOwner || isEditContributor || isCollectionAdmin),
      ),
      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.openAutoplayCollectionModal,
        tText('collection/views/collection-detail___speel-de-collectie-af'),
        IconName.play,
        permissions?.canAutoplayCollection || false,
      ),
      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.duplicate,
        tText('collection/views/collection-detail___dupliceer'),
        IconName.copy,
        permissions?.canCreateCollections || false,
      ),
      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.deleteCollection,
        tText('collection/views/collection-detail___verwijderen'),
        undefined,
        permissions?.canDeleteCollections || false,
      ),
      ...createDropdownMenuItem(
        collectionId,
        CollectionMenuAction.deleteContributor,
        tText(
          'collection/views/collection-detail___verwijder-mij-van-deze-collectie',
        ),
        undefined,
        !permissions?.canDeleteCollections && isContributor,
      ),
    ];
    return (
      <ButtonToolbar>
        <MoreOptionsDropdown
          isOpen={isOptionsMenuOpen}
          onOpen={() => setIsOptionsMenuOpen(true)}
          onClose={() => setIsOptionsMenuOpen(false)}
          label={getMoreOptionsLabel()}
          menuItems={COLLECTION_DROPDOWN_ITEMS_MOBILE}
          onOptionClicked={executeAction}
        />
      </ButtonToolbar>
    );
  };

  const renderCollectionBody = () => {
    const { collection_fragments } = collection as Avo.Collection.Collection;
    const hasCopies = (collection?.relations || []).length > 0;
    const hasParentBundles = !!bundlesContainingCollection?.length;

    return (
      <>
        <Container mode="horizontal">
          {!!collection && !!commonUser && (
            <FragmentList
              collectionFragments={collection_fragments}
              showDescription
              showMetadata
              linkToItems={true}
              canPlay={
                !isAddToBundleModalOpen &&
                !isDeleteModalOpen &&
                !isPublishModalOpen &&
                !isAutoplayCollectionModalOpen
              }
              collection={collection}
            />
          )}
        </Container>
        <Container mode="vertical">
          <Container mode="horizontal">
            <h3 className="c-h3">
              {tText(
                'collection/views/collection-detail___info-over-deze-collectie',
              )}
            </h3>
            <Grid>
              {!!collection && (
                <CommonMetadata
                  subject={collection}
                  enabledMetaData={enabledMetaData}
                  renderSearchLink={defaultRenderSearchLink}
                />
              )}
              {(hasCopies || hasParentBundles) && (
                <Column size="12">
                  <Spacer margin="top-large">
                    <p className="u-text-bold">
                      {tHtml('collection/views/collection-detail___ordering')}
                    </p>
                    {hasCopies && (
                      <p className="c-body-1">
                        {`${tText(
                          'collection/views/collection-detail___deze-collectie-is-een-kopie-van',
                        )} `}
                        {((collection?.relations ?? []) as Relation[]).map(
                          (relation: Relation) => (
                            <Link
                              key={`copy-of-link-${relation.object_meta.id}`}
                              to={buildLink(APP_PATH.COLLECTION_DETAIL.route, {
                                id: relation.object_meta.id,
                              })}
                            >
                              {relation.object_meta.title}
                            </Link>
                          ),
                        )}
                      </p>
                    )}

                    {hasParentBundles && (
                      <p className="c-body-1">
                        {bundlesContainingCollection.length === 1
                          ? tText(
                              'collection/views/collection-detail___deze-collectie-zit-in-bundel',
                            )
                          : tText(
                              'collection/views/collection-detail___deze-collectie-zit-in-bundels',
                            )}{' '}
                        {bundlesContainingCollection?.map((bundle, index) => (
                          <span key={'parent-bundle--' + bundle.id}>
                            {index !== 0 && ', '}
                            <Link
                              to={buildLink(APP_PATH.BUNDLE_DETAIL.route, {
                                id: bundle.id,
                              })}
                            >
                              {bundle.title}
                            </Link>
                          </span>
                        )) || null}
                      </p>
                    )}
                  </Spacer>
                </Column>
              )}
            </Grid>
            {!!relatedCollections &&
              renderRelatedItems(relatedCollections, defaultRenderDetailLink)}
          </Container>
        </Container>
      </>
    );
  };

  const renderModals = () => {
    const { collection_fragments } = collection as Avo.Collection.Collection;

    return (
      <>
        {!!collection && !!commonUser && (
          <PublishCollectionModal
            collection={collection}
            parentBundles={bundlesContainingCollection}
            isOpen={!!isPublishModalOpen}
            onClose={(newCollection: Avo.Collection.Collection | undefined) => {
              setIsPublishModalOpen(undefined, 'replaceIn');

              if (newCollection) {
                setCollectionInfo((oldCollectionInfo) => ({
                  showLoginPopup: oldCollectionInfo?.showLoginPopup || false,
                  showNoAccessPopup:
                    oldCollectionInfo?.showNoAccessPopup || false,
                  permissions: oldCollectionInfo?.permissions || {},
                  collection: newCollection || null,
                }));
              }
            }}
          />
        )}
        {collectionId !== undefined && !!commonUser && (
          <AddToBundleModal
            fragmentId={collectionId as string}
            fragmentInfo={collection as Avo.Collection.Collection}
            fragmentType={Avo.Core.BlockItemType.COLLECTION}
            isOpen={isAddToBundleModalOpen}
            onClose={async () => {
              setIsAddToBundleModalOpen(false);
              await refetchBundlesContainingCollection();
            }}
          />
        )}
        <DeleteCollectionModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          deleteCallback={handleDeleteCollection}
          contributorCount={collection?.contributors?.length || 0}
          isCollection={true}
        />
        <DeleteMyselfFromCollectionContributorsConfirmModal
          isOpen={isDeleteContributorModalOpen}
          onClose={() => setIsDeleteContributorModalOpen(false)}
          deleteCallback={() => handleDeleteSelfFromCollection()}
        />
        {!!collection_fragments &&
          collection &&
          isAutoplayCollectionModalOpen && (
            <AutoplayCollectionModal
              isOpen={isAutoplayCollectionModalOpen}
              onClose={() => setIsAutoplayCollectionModalOpen(false)}
              collectionFragments={collection_fragments}
            />
          )}
        {!!collection && (
          <QuickLaneModal
            modalTitle={tHtml(
              'collection/views/collection-detail___delen-met-leerlingen',
            )}
            isOpen={isQuickLaneModalOpen}
            content={collection}
            content_label={QuickLaneTypeEnum.COLLECTION}
            onClose={() => {
              setIsQuickLaneModalOpen(false);
            }}
            onUpdate={(newCollection) => {
              if (
                (collection as Avo.Collection.Collection).collection_fragments
              ) {
                setCollectionInfo((oldCollectionInfo) => ({
                  showLoginPopup: oldCollectionInfo?.showLoginPopup || false,
                  showNoAccessPopup:
                    oldCollectionInfo?.showNoAccessPopup || false,
                  permissions: oldCollectionInfo?.permissions || {},
                  collection:
                    (newCollection as Avo.Collection.Collection) || null,
                }));
              }
            }}
          />
        )}
        {!!collection && !!commonUser && (
          <>
            <CreateAssignmentModal
              isOpen={isCreateAssignmentModalOpen}
              onClose={() => setIsCreateAssignmentModalOpen(false)}
              createAssignmentCallback={onCreateAssignment}
              translations={{
                title: tHtml(
                  'assignment/modals/create-assignment-modal___importeer-naar-nieuwe-opdracht',
                ),
                primaryButton: tText(
                  'assignment/modals/create-assignment-modal___importeer',
                ),
                secondaryButton: tText(
                  'assignment/modals/create-assignment-modal___annuleer',
                ),
              }}
            />
            <ImportToAssignmentModal
              isOpen={isImportToAssignmentModalOpen}
              onClose={() => setIsImportToAssignmentModalOpen(false)}
              importToAssignmentCallback={onImportToAssignment}
              showToggle={true}
              translations={{
                title: tHtml(
                  'assignment/modals/import-to-assignment-modal___importeer-naar-bestaande-opdracht',
                ),
                primaryButton: tText(
                  'assignment/modals/import-to-assignment-modal___importeer',
                ),
                secondaryButton: tText(
                  'assignment/modals/import-to-assignment-modal___annuleer',
                ),
              }}
            />
            <ConfirmImportToAssignmentWithResponsesModal
              isOpen={isConfirmImportToAssignmentWithResponsesModalOpen}
              onClose={() =>
                setIsConfirmImportToAssignmentWithResponsesModalOpen(false)
              }
              confirmCallback={onConfirmImportAssignment}
              translations={{
                title: tHtml(
                  'assignment/modals/confirm-import-to-assignment-with-responses-modal___collectie-importeren',
                ),
                warningCallout: tText(
                  'assignment/modals/confirm-import-to-assignment-with-responses-modal___opgelet',
                ),
                warningMessage: tText(
                  'assignment/modals/confirm-import-to-assignment-with-responses-modal___leerlingen-hebben-deze-opdracht-reeds-bekeken',
                ),
                warningBody: tText(
                  'assignment/modals/confirm-import-to-assignment-with-responses-modal___ben-je-zeker-dat-je-de-collectie-wil-importeren-tot-deze-opdracht',
                ),
                primaryButton: tText(
                  'assignment/modals/create-assignment-modal___importeer',
                ),
                secondaryButton: tText(
                  'assignment/modals/create-assignment-modal___annuleer',
                ),
              }}
            />
          </>
        )}

        {!!collectionId && !!collection && isMobileWidth() && (
          <ShareModal
            title={tText(
              'collection/views/collection-detail___deel-deze-collectie-met-collegas',
            )}
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            contributors={transformContributorsToSimpleContributors(
              {
                ...collection?.profile?.user,
                profile: collection?.profile,
              } as Avo.User.User,
              (collection?.contributors || []) as Avo.Collection.Contributor[],
            )}
            onDeleteContributor={(info) =>
              onDeleteContributor(info, collectionId, fetchContributors)
            }
            onEditContributorRights={(user, newRights) =>
              onEditContributor(
                user,
                newRights,
                collectionId,
                fetchContributors,
                checkPermissionsAndGetCollection,
              )
            }
            onAddContributor={(info) =>
              onAddContributor(info, collectionId, fetchContributors)
            }
            availableRights={{
              [ContributorInfoRight.CONTRIBUTOR]:
                PermissionName.SHARE_COLLECTION_WITH_CONTRIBUTOR,
              [ContributorInfoRight.VIEWER]:
                PermissionName.SHARE_COLLECTION_WITH_VIEWER,
            }}
            isAdmin={
              commonUser?.permissions?.includes(
                PermissionName.EDIT_ANY_COLLECTIONS,
              ) || false
            }
          />
        )}
      </>
    );
  };

  const renderHeaderEducationLevel = () => {
    const groupedLomsLabels = getGroupedLomsKeyValue(
      collection?.loms || [],
      'label',
    );
    return <EducationLevelsTagList loms={groupedLomsLabels.educationLevel} />;
  };

  const renderCollection = () => {
    if (loadingInfo.state === 'loading') {
      return <FullPageSpinner />;
    }

    if (showNoAccessPopup) {
      return (
        <ErrorView
          icon={IconName.lock}
          message={tHtml(
            'collection/views/collection-detail___je-hebt-geen-rechten-om-deze-collectie-te-bekijken',
          )}
          actionButtons={['home']}
        />
      );
    }

    if (loadingInfo.state === 'forbidden') {
      return (
        <ErrorNoAccess
          title={tHtml(
            'collection/views/collection-detail___je-hebt-geen-toegang',
          )}
          message={tHtml(
            'collection/views/collection-detail___je-hebt-geen-toegang-beschrijving',
          )}
        />
      );
    }

    if (loadingInfo.state === 'error') {
      return (
        <ErrorView
          icon={IconName.alertTriangle}
          message={tHtml(
            'collection/views/collection-detail___het-laden-van-de-collectie-is-mislukt',
          )}
          actionButtons={['home']}
        />
      );
    }

    return (
      <div
        className={clsx(
          'm-collection-detail',
          showLoginPopup ? 'hide-behind-login-popup' : '',
        )}
      >
        {collection && (
          <Header
            title={collection.title}
            category={Avo.ContentType.English.COLLECTION}
            showMetaData={true}
            bookmarks={String(bookmarkViewPlayCounts.bookmarkCount || 0)}
            views={String(bookmarkViewPlayCounts.viewCount || 0)}
          >
            <HeaderTopRowLeft>{renderHeaderEducationLevel()}</HeaderTopRowLeft>
            {!showLoginPopup && (
              <HeaderMiddleRowRight>
                {isMobileWidth()
                  ? renderHeaderButtonsMobile()
                  : renderHeaderButtons()}
              </HeaderMiddleRowRight>
            )}

            <HeaderBottomRowLeft>
              <div className="u-flex-space-between">
                <HeaderOwnerAndContributors subject={collection} />
              </div>
            </HeaderBottomRowLeft>
            {!showLoginPopup && (
              <HeaderBottomRowRight>
                <InteractiveTour showButton />
              </HeaderBottomRowRight>
            )}
          </Header>
        )}

        {collection && renderCollectionBody()}
        {!showLoginPopup && renderModals()}
        {showLoginPopup && <RegisterOrLogin />}
      </div>
    );
  };

  const renderPageContent = () => {
    return (
      <div className="c-sticky-bar__wrapper">
        <div>
          <Helmet>
            <title>
              {GENERATE_SITE_TITLE(
                collection?.title ||
                  tText(
                    'collection/views/collection-detail___collectie-detail-titel-fallback',
                  ),
              )}
            </title>

            <meta name="description" content={collection?.description || ''} />
          </Helmet>

          <JsonLd
            url={window.location.href}
            title={collection?.title ?? ''}
            description={collection?.description}
            image={collection?.thumbnail_path}
            isOrganisation={!!collection?.profile?.organisation}
            author={getFullName(collection?.profile, true, false)}
            publishedAt={collection?.published_at}
            updatedAt={collection?.updated_at}
            keywords={compact(
              (collection?.loms || []).map((lom) => lom.lom?.label),
            )}
          />

          {renderCollection()}
        </div>

        <StickyBar
          title={tHtml(
            'collection/views/collection-detail___wil-je-de-collectie-title-toevoegen-aan-je-werkruimte',
            {
              title: collection?.title,
            },
          )}
          isVisible={!!inviteToken && !!collection}
          actionButtonProps={{
            label: tText('collection/views/collection-detail___toevoegen'),
            onClick: onAcceptShareCollection,
            type: 'tertiary',
          }}
          cancelButtonProps={{
            label: tText('collection/views/collection-detail___weigeren'),
            onClick: onDeclineShareCollection,
            type: 'tertiary',
          }}
        />
      </div>
    );
  };

  return renderPageContent();
};

export default CollectionDetail;
