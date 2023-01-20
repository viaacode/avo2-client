import { Button, Icon, IconName } from '@viaa/avo2-components';
import { sortBy } from 'lodash-es';
import React, { FC, Fragment, ReactNode, useMemo } from 'react';

import { NEW_ASSIGNMENT_BLOCK_ID_PREFIX } from '../../../assignment/assignment.const';
import { BaseBlockWithMeta } from '../../../assignment/assignment.types';

import './ListSorter.scss';

// Types

export interface ListSorterItem {
	id: string | number; // Number is deprecated but still used in collection fragment blocks
	onSlice?: (item: ListSorterItem) => void;
	onPositionChange?: (item: ListSorterItem, delta: number) => void;
	position: number;
	icon?: IconName;
}

export type ListSorterRenderer<T> = (item?: T & ListSorterItem, i?: number) => ReactNode;

export interface ListSorterProps<T> {
	actions?: ListSorterRenderer<T>;
	items?: (T & ListSorterItem)[];
	content?: ListSorterRenderer<T>;
	divider?: (position: number) => ReactNode;
	heading?: ListSorterRenderer<T>;
	thumbnail?: ListSorterRenderer<T>;
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
				/>
			)}
			{!isLast && (
				<Button
					type="secondary"
					icon="chevron-down"
					onClick={() => item.onPositionChange?.(item, 1)}
				/>
			)}
		</>
	);
};

export const ListSorterSlice: FC<{ item: ListSorterItem }> = ({ item }) => (
	<Button type="secondary" icon="delete" onClick={() => item.onSlice?.(item)} />
);

// Main renderer
type ListSorterType<T = ListSorterItem & any> = FC<ListSorterProps<T>>;
export const ListSorter: ListSorterType = ({
	items = [],
	thumbnail = ((item) =>
		item && <ListSorterThumbnail item={item} />) as ListSorterRenderer<unknown>,
	heading = () => 'heading',
	divider = () => 'divider',
	actions = (item, i) =>
		item && (
			<>
				<ListSorterPosition item={item} i={i} />
				<ListSorterSlice item={item} />
			</>
		),
	content = () => 'content',
}) => {
	const emptyId = `${NEW_ASSIGNMENT_BLOCK_ID_PREFIX}empty`;

	const renderItem: ListSorterRenderer<unknown> = (item?: ListSorterItem, i?: number) =>
		item && (
			<Fragment key={`${item.id}--${i}`}>
				{item.id !== emptyId && (
					<li className="c-list-sorter__item">
						<div className="c-list-sorter__item__header">
							{thumbnail && (
								<div className="c-list-sorter__item__thumbnail">
									{thumbnail(item, i)}
								</div>
							)}

							{heading && (
								<div className="c-list-sorter__item__heading">
									{heading(item, i)}
								</div>
							)}

							{actions && (
								<div className="c-list-sorter__item__actions">
									{actions(item, i)}
								</div>
							)}
						</div>

						{content && (
							<div className="c-list-sorter__item__content">{content(item, i)}</div>
						)}
					</li>
				)}

				{divider && (
					<div className="c-list-sorter__divider">
						<hr />
						{divider(item.position + 1)}
						<hr />
					</div>
				)}
			</Fragment>
		);

	return (
		<ul className="c-list-sorter">
			{divider && (
				<div className="c-list-sorter__divider">
					<hr />
					{divider(0)}
					<hr />
				</div>
			)}
			{sortBy(items, (block) => block.position).map((item, i) => {
				const j = items.length === i + 1 ? undefined : i;
				return renderItem(item, j);
			})}
		</ul>
	);
};

// TODO: use this pattern for CollectionOrBundle to reduce overhead
export const BlockListSorter = ListSorter as ListSorterType<BaseBlockWithMeta>;
