import { Column, Spacer } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import React, { FC, ReactNode } from 'react';

import { SearchFilter } from '../../../search/search.const';
import { FilterState } from '../../../search/search.types';
import { formatDate } from '../../helpers';
import { getGroupedLomsKeyValue } from '../../helpers/lom';
import { tText } from '../../helpers/translate';
import LomInfoField from '../LomInfoField/LomInfoField';

type CommonMetadataProps = {
	subject: Avo.Collection.Collection | Avo.Assignment.Assignment;
	enabledMetaData: SearchFilter[];
	renderSearchLink: (
		linkText: string | ReactNode,
		newFilters: FilterState,
		className?: string
	) => ReactNode;
};

const CommonMetadata: FC<CommonMetadataProps> = ({
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
							label={tText('Onderwijs niveaus')}
							lomLabels={groupedLomsLabels.educationLevel}
							searchFilterType={SearchFilter.educationLevel}
							renderSearchLink={renderSearchLink}
						/>
					)}

					{isEducationDegreeEnabled && (
						<LomInfoField
							id={id}
							label={tText('Onderwijsgraad')}
							lomLabels={groupedLomsLabels.educationDegree}
							searchFilterType={SearchFilter.educationDegree}
							renderSearchLink={renderSearchLink}
						/>
					)}

					{isSubjectEnabled && (
						<LomInfoField
							id={id}
							label={tText('Vakken')}
							lomLabels={groupedLomsLabels.subject}
							searchFilterType={SearchFilter.subject}
							renderSearchLink={renderSearchLink}
						/>
					)}

					{isThemeEnabled && (
						<LomInfoField
							id={id}
							label={tText("Thema's")}
							lomLabels={groupedLomsLabels.theme}
							searchFilterType={SearchFilter.thema}
							renderSearchLink={renderSearchLink}
						/>
					)}
				</Column>
			)}
			<Column size="3-3">
				<Spacer margin="top-large">
					<p className="u-text-bold">{tText('Aangemaakt op')}</p>
					<p className="c-body-1">{formatDate(created_at)}</p>
				</Spacer>
			</Column>
			<Column size="3-3">
				<Spacer margin="top-large">
					<p className="u-text-bold">{tText('Laatst aangepast op')}</p>
					<p className="c-body-1">{formatDate(updated_at)}</p>
				</Spacer>
			</Column>
		</>
	);
};

export default CommonMetadata;