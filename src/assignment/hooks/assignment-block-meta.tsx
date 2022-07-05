import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import React, { ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_PATH } from '../../constants';
import { SearchFilter } from '../../search/search.const';
import { buildLink, formatDate } from '../../shared/helpers';

export function useAssignmentBlockMeta(): (block: AssignmentBlock) => ReactNode | null {
	const [t] = useTranslation();

	return useCallback(
		(block: AssignmentBlock) => {
			const organisation = block.item_meta?.organisation?.name;
			const publishedAt = block.item_meta?.published_at;
			const series = block.item_meta?.series;

			return organisation || publishedAt || series ? (
				<section className="u-spacer-bottom">
					{organisation && (
						<div>
							{t('assignment/views/assignment-edit___uitzender')}:{` ${organisation}`}
						</div>
					)}

					{publishedAt && (
						<div>
							{t('assignment/views/assignment-edit___uitgezonden')}:
							{` ${formatDate(publishedAt)}`}
						</div>
					)}

					{series && (
						<div>
							{t('assignment/views/assignment-edit___reeks')}:{' '}
							<Link
								target="_blank"
								to={buildLink(APP_PATH.SEARCH.route, undefined, {
									filters: JSON.stringify({
										[SearchFilter.serie]: [series],
									}),
								})}
							>
								{series}
							</Link>
						</div>
					)}
				</section>
			) : null;
		},
		[t]
	);
}
