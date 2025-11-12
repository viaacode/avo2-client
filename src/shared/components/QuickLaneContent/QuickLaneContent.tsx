import { Alert, Spacer, Tabs } from '@viaa/avo2-components'
import { type Avo, PermissionName } from '@viaa/avo2-types'
import { useAtomValue } from 'jotai'
import { noop } from 'es-toolkit'
import React, { type FC, useEffect, useState } from 'react'

import { commonUserAtom } from '../../../authentication/authentication.store.js'
import { PermissionService } from '../../../authentication/helpers/permission-service.js'
import { tHtml } from '../../helpers/translate-html.js'
import { tText } from '../../helpers/translate-text.js'
import { useTabs } from '../../hooks/useTabs.js'
import { ToastService } from '../../services/toast-service.js'

import { isShareable } from './QuickLaneContent.helpers.js'
import {
  type QuickLaneContentProps,
  QuickLaneTypeEnum,
} from './QuickLaneContent.types.js'
import { QuickLaneContentPublicationTab } from './QuickLaneContentPublicationTab.js'
import { QuickLaneContentSharingTab } from './QuickLaneContentSharingTab.js'
import './QuickLaneContent.scss'

// State

enum QuickLaneContentTabs {
  publication = 'publication',
  sharing = 'sharing',
}

// Helpers

const needsToPublish = async (commonUser: Avo.User.CommonUser) => {
  return await PermissionService.hasPermissions(
    [PermissionName.REQUIRED_PUBLICATION_DETAILS_ON_QUICK_LANE],
    commonUser,
  )
}

const isAllowedToPublish = async (
  commonUser: Avo.User.CommonUser,
  collection?: Avo.Collection.Collection,
) => {
  return (
    // Is the author && can publish his own collections
    (collection?.owner_profile_id === commonUser?.profileId &&
      (await PermissionService.hasPermissions(
        [PermissionName.PUBLISH_OWN_COLLECTIONS],
        commonUser,
      ))) ||
    // Is not the author but can publish any collections
    (await PermissionService.hasPermissions(
      [PermissionName.PUBLISH_ANY_COLLECTIONS],
      commonUser,
    ))
  )
}

// Component

export const QuickLaneContent: FC<QuickLaneContentProps> = (props) => {
  const isCollection = props.content_label === QuickLaneTypeEnum.COLLECTION
  const commonUser = useAtomValue(commonUserAtom)

  const [content, setContent] = useState<
    | Avo.Assignment.Assignment
    | Avo.Collection.Collection
    | Avo.Item.Item
    | undefined
  >(props.content)

  const [isPublishRequired, setIsPublishRequired] = useState(false)
  const [canPublish, setCanPublish] = useState(false)

  const [tab, setActiveTab, tabs] = useTabs(
    [
      {
        id: QuickLaneContentTabs.publication,
        label: tText(
          'shared/components/quick-lane-modal/quick-lane-modal___publicatiedetails',
        ),
      },
      {
        id: QuickLaneContentTabs.sharing,
        label: tText(
          'shared/components/quick-lane-modal/quick-lane-modal___snel-delen',
        ),
      },
    ],
    QuickLaneContentTabs.publication,
  )

  // Sync prop with state
  useEffect(() => {
    setContent(props.content)
  }, [props.content, setContent])

  // Check permissions
  useEffect(() => {
    async function checkPermissions() {
      if (isCollection && commonUser) {
        setIsPublishRequired(await needsToPublish(commonUser))
        setCanPublish(
          await isAllowedToPublish(
            commonUser,
            content as Avo.Collection.Collection,
          ),
        )
      }
    }

    checkPermissions().then(noop)
  }, [commonUser, content, isCollection, props.content_label])

  useEffect(() => {
    const shouldBePublishedFirst =
      isCollection &&
      isPublishRequired &&
      content &&
      !(content as Avo.Collection.Collection).is_public // AVO-1880

    setActiveTab(
      canPublish && shouldBePublishedFirst
        ? QuickLaneContentTabs.publication
        : QuickLaneContentTabs.sharing,
    )
  }, [
    setActiveTab,
    isPublishRequired,
    props.content_label,
    content,
    canPublish,
    isCollection,
  ])

  const getTabs = () => {
    // AVO-1880
    if ((content as Avo.Collection.Collection).is_public) {
      return []
    }

    return tabs.filter((tab) => {
      switch (tab.id) {
        case QuickLaneContentTabs.publication:
          return isCollection && canPublish

        default:
          return true
      }
    })
  }

  const renderContentNotShareableWarning = (): string => {
    switch (props.content_label) {
      case QuickLaneTypeEnum.ITEM:
        return tText(
          'shared/components/quick-lane-modal/quick-lane-modal___item-is-niet-gepubliceerd',
        )

      case QuickLaneTypeEnum.COLLECTION:
        return tab === QuickLaneContentTabs.publication
          ? tText(
              'shared/components/quick-lane-modal/quick-lane-modal___collectie-is-niet-publiek',
            )
          : tText(
              'shared/components/quick-lane-modal/quick-lane-modal___collectie-is-niet-publiek--niet-auteur',
            )

      default:
        return ''
    }
  }

  const renderTab = () => {
    switch (tab) {
      case QuickLaneContentTabs.publication:
        return (
          <QuickLaneContentPublicationTab
            {...props}
            content={content}
            onUpdate={setContent}
            onComplete={() => setActiveTab(QuickLaneContentTabs.sharing)}
          />
        )
      case QuickLaneContentTabs.sharing:
        return (
          <QuickLaneContentSharingTab
            {...props}
            content={content}
            onUpdate={setContent}
          />
        )

      default:
        return undefined
    }
  }

  return (
    <>
      {commonUser && content && props.content_label ? (
        <>
          {getTabs().length > 1 && (
            <Spacer
              className="m-quick-lane-content__tabs-wrapper"
              margin={'bottom'}
            >
              <Tabs
                tabs={getTabs()}
                onClick={(tab) => {
                  switch (tab.toString() as keyof typeof QuickLaneContentTabs) {
                    case QuickLaneContentTabs.publication:
                      setActiveTab(tab)
                      break

                    case QuickLaneContentTabs.sharing:
                      if (!isPublishRequired || isShareable(content)) {
                        setActiveTab(tab)
                      } else {
                        ToastService.danger(
                          tHtml(
                            'shared/components/quick-lane-modal/quick-lane-modal___dit-item-kan-nog-niet-gedeeld-worden',
                          ),
                        )
                      }
                      break

                    default:
                      break
                  }
                }}
              />
            </Spacer>
          )}

          {!isShareable(content) && isCollection && (
            <Spacer margin={['bottom']}>
              <Alert type={isCollection ? 'info' : 'danger'}>
                <p>{renderContentNotShareableWarning()}</p>
              </Alert>
            </Spacer>
          )}

          {renderTab()}
        </>
      ) : (
        <Spacer margin={['bottom-small']}>
          {props.error ||
            tText(
              'shared/components/quick-lane-modal/quick-lane-modal___er-ging-iets-mis',
            )}
        </Spacer>
      )}
    </>
  )
}
