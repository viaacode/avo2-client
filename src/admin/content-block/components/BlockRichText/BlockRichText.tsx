import React, { FunctionComponent } from 'react';

import {
	Button,
	ButtonProps,
	Column,
	convertToHtml,
	DefaultProps,
	Grid,
	Spacer,
} from '@viaa/avo2-components';
import { GridSizeSchema } from '@viaa/avo2-components/src/components/Grid/Column/Column';

interface BlockRichTextElement {
	content: string;
	buttons?: ButtonProps[];
	color?: string;
}

export interface BlockRichTextProps extends DefaultProps {
	elements: BlockRichTextElement | BlockRichTextElement[];
}

export const BlockRichText: FunctionComponent<BlockRichTextProps> = ({
	className,
	elements = [
		{
			content: '',
		},
	],
}) => {
	const renderButtons = (buttons: ButtonProps[]) => {
		return buttons.map((buttons: any) => (
			<Spacer margin="top">
				<Button {...buttons} />
			</Spacer>
		));
	};

	const renderContent = (contentElem: BlockRichTextElement) => {
		const { content, color, buttons } = contentElem;

		return (
			<>
				<div
					className="c-content"
					dangerouslySetInnerHTML={{ __html: convertToHtml(content) }}
					style={color ? { color } : {}}
				/>
				{buttons && !!buttons.length && renderButtons(buttons)}
			</>
		);
	};

	const renderElements = (elements: BlockRichTextElement[]) => (
		<Grid className={className}>
			{elements.map((column, columnIndex) => (
				<Column
					size={(12 / elements.length).toString() as GridSizeSchema}
					key={`rich-text-column-${columnIndex}`}
				>
					{renderContent(column)}
				</Column>
			))}
		</Grid>
	);

	return Array.isArray(elements) ? renderElements(elements) : renderContent(elements);
};
