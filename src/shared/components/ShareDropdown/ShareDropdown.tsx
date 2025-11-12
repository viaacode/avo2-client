import {
  Dropdown,
  DropdownButton,
  DropdownContent,
} from '@meemoo/react-components'
import {
  Button,
  type ButtonProps,
  type DropdownProps,
  IconName,
  Tabs,
} from '@viaa/avo2-components'
import { type Avo, type PermissionName } from '@viaa/avo2-types'
import React, { type FC, useState } from 'react'

import { tText } from '../../helpers/translate-text.js'
import { useTabs } from '../../hooks/useTabs.js'
import { ShareWithColleagues } from '../ShareWithColleagues/ShareWithColleagues.js'
import {
  type ContributorInfo,
  type ContributorInfoRight,
} from '../ShareWithColleagues/ShareWithColleagues.types.js'
import {
  ShareWithPupil,
  type ShareWithPupilsProps,
} from '../ShareWithPupils/ShareWithPupils.js'

import { ShareDropdownTabs } from './ShareDropdown.types.js'

import './ShareDropdown.scss'

export type ShareDropdownProps = {
  contributors?: ContributorInfo[]
  onAddContributor: (info: Partial<ContributorInfo>) => Promise<void>
  onEditContributorRights: (
    info: ContributorInfo,
    newRights: ContributorInfoRight,
  ) => Promise<void>
  onDeleteContributor: (info: ContributorInfo) => Promise<void>
  buttonProps?: Partial<ButtonProps>
  dropdownProps?: Partial<DropdownProps>
  shareWithPupilsProps?: ShareWithPupilsProps
  withPupils?: boolean
  availableRights: {
    [ContributorInfoRight.CONTRIBUTOR]: PermissionName
    [ContributorInfoRight.VIEWER]: PermissionName
  }
  isAdmin: boolean
  isAssignmentExpired?: boolean
  assignment?: Partial<Avo.Assignment.Assignment>
}
export const ShareDropdown: FC<ShareDropdownProps> = ({
  assignment,
  availableRights,
  buttonProps,
  contributors,
  dropdownProps,
  isAdmin,
  onAddContributor,
  onDeleteContributor,
  onEditContributorRights,
  shareWithPupilsProps,
  withPupils = true,
}) => {
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState<boolean>(false)
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
  const [hasModalOpen, setHasModalOpen] = useState<boolean>(false)

  const handleShareButtonClicked = () => {
    setIsShareDropdownOpen(!isShareDropdownOpen)
  }

  const handleOnClose = () => {
    if (!hasModalOpen) {
      setIsShareDropdownOpen(false)
    }
  }

  return (
    <Dropdown
      isOpen={isShareDropdownOpen}
      onClose={handleOnClose}
      className="c-share-dropdown"
      placement="bottom-end"
      {...dropdownProps}
    >
      <DropdownButton>
        <Button
          ariaLabel={tText(
            'shared/components/share-dropdown/share-dropdown___delen',
          )}
          label={tText(
            'shared/components/share-dropdown/share-dropdown___delen',
          )}
          onClick={handleShareButtonClicked}
          icon={IconName.userGroup}
          {...buttonProps}
        />
      </DropdownButton>

      <DropdownContent>
        <div className="c-share-dropdown__container">
          <Tabs tabs={tabs} onClick={(id) => setActiveTab(id)} />

          <div className="c-share-dropdown__content">
            {tab === ShareDropdownTabs.COLLEAGUES ? (
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
            ) : (
              <ShareWithPupil
                {...(shareWithPupilsProps as ShareWithPupilsProps)}
              />
            )}
          </div>
        </div>
      </DropdownContent>
    </Dropdown>
  )
}
