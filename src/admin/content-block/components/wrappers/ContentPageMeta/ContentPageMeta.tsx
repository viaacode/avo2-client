import { Button } from '@viaa/avo2-components';
import { format } from 'date-fns';
import React, { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { getProfileName } from '../../../../../authentication/helpers/get-profile-info';
import { navigateToContentType } from '../../../../../shared/helpers';
import { ContentPageLabel } from '../../../../content-page-labels/content-page-label.types';
import { ContentPageInfo } from '../../../../content/content.types';
import { getPublishedDate } from '../../../../content/helpers/get-published-state';

export interface ContentPageMetaProps {
	contentPageInfo: ContentPageInfo;
}

const ContentPageMeta: FunctionComponent<ContentPageMetaProps & RouteComponentProps> = ({
	contentPageInfo,
	history,
}) => {
	const [t] = useTranslation();

	const renderLabel = (labelObj: ContentPageLabel) => {
		return (labelObj as any).link_to ? (
			<Button
				type="inline-link"
				onClick={() => navigateToContentType((labelObj as any).link_to, history)}
				key={`label-link-${labelObj.label}`}
			>
				{labelObj.label}
			</Button>
		) : (
			labelObj.label
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

	const publishedDate = getPublishedDate(contentPageInfo);
	return (
		<span>
			{t(
				'admin/content-block/components/wrappers/block-content-page-meta/block-content-page-meta___gepubliceerd-op'
			)}{' '}
			{publishedDate ? format(new Date(publishedDate), 'd MMMM yyyy') : '-'} {renderLabels()}
			{`${t(
				'admin/content-block/components/wrappers/block-content-page-meta/block-content-page-meta___door'
			)}`}{' '}
			{getProfileName(contentPageInfo.profile?.user)}
		</span>
	);
};

export default withRouter(ContentPageMeta) as unknown as FunctionComponent<ContentPageMetaProps>;
