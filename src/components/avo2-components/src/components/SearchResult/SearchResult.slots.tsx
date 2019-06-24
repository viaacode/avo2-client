import { FunctionComponent, ReactElement } from 'react';

export interface SearchResultSlotProps {
	children: ReactElement;
}

export const SearchResultTitle: FunctionComponent<SearchResultSlotProps> = ({
	children,
}: SearchResultSlotProps) => children;

export const SearchResultSubtitle: FunctionComponent<SearchResultSlotProps> = ({
	children,
}: SearchResultSlotProps) => children;

export const SearchResultThumbnail: FunctionComponent<SearchResultSlotProps> = ({
	children,
}: SearchResultSlotProps) => children;
