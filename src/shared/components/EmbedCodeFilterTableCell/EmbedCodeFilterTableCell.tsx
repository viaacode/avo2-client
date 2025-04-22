import bookwidgetLogo from '@assets/images/bookwidget_logo.png';
import smartschoolLogo from '@assets/images/smartschool_logo.png';
import { IconName, MetaData, MetaDataItem, Thumbnail } from '@viaa/avo2-components';
import { type ItemSchema } from '@viaa/avo2-types/types/item';
import React, { type FC, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { formatDate, formatDurationHoursMinutesSeconds, formatTimestamp } from '../../helpers';
import { tText } from '../../helpers/translate-text';
import { truncateTableValue } from '../../helpers/truncate';
import { type EmbedCode, EmbedCodeExternalWebsite } from '../../types/embed-code';

export interface EmbedCodeFilterTableCellProps {
	id: string;
	data: EmbedCode;
	actions?: (data?: EmbedCodeFilterTableCellProps['data']) => ReactNode;
}

const EmbedCodeFilterTableCell: FC<EmbedCodeFilterTableCellProps> = ({
	id,
	data,
	actions = () => null,
}) => {
	const getItemTimestamp = (date: string) => {
		return <span title={formatTimestamp(date)}>{formatDate(date)}</span>;
	};

	const renderTitle = ({ content, contentType, title }: EmbedCode) => (
		<div className="u-d-flex">
			<Thumbnail
				alt="thumbnail"
				category={(content as ItemSchema)?.type?.label}
				className="m-collection-overview-thumbnail u-spacer-right"
				src={content.thumbnail_path || undefined}
				showCategoryIcon
			/>
			<div className="c-content-header">
				<h3 className="c-content-header__header">
					<Link onClick={console.log} title={title}>
						{truncateTableValue(title)}
					</Link>
				</h3>
				<div className="c-content-header__meta u-text-muted">
					<MetaData category={contentType}>
						<MetaDataItem>
							{content?.created_at && (
								<span
									title={`Aangemaakt: ${formatDate(
										new Date(content?.created_at)
									)}`}
								>
									{formatDate(new Date(content?.created_at))}
								</span>
							)}
						</MetaDataItem>
						<MetaDataItem
							icon={IconName.eye}
							label={String((content as ItemSchema)?.item_counts?.views || 0)}
						/>
					</MetaData>
				</div>
			</div>
		</div>
	);

	const renderEmbedType = ({ externalWebsite }: EmbedCode) => {
		if (externalWebsite === EmbedCodeExternalWebsite.SMARTSCHOOL) {
			return (
				<>
					<img
						className="o-svg-icon prepend-logo"
						src={smartschoolLogo}
						alt={tText('Smartschool logo')}
					/>
					{tText('Smartschool')}
				</>
			);
		}
		if (externalWebsite === EmbedCodeExternalWebsite.BOOKWIDGETS) {
			return (
				<>
					<img
						className="o-svg-icon prepend-logo"
						src={bookwidgetLogo}
						alt={tText('Bookwidgets logo')}
					/>
					{tText('Bookwidgets')}
				</>
			);
		}
		return null;
	};

	switch (id) {
		case 'title':
			return renderTitle(data);

		case 'createdAt':
			return getItemTimestamp(data.createdAt);

		case 'updatedAt':
			return getItemTimestamp(data.updatedAt);

		case 'externalWebsite':
			return renderEmbedType(data);

		case 'start': {
			const cellData = `${formatDurationHoursMinutesSeconds(
				data.start
			)} - ${formatDurationHoursMinutesSeconds(data.end)}`;
			return <span title={cellData}>{cellData}</span>;
		}
		case 'action':
			return <>{actions(data)}</>;
	}

	return null;
};

export default EmbedCodeFilterTableCell;
