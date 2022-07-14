import { Avo } from '@viaa/avo2-types';
import { ItemSchema } from '@viaa/avo2-types/types/item';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_PATH } from '../../constants';
import { SearchFilter } from '../../search/search.const';
import { buildLink, formatDate } from '../../shared/helpers';

export type AssignmentBlockMetaProps = {
	block: Avo.Core.BlockItemBase;
};

export const AssignmentBlockMeta: FC<AssignmentBlockMetaProps> = ({ block }) => {
	const [t] = useTranslation();

	const organisation = block.item_meta?.organisation?.name;
	const broadcastDate = (block.item_meta as Avo.Item.Item)?.issued;
	const series = (block.item_meta as ItemSchema)?.series;

	return organisation || broadcastDate || series ? (
		<section className="u-spacer-bottom">
			{organisation && (
				<div>
					{t('assignment/views/assignment-edit___uitzender')}:{` ${organisation}`}
				</div>
			)}

			{broadcastDate && (
				<div>
					{t('assignment/views/assignment-edit___uitgezonden')}:
					{` ${formatDate(broadcastDate)}`}
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
};
