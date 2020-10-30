import { cloneDeep, compact, get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router';
import { NumberParam, QueryParamConfig, StringParam, useQueryParams } from 'use-query-params';

import {
	BlockPageOverview,
	ContentItemStyle,
	ContentTabStyle,
	LabelObj,
	PageInfo,
	RenderLinkFunction,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ContentPage } from '../../../../../content-page/views';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../../../shared/components';
import { ROUTE_PARTS } from '../../../../../shared/constants';
import { CustomError, getEnv, navigate } from '../../../../../shared/helpers';
import { fetchWithLogout } from '../../../../../shared/helpers/fetch-with-logout';
import { useDebounce } from '../../../../../shared/hooks';
import { ToastService } from '../../../../../shared/services';
import { ContentPageService } from '../../../../../shared/services/content-page-service';
import i18n from '../../../../../shared/translations/i18n';
import { ContentService } from '../../../../content/content.service';
import { ContentPageInfo } from '../../../../content/content.types';
import { convertToContentPageInfos } from '../../../../content/helpers/parsers';
import { ContentTypeAndLabelsValue } from '../../../../shared/components/ContentTypeAndLabelsPicker/ContentTypeAndLabelsPicker';
import { CheckboxListParam } from '../../../../shared/helpers/query-string-converters';
import { Color } from '../../../../shared/types';
import { GET_DARK_BACKGROUND_COLOR_OPTIONS } from '../../../content-block.const';

export interface ContentPageOverviewParams {
	withBlock: boolean;
	contentType: string;
	// Visible tabs in the page overview component for which we should fetch item counts
	labelIds: number[];
	// Selected tabs for which we should fetch content page items
	selectedLabelIds: number[];
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
	renderLink: RenderLinkFunction;
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
	renderLink,
	history,
}) => {
	const [t] = useTranslation();

	const queryParamConfig: { [queryParamId: string]: QueryParamConfig<any> } = {
		page: NumberParam,
		item: StringParam,
		label: CheckboxListParam,
	};
	const [queryParamsState, setQueryParamsState] = useQueryParams(queryParamConfig);
	const [pages, setPages] = useState<ContentPageInfo[] | null>(null);
	const [pageCount, setPageCount] = useState<number | null>(null);
	const [labelPageCounts, setLabelPageCounts] = useState<{ [id: number]: number } | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [selectedTabObjects, setSelectedTabObjects] = useState<LabelObj[]>([]);
	const [focusedPage, setFocusedPage] = useState<PageInfo | null>(null);

	const debouncedItemsPerPage = useDebounce(itemsPerPage || 1000, 200); // Default to 1000 if itemsPerPage is zero

	const dbToPageOverviewContentPage = (contentPageInfo: ContentPageInfo): PageInfo => {
		return {
			thumbnail_path: contentPageInfo.thumbnail_path || '/images/placeholder-wide.png',
			labels: ((contentPageInfo.labels || []) as Avo.ContentPage.Label[]).map((labelObj) => ({
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
			// Map labels in query params to label objects
			let selectedTabs: LabelObj[] = [];
			if (queryParamsState.label) {
				if (queryParamsState.label.length) {
					selectedTabs = compact(
						(queryParamsState.label || []).map((labelName: string) => {
							return (contentTypeAndTabs.selectedLabels || []).find((labelObj) => {
								return labelObj.label === labelName;
							});
						})
					);
					setSelectedTabObjects(selectedTabs);
				} else {
					setSelectedTabObjects([]);
				}
			}

			let tempFocusedPage: PageInfo | undefined;
			if (queryParamsState.item) {
				const contentPage = await ContentPageService.getContentPageByPath(
					queryParamsState.item
				);
				if (contentPage) {
					tempFocusedPage = dbToPageOverviewContentPage(contentPage);
					setFocusedPage(tempFocusedPage);
				} else {
					console.error(
						new CustomError(
							'Failed to find content page by path to set it as the expanded item for the page overview wrapper component',
							null,
							{
								path: queryParamsState.item,
								contentPage,
							}
						)
					);
					ToastService.danger(
						t('Het opgegeven item kon niet worden gevonden: ') + queryParamsState.item
					);
				}
			}

			const selectedLabelIds = selectedTabs.map((labelObj) => labelObj.id);
			const blockLabelIds = ((contentTypeAndTabs.selectedLabels ||
				[]) as Avo.ContentPage.Label[]).map((labelObj) => labelObj.id);
			const body: ContentPageOverviewParams = {
				withBlock: itemStyle === 'ACCORDION',
				contentType: contentTypeAndTabs.selectedContentType,
				labelIds: (contentTypeAndTabs.selectedLabels || []).map((labelObj) => labelObj.id),
				selectedLabelIds:
					selectedLabelIds && selectedLabelIds.length ? selectedLabelIds : blockLabelIds,
				orderByProp: 'published_at',
				orderByDirection: 'desc',
				offset: queryParamsState.page * debouncedItemsPerPage,
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

			// Set the pages on the state after removing the page that will be shown at the top (?item=/path)
			setPages(
				convertToContentPageInfos(response.pages).filter(
					(page) => page.id !== get(tempFocusedPage, 'id')
				)
			);
			setPageCount(Math.ceil(response.count / debouncedItemsPerPage));
			setLabelPageCounts(response.labelCounts);
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch pages', err, {
					query: 'GET_CONTENT_PAGES',
					variables: {
						offset: queryParamsState.page * debouncedItemsPerPage,
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
		queryParamsState,
		debouncedItemsPerPage,
		setPages,
		setPageCount,
		contentTypeAndTabs.selectedContentType,
		// Deep compare by value and not by ref
		// https://github.com/facebook/react/issues/14476#issuecomment-471199055
		// eslint-disable-next-line react-hooks/exhaustive-deps
		JSON.stringify(contentTypeAndTabs.selectedLabels),
		t,
	]);

	useEffect(() => {
		fetchPages();
	}, [fetchPages]);

	useEffect(() => {
		if (pages && pageCount) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [pages, pageCount]);

	const handleCurrentPageChanged = (pageIndex: number) => {
		setQueryParamsState((oldQueryParamState) => {
			return {
				...cloneDeep(oldQueryParamState),
				page: pageIndex,
				item: undefined,
			};
		});
	};

	const handleSelectedTabsChanged = (tabs: LabelObj[]) => {
		setQueryParamsState((oldQueryParamState) => {
			return {
				...cloneDeep(oldQueryParamState),
				label: tabs.map((tab) => tab.label),
				page: 0,
				item: undefined,
			};
		});
	};

	const getLabelsWithContent = () => {
		return (contentTypeAndTabs.selectedLabels || []).filter(
			(labelInfo: Avo.ContentPage.Label) => (labelPageCounts || {})[labelInfo.id] > 0
		);
	};

	const renderPageOverviewBlock = () => {
		return (
			<BlockPageOverview
				tabs={getLabelsWithContent()}
				darkTabs={
					!!headerBackgroundColor &&
					GET_DARK_BACKGROUND_COLOR_OPTIONS().includes(headerBackgroundColor)
				}
				selectedTabs={selectedTabObjects}
				onSelectedTabsChanged={handleSelectedTabsChanged}
				currentPage={queryParamsState.page}
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
				focusedPage={focusedPage}
				onLabelClicked={(label: string) =>
					navigate(history, `/${ROUTE_PARTS.news}`, {}, `label=${label}`)
				}
				renderLink={renderLink}
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
