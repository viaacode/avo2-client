import React, { FunctionComponent } from 'react';

import { Container, Flex, FlexItem } from '@viaa/avo2-components';

import { ContentBlockForm } from '../../content-block/components';
import {
	BUTTONS_BLOCK_CONFIG,
	HEADING_BLOCK_CONFIG,
	RICH_TEXT_BLOCK_CONFIG,
	RICH_TEXT_TWO_COLUMNS_BLOCK_CONFIG,
} from '../../content-block/helpers';
import { Sidebar } from '../../shared/components';

const ContentEditContentBlocks: FunctionComponent = () => (
	<Flex className="c-content-edit-view__content">
		<FlexItem>
			<Container mode="vertical">
				<Container mode="horizontal">
					<div>TODO: preview</div>
				</Container>
			</Container>
		</FlexItem>
		<Sidebar className="c-content-edit-view__sidebar" light>
			<ContentBlockForm config={HEADING_BLOCK_CONFIG()} index={1} length={4} onSave={() => {}} />
			<ContentBlockForm config={RICH_TEXT_BLOCK_CONFIG()} index={2} length={4} onSave={() => {}} />
			<ContentBlockForm
				config={RICH_TEXT_TWO_COLUMNS_BLOCK_CONFIG()}
				index={3}
				length={4}
				onSave={() => {}}
			/>
			<ContentBlockForm config={BUTTONS_BLOCK_CONFIG()} index={4} length={4} onSave={() => {}} />
		</Sidebar>
	</Flex>
);

export default ContentEditContentBlocks;
