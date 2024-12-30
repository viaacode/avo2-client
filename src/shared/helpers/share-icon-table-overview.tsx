import { Icon, IconName, Tooltip, TooltipContent, TooltipTrigger } from '@viaa/avo2-components';
import { type Avo, ShareWithColleagueTypeEnum } from '@viaa/avo2-types';
import { compact } from 'lodash-es';
import React, { type ReactNode } from 'react';

import { renderMobileDesktop } from './renderMobileDesktop';
import { tHtml } from './translate-html';
import { tText } from './translate-text';

export function contributorsToString(
	contributors: Avo.Assignment.Contributor[] | Avo.Collection.Contributor[] | null | undefined
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
		})
	).join(', ');
}

export function createShareIconTableOverview(
	shareType: ShareWithColleagueTypeEnum | undefined,
	contributors: Avo.Assignment.Contributor[] | Avo.Collection.Contributor[] | null | undefined,
	contentType: 'assignment' | 'collection',
	triggerClassName: string
) {
	const shareTypeTitle =
		shareType &&
		{
			[ShareWithColleagueTypeEnum.GEDEELD_MET_MIJ]: tText(
				'shared/helpers/share-icon-table-overview___gedeeld-met-mij'
			),
			[ShareWithColleagueTypeEnum.GEDEELD_MET_ANDERE]: tText(
				'shared/helpers/share-icon-table-overview___gedeeld-met-anderen'
			),
			[ShareWithColleagueTypeEnum.NIET_GEDEELD]:
				contentType === 'assignment'
					? tText('shared/helpers/share-icon-table-overview___mijn-opdracht')
					: tText('shared/helpers/share-icon-table-overview___mijn-collectie'),
		}[shareType];

	let shareTypeText: ReactNode;
	const count = contributors?.length;
	const names = contributorsToString(contributors);
	switch (shareType) {
		case ShareWithColleagueTypeEnum.GEDEELD_MET_ANDERE:
			shareTypeText = tHtml(
				'shared/helpers/share-icon-table-overview___b-gedeeld-met-count-anderen-b-names',
				{
					count,
					names,
				}
			);
			break;

		case ShareWithColleagueTypeEnum.GEDEELD_MET_MIJ:
			if ((contributors?.length || 0) > 1) {
				shareTypeText = tHtml(
					'shared/helpers/share-icon-table-overview___b-gedeeld-met-mij-en-count-anderen-b-br-names',
					{
						count,
						names,
					}
				);
			} else {
				shareTypeText = tHtml('shared/helpers/share-icon-table-overview___gedeeld-met-mij');
			}
			break;

		case ShareWithColleagueTypeEnum.NIET_GEDEELD:
		default:
			shareTypeText =
				contentType === 'assignment'
					? tHtml('shared/helpers/share-icon-table-overview___mijn-opdracht')
					: tHtml('shared/helpers/share-icon-table-overview___mijn-collectie');
	}

	const shareTypeIcon =
		shareType === ShareWithColleagueTypeEnum.GEDEELD_MET_MIJ
			? IconName.userGroup
			: shareType === ShareWithColleagueTypeEnum.GEDEELD_MET_ANDERE
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
