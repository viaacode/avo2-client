import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { APP_PATH } from '../../constants';
import { SEARCH_FILTER_STATE_SERIES_PROP } from '../../shared/constants';
import { buildLink, formatDate } from '../../shared/helpers';

export function useAssignmentBlockMeta() {
	const [t] = useTranslation();

	return useCallback(
		(block: AssignmentBlock) => {
			const organisation = block.item?.organisation?.name;
			const publishedAt = block.item?.published_at;
			const series = block.item?.series;

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
										[SEARCH_FILTER_STATE_SERIES_PROP]: [series],
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
