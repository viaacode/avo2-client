import { compact, get } from 'lodash';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	BlockHeading,
	Container,
	Spacer,
	Table,
	TagInfo,
	TagList,
	TagOption,
	Thumbnail,
} from '@viaa/avo2-components';

import Html from '../../../shared/components/Html/Html';
import { ToastService } from '../../../shared/services';
import { fetchAllUserGroups } from '../../../shared/services/user-groups-service';
import {
	renderDateDetailRows,
	renderDetailRow,
	renderSimpleDetailRows,
} from '../../shared/helpers/render-detail-fields';
import { UserService } from '../../users/user.service';
import { GET_CONTENT_WIDTH_OPTIONS } from '../content.const';
import { ContentService } from '../content.service';
import { ContentPageInfo } from '../content.types';
import { formatDate } from '../../../shared/helpers';

interface ContentDetailMetaDataProps {
	contentPageInfo: ContentPageInfo;
}

export const ContentDetailMetaData: FunctionComponent<ContentDetailMetaDataProps> = ({
	contentPageInfo,
}) => {
	const [t] = useTranslation();

	const [allUserGroups, setAllUserGroups] = useState<TagInfo[]>([]);

	// Get labels of the contentPages, so we can show a readable error message
	useEffect(() => {
		fetchAllUserGroups()
			.then(userGroups => {
				setAllUserGroups(userGroups);
			})
			.catch((err: any) => {
				console.error('Failed to get user groups', err);
				ToastService.danger(
					t(
						'admin/shared/components/user-group-select/user-group-select___het-controleren-van-je-account-rechten-is-mislukt'
					),
					false
				);
			});
	}, [setAllUserGroups, t]);

	// Methods
	const getUserGroups = (contentPageInfo: ContentPageInfo): TagOption[] => {
		const tagInfos: TagInfo[] = compact(
			(contentPageInfo.user_group_ids || []).map((userGroupId: number):
				| TagInfo
				| undefined => {
				return allUserGroups.find(
					(userGroupOption: any) => userGroupOption.value === userGroupId
				);
			})
		);

		const tagOptions = tagInfos.map(
			(ug: TagInfo): TagOption => ({
				id: ug.value,
				label: ug.label,
			})
		);

		if (tagOptions && tagOptions.length) {
			return tagOptions;
		}

		return [
			{
				id: -3,
				label: t('admin/menu/components/menu-edit-form/menu-edit-form___niemand'),
			},
		];
	};

	const getContentPageWidthLabel = (contentPageInfo: ContentPageInfo): string => {
		return get(
			GET_CONTENT_WIDTH_OPTIONS().find(
				option => option.value === contentPageInfo.content_width
			),
			'label',
			'-'
		);
	};

	const description = ContentService.getDescription(contentPageInfo, 'full');
	return (
		<Container mode="vertical" size="small">
			<Container mode="horizontal">
				{!!description && (
					<Spacer margin="bottom-large">
						<BlockHeading type="h4">
							<Trans i18nKey="admin/content/views/content-detail___omschrijving">
								Omschrijving:
							</Trans>
						</BlockHeading>
						<Html content={description || '-'} sanitizePreset="full" />
					</Spacer>
				)}

				<Table horizontal variant="invisible" className="c-table_detail-page">
					<tbody>
						{renderDetailRow(
							<div style={{ width: '400px' }}>
								<Thumbnail
									category="item"
									src={contentPageInfo.thumbnail_path || undefined}
								/>
							</div>,
							t('admin/content/views/content-detail___cover-afbeelding')
						)}
						{renderSimpleDetailRows(contentPageInfo, [
							['title', t('admin/content/views/content-detail___titel')],
						])}
						{renderDetailRow(
							description || '-',
							t('admin/content/views/content-detail___beschrijving')
						)}
						{renderSimpleDetailRows(contentPageInfo, [
							[
								'seo_description',
								t(
									'admin/content/views/content-detail-meta-data___seo-beschrijving'
								),
							],
							[
								'content_type',
								t('admin/content/views/content-detail___content-type'),
							],
							['path', t('admin/content/views/content-detail___pad')],
							[
								'is_protected',
								t('admin/content/views/content-detail___beschermde-pagina'),
							],
						])}
						{renderDetailRow(
							getContentPageWidthLabel(contentPageInfo),
							t('admin/content/views/content-detail___breedte')
						)}
						{renderDetailRow(
							`${get(contentPageInfo, 'profile.user.first_name')} ${get(
								contentPageInfo,
								'profile.user.last_name'
							)}`,
							t('admin/content/views/content-detail___auteur')
						)}
						{renderDetailRow(
							UserService.getUserRoleLabel(get(contentPageInfo, 'profile')),
							t('admin/content/views/content-detail___auteur-rol')
						)}
						{renderDateDetailRows(contentPageInfo, [
							['created_at', t('admin/content/views/content-detail___aangemaakt')],
							[
								'updated_at',
								t('admin/content/views/content-detail___laatst-bewerkt'),
							],
							['publish_at', t('admin/content/views/content-detail___gepubliceerd')],
							[
								'depublish_at',
								t('admin/content/views/content-detail___gedepubliceerd'),
							],
						])}
						{renderDetailRow(
							<p>{formatDate(contentPageInfo.published_at) || 'Nee'}</p>,
							t('admin/content/views/content-detail___gepubliceerd')
						)}
						{renderDetailRow(
							<p>{formatDate(contentPageInfo.publish_at) || 'N.v.t'}</p>,
							t('Wordt gepubliceerd op')
						)}
						{renderDetailRow(
							<p>{formatDate(contentPageInfo.depublish_at) || 'N.v.t.'}</p>,
							t('Wordt gedepubliceerd op')
						)}
						{renderDetailRow(
							<TagList
								swatches={false}
								selectable={false}
								closable={false}
								tags={getUserGroups(contentPageInfo)}
							/>,
							t('admin/content/views/content-detail___toegankelijk-voor')
						)}
						{renderDetailRow(
							<TagList
								swatches={false}
								selectable={false}
								closable={false}
								tags={contentPageInfo.labels
									.filter(labelObj => labelObj.label && labelObj.id)
									.map(labelObj => ({
										label: labelObj.label as string,
										id: String(labelObj.id),
									}))}
							/>,
							t('admin/content/views/content-detail___labels')
						)}
					</tbody>
				</Table>
			</Container>
		</Container>
	);
};
