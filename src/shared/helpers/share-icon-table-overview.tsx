import {
  Icon,
  IconName,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@viaa/avo2-components';
import {
  AvoAssignmentContributor,
  AvoCollectionContributor,
  AvoShareShareWithColleagueType,
} from '@viaa/avo2-types';
import { compact } from 'es-toolkit';
import { type ReactNode } from 'react';
import { renderMobileDesktop } from './renderMobileDesktop';
import { tHtml } from './translate-html';
import { tText } from './translate-text';

export function contributorsToString(
  contributors:
    | AvoAssignmentContributor[]
    | AvoCollectionContributor[]
    | null
    | undefined,
) {
  return compact(
    (contributors || []).map((contributor) => {
      if (!contributor.profile) {
        return null;
      }
      const fullName = contributor.profile?.user?.full_name;
      const orgName = contributor.profile?.organisation?.name
        ? `(${contributor.profile?.organisation?.name})`
        : undefined;

      return compact([fullName, orgName]).join(' ');
    }),
  ).join(', ');
}

export function createShareIconTableOverview(
  shareType: AvoShareShareWithColleagueType | undefined,
  contributors:
    | AvoAssignmentContributor[]
    | AvoCollectionContributor[]
    | null
    | undefined,
  contentType: 'assignment' | 'collection',
  triggerClassName: string,
) {
  const shareTypeTitle =
    shareType &&
    {
      [AvoShareShareWithColleagueType.GEDEELD_MET_MIJ]: tText(
        'shared/helpers/share-icon-table-overview___gedeeld-met-mij',
      ),
      [AvoShareShareWithColleagueType.GEDEELD_MET_ANDERE]: tText(
        'shared/helpers/share-icon-table-overview___gedeeld-met-anderen',
      ),
      [AvoShareShareWithColleagueType.NIET_GEDEELD]:
        contentType === 'assignment'
          ? tText('shared/helpers/share-icon-table-overview___mijn-opdracht')
          : tText('shared/helpers/share-icon-table-overview___mijn-collectie'),
    }[shareType];

  let shareTypeText: ReactNode;
  const count = contributors?.length;
  const names = contributorsToString(contributors);
  switch (shareType) {
    case AvoShareShareWithColleagueType.GEDEELD_MET_ANDERE:
      shareTypeText = tHtml(
        'shared/helpers/share-icon-table-overview___b-gedeeld-met-count-anderen-b-names',
        {
          count: count || 0,
          names,
        },
      );
      break;

    case AvoShareShareWithColleagueType.GEDEELD_MET_MIJ:
      if ((contributors?.length || 0) > 1) {
        shareTypeText = tHtml(
          'shared/helpers/share-icon-table-overview___b-gedeeld-met-mij-en-count-anderen-b-br-names',
          {
            count: count || 0,
            names,
          },
        );
      } else {
        shareTypeText = tHtml(
          'shared/helpers/share-icon-table-overview___gedeeld-met-mij',
        );
      }
      break;

    case AvoShareShareWithColleagueType.NIET_GEDEELD:
    default:
      shareTypeText =
        contentType === 'assignment'
          ? tHtml('shared/helpers/share-icon-table-overview___mijn-opdracht')
          : tHtml('shared/helpers/share-icon-table-overview___mijn-collectie');
  }

  const shareTypeIcon =
    shareType === AvoShareShareWithColleagueType.GEDEELD_MET_MIJ
      ? IconName.userGroup
      : shareType === AvoShareShareWithColleagueType.GEDEELD_MET_ANDERE
        ? IconName.userGroup2
        : IconName.user2;
  return renderMobileDesktop({
    mobile: null,
    desktop: (
      <Tooltip position="top">
        <TooltipTrigger>
          <div className={triggerClassName} title={shareTypeTitle || ''}>
            <Icon name={shareTypeIcon} />
          </div>
        </TooltipTrigger>
        <TooltipContent>{shareTypeText}</TooltipContent>
      </Tooltip>
    ),
  });
}
