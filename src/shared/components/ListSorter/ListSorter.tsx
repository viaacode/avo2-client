import React, { FC, Fragment, ReactNode, useMemo } from 'react';

import { Button, Icon, IconName } from '@viaa/avo2-components';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';

import './ListSorter.scss';
import { sortByPositionAsc } from '../../helpers';
import { NEW_ASSIGNMENT_BLOCK_ID_PREFIX } from '../../../assignment/assignment.const';

// Types

export interface ListSorterItem {
	id: string;
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
	divider?: ListSorterRenderer<T>;
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

export const ListSorterSlice: FC<{ item: ListSorterItem }> = ({ item }) => (
	<Button type="secondary" icon="trash-2" onClick={() => item.onSlice?.(item)}></Button>
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
						{divider(item, i)}
						<hr />
					</div>
				)}
			</Fragment>
		);

	return (
		<ul className="c-list-sorter">
			{items?.sort(sortByPositionAsc).map((item, i) => {
				const j = items.length === i + 1 ? undefined : i;
				return renderItem(item, j);
			})}

			{(!items || items.length <= 0) && renderItem({ id: emptyId, position: -1 }, 0)}
		</ul>
	);
};

// TODO: use this pattern for CollectionOrBundle to reduce overhead
export const AssignmentBlockListSorter = ListSorter as ListSorterType<AssignmentBlock>;
