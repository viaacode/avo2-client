import { get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	BlockPageOverview,
	ButtonAction,
	ContentItemStyle,
	ContentPageInfo,
	ContentTabStyle,
	LabelObj,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { navigateToContentType } from '../../../../shared/helpers';
import { useDebounce } from '../../../../shared/hooks';
import { dataService } from '../../../../shared/services/data-service';
import i18n from '../../../../shared/translations/i18n';
import { GET_CONTENT_PAGES, GET_CONTENT_PAGES_WITH_BLOCKS } from '../../../content/content.gql';
import { ContentTypeAndLabelsValue } from '../../../shared/components/ContentTypeAndLabelsPicker/ContentTypeAndLabelsPicker';
import { ContentBlockConfig } from '../../content-block.types';
import { parseContentBlocks } from '../../helpers';

import toastService from '../../../../shared/services/toast-service';
import { ContentBlockPreview } from '../index';

interface PageOverviewWrapperProps extends RouteComponentProps {
	contentTypeAndTabs: ContentTypeAndLabelsValue;
	tabStyle?: ContentTabStyle;
	allowMultiple?: boolean;
	itemStyle?: ContentItemStyle;
	showTitle?: boolean;
	showDescription?: boolean;
	showDate?: boolean;
	buttonLabel?: string;
	itemsPerPage?: number;
}

const PageOverviewWrapper: FunctionComponent<PageOverviewWrapperProps> = ({
	contentTypeAndTabs = {
		selectedContentType: 'PROJECT',
		selectedLabels: [],
	},
	tabStyle = 'MENU_BAR',
	allowMultiple = false,
	itemStyle = 'LIST',
	showTitle = true,
	showDescription = true,
	showDate = false,
	buttonLabel = i18n.t('Lees meer'),
	itemsPerPage = 20,
	history,
}) => {
	const [t] = useTranslation();

	const [currentPage, setCurrentPage] = useState<number>(0);
	const [selectedTabs, setSelectedTabs] = useState<LabelObj[]>([]);
	const [pages, setPages] = useState<Avo.Content.Content[]>([] as Avo.Content.Content[]);
	const [pageCount, setPageCount] = useState<number>(1);

	const debouncedItemsPerPage = useDebounce(itemsPerPage || 1000, 200); // Default to 1000 if itemsPerPage is zero

	const renderContentPage = (contentPage: Avo.Content.Content) => {
		const contentBlockConfig: ContentBlockConfig[] = parseContentBlocks(
			contentPage.contentBlockssBycontentId
		);
		return contentBlockConfig.map((contentBlockConfig: ContentBlockConfig, index) => (
			<ContentBlockPreview
				key={contentPage.contentBlockssBycontentId[index].id}
				componentState={contentBlockConfig.components.state}
				contentWidth={(contentPage as any).content_width} // TODO: remove any with typings update
				blockState={contentBlockConfig.block.state}
			/>
		));
	};

	const dbToPageOverviewContentPage = (dbContentPage: Avo.Content.Content): ContentPageInfo => {
		return {
			thumbnail_path: '/images/placeholder.png',
			labels: [],
			created_at: dbContentPage.created_at,
			description: dbContentPage.description,
			title: dbContentPage.title,
			id: dbContentPage.id,
			blocks: dbContentPage.contentBlockssBycontentId ? renderContentPage(dbContentPage) : null,
			content_width: dbContentPage.content_width,
			path: dbContentPage.path,
		};
	};

	const fetchPages = useCallback(async () => {
		let filteredPages: Avo.Content.Content[] = [];
		let pageCount = 0;
		if (selectedTabs.length) {
			// TODO get contentPages from the database that have one of the selected groups
		} else {
			const response = await dataService.query({
				query: itemStyle === 'ACCORDION' ? GET_CONTENT_PAGES_WITH_BLOCKS : GET_CONTENT_PAGES,
				variables: {
					where: { content_type: { _eq: contentTypeAndTabs.selectedContentType } },
					offset: currentPage * debouncedItemsPerPage,
					limit: debouncedItemsPerPage,
				},
			});
			const pageArray: Avo.Content.Content[] = get(response, 'data.app_content', []);
			pageCount =
				get(response, 'data.app_content_aggregate.aggregate.count', 0) / debouncedItemsPerPage;
			filteredPages = pageArray;
		}
		setPages(filteredPages);
		setPageCount(Math.ceil(pageCount / debouncedItemsPerPage));
	}, [
		selectedTabs,
		itemStyle,
		currentPage,
		debouncedItemsPerPage,
		setPages,
		setPageCount,
		contentTypeAndTabs,
	]);

	useEffect(() => {
		fetchPages().catch(err => {
			toastService.danger(
				t('Het ophalen van de paginas is mislukt', err, {
					query: 'GET_CONTENT',
					variables: {
						offset: currentPage * debouncedItemsPerPage,
						limit: debouncedItemsPerPage,
					},
				})
			);
		});
	}, [
		contentTypeAndTabs.selectedContentType,
		selectedTabs,
		currentPage,
		setPageCount,
		setPages,
		fetchPages,
		debouncedItemsPerPage,
		t,
	]);

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
			showTitle={showTitle}
			showDescription={showDescription}
			showDate={showDate}
			dateString={t('Geplaatst in %label% op %date%')}
			allLabel={t('Alle')}
			noLabel={t('Overige')}
			buttonLabel={buttonLabel}
			navigate={(buttonAction: ButtonAction) => navigateToContentType(buttonAction, history)}
		/>
	);
};

export default withRouter(PageOverviewWrapper);
