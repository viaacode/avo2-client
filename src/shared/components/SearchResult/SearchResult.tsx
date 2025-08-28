import {
	type DefaultProps,
	Flex,
	FlexItem,
	IconName,
	MetaData,
	MetaDataItem,
	Spacer,
	TagList,
	type TagOption,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import { isNil, noop, truncate } from 'lodash-es';
import React, { type FC, type ReactNode, type ReactText } from 'react';

import './SearchResult.scss';
import { defaultRenderBookmarkButton } from '../../helpers/default-render-bookmark-button';
import { tText } from '../../helpers/translate-text';

interface SearchResultProps extends DefaultProps {
	title: ReactNode;
	subTitle: ReactNode;
	thumbnail: ReactNode;
	type: Avo.ContentType.English;
	thumbnailPath?: string;
	description?: string;
	maxDescriptionLength?: number;
	isBookmarked: boolean | null;
	date: string;
	dateTooltip: string;
	bookmarkCount: number | null; // null hides the counter
	viewCount: number;
	typeTags?: (TagOption & { dark?: boolean })[];
	qualityTags?: TagOption[];
	onToggleBookmark?: (active: boolean) => void;
	onTagClicked?: (tagId: string) => void;
}

export const SearchResult: FC<SearchResultProps> = ({
	title,
	subTitle,
	thumbnail,
	className,
	type,
	description = '',
	maxDescriptionLength = 300,
	isBookmarked,
	date,
	dateTooltip,
	bookmarkCount,
	viewCount,
	typeTags = [],
	qualityTags = [],
	onToggleBookmark = noop,
	onTagClicked = noop,
}) => {
	return (
		<div className={clsx(className, 'c-search-result')}>
			<div className="c-search-result__image">{thumbnail}</div>
			<div className="c-search-result__content">
				<Flex align="start" justify="between">
					<FlexItem>
						<h2 className="c-search-result__title">{title}</h2>
						{subTitle}
					</FlexItem>
					{!isNil(isBookmarked) && (
						<FlexItem shrink>
							<div className="c-button-toolbar">
								{defaultRenderBookmarkButton({
									active: isBookmarked,
									ariaLabel: tText('toggle bookmark'),
									title: tText('toggle bookmark'),
									onClick: (active: boolean) => onToggleBookmark(active),
									type: undefined,
								})}
							</div>
						</FlexItem>
					)}
				</Flex>
				<p className="c-search-result__description">
					{truncate(description, { length: maxDescriptionLength })}
				</p>
				<Spacer margin="bottom-small">
					<Flex justify="between" wrap>
						<MetaData category={type}>
							<Tooltip position="right">
								<TooltipTrigger>
									<MetaDataItem label={date} />
								</TooltipTrigger>

								<TooltipContent>
									<span>{dateTooltip}</span>
								</TooltipContent>
							</Tooltip>

							<MetaDataItem label={String(viewCount)} icon={IconName.eye} />

							{!isNil(bookmarkCount) && (
								<MetaDataItem
									label={String(bookmarkCount)}
									icon={IconName.bookmark}
								/>
							)}
						</MetaData>

						<TagList
							tags={qualityTags}
							swatches={false}
							onTagClicked={(tagId: ReactText) => onTagClicked(tagId.toString())}
						/>
					</Flex>
				</Spacer>

				<TagList
					className="c-search_result__tags"
					tags={typeTags}
					swatches={false}
					onTagClicked={(tagId: ReactText) => onTagClicked(tagId.toString())}
				/>
			</div>
		</div>
	);
};
