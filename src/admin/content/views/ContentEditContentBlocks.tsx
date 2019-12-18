import React, { FunctionComponent, useState } from 'react';

import { Flex, FlexItem, Form, FormGroup, Select } from '@viaa/avo2-components';

import { ContentBlockForm, ContentBlockPreview } from '../../content-block/components';
import {
	CONTENT_BLOCK_CONFIG_MAP,
	CONTENT_BLOCK_TYPE_OPTIONS,
} from '../../content-block/content-block.const';
import {
	ContentBlockConfig,
	ContentBlockFormStates,
	ContentBlockType,
} from '../../content-block/content-block.types';
import { Sidebar } from '../../shared/components';

const ContentEditContentBlocks: FunctionComponent = () => {
	// Hooks
	const [accordionsOpenState, setAccordionsOpenState] = useState<{ [key: string]: boolean }>({});
	const [cbConfigs, setCbConfigs] = useState<ContentBlockConfig[]>([]);

	// Methods
	const getFormKey = (name: string, index: number) => `${name}-${index}`;

	const handleCbAdd = (configType: ContentBlockType) => {
		const newConfig = CONTENT_BLOCK_CONFIG_MAP[configType]();
		const updatedCbConfigs = [...cbConfigs, newConfig];
		const cbFormKey = getFormKey(newConfig.name, updatedCbConfigs.length - 1);
		// Update content block configs
		setCbConfigs(updatedCbConfigs);
		// Set newly added config accordion as open
		setAccordionsOpenState({ [cbFormKey]: true });
	};

	const handleSave = (index: number, formState: ContentBlockFormStates) => {
		// Clone content block states array to prevent mutating state in place
		const cbConfigsCopy = [...cbConfigs];
		// Update item with new initialState
		const updatedCbConfig = {
			...cbConfigsCopy[index],
			formState,
		};
		// Update item at given index
		cbConfigsCopy.splice(index, 1, updatedCbConfig);

		setCbConfigs(cbConfigsCopy);
	};

	// Render
	const renderCbForms = () => {
		return cbConfigs.map((cbConfig, index) => {
			const cbFormKey = getFormKey(cbConfig.name, index);

			return (
				<ContentBlockForm
					key={cbFormKey}
					config={cbConfig}
					index={index + 1}
					isAccordionOpen={accordionsOpenState[cbFormKey] || false}
					length={cbConfigs.length}
					setIsAccordionOpen={() =>
						setAccordionsOpenState({ [cbFormKey]: !accordionsOpenState[cbFormKey] })
					}
					onSave={cbState => handleSave(index, cbState)}
				/>
			);
		});
	};

	return (
		<Flex className="c-content-edit-view__content">
			<FlexItem>
				{cbConfigs.map((cbConfig, index) => (
					<ContentBlockPreview key={getFormKey(cbConfig.name, index)} state={cbConfig.formState} />
				))}
			</FlexItem>
			<Sidebar className="c-content-edit-view__sidebar" light>
				{renderCbForms()}
				<Form>
					<FormGroup label="Voeg een content block toe">
						<Select
							options={CONTENT_BLOCK_TYPE_OPTIONS}
							onChange={value => handleCbAdd(value as ContentBlockType)}
							value={CONTENT_BLOCK_TYPE_OPTIONS[0].value}
						/>
					</FormGroup>
				</Form>
			</Sidebar>
		</Flex>
	);
};

export default ContentEditContentBlocks;
