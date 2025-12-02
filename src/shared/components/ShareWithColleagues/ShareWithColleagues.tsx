import './ShareWithColleagues.scss'
import { useLocalStorage } from '@uidotdev/usehooks'
import {
  Avatar,
  Button,
  Dropdown,
  DropdownButton,
  DropdownContent,
  Flex,
  Icon,
  IconName,
  MenuContent,
  type SelectOption,
  Spacer,
  Spinner,
  TextInput,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@viaa/avo2-components'
import { type Avo, type PermissionName } from '@viaa/avo2-types'
import { clsx } from 'clsx'
import { useAtomValue } from 'jotai'
import { isNil } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import { type FC, useMemo, useState } from 'react'

import { commonUserAtom } from '../../../authentication/authentication.store';
import { tHtml } from '../../helpers/translate-html';
import { tText } from '../../helpers/translate-text';
import { validateEmailAddress } from '../../helpers/validation/email';
import { ConfirmModal } from '../ConfirmModal/ConfirmModal';
import { ConfirmModalRememberKey } from '../ConfirmModal/ConfirmModal.consts';

import { EditShareUserRightsModal } from './Modals/EditShareUserRightsModal';
import { GET_EDUCATION_LEVEL_DIFFERENCE_DICT } from './ShareWithColleagues.const';
import {
  compareUsersEmail,
  findRightByValue,
  getContributorRightLabel,
  hasEducationLevel,
  sortContributors,
} from './ShareWithColleagues.helpers';
import {
  type ContributorInfo,
  ContributorInfoRight,
} from './ShareWithColleagues.types';

type ShareWithColleaguesProps = {
  contributors: ContributorInfo[]
  availableRights: {
    [ContributorInfoRight.CONTRIBUTOR]: PermissionName
    [ContributorInfoRight.VIEWER]: PermissionName
  }
  isAdmin: boolean
  onAddNewContributor: (info: Partial<ContributorInfo>) => Promise<void>
  onEditRights: (
    info: ContributorInfo,
    newRights: ContributorInfoRight,
  ) => Promise<void>
  onDeleteContributor: (info: ContributorInfo) => Promise<void>
  hasModalOpen: (open: boolean) => void
  assignment?: Partial<Avo.Assignment.Assignment>
}

export const ShareWithColleagues: FC<ShareWithColleaguesProps> = ({
  assignment,
  availableRights,
  contributors,
  hasModalOpen,
  isAdmin,
  onAddNewContributor,
  onDeleteContributor,
  onEditRights,
}) => {
  const commonUser = useAtomValue(commonUserAtom)
  const currentUser =
    (contributors.find(
      (contributor) => contributor.profileId === commonUser?.profileId,
    ) as ContributorInfo) ||
    ({
      rights: ContributorInfoRight.OWNER,
      email: commonUser?.email,
      firstName: commonUser?.firstName,
      lastName: commonUser?.lastName,
      profileId: commonUser?.profileId,
      profileImage: commonUser?.organisation?.logo_url || commonUser?.avatar,
    } as ContributorInfo)
  const [isRightsDropdownOpen, setIsRightsDropdownOpen] =
    useState<boolean>(false)
  const [contributor, setNewContributor] = useState<Partial<ContributorInfo>>({
    email: undefined,
    rights: undefined,
  })
  const [error, setError] = useState<string | null>(null)
  const [isEditRightsModalOpen, setIsEditRightsModalOpen] =
    useState<boolean>(false)
  const [toEditContributor, setToEditContributor] =
    useState<ContributorInfo | null>(null)
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] =
    useState<boolean>(false)
  const [toDeleteContributor, setToDeleteContributor] =
    useState<ContributorInfo | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isShareWarningModalOpen, setIsShareWarningModalOpen] =
    useState<boolean>(false)
  const [isShareWarningModalRemembered] = useLocalStorage(
    ConfirmModalRememberKey.AVO__REMEMBER__SHARE_WITH_COLLEAGUES,
    false,
  )

  const handleRightsButtonClicked = () => {
    setIsRightsDropdownOpen(!isRightsDropdownOpen)
  }

  const addNewContributor = async () => {
    setError(null) // Clear errors
    setIsShareWarningModalOpen(false)

    if (!contributor.email) {
      setError(
        tText(
          'shared/components/share-with-colleagues/share-with-colleagues___email-is-verplicht',
        ),
      )
    } else if (!validateEmailAddress(contributor.email)) {
      setError(
        tText(
          'shared/components/share-with-colleagues/share-with-colleagues___email-is-geen-geldig-emailadres',
        ),
      )
    } else {
      setIsLoading(true)
      await onAddNewContributor({
        ...contributor,
        rights: findRightByValue(contributor.rights as ContributorInfoRight),
      })
      setNewContributor({ email: undefined, rights: undefined })
      setError(null)
      setIsLoading(false)
    }
  }

  const handleAddNewContributor = () => {
    const isAssignment = assignment !== undefined
    // Skip the warning if it's not an assignment, been dismissed or the new contributor is a viewer
    if (
      !isAssignment ||
      isShareWarningModalRemembered ||
      contributor.rights === ContributorInfoRight.VIEWER
    ) {
      addNewContributor()
    } else {
      setIsShareWarningModalOpen(true)
      hasModalOpen(true)
    }
  }

  const handleEditContributorRights = (user: ContributorInfo) => {
    setToEditContributor(user)
    setIsEditRightsModalOpen(true)
    hasModalOpen(true)
  }

  const handleConfirmEditContributorRights = async (
    right: ContributorInfoRight,
  ) => {
    await onEditRights(toEditContributor as ContributorInfo, right)
    handleOnCloseEditUserRights()
  }

  const handleOnCloseEditUserRights = () => {
    setIsEditRightsModalOpen(false)
    setToEditContributor(null)
    hasModalOpen(false)
  }

  const handleDeleteContributor = (user: ContributorInfo) => {
    setToDeleteContributor(user)
    setIsDeleteUserModalOpen(true)
    hasModalOpen(true)
  }

  const handleConfirmDeleteContributor = async () => {
    await onDeleteContributor(toDeleteContributor as ContributorInfo)
    handleOnCloseDeleteContributor()
  }

  const handleOnCloseDeleteContributor = () => {
    setToDeleteContributor(null)
    setIsDeleteUserModalOpen(false)
    hasModalOpen(false)
  }

  const handleOnCloseShareWarningModal = () => {
    setIsShareWarningModalOpen(false)
  }

  const updateNewContributor = (value: Record<string, string>) => {
    setNewContributor({
      ...contributor,
      ...value,
    })
  }

  const renderColleaguesInfoList = () => {
    if (contributors.length > 0) {
      return (
        <ul className="c-colleagues-info-list">
          {sortContributors(contributors).map((contributor, index) => {
            const currentUserIsOwner =
              currentUser.rights === ContributorInfoRight.OWNER
            const currentUserIsContributor =
              currentUser.rights === ContributorInfoRight.CONTRIBUTOR

            const contributorIsOwner =
              contributor.rights === ContributorInfoRight.OWNER
            const contributorIsCurrentUser =
              contributor.email === currentUser.email
            const contributorIsPending = isNil(contributor.profileId)
            const contributorIsConflicting = !hasEducationLevel(
              contributor,
              assignment,
            )

            const showConflictIcon =
              !contributorIsPending &&
              contributorIsConflicting &&
              !contributorIsOwner

            const canEdit =
              !showConflictIcon &&
              ((!contributorIsCurrentUser && !contributorIsOwner) ||
                (!currentUserIsOwner && contributorIsCurrentUser) ||
                (currentUserIsContributor && !contributorIsOwner) ||
                (isAdmin && !contributorIsOwner))

            // The owner cannot delete himself but can delete everyone else
            // Contributors can delete themselves and every other contributor and viewer
            // Viewers can only delete themselves, but they do not have access to this dialog
            const canDelete =
              // This contributor is not the current user and not the owner
              (!contributorIsCurrentUser && !contributorIsOwner) ||
              // This contributor is the current user and is not the owner
              (!currentUserIsOwner && contributorIsCurrentUser) ||
              // The current user is a contributor and this contributor is not the owner
              (currentUserIsContributor && !contributorIsOwner) ||
              // The current user is an admin and this contributor is not the owner
              (isAdmin && !contributorIsOwner)

            return (
              <li key={index} className="c-colleague-info-row">
                <div className="c-colleague-info-row__avatar">
                  {!contributorIsPending ? (
                    <Avatar
                      initials={
                        contributor.firstName && contributor.lastName
                          ? (
                              contributor.firstName[0] + contributor.lastName[0]
                            ).toLocaleUpperCase()
                          : contributor.email?.slice(0, 2).toUpperCase()
                      }
                      image={contributor.profileImage}
                    />
                  ) : (
                    <div className="c-colleague-info-row__avatar--pending" />
                  )}
                </div>

                <div className="c-colleague-info-row__info">
                  {(contributor.firstName || contributor.lastName) && (
                    <p>{`${contributor.firstName} ${contributor.lastName}`}</p>
                  )}

                  <p className="c-colleague-info-row__info__email">
                    {!contributorIsPending
                      ? contributor.email?.slice(0, 32)
                      : `${contributor.inviteEmail} (${tText(
                          'shared/components/share-with-colleagues/share-with-colleagues___pending',
                        )})`}
                  </p>
                </div>

                <div
                  className={clsx({
                    'c-colleague-info-row__rights': true,
                    'u-text-muted': showConflictIcon,
                  })}
                >
                  <span>{getContributorRightLabel(contributor.rights)}</span>
                </div>

                <div className="c-colleague-info-row__action">
                  {showConflictIcon && assignment?.education_level_id && (
                    <Tooltip position="top">
                      <TooltipTrigger>
                        <button className="c-icon-button u-text-muted">
                          <Icon name={IconName.info} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {
                          GET_EDUCATION_LEVEL_DIFFERENCE_DICT()[
                            assignment.education_level_id
                          ]
                        }
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {canEdit && (
                    <button
                      className="c-icon-button"
                      onClick={() => handleEditContributorRights(contributor)}
                    >
                      <Icon name={IconName.edit4} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className="c-icon-button"
                      onClick={() => handleDeleteContributor(contributor)}
                    >
                      <Icon name={IconName.trash} />
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )
    }
  }

  const changeRightsOptions =
    useMemo((): SelectOption<ContributorInfoRight>[] => {
      const options: SelectOption<ContributorInfoRight>[] = []
      if (
        commonUser?.permissions?.includes(
          availableRights[ContributorInfoRight.CONTRIBUTOR],
        )
      ) {
        options.push({
          label: getContributorRightLabel(ContributorInfoRight.CONTRIBUTOR),
          value: ContributorInfoRight.CONTRIBUTOR,
        })
      }
      if (
        commonUser?.permissions?.includes(
          availableRights[ContributorInfoRight.VIEWER],
        )
      ) {
        options.push({
          label: getContributorRightLabel(ContributorInfoRight.VIEWER),
          value: ContributorInfoRight.VIEWER,
        })
      }
      if (currentUser.rights === ContributorInfoRight.OWNER) {
        options.push({
          label: tText(
            'shared/components/share-with-colleagues/modals/edit-share-user-rights-modal___eigenaarschap-overdragen',
          ),
          value: ContributorInfoRight.OWNER,
        })
      }
      return options
    }, [commonUser?.permissions, currentUser.rights, getContributorRightLabel])

  const rightsDropdownOptions = [
    ...(commonUser?.permissions?.includes(availableRights.CONTRIBUTOR)
      ? [
          {
            label: tText(
              'shared/components/share-with-colleagues/share-with-colleagues___bijdrager',
            ),
            id: ContributorInfoRight.CONTRIBUTOR,
            key: ContributorInfoRight.CONTRIBUTOR,
          },
        ]
      : []),
    ...(commonUser?.permissions?.includes(availableRights.VIEWER)
      ? [
          {
            label: tText(
              'shared/components/share-with-colleagues/share-with-colleagues___kijker',
            ),
            id: ContributorInfoRight.VIEWER,
            key: ContributorInfoRight.VIEWER,
          },
        ]
      : []),
  ]
  return (
    <>
      {(currentUser.rights === ContributorInfoRight.OWNER ||
        currentUser.rights === ContributorInfoRight.CONTRIBUTOR ||
        isAdmin) && (
        <>
          <section className="u-spacer-bottom">
            <div className="c-add-colleague">
              <TextInput
                type="email"
                className="c-add-colleague__input"
                placeholder={tText(
                  'shared/components/share-with-colleagues/share-with-colleagues___emailadres',
                )}
                value={contributor.email}
                onChange={(value) => updateNewContributor({ email: value })}
              />

              <Dropdown isOpen={isRightsDropdownOpen}>
                <DropdownButton>
                  <Button
                    icon={
                      isRightsDropdownOpen
                        ? IconName.caretUp
                        : IconName.caretDown
                    }
                    iconPosition="right"
                    onClick={handleRightsButtonClicked}
                    label={
                      contributor.rights
                        ? getContributorRightLabel(contributor.rights)
                        : tText(
                            'shared/components/share-with-colleagues/share-with-colleagues___rol',
                          )
                    }
                    className="c-add-colleague__select"
                  />
                </DropdownButton>

                <DropdownContent>
                  <MenuContent
                    menuItems={rightsDropdownOptions}
                    onClick={(id) => {
                      updateNewContributor({ rights: id as string })
                      handleRightsButtonClicked()
                    }}
                  />
                </DropdownContent>
              </Dropdown>

              <Button
                icon={IconName.add}
                label={tText(
                  'shared/components/share-with-colleagues/share-with-colleagues___voeg-toe',
                )}
                className="c-add-colleague__button"
                onClick={handleAddNewContributor}
                disabled={isEmpty(contributor.email) || !contributor.rights}
                type="secondary"
              />
            </div>

            {error && <p className="c-add-colleague__error">{error}</p>}
          </section>

          <EditShareUserRightsModal
            toEditContributorRight={
              toEditContributor?.rights as ContributorInfoRight
            }
            isOpen={isEditRightsModalOpen}
            handleClose={() => handleOnCloseEditUserRights()}
            handleConfirm={(right) => handleConfirmEditContributorRights(right)}
            options={changeRightsOptions}
            assignment={assignment}
          />

          {toDeleteContributor && (
            <ConfirmModal
              title={
                compareUsersEmail(
                  toDeleteContributor as ContributorInfo,
                  currentUser,
                )
                  ? tText(
                      'shared/components/share-with-colleagues/share-with-colleagues___opdracht-verlaten',
                    )
                  : tText(
                      'shared/components/share-with-colleagues/share-with-colleagues___toegang-intrekken',
                    )
              }
              body={
                compareUsersEmail(
                  toDeleteContributor as ContributorInfo,
                  currentUser,
                )
                  ? tText(
                      'shared/components/share-with-colleagues/share-with-colleagues___ben-je-zeker-dat-je-deze-opdracht-wilt-verlaten-als-kijker-deze-actie-kan-niet-ongedaan-gemaakt-worden',
                    )
                  : tText(
                      'shared/components/share-with-colleagues/share-with-colleagues___ben-je-zeker-dat-je-voor-deze-lesgever-de-toegang-wil-intrekken-dit-wil-zeggen-dat-deze-persoon-de-opdracht-niet-meer-kan-bekijken-of-bewerken',
                    )
              }
              confirmLabel={
                compareUsersEmail(
                  toDeleteContributor as ContributorInfo,
                  currentUser,
                )
                  ? tText(
                      'shared/components/share-with-colleagues/share-with-colleagues___verlaat-opdracht',
                    )
                  : tText(
                      'shared/components/share-with-colleagues/share-with-colleagues___trek-toegang-in',
                    )
              }
              isOpen={isDeleteUserModalOpen}
              confirmCallback={handleConfirmDeleteContributor}
              onClose={() => handleOnCloseDeleteContributor()}
            />
          )}

          <ConfirmModal
            body={tHtml(
              'shared/components/share-with-colleagues/share-with-colleagues___opdracht-delen-waarschuwing-beschrijving',
            )}
            cancelLabel={tText(
              'shared/components/share-with-colleagues/share-with-colleagues___annuleren',
            )}
            confirmButtonType="primary"
            confirmCallback={addNewContributor}
            confirmLabel={tText(
              'shared/components/share-with-colleagues/share-with-colleagues___delen',
            )}
            isOpen={isShareWarningModalOpen}
            onClose={handleOnCloseShareWarningModal}
            title={tHtml(
              'shared/components/share-with-colleagues/share-with-colleagues___opdracht-delen-waarschuwing',
            )}
            rememberKey={
              ConfirmModalRememberKey.AVO__REMEMBER__SHARE_WITH_COLLEAGUES
            }
            size="medium"
          />
        </>
      )}

      {renderColleaguesInfoList()}

      {isLoading && (
        <Spacer margin={'small'}>
          <Flex>
            <Spinner />
          </Flex>
        </Spacer>
      )}
    </>
  )
}
