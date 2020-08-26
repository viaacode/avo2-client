import { isString } from 'lodash-es';
import queryString from 'query-string';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	BlockPageOverview,
	ButtonAction,
	ContentItemStyle,
	ContentTabStyle,
	LabelObj,
	PageInfo,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ContentPage } from '../../../../../content-page/views';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../../../shared/components';
import { ROUTE_PARTS } from '../../../../../shared/constants';
import {
	CustomError,
	getEnv,
	navigate,
	navigateToContentType,
} from '../../../../../shared/helpers';
import { fetchWithLogout } from '../../../../../shared/helpers/fetch-with-logout';
import { useDebounce } from '../../../../../shared/hooks';
import { ToastService } from '../../../../../shared/services';
import { ContentPageService } from '../../../../../shared/services/content-page-service';
import i18n from '../../../../../shared/translations/i18n';
import { ContentService } from '../../../../content/content.service';
import { ContentPageInfo } from '../../../../content/content.types';
import { convertToContentPageInfos } from '../../../../content/helpers/parsers';
import { ContentTypeAndLabelsValue } from '../../../../shared/components/ContentTypeAndLabelsPicker/ContentTypeAndLabelsPicker';
import { Color } from '../../../../shared/types';
import { GET_DARK_BACKGROUND_COLOR_OPTIONS } from '../../../content-block.const';

export interface ContentPageOverviewParams {
	withBlock: boolean;
	contentType: string;
	labelIds: number[];
	orderByProp?: string;
	orderByDirection?: 'asc' | 'desc';
	offset: number;
	limit: number;
}

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
	headerBackgroundColor: Color;
}

const PageOverviewWrapper: FunctionComponent<PageOverviewWrapperProps & RouteComponentProps> = ({
	contentTypeAndTabs = {
		selectedContentType: 'PROJECT',
		selectedLabels: null,
	},
	tabStyle = 'MENU_BAR',
	allowMultiple = false,
	centerHeader = false,
	itemStyle = 'NEWS_LIST',
	showTitle = true,
	showDescription = true,
	showDate = false,
	buttonLabel = i18n.t(
		'admin/content-block/components/page-overview-wrapper/page-overview-wrapper___lees-meer'
	),
	itemsPerPage = 20,
	headerBackgroundColor,
	history,
}) => {
	const [t] = useTranslation();

	const [currentPage, setCurrentPage] = useState<number>(0);
	const [selectedTabs, setSelectedTabs] = useState<LabelObj[]>([]);
	const [pages, setPages] = useState<ContentPageInfo[] | null>(null);
	const [pageCount, setPageCount] = useState<number | null>(null);
	const [focusedPageId, setFocusedPageId] = useState<number | undefined>(undefined);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	const debouncedItemsPerPage = useDebounce(itemsPerPage || 1000, 200); // Default to 1000 if itemsPerPage is zero

	const dbToPageOverviewContentPage = (contentPageInfo: ContentPageInfo): PageInfo => {
		return {
			thumbnail_path: contentPageInfo.thumbnail_path || '/images/placeholder-wide.png',
			labels: ((contentPageInfo.labels || []) as Avo.ContentPage.Label[]).map(labelObj => ({
				id: labelObj.id,
				label: labelObj.label,
			})),
			created_at:
				contentPageInfo.published_at ||
				contentPageInfo.publish_at ||
				contentPageInfo.created_at,
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

	const fetchPages = useCallback(async () => {
		try {
			const selectedLabelIds = selectedTabs.map(labelObj => labelObj.id);
			const blockLabelIds = ((contentTypeAndTabs.selectedLabels ||
				[]) as Avo.ContentPage.Label[]).map(labelObj => labelObj.id);
			const body: ContentPageOverviewParams = {
				withBlock: itemStyle === 'ACCORDION',
				contentType: contentTypeAndTabs.selectedContentType,
				labelIds:
					selectedLabelIds && selectedLabelIds.length ? selectedLabelIds : blockLabelIds,
				orderByProp: 'published_at',
				orderByDirection: 'desc',
				offset: currentPage * debouncedItemsPerPage,
				limit: debouncedItemsPerPage,
			};
			const reply = await fetchWithLogout(`${getEnv('PROXY_URL')}/content-pages/overview`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(body),
			});

			const response = await reply.json();
			setPages(convertToContentPageInfos(response.pages));
			setPageCount(Math.ceil(response.count / debouncedItemsPerPage));
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch pages', err, {
					query: 'GET_CONTENT_PAGES',
					variables: {
						offset: currentPage * debouncedItemsPerPage,
						limit: debouncedItemsPerPage,
					},
				})
			);
			setLoadingInfo({
				state: 'error',
				message: t(
					'admin/content-block/components/page-overview-wrapper/page-overview-wrapper___het-ophalen-van-de-paginas-is-mislukt'
				),
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		itemStyle,
		currentPage,
		debouncedItemsPerPage,
		setPages,
		setPageCount,
		contentTypeAndTabs.selectedContentType,
		// Deep compare by value and not by ref
		// https://github.com/facebook/react/issues/14476#issuecomment-471199055
		// eslint-disable-next-line react-hooks/exhaustive-deps
		JSON.stringify(contentTypeAndTabs.selectedLabels),
		selectedTabs,
		t,
	]);

	const checkFocusedFilterAndPage = useCallback(async () => {
		try {
			const queryParams = queryString.parse(window.location.search);
			const hasLabel = queryParams.label && isString(queryParams.label);
			const hasItem = queryParams.item && isString(queryParams.item);
			if (hasLabel) {
				const labelObj = (contentTypeAndTabs.selectedLabels || []).find(
					l => l.label === queryParams.label
				);
				if (labelObj) {
					setSelectedTabs([{ label: labelObj.label, id: labelObj.id }]);
				}
			}
			if (hasItem) {
				const contentPage = await ContentPageService.getContentPageByPath(
					queryParams.item as string
				);
				if (!contentPage) {
					throw new CustomError('No pages were found with the provided path');
				}
				setFocusedPageId(contentPage.id);
			}
		} catch (err) {
			console.error('Failed to fetch content page by path', err, {
				queryParams: window.location.search,
			});
			ToastService.danger(
				t(
					'admin/content-block/components/wrappers/page-overview-wrapper/page-overview-wrapper___het-ophalen-van-het-te-focussen-item-is-mislukt'
				)
			);
		}
	}, [setFocusedPageId, contentTypeAndTabs.selectedLabels, t]);

	useEffect(() => {
		fetchPages();
	}, [fetchPages]);

	useEffect(() => {
		checkFocusedFilterAndPage();
	}, [checkFocusedFilterAndPage]);

	useEffect(() => {
		if (pages && pageCount) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [pages, pageCount]);

	const handleCurrentPageChanged = (pageIndex: number) => {
		setCurrentPage(pageIndex);
	};

	const handleSelectedTabsChanged = (tabs: LabelObj[]) => {
		setSelectedTabs(tabs);
		setCurrentPage(0);
	};

	const renderPageOverviewBlock = () => {
		return (
			<BlockPageOverview
				tabs={contentTypeAndTabs.selectedLabels || []}
				darkTabs={
					!!headerBackgroundColor &&
					GET_DARK_BACKGROUND_COLOR_OPTIONS().includes(headerBackgroundColor)
				}
				selectedTabs={selectedTabs}
				onSelectedTabsChanged={handleSelectedTabsChanged}
				currentPage={currentPage}
				onCurrentPageChanged={handleCurrentPageChanged}
				pageCount={pageCount || 1}
				pages={(pages || []).map(dbToPageOverviewContentPage)}
				tabStyle={tabStyle}
				itemStyle={itemStyle}
				allowMultiple={allowMultiple}
				centerHeader={centerHeader}
				showTitle={showTitle}
				showDescription={showDescription}
				showDate={showDate}
				dateString={t(
					'admin/content-block/components/page-overview-wrapper/page-overview-wrapper___geplaatst-label-op-date'
				)}
				allLabel={t(
					'admin/content-block/components/page-overview-wrapper/page-overview-wrapper___alle'
				)}
				noLabel={t(
					'admin/content-block/components/page-overview-wrapper/page-overview-wrapper___overige'
				)}
				buttonLabel={buttonLabel}
				activePageId={focusedPageId}
				onLabelClicked={(label: string) =>
					navigate(history, `/${ROUTE_PARTS.news}`, {}, `label=${label}`)
				}
				navigate={(buttonAction: ButtonAction) =>
					navigateToContentType(buttonAction, history)
				}
			/>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={pages}
			render={renderPageOverviewBlock}
		/>
	);
};

export default withRouter(PageOverviewWrapper);
