import { BlockHeading } from '@meemoo/admin-core-ui/client'
import {
  Button,
  Container,
  Dropdown,
  IconName,
  MenuContent,
  type MenuItemInfo,
  Modal,
  ModalBody,
  ModalFooterLeft,
  ModalSubHeader,
  Spacer,
  Tabs,
} from '@viaa/avo2-components'
import { type Avo, PermissionName } from '@viaa/avo2-types'
import { clsx } from 'clsx'
import { useAtomValue } from 'jotai'
import { isNil } from 'es-toolkit'
import React, {
  createRef,
  type FC,
  type ReactNode,
  useEffect,
  useState,
} from 'react'

import { commonUserAtom } from '../../../authentication/authentication.store.js'
import { PermissionService } from '../../../authentication/helpers/permission-service.js'
import { EmbedContent } from '../../../embed-code/components/EmbedContent.js'
import {
  bookWidgetsLogo,
  smartSchoolLogo,
} from '../../../embed-code/embed-code.const.js'
import {
  type EmbedCode,
  EmbedCodeContentType,
  EmbedCodeDescriptionType,
  EmbedCodeExternalWebsite,
} from '../../../embed-code/embed-code.types.js'
import { createResource } from '../../../embed-code/helpers/resourceForTrackEvents.js'
import { toSeconds } from '../../helpers/parsers/duration.js'
import { tHtml } from '../../helpers/translate-html.js'
import { tText } from '../../helpers/translate-text.js'
import { useTabs } from '../../hooks/useTabs.js'
import { trackEvents } from '../../services/event-logging-service.js'
import { embedFlowAtom } from '../../store/ui.store.js'
import { QuickLaneContent } from '../QuickLaneContent/QuickLaneContent.js'
import { QuickLaneTypeEnum } from '../QuickLaneContent/QuickLaneContent.types.js'
import { ShareDropdownTabs } from '../ShareDropdown/ShareDropdown.types.js'
import { ShareThroughEmailContent } from '../ShareThroughEmailContent/ShareThroughEmailContent.js'

import './FragmentShareModal.scss'

type FragmentShareModalProps = {
  item: Avo.Item.Item | null
  isOpen: boolean
  onClose: () => void
  showOnlyEmbedTab?: boolean
}

export const FragmentShareModal: FC<FragmentShareModalProps> = ({
  item,
  isOpen,
  onClose,
  showOnlyEmbedTab,
}) => {
  const commonUser = useAtomValue(commonUserAtom)
  const isSmartSchoolEmbedFlow = useAtomValue(embedFlowAtom)
  showOnlyEmbedTab = isSmartSchoolEmbedFlow ? true : showOnlyEmbedTab

  const initialTab = ShareDropdownTabs.COLLEAGUES
  const [tab, setActiveTab, tabs] = useTabs(
    [
      ...(!showOnlyEmbedTab
        ? [
            {
              id: ShareDropdownTabs.COLLEAGUES,
              label: tText(
                'shared/components/share-dropdown/share-dropdown___collegas',
              ),
              icon: IconName.userTeacher,
            },
          ]
        : []),
      ...(!showOnlyEmbedTab &&
      PermissionService.hasPerm(commonUser, PermissionName.CREATE_QUICK_LANE)
        ? [
            {
              id: ShareDropdownTabs.PUPILS,
              label: tText(
                'shared/components/share-dropdown/share-dropdown___leerlingen',
              ),
              icon: IconName.userStudent,
            },
          ]
        : []),
      ...(PermissionService.hasPerm(
        commonUser,
        PermissionName.EMBED_ITEMS_ON_OTHER_SITES,
      )
        ? [
            {
              id: ShareDropdownTabs.EMBED,
              label: (
                <>
                  {tText(
                    'shared/components/fragment-share-modal/fragment-share-modal___insluiten',
                  )}
                  <img
                    className="append-logo"
                    src={smartSchoolLogo}
                    alt={tText(
                      'shared/components/fragment-share-modal/fragment-share-modal___smartschool-logo',
                    )}
                  />
                  <img
                    className="append-logo"
                    src={bookWidgetsLogo}
                    alt={tText(
                      'shared/components/fragment-share-modal/fragment-share-modal___bookwidgets-logo',
                    )}
                  />
                </>
              ),
              icon: IconName.code,
            },
          ]
        : []),
    ],
    initialTab,
  )
  const [isEmbedDropdownOpen, setIsEmbedDropdownOpen] = useState<boolean>(false)
  const [embedDropdownSelection, setEmbedDropdownSelection] = useState<
    EmbedCodeExternalWebsite | ''
  >('')
  const [embedCode, setEmbedCode] = useState<EmbedCode | null>(null)

  const modalRef = createRef<{ updateSize: () => void }>()

  const handleRightsButtonClicked = () => {
    setIsEmbedDropdownOpen(!isEmbedDropdownOpen)
  }

  useEffect(() => {
    if (!isSmartSchoolEmbedFlow) {
      setEmbedDropdownSelection('')
    }
  }, [isSmartSchoolEmbedFlow, tab])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (showOnlyEmbedTab) {
      setActiveTab(ShareDropdownTabs.EMBED)
    }

    if (isSmartSchoolEmbedFlow) {
      setEmbedDropdownSelection(EmbedCodeExternalWebsite.SMARTSCHOOL)
    }
  }, [
    isSmartSchoolEmbedFlow,
    setActiveTab,
    setEmbedDropdownSelection,
    isOpen,
    showOnlyEmbedTab,
  ])

  useEffect(() => {
    let newEmbedCode = null

    if (embedDropdownSelection !== '' && item) {
      newEmbedCode = {
        id: '',
        title: item.title,
        externalWebsite: embedDropdownSelection,
        contentType: EmbedCodeContentType.item,
        contentId: item.external_id,
        content: item,
        thumbnailPath: item.thumbnail_path,
        descriptionType:
          embedDropdownSelection === EmbedCodeExternalWebsite.BOOKWIDGETS
            ? EmbedCodeDescriptionType.NONE
            : EmbedCodeDescriptionType.ORIGINAL,
        description:
          embedDropdownSelection === EmbedCodeExternalWebsite.BOOKWIDGETS
            ? ''
            : item.description,
        start: 0,
        end: toSeconds(item.duration),
      } as EmbedCode
    }

    if (isNil(embedCode) && !isNil(newEmbedCode)) {
      trackEvents(
        {
          object: 'no-id-yet',
          object_type: 'embed_code',
          action: 'activate',
          resource: {
            ...createResource(newEmbedCode, commonUser as Avo.User.CommonUser),
            startedFlow: isSmartSchoolEmbedFlow ? 'SMART_SCHOOL' : 'AVO',
          },
        },
        commonUser,
      )
    }
    setEmbedCode(newEmbedCode)
  }, [embedDropdownSelection, setEmbedCode, item])

  const embedDropdownOptions: MenuItemInfo[] = [
    {
      label: (
        <>
          <img
            className="o-svg-icon prepend-logo"
            src={smartSchoolLogo}
            alt={tText(
              'shared/components/fragment-share-modal/fragment-share-modal___smartschool-logo',
            )}
          />
          {tText(
            'shared/components/fragment-share-modal/fragment-share-modal___smartschool',
          )}
        </>
      ) as unknown as string, // TODO allow ReactNode in avo2-components
      id: EmbedCodeExternalWebsite.SMARTSCHOOL,
      key: EmbedCodeExternalWebsite.SMARTSCHOOL,
    },
    {
      label: (
        <>
          <img
            className="o-svg-icon prepend-logo"
            src={bookWidgetsLogo}
            alt={tText(
              'shared/components/fragment-share-modal/fragment-share-modal___bookwidgets-logo',
            )}
          />
          {tText(
            'shared/components/fragment-share-modal/fragment-share-modal___bookwidgets',
          )}
        </>
      ) as unknown as string, // TODO allow ReactNode in avo2-components
      id: EmbedCodeExternalWebsite.BOOKWIDGETS,
      key: EmbedCodeExternalWebsite.BOOKWIDGETS,
    },
  ]

  const getEmbedDropdownLabel = () => {
    return (
      embedDropdownOptions.find((value) => value.id === embedDropdownSelection)
        ?.label ||
      tText(
        'shared/components/fragment-share-modal/fragment-share-modal___selecteer-een-platform',
      )
    )
  }

  const handleClose = () => {
    onClose && onClose()
    setActiveTab(initialTab)
    setEmbedDropdownSelection('')
  }

  const renderPupilsContent = (): ReactNode => {
    if (!item) {
      return null
    }

    return (
      <QuickLaneContent
        content={item}
        content_label={QuickLaneTypeEnum.ITEM}
        isOpen={isOpen}
      />
    )
  }

  const renderColleaguesContent = (): ReactNode => {
    if (!item) {
      return null
    }

    return (
      <ShareThroughEmailContent
        emailLinkHref={window.location.href}
        emailLinkTitle={item.title}
        type="item"
        onSendMail={handleClose}
      />
    )
  }

  const renderEmbedContentDescription = (): string | ReactNode => {
    switch (embedDropdownSelection) {
      case EmbedCodeExternalWebsite.SMARTSCHOOL:
        return tHtml(
          'shared/components/fragment-share-modal/fragment-share-modal___bewerk-het-fragment-kopieer-de-link-en-plak-hem-bij-extra-inhoud-in-een-smartschoolfiche',
        )
      case EmbedCodeExternalWebsite.BOOKWIDGETS:
        return tHtml(
          'shared/components/fragment-share-modal/fragment-share-modal___bewerk-het-fragment-kopieer-de-link-en-plak-hem-in-een-widget-in-bookwidgets',
        )
      default:
        return ''
    }
  }

  const renderEmbedContent = (): ReactNode => {
    return (
      <>
        {!isSmartSchoolEmbedFlow && (
          <Container
            mode="vertical"
            bordered={!!embedDropdownSelection}
            className={clsx('embed-selection', {
              'embed-selection-selected': !!embedDropdownSelection,
            })}
          >
            <Spacer margin="bottom">
              <BlockHeading type="h4">
                {tHtml(
                  'shared/components/fragment-share-modal/fragment-share-modal___fragment-insluiten-in',
                )}
              </BlockHeading>
            </Spacer>
            <Spacer margin="bottom">
              <Dropdown
                label={getEmbedDropdownLabel() as string} // TODO allow ReactNode in avo2-components
                onOpen={handleRightsButtonClicked}
                onClose={handleRightsButtonClicked}
                isOpen={isEmbedDropdownOpen}
              >
                <MenuContent
                  menuItems={embedDropdownOptions}
                  onClick={(id) => {
                    setEmbedDropdownSelection(id as EmbedCodeExternalWebsite)
                    handleRightsButtonClicked()
                  }}
                />
              </Dropdown>
            </Spacer>
          </Container>
        )}
        <EmbedContent
          item={embedCode}
          contentDescription={renderEmbedContentDescription()}
          onClose={handleClose}
          onResize={() => modalRef?.current?.updateSize()}
        />
      </>
    )
  }

  const renderTabs = (): ReactNode => {
    switch (tab) {
      case ShareDropdownTabs.COLLEAGUES:
        return renderColleaguesContent()
      case ShareDropdownTabs.PUPILS:
        return renderPupilsContent()
      case ShareDropdownTabs.EMBED:
        return renderEmbedContent()
      default:
        return <></>
    }
  }

  return (
    <Modal
      ref={modalRef}
      isOpen={isOpen}
      size="large"
      scrollable={tab === ShareDropdownTabs.PUPILS || !!embedDropdownSelection}
      onClose={handleClose}
      disablePageScroll={true}
      title={tHtml(
        'shared/components/fragment-share-modal/fragment-share-modal___deel-dit-fragment',
      )}
    >
      {!isSmartSchoolEmbedFlow && (
        <ModalSubHeader>
          <Spacer
            className="m-fragment-share-modal__tabs-wrapper"
            margin={'bottom'}
          >
            <Tabs tabs={tabs} onClick={setActiveTab} />
          </Spacer>
        </ModalSubHeader>
      )}
      <ModalBody>{renderTabs()}</ModalBody>
      {(!embedDropdownSelection || tab !== ShareDropdownTabs.EMBED) && (
        <ModalFooterLeft>
          <Button
            type="secondary"
            label={tText(
              'shared/components/fragment-share-modal/fragment-share-modal___annuleer',
            )}
            title={tText(
              'shared/components/fragment-share-modal/fragment-share-modal___annuleer',
            )}
            ariaLabel={tText(
              'shared/components/fragment-share-modal/fragment-share-modal___annuleer',
            )}
            onClick={handleClose}
          />
        </ModalFooterLeft>
      )}
    </Modal>
  )
}
