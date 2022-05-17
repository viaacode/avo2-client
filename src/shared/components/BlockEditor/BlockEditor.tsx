import React, { FC, ReactNode, useMemo } from 'react';

import { Button, Icon } from '@viaa/avo2-components';

import './BlockEditor.scss';

// Types

export enum BlockType {
	Collection,
	Item,
	Search,
	Text,
}

export interface Block {
	id: string;
	onDelete?: (block: Block) => void;
	onPositionChange?: (block: Block, delta: number) => void;
	position: number;
	type: BlockType;
}

export type BlockRenderer = (block: Block, i?: number) => ReactNode;

export interface BlockEditorProps {
	actions?: BlockRenderer;
	blocks?: Block[];
	content?: BlockRenderer;
	divider?: BlockRenderer;
	heading?: BlockRenderer;
	thumbnail?: BlockRenderer;
}

// Default renderers

export const BlockEditorThumbnail: FC<{ block: Block }> = ({ block }) => {
	switch (block.type) {
		case BlockType.Text:
			return <Icon name="type" />;

		case BlockType.Item:
			return <Icon name="video" />; // TODO: replace with video-image-audio icon

		case BlockType.Search:
			return <Icon name="search" />;

		default:
			return <Icon name="x" />;
	}
};

export const BlockEditorActions: FC<{ block: Block; i?: number }> = ({ block, i }) => {
	const isFirst = useMemo(() => i === 0, [i]);
	const isLast = useMemo(() => i === undefined, [i]);

	return (
		<>
			{!isFirst && (
				<Button
					type="secondary"
					icon="chevron-up"
					onClick={() => block.onPositionChange?.(block, -1)}
				></Button>
			)}
			{!isLast && (
				<Button
					type="secondary"
					icon="chevron-down"
					onClick={() => block.onPositionChange?.(block, 1)}
				></Button>
			)}
			<Button
				type="secondary"
				icon="trash-2"
				onClick={() => block.onDelete?.(block)}
			></Button>
		</>
	);
};

// Main renderer

export const BlockEditor: FC<BlockEditorProps> = ({
	blocks,
	thumbnail = (block) => <BlockEditorThumbnail block={block} />,
	heading = () => 'heading',
	divider = () => 'divider',
	actions = (block, i) => <BlockEditorActions block={block} i={i} />,
	content = () => 'content',
}) => {
	const renderBlock: BlockRenderer = (block: Block, i?: number) => (
		<>
			<li className="c-block-editor__item" key={block.id}>
				<div className="c-block-editor__item__header">
					{thumbnail && (
						<div className="c-block-editor__item__thumbnail">{thumbnail(block, i)}</div>
					)}

					{heading && (
						<div className="c-block-editor__item__heading">{heading(block, i)}</div>
					)}

					{actions && (
						<div className="c-block-editor__item__actions">{actions(block, i)}</div>
					)}
				</div>

				{content && (
					<div className="c-block-editor__item__content">{content(block, i)}</div>
				)}
			</li>

			{divider && (
				<div className="c-block-editor__divider">
					<hr />
					{divider(block, i)}
					<hr />
				</div>
			)}
		</>
	);

	return (
		<ul className="c-block-editor">
			{blocks
				?.sort((a, b) => a.position - b.position)
				.map((block, i) => {
					const j = blocks.length === i + 1 ? undefined : i;
					return renderBlock(block, j);
				})}
		</ul>
	);
};
