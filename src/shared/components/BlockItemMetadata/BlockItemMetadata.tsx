import { Avo } from '@viaa/avo2-types';
import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { formatDate } from '../../helpers';

export type BlockItemMetadataProps = {
	block: Avo.Core.BlockItemBase;
	buildSeriesLink?: (series: string) => ReactNode | string;
};

export const BlockItemMetadata: FC<BlockItemMetadataProps> = ({
	block,
	buildSeriesLink = (series: string) => series,
}) => {
	const [t] = useTranslation();

	const organisation = block.item_meta?.organisation?.name;
	const broadcastDate = (block.item_meta as Avo.Item.Item)?.issued;
	const series = (block.item_meta as Avo.Item.Item)?.series;

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
					{t('assignment/views/assignment-edit___reeks')}: {buildSeriesLink(series)}
				</div>
			)}
		</section>
	) : null;
};
