import React, { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Avo } from '@viaa/avo2-types';

import { getProfileName } from '../../../../../authentication/helpers/get-profile-info';
import { ROUTE_PARTS } from '../../../../../shared/constants';
import { normalizeTimestamp } from '../../../../../shared/helpers/formatters';
import { ContentPageInfo } from '../../../../content/content.types';

export interface BlockContentPageMetaProps {
	contentPageInfo: ContentPageInfo;
}

const BlockContentPageMeta: FunctionComponent<BlockContentPageMetaProps> = ({
	contentPageInfo,
}) => {
	const [t] = useTranslation();

	const renderLabel = (labelObj: Partial<Avo.ContentPage.Label>) => {
		return (
			<Link
				to={`/${ROUTE_PARTS.news}?label=${labelObj.label}`}
				key={`label-link-${labelObj.label}`}
			>
				{labelObj.label}
			</Link>
		);
	};

	const renderLabels = (): ReactNode => {
		if (!contentPageInfo.labels || !contentPageInfo.labels.length) {
			return null;
		}

		return (
			<>
				{`${t(
					'admin/content-block/components/wrappers/block-content-page-meta/block-content-page-meta___in'
				)} `}
				{contentPageInfo.labels.map((labelObj, index) => {
					if (index === contentPageInfo.labels.length - 1) {
						return renderLabel(labelObj);
					}
					if (index === contentPageInfo.labels.length - 2) {
						return (
							<>
								{renderLabel(labelObj)}{' '}
								{t(
									'admin/content-block/components/wrappers/block-content-page-meta/block-content-page-meta___en'
								)}{' '}
							</>
						);
					}
					return <>{renderLabel(labelObj)}, </>;
				})}{' '}
			</>
		);
	};

	return (
		<span>
			{t(
				'admin/content-block/components/wrappers/block-content-page-meta/block-content-page-meta___gepubliceerd-op'
			)}{' '}
			{normalizeTimestamp(contentPageInfo.updated_at || contentPageInfo.created_at).format(
				'D MMMM YYYY'
			)}{' '}
			{renderLabels()}
			{`${t(
				'admin/content-block/components/wrappers/block-content-page-meta/block-content-page-meta___door'
			)}`}{' '}
			{getProfileName(contentPageInfo.profile.user)}
		</span>
	);
};

export default BlockContentPageMeta;
