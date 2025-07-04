import { IconName, MetaData, MetaDataItem, Thumbnail } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC, type ReactNode } from 'react';

import {
	formatDate,
	formatDurationHoursMinutesSeconds,
	formatTimestamp,
} from '../../shared/helpers/formatters';
import { tText } from '../../shared/helpers/translate-text';
import { truncateTableValue } from '../../shared/helpers/truncate';
import { bookWidgetsLogo, smartSchoolLogo } from '../embed-code.const';
import { type EmbedCode, EmbedCodeExternalWebsite } from '../embed-code.types';

import './EmbedCodeFilterTableCell.scss';

export interface EmbedCodeFilterTableCellProps {
	id: string;
	data: Partial<EmbedCode>;
	onNameClick: (data: Partial<EmbedCode>) => void;
	actions?: (data?: EmbedCodeFilterTableCellProps['data']) => ReactNode;
}

const EmbedCodeFilterTableCell: FC<EmbedCodeFilterTableCellProps> = ({
	id,
	data,
	onNameClick,
	actions = () => null,
}) => {
	const getItemTimestamp = (date: string | undefined) => {
		return <span title={formatTimestamp(date)}>{formatDate(date)}</span>;
	};

	const renderThumbnail = ({ content, thumbnailPath }: Partial<EmbedCode>) => (
		<Thumbnail
			alt="thumbnail"
			category={(content as Avo.Item.Item)?.type?.label}
			className="m-embed-code-cell-thumbnail"
			src={thumbnailPath}
			showCategoryIcon
		/>
	);

	const renderTitle = ({ content, contentType, title }: Partial<EmbedCode>) => (
		<div className="c-content-header">
			<h3 className="c-content-header__header" onClick={() => onNameClick(data)}>
				{truncateTableValue(title)}
			</h3>
			<div className="c-content-header__meta u-text-muted">
				<MetaData category={contentType}>
					<MetaDataItem>
						{content?.created_at && (
							<span
								title={`Aangemaakt: ${formatDate(new Date(content?.created_at))}`}
							>
								{formatDate(new Date(content?.created_at))}
							</span>
						)}
					</MetaDataItem>
					<MetaDataItem
						icon={IconName.eye}
						label={String((content as Avo.Item.Item)?.item_counts?.views || 0)}
					/>
				</MetaData>
			</div>
		</div>
	);

	const renderEmbedType = ({ externalWebsite }: Partial<EmbedCode>) => {
		if (externalWebsite === EmbedCodeExternalWebsite.SMARTSCHOOL) {
			return (
				<span className="u-nowrap">
					<img
						className="o-svg-icon prepend-logo"
						src={smartSchoolLogo}
						alt={tText(
							'embed-code/components/embed-code-filter-table-cell___smartschool-logo'
						)}
					/>
					{tText('embed-code/components/embed-code-filter-table-cell___smartschool')}
				</span>
			);
		}
		if (externalWebsite === EmbedCodeExternalWebsite.BOOKWIDGETS) {
			return (
				<span className="u-nowrap">
					<img
						className="o-svg-icon prepend-logo"
						src={bookWidgetsLogo}
						alt={tText(
							'embed-code/components/embed-code-filter-table-cell___bookwidgets-logo'
						)}
					/>
					{tText('embed-code/components/embed-code-filter-table-cell___bookwidgets')}
				</span>
			);
		}
		return null;
	};

	switch (id) {
		case 'thumbnail':
			return renderThumbnail(data);

		case 'title':
			return renderTitle(data);

		case 'createdAt':
			return getItemTimestamp(data?.createdAt);

		case 'updatedAt':
			return getItemTimestamp(data?.updatedAt);

		case 'externalWebsite':
			return renderEmbedType(data);

		case 'start': {
			const cellData = `${formatDurationHoursMinutesSeconds(
				data.start
			)} - ${formatDurationHoursMinutesSeconds(data.end)}`;
			return (
				<span className="time-code" title={cellData}>
					{cellData}
				</span>
			);
		}
		case 'action':
			return <>{actions(data)}</>;
	}

	return null;
};

export default EmbedCodeFilterTableCell;
