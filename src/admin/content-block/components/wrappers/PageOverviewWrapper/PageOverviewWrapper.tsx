import { get, isString } from 'lodash-es';
import queryString from 'query-string';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { withRouter } from 'react-router';
import { compose } from 'redux';

import {
	BlockPageOverview,
	ButtonAction,
	ContentItemStyle,
	ContentTabStyle,
	LabelObj,
	PageInfo,
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
import { ContentService } from '../../../../content/content.service';
import { ContentPageInfo } from '../../../../content/content.types';
import { convertToContentPageInfos } from '../../../../content/helpers/parsers';
import { ContentTypeAndLabelsValue } from '../../../../shared/components/ContentTypeAndLabelsPicker/ContentTypeAndLabelsPicker';

interface PageOverviewWrapperProps {
	contentTypeAndTabs: ContentTypeAndLabelsValue;
	tabStyle?: ContentTabStyle;
	allowMultiple?: boolean;
	centerHeader?: boolean;
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
	itemStyle = 'LIST',
	showTitle = true,
	showDescription = true,
	showDate = false,
	buttonLabel = i18n.t(
		'admin/content-block/components/page-overview-wrapper/page-overview-wrapper___lees-meer'
	),
	itemsPerPage = 20,
	history,
	location,
	user,
}) => {
	const [t] = useTranslation();

	const [currentPage, setCurrentPage] = useState<number>(0);
	const [selectedTabs, setSelectedTabs] = useState<LabelObj[]>([]);
	const [pages, setPages] = useState<ContentPageInfo[]>([]);
	const [pageCount, setPageCount] = useState<number>(1);
	const [focusedPageId, setFocusedPageId] = useState<number | undefined>(undefined);

	const debouncedItemsPerPage = useDebounce(itemsPerPage || 1000, 200); // Default to 1000 if itemsPerPage is zero

	const dbToPageOverviewContentPage = (contentPageInfo: ContentPageInfo): PageInfo => {
		return {
			thumbnail_path: contentPageInfo.thumbnail_path || '/images/placeholder-wide.png',
			labels: ((contentPageInfo.labels || []) as Avo.ContentPage.Label[]).map(labelObj => ({
				id: labelObj.id,
				label: labelObj.label,
			})),
			created_at: contentPageInfo.created_at,
			description: ContentService.getDescription(contentPageInfo, 'full'),
			title: contentPageInfo.title,
			id: contentPageInfo.id,
			blocks: contentPageInfo.contentBlockConfigs ? (
				<ContentPage contentPageInfo={contentPageInfo} />
			) : null,
			content_width: contentPageInfo.content_width,
			path: contentPageInfo.path as string, // TODO enforce path in database
		};
	};

	const getLabelFilter = useCallback((): any[] => {
		const selectedLabelIds = selectedTabs.map(labelObj => labelObj.id);
		const blockLabelIds = ((get(contentTypeAndTabs, 'selectedLabels') ||
			[]) as Avo.ContentPage.Label[]).map(labelObj => labelObj.id);
		if (selectedLabelIds.length) {
			// The user selected some block labels at the top of the page overview component
			return [
				{
					content_content_labels: {
						content_label: { id: { _in: selectedLabelIds } },
					},
				},
			];
		}
		if (blockLabelIds.length) {
			// If the "all" label is selected, we want to get content pages with any of the block labels
			return [
				{
					content_content_labels: {
						content_label: { id: { _in: blockLabelIds } },
					},
				},
			];
		}
		return [];
	}, [selectedTabs, contentTypeAndTabs]);

	const fetchPages = useCallback(async () => {
		try {
			const userGroupIds: number[] = getUserGroupIds(user);

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
							...getLabelFilter(),
						],
					},
					offset: currentPage * debouncedItemsPerPage,
					limit: debouncedItemsPerPage,
				},
			});
			const dbPages = get(response, 'data.app_content', []);
			setPages(convertToContentPageInfos(dbPages));
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
		itemStyle,
		currentPage,
		debouncedItemsPerPage,
		setPages,
		setPageCount,
		contentTypeAndTabs,
		getLabelFilter,
		user,
		t,
	]);

	const checkFocusedFilterAndPage = useCallback(async () => {
		try {
			const queryParams = queryString.parse(location.search);
			const hasLabel = queryParams.label && isString(queryParams.label);
			const hasItem = queryParams.item && isString(queryParams.item);
			if (hasLabel) {
				const labelObj = contentTypeAndTabs.selectedLabels.find(
					l => l.label === queryParams.label
				);
				if (labelObj) {
					setSelectedTabs([{ label: labelObj.label, id: labelObj.id }]);
				}
			}
			if (hasItem) {
				const contentPage = await ContentService.fetchContentPageByPath(
					queryParams.item as string
				);
				if (!contentPage) {
					throw new CustomError('No pages were found with the provided path');
				}
				setFocusedPageId(contentPage.id);
			}
			if (hasItem || hasLabel) {
				// Clear query params to avoid inf loop
				history.push(location.pathname);
			}
		} catch (err) {
			console.error('Failed to fetch content page by path', err, {
				queryParams: location.search,
			});
			ToastService.danger(
				t(
					'admin/content-block/components/wrappers/page-overview-wrapper/page-overview-wrapper___het-ophalen-van-het-te-focussen-item-is-mislukt'
				)
			);
		}
	}, [
		location.search,
		setFocusedPageId,
		contentTypeAndTabs.selectedLabels,
		t,
		history,
		location.pathname,
	]);

	useEffect(() => {
		fetchPages();
		checkFocusedFilterAndPage();
	}, [fetchPages, checkFocusedFilterAndPage]);

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
			activePageId={focusedPageId}
			navigate={(buttonAction: ButtonAction) => navigateToContentType(buttonAction, history)}
		/>
	);
};

export default compose(withRouter, withUser)(PageOverviewWrapper) as FunctionComponent<
	PageOverviewWrapperProps
>;
