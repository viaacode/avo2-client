import { get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { withRouter } from 'react-router';
import { compose } from 'redux';

import {
	BlockPageOverview,
	ButtonAction,
	ContentItemStyle,
	ContentPageInfo,
	ContentTabStyle,
	LabelObj,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { getUserGroupIds } from '../../../../../authentication/authentication.service';
import { DefaultSecureRouteProps } from '../../../../../authentication/components/SecuredRoute';
import { ContentPage } from '../../../../../content-page/views';
import { CustomError, navigateToContentType } from '../../../../../shared/helpers';
import withUser from '../../../../../shared/hocs/withUser';
import { useDebounce } from '../../../../../shared/hooks';
import { dataService, ToastService } from '../../../../../shared/services';
import i18n from '../../../../../shared/translations/i18n';
import { GET_CONTENT_PAGES, GET_CONTENT_PAGES_WITH_BLOCKS } from '../../../../content/content.gql';
import { DbContent } from '../../../../content/content.types';
import { ContentTypeAndLabelsValue } from '../../../../shared/components/ContentTypeAndLabelsPicker/ContentTypeAndLabelsPicker';

interface PageOverviewWrapperProps {
	contentTypeAndTabs: ContentTypeAndLabelsValue;
	tabStyle?: ContentTabStyle;
	allowMultiple?: boolean;
	centerHeader?: boolean;
	headerBackgroundColor?: string;
	itemStyle?: ContentItemStyle;
	showTitle?: boolean;
	showDescription?: boolean;
	showDate?: boolean;
	buttonLabel?: string;
	itemsPerPage?: number;
}

const PageOverviewWrapper: FunctionComponent<PageOverviewWrapperProps &
	DefaultSecureRouteProps> = ({
	contentTypeAndTabs = {
		selectedContentType: 'PROJECT',
		selectedLabels: [],
	},
	tabStyle = 'MENU_BAR',
	allowMultiple = false,
	centerHeader = false,
	headerBackgroundColor = 'transparent',
	itemStyle = 'LIST',
	showTitle = true,
	showDescription = true,
	showDate = false,
	buttonLabel = i18n.t(
		'admin/content-block/components/page-overview-wrapper/page-overview-wrapper___lees-meer'
	),
	itemsPerPage = 20,
	history,
	user,
}) => {
	const [t] = useTranslation();

	const [currentPage, setCurrentPage] = useState<number>(0);
	const [selectedTabs, setSelectedTabs] = useState<LabelObj[]>([]);
	const [pages, setPages] = useState<DbContent[]>([]);
	const [pageCount, setPageCount] = useState<number>(1);

	const debouncedItemsPerPage = useDebounce(itemsPerPage || 1000, 200); // Default to 1000 if itemsPerPage is zero

	const dbToPageOverviewContentPage = (dbContentPage: Avo.Content.Content): ContentPageInfo => {
		return {
			thumbnail_path: '/images/placeholder.png',
			labels: [],
			created_at: dbContentPage.created_at,
			description: dbContentPage.description,
			title: dbContentPage.title,
			id: dbContentPage.id,
			blocks: dbContentPage.contentBlockssBycontentId ? (
				<ContentPage contentPage={dbContentPage} />
			) : null,
			content_width: dbContentPage.content_width,
			path: dbContentPage.path as string, // TODO enforce path in database
		};
	};

	const fetchPages = useCallback(async () => {
		try {
			const userGroupIds: number[] = getUserGroupIds(user);

			const selectedLabelIds = selectedTabs.map(labelObj => labelObj.id);
			const response = await dataService.query({
				query:
					itemStyle === 'ACCORDION' ? GET_CONTENT_PAGES_WITH_BLOCKS : GET_CONTENT_PAGES,
				variables: {
					where: {
						_and: [
							{
								// Get content pages with the selected content type
								content_type: { _eq: contentTypeAndTabs.selectedContentType },
							},
							{
								// Get pages that are visible to the current user
								_or: userGroupIds.map(userGroupId => ({
									user_group_ids: { _contains: userGroupId },
								})),
							},
							// Get pages for the selected labels if some labels are selected
							...(selectedLabelIds.length
								? [
										{
											content_content_labels: {
												content_label: { id: { _in: selectedLabelIds } },
											},
										},
								  ]
								: []),
						],
					},
					offset: currentPage * debouncedItemsPerPage,
					limit: debouncedItemsPerPage,
				},
			});
			setPages(get(response, 'data.app_content', []));
			setPageCount(
				Math.ceil(
					get(response, 'data.app_content_aggregate.aggregate.count', 0) /
						debouncedItemsPerPage
				)
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch pages', err, {
					query: 'GET_CONTENT',
					variables: {
						offset: currentPage * debouncedItemsPerPage,
						limit: debouncedItemsPerPage,
					},
				})
			);
			ToastService.danger(
				t(
					'admin/content-block/components/page-overview-wrapper/page-overview-wrapper___het-ophalen-van-de-paginas-is-mislukt'
				)
			);
		}
	}, [
		selectedTabs,
		itemStyle,
		currentPage,
		debouncedItemsPerPage,
		setPages,
		setPageCount,
		contentTypeAndTabs,
		user,
		t,
	]);

	useEffect(() => {
		fetchPages();
	}, [fetchPages]);

	const handleCurrentPageChanged = (pageIndex: number) => {
		setCurrentPage(pageIndex);
	};

	const handleSelectedTabsChanged = (tabs: LabelObj[]) => {
		setSelectedTabs(tabs);
		setCurrentPage(0);
	};

	return (
		<BlockPageOverview
			tabs={contentTypeAndTabs.selectedLabels}
			selectedTabs={selectedTabs}
			onSelectedTabsChanged={handleSelectedTabsChanged}
			currentPage={currentPage}
			onCurrentPageChanged={handleCurrentPageChanged}
			pageCount={pageCount}
			pages={pages.map(dbToPageOverviewContentPage)}
			tabStyle={tabStyle}
			itemStyle={itemStyle}
			allowMultiple={allowMultiple}
			centerHeader={centerHeader}
			headerBackgroundColor={headerBackgroundColor}
			showTitle={showTitle}
			showDescription={showDescription}
			showDate={showDate}
			dateString={t(
				'admin/content-block/components/page-overview-wrapper/page-overview-wrapper___geplaatst-in-label-op-date'
			)}
			allLabel={t(
				'admin/content-block/components/page-overview-wrapper/page-overview-wrapper___alle'
			)}
			noLabel={t(
				'admin/content-block/components/page-overview-wrapper/page-overview-wrapper___overige'
			)}
			buttonLabel={buttonLabel}
			navigate={(buttonAction: ButtonAction) => navigateToContentType(buttonAction, history)}
		/>
	);
};

export default compose(withRouter, withUser)(PageOverviewWrapper) as FunctionComponent<
	PageOverviewWrapperProps
>;
