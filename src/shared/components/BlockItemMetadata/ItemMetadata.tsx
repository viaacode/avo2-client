import { type Avo } from '@viaa/avo2-types';
import React, { type FC, type ReactNode } from 'react';

import { formatDate } from '../../helpers/formatters/date';
import { tHtml } from '../../helpers/translate-html';

export type ItemMetadataProps = {
	item: Avo.Item.Item;
	buildSeriesLink?: (series: string) => ReactNode | string;
};

export const ItemMetadata: FC<ItemMetadataProps> = ({
	item,
	buildSeriesLink = (series: string) => series,
}) => {
	const organisation = item?.organisation?.name;
	const broadcastDate = item?.issued;
	const series = item?.series;

	return organisation || broadcastDate || series ? (
		<section className="u-spacer-bottom">
			{organisation && (
				<div>
					{tHtml('shared/components/block-item-metadata/block-item-metadata___uitzender')}
					: <b>{organisation}</b>
				</div>
			)}

			{broadcastDate && (
				<div>
					{tHtml(
						'shared/components/block-item-metadata/block-item-metadata___uitgezonden'
					)}
					: <b>{formatDate(broadcastDate)}</b>
				</div>
			)}

			{series && (
				<div>
					{tHtml('shared/components/block-item-metadata/block-item-metadata___reeks')}:{' '}
					<b>{buildSeriesLink(series)}</b>
				</div>
			)}
		</section>
	) : null;
};
