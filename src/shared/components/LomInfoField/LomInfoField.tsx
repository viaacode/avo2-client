import { Spacer } from '@viaa/avo2-components';
import React, { FC, ReactNode } from 'react';

import { SearchFilter } from '../../../search/search.const';
import { FilterState } from '../../../search/search.types';
import { renderSearchLinks } from '../../helpers';

type LomInfoFieldProps = {
	id: string;
	label: string;
	lomLabels: string[] | null;
	searchFilterType: SearchFilter;
	renderSearchLink: (
		linkText: string | ReactNode,
		newFilters: FilterState,
		className?: string
	) => ReactNode;
};

const LomInfoField: FC<LomInfoFieldProps> = ({
	id,
	label,
	lomLabels,
	searchFilterType,
	renderSearchLink,
}) => {
	return (
		<Spacer margin="top-large">
			<p className="u-text-bold">{label}</p>

			<p className="c-body-1">
				{lomLabels && lomLabels.length ? (
					renderSearchLinks(renderSearchLink, id, searchFilterType, lomLabels)
				) : (
					<span className="u-d-block">-</span>
				)}
			</p>
		</Spacer>
	);
};

export default LomInfoField;
