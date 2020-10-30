import classnames from 'classnames';
import { findIndex, flatten, get, uniqBy } from 'lodash-es';
import moment from 'moment';
import React, { FunctionComponent, MouseEvent, ReactNode } from 'react';

import {
	Accordion,
	AspectRatioWrapper,
	BlockHeading,
	BlockImageGrid,
	Button,
	ButtonAction,
	Column,
	Container,
	convertToHtml,
	DefaultProps,
	Flex,
	Grid,
	GridItem,
	Pagination,
	Spacer,
	Tabs,
	TagList,
} from '@viaa/avo2-components';

import './BlockPageOverview.scss';

moment.locale('nl-be');

export type ContentWidthSchema = 'REGULAR' | 'LARGE' | 'MEDIUM';
export type ContentTabStyle = 'ROUNDED_BADGES' | 'MENU_BAR';
export type ContentItemStyle = 'GRID' | 'NEWS_LIST' | 'PROJECT_LIST' | 'ACCORDION';

export type LabelObj = {
	label: string;
	id: number;
};

export interface PageInfo {
	id: number;
	title: string;
	description: string | null;
	created_at: string;
	content_width: ContentWidthSchema;
	// TODO add thumbnail_path to content page in database
	thumbnail_path: string;
	// TODO add labels to content page in database
	labels: LabelObj[];
	blocks?: ReactNode; // Client knows how to convert ContentBlockSchema[] into a ReactNode
	path: string;
}

export interface BlockPageOverviewProps extends DefaultProps {
	tabs?: { label: string; id: number }[];
	darkTabs?: boolean;
	tabStyle?: ContentTabStyle;
	allowMultiple?: boolean;
	centerHeader?: boolean;
	itemStyle?: ContentItemStyle;
	showTitle?: boolean;
	showDescription?: boolean;
	showDate?: boolean;
	dateString?: string;
	buttonLabel?: string;
	allLabel?: string;
	noLabel?: string;
	selectedTabs: LabelObj[];
	onSelectedTabsChanged: (selectedTabs: LabelObj[]) => void;
	currentPage: number;
	onCurrentPageChanged: (newPage: number) => void;
	pageCount: number;
	pages: PageInfo[];
	focusedPage: PageInfo | null; // Shown at the top with an expanded accordion
	onLabelClicked?: (label: string) => void;
	navigate?: (action: ButtonAction) => void;
}

export const BlockPageOverview: FunctionComponent<BlockPageOverviewProps> = ({
	tabs = [],
	darkTabs = false,
	tabStyle = 'MENU_BAR',
	allowMultiple = false,
	centerHeader = false,
	itemStyle = 'NEWS_LIST',
	showTitle = true,
	showDescription = true,
	showDate = false,
	dateString = 'Geplaatst %label% op %date%',
	buttonLabel = 'Lees meer',
	allLabel = 'alle',
	noLabel = 'Overige',
	selectedTabs,
	onSelectedTabsChanged,
	currentPage = 0,
	onCurrentPageChanged,
	pageCount,
	pages = [],
	focusedPage,
	onLabelClicked,
	navigate,
}) => {
	const allLabelObj = { label: allLabel, id: -2 };
	const noLabelObj = { label: noLabel, id: -2 };

	const handleTabClick = (tab: LabelObj | undefined) => {
		if (!tab || tab.id === allLabelObj.id) {
			// Click on all selected tabs => clear other filters automatically
			// Empty selected tabs signifies to the outsides: show all items / do not apply any label filters
			onSelectedTabsChanged([]);
			return;
		}

		let newSelectedTabs: LabelObj[];
		if (allowMultiple) {
			const indexOf = findIndex(selectedTabs, { id: tab.id });
			if (indexOf !== -1) {
				// already in the selected tabs => remove the tab
				const newTabs = [...selectedTabs];
				newTabs.splice(indexOf, 1);
				newSelectedTabs = newTabs;
			} else {
				// add the tab
				newSelectedTabs = [...selectedTabs, tab];
			}
		} else {
			// Replace the current selected tab
			newSelectedTabs = [tab];
		}

		// Empty selected tabs signifies to the outsides: show all items / do not apply any label filters
		onSelectedTabsChanged(newSelectedTabs.filter((tab) => tab.id !== allLabelObj.id));
	};

	const handlePageClick = (page: PageInfo) => {
		if (navigate) {
			navigate({
				type: 'CONTENT_PAGE',
				value: page.path,
			} as ButtonAction);
		}
	};

	const renderLabel = (labelObj: any) => {
		return `<span class="c-content-page__label">${labelObj.label}</span>`;
	};

	const renderLabels = (page: PageInfo) => {
		if (!page.labels || !page.labels.length) {
			return '';
		}
		return ` in ${page.labels
			.map((labelObj, index) => {
				if (index === page.labels.length - 1) {
					return renderLabel(labelObj);
				}
				if (index === page.labels.length - 2) {
					return `${renderLabel(labelObj)} en `;
				}
				return `${renderLabel(labelObj)}, `;
			})
			.join('')}`;
	};

	const formatDateString = (dateString: string, page: PageInfo): string => {
		return dateString
			.replace('%label%', renderLabels(page))
			.replace('%date%', moment(page.created_at).format('D MMMM YYYY'));
	};

	const getDescription = (page: PageInfo) => {
		return showDescription && page.description
			? <div dangerouslySetInnerHTML={{ __html: page.description }} /> || undefined
			: undefined;
	};

	const renderText = (text: string | ReactNode, className?: string) => {
		if (text) {
			if (typeof text === 'string') {
				return (
					<p
						className={className}
						dangerouslySetInnerHTML={{ __html: convertToHtml(text as string) }}
					/>
				);
			}
			return text;
		}
		return null;
	};

	const handleLabelClicked = (evt: MouseEvent<HTMLDivElement>) => {
		if (get(evt.target, 'className') === 'c-content-page__label' && onLabelClicked) {
			onLabelClicked((evt.target as HTMLSpanElement).innerText);
		}
	};

	const renderPages = () => {
		const allPages = [...(focusedPage ? [focusedPage] : []), ...pages] as PageInfo[];
		if (itemStyle === 'NEWS_LIST' || itemStyle === 'PROJECT_LIST') {
			return allPages.map((page) => {
				return (
					<Container
						className={classnames(
							'c-block-image-title-text-button',
							itemStyle === 'NEWS_LIST' && 'c-page-overview-news-list',
							itemStyle === 'PROJECT_LIST' && 'c-page-overview-project-list'
						)}
						mode="vertical"
						key={`content-block-page-${page.id}`}
					>
						<Container mode="horizontal">
							<Grid>
								<Column size={itemStyle === 'NEWS_LIST' ? '2-5' : '2-4'}>
									<Spacer margin="bottom-large">
										<AspectRatioWrapper
											style={{
												backgroundImage: `url(${page.thumbnail_path})`,
											}}
											aspect={itemStyle === 'NEWS_LIST' ? 1.78 : 2.5} // 500 x 280 or 528 x 211
										/>
									</Spacer>
								</Column>
								<Column size="2-7">
									<div className="c-content">
										{showTitle &&
											(itemStyle === 'NEWS_LIST' ? (
												<h3 onClick={() => handlePageClick(page)}>
													{page.title}
												</h3>
											) : (
												<h2 onClick={() => handlePageClick(page)}>
													{page.title}
												</h2>
											))}
										{showDate && (
											<div onClick={handleLabelClicked}>
												{renderText(
													formatDateString(dateString, page),
													'a-subtitle'
												)}
											</div>
										)}
										{
											<div className="a-content-page__description">
												{renderText(getDescription(page))}
											</div>
										}
										{buttonLabel && (
											<Spacer margin="top">
												<Button
													label={buttonLabel}
													type="tertiary"
													onClick={() => handlePageClick(page)}
												/>
											</Spacer>
										)}
									</div>
								</Column>
							</Grid>
						</Container>
					</Container>
				);
			});
		}
		if (itemStyle === 'GRID') {
			const uniqueLabels: LabelObj[] = uniqBy(
				flatten(allPages.map((page): LabelObj[] => page.labels)),
				'id'
			);
			const pagesByLabel: { [labelId: number]: PageInfo[] } = Object.fromEntries(
				uniqueLabels.map((labelObj: LabelObj): [number, PageInfo[]] => {
					return [
						labelObj.id,
						allPages.filter((page) =>
							page.labels.map((pageLabelObj) => pageLabelObj.id).includes(labelObj.id)
						),
					];
				})
			);
			// Put the pages that do not have a label under their own category
			pagesByLabel[noLabelObj.id] = allPages.filter(
				(page) => !page.labels || !page.labels.length
			);
			const showAllLabels = !selectedTabs.length || selectedTabs[0].id === allLabelObj.id;
			const labelsToShow: LabelObj[] = showAllLabels ? [...tabs, noLabelObj] : selectedTabs;

			return labelsToShow.map((labelObj) => {
				if (!(pagesByLabel[labelObj.id] || []).length) {
					return null;
				}
				return (
					<Spacer margin="top-extra-large" key={`block-page-label-${labelObj.id}`}>
						{(showAllLabels || allowMultiple) && !!(tabs || []).length && (
							<Spacer margin="left-small">
								<BlockHeading type={'h2'}>{labelObj.label}</BlockHeading>
							</Spacer>
						)}
						<BlockImageGrid
							elements={(pagesByLabel[labelObj.id] || []).map(
								(page: PageInfo): GridItem => ({
									title: showTitle ? page.title : undefined,
									text: getDescription(page),
									source: page.thumbnail_path,
									action: { type: 'CONTENT_PAGE', value: page.id },
								})
							)}
							itemWidth={307}
							imageHeight={172}
							imageWidth={307}
							navigate={navigate}
							fill="cover"
							textAlign="left"
						/>
					</Spacer>
				);
			});
		}
		if (itemStyle === 'ACCORDION') {
			return (
				<Spacer margin="top-large">
					{allPages.map((page) => {
						return (
							<Accordion
								title={page.title}
								isOpen={page.id === get(focusedPage, 'id')}
								key={`block-page-${page.id}`}
							>
								{page.blocks}
							</Accordion>
						);
					})}
				</Spacer>
			);
		}
	};

	const renderHeader = () => {
		// if only one tab, only show the content of that one tab, don't show the header
		if (tabs.length > 1) {
			// Add "all" option to the front
			const extendedTabs = [allLabelObj, ...tabs];
			let extendedSelectedTabs: LabelObj[] = selectedTabs;
			if (!extendedSelectedTabs || !extendedSelectedTabs.length) {
				// Select the "all" option if no tabs are selected
				extendedSelectedTabs = [extendedTabs[0]];
			}
			if (tabStyle === 'ROUNDED_BADGES') {
				return (
					<Flex center={centerHeader} className="c-content-page-overview-block__header">
						<Spacer margin={['left', 'bottom', 'right']}>
							<TagList
								tags={extendedTabs.map((tab) => ({
									id: tab.id,
									label: tab.label,
									active: !!extendedSelectedTabs.find(
										(extendedTab) => extendedTab.id === tab.id
									),
								}))}
								swatches={false}
								selectable
								onTagClicked={(tagId: string | number) =>
									handleTabClick(tabs.find((tab) => tab.id === tagId))
								}
							/>
						</Spacer>
					</Flex>
				);
			}
			if (tabStyle === 'MENU_BAR') {
				return (
					<Flex center={centerHeader} className="c-content-page-overview-block__header">
						<Spacer margin={['left', 'bottom', 'right']}>
							<Tabs
								tabs={extendedTabs.map((tab) => ({
									id: tab.id,
									label: tab.label,
									active: !!extendedSelectedTabs.find(
										(extendedTab) => extendedTab.id === tab.id
									),
								}))}
								dark={darkTabs}
								onClick={(tabId) =>
									handleTabClick(tabs.find((tab) => tab.id === tabId))
								}
							/>
						</Spacer>
					</Flex>
				);
			}
		} else {
			return null;
		}
	};

	return (
		<div className="c-content-page-overview-block">
			{renderHeader()}
			{renderPages()}
			{pageCount > 1 && (
				<Spacer margin="top">
					<Pagination
						pageCount={pageCount}
						currentPage={currentPage}
						displayCount={5}
						onPageChange={onCurrentPageChanged}
					/>
				</Spacer>
			)}
		</div>
	);
};
