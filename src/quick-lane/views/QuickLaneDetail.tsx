import './QuickLaneDetail.scss';

import { BlockHeading } from '@meemoo/admin-core-ui/client';
import {
  Button,
  Container,
  Flex,
  FlexItem,
  HeaderBottomRowLeft,
  IconName,
  Navbar,
  Toolbar,
  ToolbarItem,
  ToolbarLeft,
  ToolbarRight,
} from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import { noop } from 'es-toolkit';
import { useAtomValue } from 'jotai';
import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { Helmet } from 'react-helmet';
import { generatePath, useNavigate, useParams } from 'react-router';

import { AssignmentLayout } from '../../assignment/assignment.types';
import { commonUserAtom } from '../../authentication/authentication.store';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { FragmentList } from '../../collection/components/fragment/FragmentList';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views/ErrorView';
import { ItemVideoDescription } from '../../item/components/ItemVideoDescription';
import { FullPageSpinner } from '../../shared/components/FullPageSpinner/FullPageSpinner';
import { QuickLaneTypeEnum } from '../../shared/components/QuickLaneContent/QuickLaneContent.types';
import { getValidStartAndEnd } from '../../shared/helpers/cut-start-and-end';
import { renderAvatar } from '../../shared/helpers/formatters/avatar';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { toSeconds } from '../../shared/helpers/parsers/duration';
import { stripRichTextParagraph } from '../../shared/helpers/strip-rich-text-paragraph';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';
import { BookmarksViewsPlaysService } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service';
import { trackEvents } from '../../shared/services/event-logging-service';
import { useGetQuickLane } from '../hooks/useGetQuickLane';

export const QuickLaneDetail: FC = () => {
  const navigateFunc = useNavigate();
  const { id: quickLaneId } = useParams<{ id: string }>();
  const commonUser = useAtomValue(commonUserAtom);

  // State
  const canViewQuickLanes = PermissionService.hasPerm(
    commonUser,
    PermissionName.VIEW_QUICK_LANE_DETAIL,
  );
  const {
    data: quickLane,
    isLoading: isLoadingQuickLane,
    isError: isErrorQuickLane,
  } = useGetQuickLane(quickLaneId, {
    enabled: !!quickLaneId && canViewQuickLanes,
  });

  const canReadOriginal = useMemo(() => {
    if (!quickLane || !commonUser) {
      return false;
    }

    if (quickLane.content_label === QuickLaneTypeEnum.ITEM) {
      return PermissionService.hasPerm(
        commonUser,
        PermissionName.VIEW_ANY_PUBLISHED_ITEMS,
      );
    } else if (quickLane.content_label === QuickLaneTypeEnum.COLLECTION) {
      return PermissionService.hasPerm(
        commonUser,
        PermissionName.VIEW_ANY_PUBLISHED_COLLECTIONS,
      );
    } else {
      return false;
    }
  }, [commonUser, quickLane]);

  const triggerViewEvents = useCallback(async () => {
    if (!quickLane) {
      return null;
    }
    const content_type =
      { ITEM: 'item', COLLECTIE: 'collection' }[
        quickLane.content_label as string
      ] || 'unknown';
    trackEvents(
      {
        object: String(quickLane.id),
        object_type: 'quick_lane',
        action: 'view',
        resource: {
          content_type,
        },
      },
      commonUser,
    );

    // Also increase the view count for the item or collection
    if (content_type === 'item' && quickLane.content_id) {
      await BookmarksViewsPlaysService.action(
        'view',
        'item',
        quickLane.content_id,
        commonUser,
      ).then(noop);
    } else if (content_type === 'collection' && quickLane.content_id) {
      await BookmarksViewsPlaysService.action(
        'view',
        'collection',
        quickLane.content_id,
        commonUser,
      ).then(noop);
    }
  }, [commonUser, quickLane]);

  useEffect(() => {
    if (quickLane) {
      triggerViewEvents().then(noop);
    }
  }, [quickLane, triggerViewEvents]);

  // Render methods
  const renderContent = () => {
    if (!quickLane || !quickLane.content) {
      return null;
    }

    const contentLabel = quickLane.content_label;
    const contentLayout = quickLane.view_mode;

    const [start, end] = getValidStartAndEnd(
      quickLane.start_oc,
      quickLane.end_oc,
      toSeconds((quickLane.content as Avo.Item.Item)?.duration || 0),
    );

    switch (contentLabel) {
      case QuickLaneTypeEnum.COLLECTION:
        return (
          <FragmentList
            collectionFragments={
              (quickLane.content as Avo.Collection.Collection)
                .collection_fragments
            }
            showDescription={contentLayout === AssignmentLayout.PlayerAndText}
            showMetadata
            linkToItems={false}
            collection={quickLane.content as Avo.Collection.Collection}
          />
        );
      case QuickLaneTypeEnum.ITEM:
        return (
          <ItemVideoDescription
            itemMetaData={quickLane.content as Avo.Item.Item}
            showMetadata={true}
            enableMetadataLink={false}
            showDescription={contentLayout === AssignmentLayout.PlayerAndText}
            verticalLayout={isMobileWidth()}
            cuePointsLabel={{ start, end }}
            cuePointsVideo={{ start, end }}
            trackPlayEvent={true}
          />
        );
      default:
        return (
          <ErrorView
            locationId="quick-lane-detail--error"
            icon={IconName.alertTriangle}
            message={tHtml(
              'quick-lane/views/quick-lane-detail___onverwacht-inhoudstype',
              {
                type: contentLabel || '',
              },
            )}
          />
        );
    }
  };

  const handleClickGoToContentButton = () => {
    if (!quickLane?.content_id) {
      return;
    }

    let path: string | undefined;

    if (quickLane?.content_label === QuickLaneTypeEnum.ITEM) {
      path = generatePath(APP_PATH.ITEM_DETAIL.route, {
        id: (quickLane.content as Avo.Item.Item).external_id.toString(),
      });
    } else if (quickLane.content_label === QuickLaneTypeEnum.COLLECTION) {
      path = generatePath(APP_PATH.COLLECTION_DETAIL.route, {
        id: quickLane.content_id,
      });
    }

    if (path) {
      navigateFunc(path);
    }
  };

  const renderGoToContentButton = () => {
    if (!canReadOriginal) {
      return null;
    }

    return (
      <ToolbarItem>
        <Button
          type="primary"
          label={tText(
            'quick-lane/views/quick-lane-detail___bekijk-als-leerkracht',
          )}
          title={tText(
            'quick-lane/views/quick-lane-detail___bekijk-als-leerkracht',
          )}
          icon={IconName.eye}
          onClick={handleClickGoToContentButton}
        />
      </ToolbarItem>
    );
  };

  const renderQuickLaneDetail = () => {
    if (!quickLane) {
      return null;
    }
    const { title } = quickLane;
    const profile = quickLane.owner;

    return (
      <div
        className={clsx('c-quick-lane-detail', {
          'c-quick-lane-detail--mobile': isMobileWidth(),
        })}
      >
        <Navbar>
          <Container mode="vertical" size="small" background="alt">
            <Container mode="horizontal">
              <Flex>
                <FlexItem>
                  <Toolbar
                    justify
                    wrap={isMobileWidth()}
                    size="huge"
                    className="c-toolbar--drop-columns-low-mq"
                  >
                    <ToolbarLeft>
                      <ToolbarItem>
                        <BlockHeading className="u-m-0" type="h2">
                          {title}
                        </BlockHeading>
                      </ToolbarItem>
                    </ToolbarLeft>
                    <ToolbarRight>
                      {!!profile && (
                        <ToolbarItem>
                          <HeaderBottomRowLeft>
                            {renderAvatar(profile, { dark: true })}
                          </HeaderBottomRowLeft>
                        </ToolbarItem>
                      )}
                      {renderGoToContentButton()}
                    </ToolbarRight>
                  </Toolbar>
                </FlexItem>
              </Flex>
            </Container>
          </Container>
        </Navbar>
        <Container mode="vertical">
          <Container mode="horizontal">{renderContent()}</Container>
        </Container>
      </div>
    );
  };

  const renderPageContent = (): ReactNode | null => {
    if (isLoadingQuickLane) {
      return <FullPageSpinner locationId="quick-lane-detail--loading" />;
    }

    if (isErrorQuickLane) {
      return (
        <ErrorView
          locationId="quick-lane-detail--error"
          icon={IconName.alertTriangle}
          message={tHtml(
            'quick-lane/views/quick-lane-detail___het-laden-van-de-gedeelde-link-is-mislukt',
          )}
        />
      );
    }

    if (!canViewQuickLanes) {
      return (
        <ErrorView
          locationId="quick-lane-detail--error"
          icon={IconName.lock}
          message={tHtml(
            'quick-lane/views/quick-lane-detail___je-hebt-geen-rechten-om-deze-gedeelde-link-te-bekijken',
          )}
        />
      );
    }

    if (quickLane?.content_label === QuickLaneTypeEnum.COLLECTION) {
      const content = quickLane?.content as
        | Avo.Collection.Collection
        | undefined;

      if (!content || !content.is_public) {
        return (
          <ErrorView
            locationId="quick-lane-detail--error"
            icon={IconName.search}
            message={tHtml(
              'collection/views/collection-detail___de-collectie-kon-niet-worden-gevonden',
            )}
          />
        );
      }
    } else {
      // ITEM
      // We assume the response isItem but don't check so we can handle the absence of VIEW_ANY_UNPUBLISHED_ITEMS
      const content = quickLane?.content as Avo.Item.Item;

      // Check for a depublish reason first
      if (content.depublish_reason) {
        const depublishReason = stripRichTextParagraph(
          (quickLane?.content as Avo.Item.Item).depublish_reason || '',
        );

        return (
          <ErrorView
            locationId="quick-lane-detail--error"
            message={tHtml(
              'item/views/item-detail___dit-item-werdt-gedepubliceerd-met-volgende-reden',
              { depublishReason },
            )}
            icon={IconName.cameraOff}
          />
        );
      }

      // If there's no reason, check if it's published
      // Note: this is not handled in GQL because the response is a quick_lane object enriched in the QuickLaneService using the ItemService's fetch
      if (!content.is_published) {
        return (
          <ErrorView
            locationId="quick-lane-detail--error"
            message={tHtml('item/views/item___dit-item-werd-niet-gevonden')}
            icon={IconName.search}
          />
        );
      }
    }
    return renderQuickLaneDetail();
  };

  return (
    <>
      <Helmet>
        <title>
          {GENERATE_SITE_TITLE(
            quickLane?.title ||
              tText(
                'quick-lane/views/quick-lane-detail___gedeelde-link-detail-pagina-titel-fallback',
              ),
          )}
        </title>
        <meta
          name="description"
          content={quickLane?.content?.description || ''}
        />
      </Helmet>
      {renderPageContent()}
    </>
  );
};

export default QuickLaneDetail;
