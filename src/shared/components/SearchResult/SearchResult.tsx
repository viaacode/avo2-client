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

import { clsx } from 'clsx';
import { isNil, noop } from 'es-toolkit';
import { type FC, type ReactNode, type ReactText } from 'react';

import { defaultRenderBookmarkButton } from '../../helpers/default-render-bookmark-button';
import { tText } from '../../helpers/translate-text';
import EducationLevelsTagList from '../EducationLevelsTagList/EducationLevelsTagList';

import './SearchResult.scss';
import { AvoContentTypeEnglish } from '@viaa/avo2-types';

interface SearchResultProps extends DefaultProps {
  title: ReactNode;
  subTitle: ReactNode;
  thumbnail: ReactNode;
  type: AvoContentTypeEnglish;
  thumbnailPath?: string;
  description?: string;
  maxDescriptionLength?: number;
  isBookmarked: boolean | null;
  date: string;
  dateTooltip: string;
  bookmarkCount: number | null; // null hides the counter
  viewCount: number;
  typeTags?: (TagOption & { dark?: boolean })[];
  loms?: string[];
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
  loms = [],
  onToggleBookmark = noop,
  onTagClicked = noop,
}) => {
  const renderEducationLevels = () => {
    if (type !== 'collection' && type !== 'bundle' && type !== 'assignment') {
      return null;
    }
    return (
      <FlexItem>
        <EducationLevelsTagList
          className="c-search_result__education-levels"
          loms={loms}
        />
      </FlexItem>
    );
  };

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
                  ariaLabel: tText(
                    'shared/components/search-result/search-result___toggle-bookmark',
                  ),
                  title: tText(
                    'shared/components/search-result/search-result___toggle-bookmark',
                  ),
                  onClick: (active: boolean) => onToggleBookmark(active),
                  type: undefined,
                })}
              </div>
            </FlexItem>
          )}
        </Flex>
        <p className="c-search-result__description">
          {description.slice(0, maxDescriptionLength)}
        </p>
        <Spacer margin="bottom-small">
          <Flex justify="between" wrap align="baseline">
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
            {renderEducationLevels()}
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
