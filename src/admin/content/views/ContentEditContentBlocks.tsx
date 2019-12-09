import React, { FunctionComponent } from 'react';

import { Container, Flex, FlexItem } from '@viaa/avo2-components';

import { ContentBlockForm } from '../../content-block/components';
import { HEADING_BLOCK_CONFIG } from '../../content-block/helpers';
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
			<ContentBlockForm config={HEADING_BLOCK_CONFIG()} index={1} length={1} onSave={() => {}} />
		</Sidebar>
	</Flex>
);

export default ContentEditContentBlocks;
