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
import { compact, get } from 'lodash';
import moment from 'moment';
import React, { FunctionComponent } from 'react';

import { getUserGroupLabel } from '../../../authentication/helpers/get-profile-info';
import Html from '../../../shared/components/Html/Html';
import { formatDate, getFullName } from '../../../shared/helpers';
import useTranslation from '../../../shared/hooks/useTranslation';
import {
	renderDateDetailRows,
	renderDetailRow,
	renderSimpleDetailRows,
} from '../../shared/helpers/render-detail-fields';
import { useUserGroupOptions } from '../../user-groups/hooks/useUserGroupOptions';
import { GET_CONTENT_WIDTH_OPTIONS } from '../content.const';
import { ContentService } from '../content.service';
import { ContentPageInfo } from '../content.types';
import { useContentTypes } from '../hooks';

interface ContentDetailMetaDataProps {
	contentPageInfo: ContentPageInfo;
}

export const ContentDetailMetaData: FunctionComponent<ContentDetailMetaDataProps> = ({
	contentPageInfo,
}) => {
	const { tText, tHtml } = useTranslation();

	const [contentTypes] = useContentTypes();
	const [allUserGroupOptions] = useUserGroupOptions('TagInfo', true) as [TagInfo[], boolean];

	// Methods
	const getUserGroups = (contentPageInfo: ContentPageInfo): TagOption[] => {
		const tagInfos: TagInfo[] = compact(
			(contentPageInfo.user_group_ids || []).map(
				(userGroupId: number): TagInfo | undefined => {
					return allUserGroupOptions.find(
						(userGroup: TagInfo) => userGroup.value === userGroupId
					);
				}
			)
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
				label: tText('admin/menu/components/menu-edit-form/menu-edit-form___niemand'),
			},
		];
	};

	const getContentPageWidthLabel = (contentPageInfo: ContentPageInfo): string => {
		return get(
			GET_CONTENT_WIDTH_OPTIONS().find(
				(option) => option.value === contentPageInfo.content_width
			),
			'label',
			'-'
		);
	};

	const definePublishedAt = (contentPageInfo: ContentPageInfo) => {
		const { published_at, publish_at, depublish_at } = contentPageInfo;

		if (published_at) {
			return formatDate(published_at);
		}

		if (
			publish_at &&
			depublish_at &&
			moment().isBetween(moment(publish_at), moment(depublish_at))
		) {
			return formatDate(publish_at);
		}

		if (!depublish_at && publish_at && moment().isAfter(moment(publish_at))) {
			return formatDate(publish_at);
		}

		if (!publish_at && depublish_at && moment().isBefore(moment(depublish_at))) {
			return tText('admin/content/views/content-detail-meta-data___ja');
		}

		return tText('admin/content/views/content-detail-meta-data___nee');
	};
	const description = ContentService.getDescription(contentPageInfo, 'full');
	return (
		<Container mode="vertical" size="small">
			<Container mode="horizontal">
				{!!description && (
					<Spacer margin="bottom-large">
						<BlockHeading type="h4">
							{tHtml('admin/content/views/content-detail___omschrijving')}
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
							tText('admin/content/views/content-detail___cover-afbeelding')
						)}
						{renderSimpleDetailRows(contentPageInfo, [
							['title', tText('admin/content/views/content-detail___titel')],
						])}
						{renderDetailRow(
							description || '-',
							tText('admin/content/views/content-detail___beschrijving')
						)}
						{renderSimpleDetailRows(contentPageInfo, [
							[
								'seo_description',
								tText(
									'admin/content/views/content-detail-meta-data___seo-beschrijving'
								),
							],
							[
								'meta_description',
								tText(
									'admin/content/views/content-detail-meta-data___beschrijving-voor-export-bv-klaar-nieuwsbrief'
								),
							],
							['path', tText('admin/content/views/content-detail___pad')],
							[
								'is_protected',
								tText('admin/content/views/content-detail___beschermde-pagina'),
							],
						])}
						{renderDetailRow(
							get(
								contentTypes.find(
									(type) => type.value === contentPageInfo.content_type
								),
								'label'
							) || '-',
							tText('admin/content/views/content-detail___content-type')
						)}
						{renderDetailRow(
							getContentPageWidthLabel(contentPageInfo),
							tText('admin/content/views/content-detail___breedte')
						)}
						{renderDetailRow(
							get(contentPageInfo, 'profile.user')
								? getFullName(get(contentPageInfo, 'profile'), false, false)
								: '-',
							tText('admin/content/views/content-detail___auteur')
						)}
						{renderDetailRow(
							getUserGroupLabel(contentPageInfo.profile) || '-',
							tText('admin/content/views/content-detail___auteur-rol')
						)}
						{renderDateDetailRows(contentPageInfo, [
							[
								'created_at',
								tText('admin/content/views/content-detail___aangemaakt'),
							],
							[
								'updated_at',
								tText('admin/content/views/content-detail___laatst-bewerkt'),
							],
						])}
						{renderDetailRow(
							<p>{definePublishedAt(contentPageInfo)}</p>,
							tText('admin/content/views/content-detail___gepubliceerd')
						)}
						{renderDetailRow(
							<p>
								{formatDate(contentPageInfo.publish_at) ||
									tText('admin/content/views/content-detail-meta-data___n-v-t')}
							</p>,
							tText(
								'admin/content/views/content-detail-meta-data___wordt-gepubliceerd-op'
							)
						)}
						{renderDetailRow(
							<p>
								{formatDate(contentPageInfo.depublish_at) ||
									tText('admin/content/views/content-detail-meta-data___n-v-t')}
							</p>,
							tText(
								'admin/content/views/content-detail-meta-data___wordt-gedepubliceerd-op'
							)
						)}
						{renderDetailRow(
							<TagList
								swatches={false}
								selectable={false}
								closable={false}
								tags={getUserGroups(contentPageInfo)}
							/>,
							tText('admin/content/views/content-detail___toegankelijk-voor')
						)}
						{renderDetailRow(
							<TagList
								swatches={false}
								selectable={false}
								closable={false}
								tags={contentPageInfo.labels
									.filter((labelObj) => labelObj.label && labelObj.id)
									.map((labelObj) => ({
										label: labelObj.label as string,
										id: String(labelObj.id),
									}))}
							/>,
							tText('admin/content/views/content-detail___labels')
						)}
					</tbody>
				</Table>
			</Container>
		</Container>
	);
};
