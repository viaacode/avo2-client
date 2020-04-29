import React, { FunctionComponent } from 'react';

import { Button, Column, convertToHtml, DefaultProps, Grid, Spacer } from '@viaa/avo2-components';
import { GridSizeSchema } from '@viaa/avo2-components/src/components/Grid/Column/Column';

interface BlockRichTextElement {
	content: string;
	buttons: any[];
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
			buttons: {},
		},
	],
}) => {
	const renderContent = (contentElem: BlockRichTextElement) => (
		<>
			<div
				className="c-content"
				dangerouslySetInnerHTML={{ __html: convertToHtml(contentElem.content) }}
				style={contentElem.color ? { color: contentElem.color } : {}}
			/>
			{contentElem.buttons.map((buttons: any) => (
				<Spacer margin="top">
					<Button {...buttons} />
				</Spacer>
			))}
		</>
	);

	return Array.isArray(elements) ? (
		<Grid className={className}>
			{(elements as BlockRichTextElement[]).map((column, index) => (
				<Column
					size={(12 / elements.length).toString() as GridSizeSchema}
					key={`rich-text-column-${index}`}
				>
					{renderContent(column)}
				</Column>
			))}
		</Grid>
	) : (
		renderContent(elements)
	);
};
