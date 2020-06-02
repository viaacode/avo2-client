import { compact, flatten, get } from 'lodash';
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
import { Avo } from '@viaa/avo2-types';

import Html from '../../../shared/components/Html/Html';
import { ToastService } from '../../../shared/services';
import { fetchAllUserGroups } from '../../../shared/services/user-groups-service';
import {
	renderDateDetailRows,
	renderDetailRow,
	renderSimpleDetailRows,
} from '../../shared/helpers/render-detail-fields';
import { GET_CONTENT_WIDTH_OPTIONS } from '../content.const';
import { DbContent } from '../content.types';

interface ContentDetailMetaDataProps {
	contentPage: DbContent;
}

export const ContentDetailMetaData: FunctionComponent<ContentDetailMetaDataProps> = ({
	contentPage,
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
	const getUserGroups = (contentPage: DbContent): TagOption[] => {
		const tagInfos: TagInfo[] = compact(
			(contentPage.user_group_ids || []).map((userGroupId: number): TagInfo | undefined => {
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

	const getLabels = (contentPage: DbContent): TagOption[] => {
		return flatten(
			(contentPage.content_content_labels || []).map(
				(contentLabelLink: Avo.Content.ContentLabelLink) => {
					return contentLabelLink.content_label;
				}
			)
		);
	};

	const getContentPageWidthLabel = (contentPage: DbContent): string => {
		return get(
			GET_CONTENT_WIDTH_OPTIONS().find(option => option.value === contentPage.content_width),
			'label',
			'-'
		);
	};

	return (
		<Container mode="vertical" size="small">
			<Container mode="horizontal">
				{!!contentPage.description && (
					<Spacer margin="bottom-large">
						<BlockHeading type="h4">
							<Trans i18nKey="admin/content/views/content-detail___omschrijving">
								Omschrijving:
							</Trans>
						</BlockHeading>
						<Html content={t('contentPage.description')} sanitizePreset="full" />
					</Spacer>
				)}

				<Table horizontal variant="invisible" className="c-table_detail-page">
					<tbody>
						{renderDetailRow(
							<div style={{ width: '400px' }}>
								<Thumbnail
									category="item"
									src={contentPage.thumbnail_path || undefined}
								/>
							</div>,
							t('admin/content/views/content-detail___cover-afbeelding')
						)}
						{renderSimpleDetailRows(contentPage, [
							['title', t('admin/content/views/content-detail___titel')],
							['description', t('admin/content/views/content-detail___beschrijving')],
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
							getContentPageWidthLabel(contentPage),
							t('admin/content/views/content-detail___breedte')
						)}
						{renderDetailRow(
							`${get(contentPage, 'profile.user.first_name')} ${get(
								contentPage,
								'profile.user.last_name'
							)}`,
							t('admin/content/views/content-detail___auteur')
						)}
						{renderDetailRow(
							get(contentPage, 'profile.user.role.label'),
							t('admin/content/views/content-detail___auteur-rol')
						)}
						{renderDateDetailRows(contentPage, [
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
							<TagList
								swatches={false}
								selectable={false}
								closable={false}
								tags={getUserGroups(contentPage)}
							/>,
							t('admin/content/views/content-detail___toegankelijk-voor')
						)}
						{renderDetailRow(
							<TagList
								swatches={false}
								selectable={false}
								closable={false}
								tags={getLabels(contentPage as DbContent)}
							/>,
							t('admin/content/views/content-detail___labels')
						)}
					</tbody>
				</Table>
			</Container>
		</Container>
	);
};
