import { Avo } from '@viaa/avo2-types';
import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { formatDate } from '../../helpers';

export type BlockItemMetadataProps = {
	block: BaseBlockWithMeta;
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
					{t('shared/components/block-item-metadata/block-item-metadata___uitzender')}:
					<b>{` ${organisation}`}</b>
				</div>
			)}

			{broadcastDate && (
				<div>
					{t('shared/components/block-item-metadata/block-item-metadata___uitgezonden')}:
					<b>{` ${formatDate(broadcastDate)}`}</b>
				</div>
			)}

			{series && (
				<div>
					{t('shared/components/block-item-metadata/block-item-metadata___reeks')}:
					<b> {buildSeriesLink(series)}</b>
				</div>
			)}
		</section>
	) : null;
};
