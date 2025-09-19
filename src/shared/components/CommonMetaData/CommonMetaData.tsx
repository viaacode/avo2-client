import { Column, Spacer } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC, type ReactNode } from 'react';

import { SearchFilter } from '../../../search/search.const';
import { type FilterState } from '../../../search/search.types';
import { formatDate } from '../../helpers/formatters';
import { getGroupedLomsKeyValue } from '../../helpers/lom';
import { tText } from '../../helpers/translate-text';
import LomInfoField from '../LomInfoField/LomInfoField';

type CommonMetadataProps = {
	subject: { loms?: Avo.Lom.Lom[] | null; created_at?: string; updated_at?: string; id: string };
	enabledMetaData: SearchFilter[];
	renderSearchLink: (
		linkText: string | ReactNode,
		newFilters: FilterState,
		className?: string
	) => ReactNode;
};

export const CommonMetadata: FC<CommonMetadataProps> = ({
	subject,
	enabledMetaData,
	renderSearchLink,
}) => {
	const { id, created_at, updated_at, loms } = subject;
	const groupedLomsLabels = getGroupedLomsKeyValue(loms || [], 'label');
	const isEducationLevelEnabled = enabledMetaData.includes(SearchFilter.educationLevel);
	const isEducationDegreeEnabled = enabledMetaData.includes(SearchFilter.educationDegree);
	const isSubjectEnabled = enabledMetaData.includes(SearchFilter.subject);
	const isThemeEnabled = enabledMetaData.includes(SearchFilter.thema);
	const isDatesEnabled = enabledMetaData.includes(SearchFilter.broadcastDate);

	return (
		<>
			{(isEducationLevelEnabled ||
				isSubjectEnabled ||
				isEducationDegreeEnabled ||
				isThemeEnabled) && (
				<Column size="3-3">
					{isEducationLevelEnabled && (
						<LomInfoField
							id={id}
							label={tText(
								'shared/components/common-meta-data/common-meta-data___onderwijs-niveaus'
							)}
							lomLabels={groupedLomsLabels.educationLevel}
							searchFilterType={SearchFilter.educationLevel}
							renderSearchLink={renderSearchLink}
						/>
					)}

					{isEducationDegreeEnabled && (
						<LomInfoField
							id={id}
							label={tText(
								'shared/components/common-meta-data/common-meta-data___onderwijsgraad'
							)}
							lomLabels={groupedLomsLabels.educationDegree}
							searchFilterType={SearchFilter.educationDegree}
							renderSearchLink={renderSearchLink}
						/>
					)}

					{isSubjectEnabled && (
						<LomInfoField
							id={id}
							label={tText(
								'shared/components/common-meta-data/common-meta-data___vakken'
							)}
							lomLabels={groupedLomsLabels.subject}
							searchFilterType={SearchFilter.subject}
							renderSearchLink={renderSearchLink}
						/>
					)}

					{isThemeEnabled && (
						<LomInfoField
							id={id}
							label={tText(
								'shared/components/common-meta-data/common-meta-data___themas'
							)}
							lomLabels={groupedLomsLabels.theme}
							searchFilterType={SearchFilter.thema}
							renderSearchLink={renderSearchLink}
						/>
					)}
				</Column>
			)}
			{isDatesEnabled && (
				<>
					<Column size="3-3">
						<Spacer margin="top-large">
							<p className="u-text-bold">
								{tText(
									'shared/components/common-meta-data/common-meta-data___aangemaakt-op'
								)}
							</p>
							<p className="c-body-1">{formatDate(created_at)}</p>
						</Spacer>
					</Column>
					<Column size="3-3">
						<Spacer margin="top-large">
							<p className="u-text-bold">
								{tText(
									'shared/components/common-meta-data/common-meta-data___laatst-aangepast-op'
								)}
							</p>
							<p className="c-body-1">{formatDate(updated_at)}</p>
						</Spacer>
					</Column>
				</>
			)}
		</>
	);
};
