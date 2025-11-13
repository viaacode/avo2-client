import { type Avo } from '@viaa/avo2-types'

import {
  type ContributorInfo,
  ContributorInfoRight,
} from '../../shared/components/ShareWithColleagues/ShareWithColleagues.types';
import { type ShareWithPupilsProps } from '../../shared/components/ShareWithPupils/ShareWithPupils';
import { tText } from '../../shared/helpers/translate-text';
import { ToastService } from '../../shared/services/toast-service';
import { AssignmentService } from '../assignment.service';

export async function onEditContributor(
  contributor: ContributorInfo,
  newRights: ContributorInfoRight,
  shareWithPupilsProps: ShareWithPupilsProps,
  fetchContributors: () => void,
  refetchAssignment: () => void,
) {
  try {
    if (shareWithPupilsProps && refetchAssignment) {
      if (newRights === ContributorInfoRight.OWNER) {
        await AssignmentService.transferAssignmentOwnerShip(
          shareWithPupilsProps.assignment?.id as string,
          contributor.profileId as string,
        )

        await refetchAssignment()

        ToastService.success(
          tText(
            'assignment/components/assignment-actions___eigenaarschap-is-succesvol-overgedragen',
          ),
        )
      } else {
        await AssignmentService.editContributorRights(
          shareWithPupilsProps.assignment?.id as string,
          contributor.contributorId as string,
          newRights,
        )

        await fetchContributors()

        ToastService.success(
          tText(
            'assignment/components/assignment-actions___rol-van-de-gebruiker-is-aangepast',
          ),
        )
      }
    }
  } catch (err) {
    ToastService.danger(
      tText(
        'assignment/components/assignment-actions___er-liep-iets-fout-met-het-aanpassen-van-de-collega-rol',
      ),
    )
  }
}

export async function onAddNewContributor(
  info: Partial<ContributorInfo>,
  shareWithPupilsProps: ShareWithPupilsProps,
  fetchContributors: () => void,
  inviter?: Avo.User.CommonUser,
) {
  try {
    await AssignmentService.addContributor(
      shareWithPupilsProps?.assignment,
      info,
      inviter,
    )

    await fetchContributors()

    ToastService.success(
      tText(
        'assignment/components/assignment-actions___uitnodiging-tot-samenwerken-is-verstuurd',
      ),
    )
  } catch (err) {
    ToastService.danger(
      tText(
        'assignment/components/assignment-actions___er-liep-iets-fout-met-het-uitnodigen-van-een-collega',
      ),
    )
  }
}

export async function onDeleteContributor(
  info: ContributorInfo,
  shareWithPupilsProps: ShareWithPupilsProps,
  fetchContributors: () => void,
) {
  try {
    await AssignmentService.deleteContributor(
      shareWithPupilsProps?.assignment?.id as string,
      info.contributorId,
      info.profileId,
    )

    await fetchContributors()

    ToastService.success(
      tText(
        'assignment/components/assignment-actions___gebruiker-is-verwijderd-van-de-opdracht',
      ),
    )
  } catch (err) {
    ToastService.danger(
      tText(
        'assignment/components/assignment-actions___er-liep-iets-fout-met-het-verwijderen-van-een-collega',
      ),
    )
  }
}
