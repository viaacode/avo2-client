import React, { FC, ReactNode, useMemo } from 'react';

import { Button, Icon, IconName } from '@viaa/avo2-components';

import './ListSorter.scss';

// Types

export interface ListSorterItem {
	id: string;
	onDelete?: (item: ListSorterItem) => void;
	onPositionChange?: (item: ListSorterItem, delta: number) => void;
	position: number;
	icon: IconName;
}

export type ListSorterRenderer = (item: ListSorterItem, i?: number) => ReactNode;

export interface ListSorterProps {
	actions?: ListSorterRenderer;
	items?: ListSorterItem[];
	content?: ListSorterRenderer;
	divider?: ListSorterRenderer;
	heading?: ListSorterRenderer;
	thumbnail?: ListSorterRenderer;
}

// Default renderers

export const ListSorterThumbnail: FC<{ item: ListSorterItem }> = ({ item }) => (
	<Icon name={item.icon} />
);

export const ListSorterPosition: FC<{ item: ListSorterItem; i?: number }> = ({ item, i }) => {
	const isFirst = useMemo(() => i === 0, [i]);
	const isLast = useMemo(() => i === undefined, [i]);

	return (
		<>
			{!isFirst && (
				<Button
					type="secondary"
					icon="chevron-up"
					onClick={() => item.onPositionChange?.(item, -1)}
				></Button>
			)}
			{!isLast && (
				<Button
					type="secondary"
					icon="chevron-down"
					onClick={() => item.onPositionChange?.(item, 1)}
				></Button>
			)}
		</>
	);
};

export const ListSorterDelete: FC<{ item: ListSorterItem }> = ({ item }) => (
	<Button type="secondary" icon="trash-2" onClick={() => item.onDelete?.(item)}></Button>
);

// Main renderer

export const ListSorter: FC<ListSorterProps> = ({
	items,
	thumbnail = (item) => <ListSorterThumbnail item={item} />,
	heading = () => 'heading',
	divider = () => 'divider',
	actions = (item, i) => (
		<>
			<ListSorterPosition item={item} i={i} />
			<ListSorterDelete item={item} />
		</>
	),
	content = () => 'content',
}) => {
	const renderItem: ListSorterRenderer = (item: ListSorterItem, i?: number) => (
		<>
			<li className="c-list-sorter__item" key={item.id}>
				<div className="c-list-sorter__item__header">
					{thumbnail && (
						<div className="c-list-sorter__item__thumbnail">{thumbnail(item, i)}</div>
					)}

					{heading && (
						<div className="c-list-sorter__item__heading">{heading(item, i)}</div>
					)}

					{actions && (
						<div className="c-list-sorter__item__actions">{actions(item, i)}</div>
					)}
				</div>

				{content && <div className="c-list-sorter__item__content">{content(item, i)}</div>}
			</li>

			{divider && (
				<div className="c-list-sorter__divider">
					<hr />
					{divider(item, i)}
					<hr />
				</div>
			)}
		</>
	);

	return (
		<ul className="c-list-sorter">
			{items
				?.sort((a, b) => a.position - b.position)
				.map((item, i) => {
					const j = items.length === i + 1 ? undefined : i;
					return renderItem(item, j);
				})}
		</ul>
	);
};
