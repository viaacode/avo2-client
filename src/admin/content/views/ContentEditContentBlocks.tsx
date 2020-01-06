import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

interface ContentEditContentBlocksProps {
	cbConfigs: ContentBlockConfig[];
	onAdd: (config: ContentBlockConfig) => void;
	onChange: (index: number, formState: Partial<ContentBlockFormStates>) => void;
}

const ContentEditContentBlocks: FunctionComponent<ContentEditContentBlocksProps> = ({
	cbConfigs,
	onAdd,
	onChange,
}) => {
	// Hooks
	const [accordionsOpenState, setAccordionsOpenState] = useState<{ [key: string]: boolean }>({});

	const [t] = useTranslation();

	// Methods
	const getFormKey = (name: string, index: number) => `${name}-${index}`;

	const handleCbAdd = (configType: ContentBlockType) => {
		const newConfig = CONTENT_BLOCK_CONFIG_MAP[configType]();
		const cbFormKey = getFormKey(newConfig.formState.blockType, cbConfigs.length);
		// Update content block configs
		onAdd(newConfig);
		// Set newly added config accordion as open
		setAccordionsOpenState({ [cbFormKey]: true });
	};

	// Render
	const renderCbForms = () => {
		return cbConfigs.map((cbConfig, index) => {
			const cbFormKey = getFormKey(cbConfig.formState.blockType, index);

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
					onChange={cbFormState => onChange(index, cbFormState)}
				/>
			);
		});
	};

	return (
		<Flex className="c-content-edit-view__content">
			<FlexItem>
				{cbConfigs.map((cbConfig, index) => (
					<ContentBlockPreview
						key={getFormKey(cbConfig.formState.blockType, index)}
						state={cbConfig.formState}
					/>
				))}
			</FlexItem>
			<Sidebar className="c-content-edit-view__sidebar" light>
				{renderCbForms()}
				<Form>
					<FormGroup
						label={t(
							'admin/content/views/content-edit-content-blocks___voeg-een-content-block-toe'
						)}
					>
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
