import React, { FunctionComponent, useState } from 'react';

import { Container, Flex, FlexItem, Form, FormGroup, Select } from '@viaa/avo2-components';

import { ContentBlockForm } from '../../content-block/components';
import {
	CONTENT_BLOCK_COMPONENT_MAP,
	CONTENT_BLOCK_CONFIG_MAP,
	CONTENT_BLOCK_TYPE_OPTIONS,
} from '../../content-block/content-block.const';
import { ContentBlockFormStates, ContentBlockType } from '../../content-block/content-block.types';
import { Sidebar } from '../../shared/components';

const ContentEditContentBlocks: FunctionComponent = () => {
	// Hooks
	const [cbSelected, setcbSelected] = useState<ContentBlockType | ''>('');
	const [cbConfigs, setCbConfigs] = useState<ContentBlockType[]>([]);
	const [cbStates, setCbStates] = useState<ContentBlockType[]>([]);

	// Methods
	const handleCbAdd = (value: ContentBlockType) => {
		setcbSelected(value);

		setCbConfigs([...cbConfigs, value]);
	};

	const handleSave = (index: number, cbState: ContentBlockFormStates) => {
		setCbStates([]);
	};

	// Render
	return (
		<Flex className="c-content-edit-view__content">
			<FlexItem>
				<Container mode="vertical" background="white">
					<Container mode="horizontal">
						<div>TODO: preview {cbSelected}</div>
						{cbConfigs.map(cbConfig => {
							const ContentBlockComponent = CONTENT_BLOCK_COMPONENT_MAP[cbConfig];

							// return <ContentBlockComponent />;
						})}
					</Container>
				</Container>
			</FlexItem>
			<Sidebar className="c-content-edit-view__sidebar" light>
				{cbConfigs.map((cbConfig, index) => (
					<ContentBlockForm
						config={CONTENT_BLOCK_CONFIG_MAP[cbConfig]()}
						index={index + 1}
						length={cbConfigs.length}
						onSave={cbState => handleSave(index, cbState)}
					/>
				))}
				<Form>
					<FormGroup label="Voeg een content block toe">
						<Select
							options={CONTENT_BLOCK_TYPE_OPTIONS}
							onChange={value => handleCbAdd(value as ContentBlockType)}
							value={cbSelected}
						/>
					</FormGroup>
				</Form>
			</Sidebar>
		</Flex>
	);
};

export default ContentEditContentBlocks;
