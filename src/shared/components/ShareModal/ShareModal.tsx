import { IconName, Modal, ModalBody, Spacer, Tabs } from '@viaa/avo2-components'
import { type Avo, type PermissionName } from '@viaa/avo2-types'
import React, { type FC, useEffect, useState } from 'react'

import { tText } from '../../helpers/translate-text.js'
import { useTabs } from '../../hooks/useTabs.js'
import { ShareDropdownTabs } from '../ShareDropdown/ShareDropdown.types.js'
import { ShareWithColleagues } from '../ShareWithColleagues/ShareWithColleagues.js'
import {
  type ContributorInfo,
  type ContributorInfoRight,
} from '../ShareWithColleagues/ShareWithColleagues.types.js'
import {
  ShareWithPupil,
  type ShareWithPupilsProps,
} from '../ShareWithPupils/ShareWithPupils.js'
import './ShareModal.scss'

type ShareModalProps = {
  title: string
  isOpen: boolean
  contributors?: ContributorInfo[]
  onClose: () => void
  onAddContributor: (info: Partial<ContributorInfo>) => Promise<void>
  onEditContributorRights: (
    info: ContributorInfo,
    newRights: ContributorInfoRight,
  ) => Promise<void>
  onDeleteContributor: (info: ContributorInfo) => Promise<void>
  shareWithPupilsProps?: ShareWithPupilsProps
  withPupils?: boolean
  availableRights: {
    [ContributorInfoRight.CONTRIBUTOR]: PermissionName
    [ContributorInfoRight.VIEWER]: PermissionName
  }
  isAdmin: boolean
  assignment?: Partial<Avo.Assignment.Assignment>
}

export const ShareModal: FC<ShareModalProps> = ({
  assignment,
  availableRights,
  contributors,
  isAdmin,
  isOpen,
  onAddContributor,
  onClose,
  onDeleteContributor,
  onEditContributorRights,
  shareWithPupilsProps,
  title,
  withPupils = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [hasModalOpen, setHasModalOpen] = useState<boolean>(false)

  const [tab, setActiveTab, tabs] = useTabs(
    [
      {
        id: ShareDropdownTabs.COLLEAGUES,
        label: tText(
          'shared/components/share-dropdown/share-dropdown___collegas',
        ),
        icon: IconName.userTeacher,
      },
      ...(withPupils
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
    ],
    withPupils ? ShareDropdownTabs.PUPILS : ShareDropdownTabs.COLLEAGUES,
  )

  useEffect(() => {
    if (!hasModalOpen) {
      setIsModalOpen(isOpen)
    } else {
      setIsModalOpen(false)
    }
  }, [isOpen, hasModalOpen])

  const handleOnClose = () => {
    if (!hasModalOpen) {
      onClose()
    }
  }

  return (
    <Modal isOpen={isModalOpen} onClose={handleOnClose} title={title}>
      <ModalBody>
        {
          <>
            <Tabs
              tabs={tabs}
              onClick={(id) => setActiveTab(id)}
              className={'c-share-modal__tabs'}
            />

            {tab === ShareDropdownTabs.COLLEAGUES ? (
              <Spacer margin={'top-large'}>
                <ShareWithColleagues
                  assignment={assignment}
                  contributors={contributors || []}
                  availableRights={availableRights}
                  onAddNewContributor={onAddContributor}
                  onDeleteContributor={onDeleteContributor}
                  onEditRights={onEditContributorRights}
                  hasModalOpen={(open: boolean) => setHasModalOpen(open)}
                  isAdmin={isAdmin}
                />
              </Spacer>
            ) : (
              <Spacer margin={'top-large'}>
                <ShareWithPupil
                  {...(shareWithPupilsProps as ShareWithPupilsProps)}
                />
              </Spacer>
            )}
          </>
        }
      </ModalBody>
    </Modal>
  )
}
