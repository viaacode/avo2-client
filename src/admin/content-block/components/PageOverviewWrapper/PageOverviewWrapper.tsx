import { get } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	BlockPageOverview,
	ContentPageInfo,
} from '@viaa/avo2-components/dist/content-blocks/BlockPageOverview/BlockPageOverview';
import { Avo } from '@viaa/avo2-types';

import { dataService } from '../../../../shared/services/data-service';
import i18n from '../../../../shared/translations/i18n';
import { GET_CONTENT } from '../../../content/content.gql';
import { ContentBlockConfig } from '../../content-block.types';
import { parseContentBlocks } from '../../helpers';

import { ContentBlockPreview } from '../index';

interface PageOverviewWrapperProps {
	tabs?: string[];
	tabStyle?: 'ROUNDED_BADGES' | 'MENU_BAR';
	allowMultiple?: boolean;
	contentType: string; // lookup options in lookup.enum_content_types
	itemStyle?: 'GRID' | 'LIST';
	showTitle?: boolean;
	showDescription?: boolean;
	showDate?: boolean;
	buttonLabel?: string;
	itemsPerPage?: number;
}

const PageOverviewWrapper: FunctionComponent<PageOverviewWrapperProps> = ({
	tabs = [],
	tabStyle = 'MENU_BAR',
	allowMultiple = false,
	contentType = 'PROJECT', // lookup options in lookup.enum_content_types
	itemStyle = 'LIST',
	showTitle = true,
	showDescription = true,
	showDate = false,
	buttonLabel = i18n.t('Lees meer'),
	itemsPerPage = 20,
}) => {
	const [t] = useTranslation();

	const [currentPage, setCurrentPage] = useState<number>(0);
	const [selectedTabs, setSelectedTabs] = useState<string[]>([]);
	const [pages, setPages] = useState<ContentPageInfo[]>([]);
	const [pageCount, setPageCount] = useState<number>(1);

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
			thumbnail_path: '',
			labels: [],
			created_at: dbContentPage.created_at,
			description: dbContentPage.description,
			title: dbContentPage.title,
			id: dbContentPage.id,
			blocks: dbContentPage.contentBlockssBycontentId ? renderContentPage(dbContentPage) : null,
			content_width: dbContentPage.content_width,
		};
	};

	useEffect(() => {
		let filteredPages: ContentPageInfo[] = [];
		let pageCount = 0;
		if (selectedTabs.length) {
			// TODO get contentPages from the database that have one of the selected groups
		} else {
			const response = dataService.query({
				query: GET_CONTENT,
				variables: {
					offset: currentPage * itemsPerPage,
					limit: itemsPerPage,
				},
			});
			const pageArray: Avo.Content.Content[] = get(response, 'data.app_content', []);
			pageCount = get(response, 'data.app_content_aggregate.aggregate.count', []);
			filteredPages = pageArray.map(dbToPageOverviewContentPage);
		}
		setPages(filteredPages);
		setPageCount(Math.ceil(pageCount / itemsPerPage));
	}, [selectedTabs, currentPage]);

	const handleCurrentPageChanged = (pageIndex: number) => {
		setCurrentPage(pageIndex);
	};

	const handleSelectedTabsChanged = (tabs: string[]) => {
		setSelectedTabs(tabs);
		setCurrentPage(0);
	};

	return (
		<BlockPageOverview
			tabs={tabs}
			selectedTabs={selectedTabs}
			onSelectedTabsChanged={handleSelectedTabsChanged}
			currentPage={currentPage}
			onCurrentPageChanged={handleCurrentPageChanged}
			pageCount={pageCount}
			pages={pages}
			itemsPerPage={itemsPerPage}
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
			navigate={() => {}} // TODO fill in once the PR is merged
		/>
	);
};

export default PageOverviewWrapper;
