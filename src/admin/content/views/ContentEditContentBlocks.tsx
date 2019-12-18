import React, { FunctionComponent, useReducer, useState } from 'react';

import { Flex, FlexItem, Form, FormGroup, Select } from '@viaa/avo2-components';

import { ContentBlockForm, ContentBlockPreview } from '../../content-block/components';
import {
	CONTENT_BLOCK_CONFIG_MAP,
	CONTENT_BLOCK_TYPE_OPTIONS,
} from '../../content-block/content-block.const';
import { ContentBlockFormStates, ContentBlockType } from '../../content-block/content-block.types';
import { Sidebar } from '../../shared/components';

import { ContentEditBlocksActionType } from '../content.types';
import { CONTENT_EDIT_BLOCKS_INITIAL_STATE, contentEditBlocksReducer } from '../helpers/reducer';

const ContentEditContentBlocks: FunctionComponent = () => {
	const initialState = CONTENT_EDIT_BLOCKS_INITIAL_STATE();

	// Hooks
	const [accordionsOpenState, setAccordionsOpenState] = useState<{ [key: string]: boolean }>({});
	const [{ cbConfigs }, dispatch] = useReducer(
		contentEditBlocksReducer(initialState),
		initialState
	);

	// Methods
	const getFormKey = (name: string, index: number) => `${name}-${index}`;

	const handleCbAdd = (configType: ContentBlockType) => {
		const newConfig = CONTENT_BLOCK_CONFIG_MAP[configType]();
		const cbFormKey = getFormKey(newConfig.name, cbConfigs.length);
		// Update content block configs
		dispatch({
			type: ContentEditBlocksActionType.ADD_CB_CONFIG,
			payload: newConfig,
		});
		// Set newly added config accordion as open
		setAccordionsOpenState({ [cbFormKey]: true });
	};

	const handleSave = (index: number, formState: Partial<ContentBlockFormStates>) => {
		dispatch({
			type: ContentEditBlocksActionType.SET_FORM_STATE,
			payload: { index, formState },
		});
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
					onChange={cbFormState => handleSave(index, cbFormState)}
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
