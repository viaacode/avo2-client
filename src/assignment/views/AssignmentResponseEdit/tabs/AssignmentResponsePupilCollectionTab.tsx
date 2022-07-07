import {
	Button,
	Container,
	Flex,
	FormGroup,
	Spacer,
	TextInput,
	Toolbar,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import { noop } from 'lodash-es';
import React, { Dispatch, FunctionComponent, SetStateAction } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { compose } from 'redux';

import { ItemsService } from '../../../../admin/items/items.service';
import emptyCollectionPlaceholder from '../../../../assets/images/empty-collection.jpg';
import BlockListEdit from '../../../../shared/components/BlockListEdit/BlockListEdit';
import withUser, { UserProps } from '../../../../shared/hocs/withUser';
import {
	ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS,
	NEW_ASSIGNMENT_BLOCK_ID_PREFIX,
} from '../../../assignment.const';
import {
	AssignmentBlockType,
	AssignmentResponseFormState,
	PupilCollectionFragment,
} from '../../../assignment.types';
import { insertAtPosition } from '../../../helpers/insert-at-position';
import { useAssignmentBlockChangeHandler, useBlockListModals, useBlocks } from '../../../hooks';

import './AssignmentResponsePupilCollectionTab.scss';

interface AssignmentResponsePupilCollectionTabProps {
	assignmentResponse: Avo.Assignment.Response_v2;
	setAssignmentResponse: Dispatch<SetStateAction<Avo.Assignment.Response_v2>>;
	setTab: (tab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS) => void;
}

const AssignmentResponsePupilCollectionTab: FunctionComponent<
	AssignmentResponsePupilCollectionTabProps &
		Pick<UseFormReturn<AssignmentResponseFormState>, 'setValue' | 'control'> &
		UserProps
> = ({ assignmentResponse, setAssignmentResponse, setValue, control, setTab, user }) => {
	const [t] = useTranslation();

	// UI

	// Effects

	// Events

	const updateBlocksInAssignmentResponseState = (newBlocks: Avo.Core.BlockItemBase[]) => {
		setAssignmentResponse(
			(prev) =>
				({
					...prev,
					pupil_collection_blocks: newBlocks as PupilCollectionFragment[],
				} as any)
		); // TODO remove cast once pupil_collection_blocks is in typings repo
		setValue('pupil_collection_blocks', newBlocks as PupilCollectionFragment[], {
			shouldDirty: true,
			shouldTouch: true,
		});
	};
	const onAddItem = async (itemExternalId: string) => {
		if (addBlockModal.entity == null) {
			return;
		}

		// fetch item details
		const item_meta = (await ItemsService.fetchItemByExternalId(itemExternalId)) || undefined;
		const newBlocks = insertAtPosition<Partial<Avo.Core.BlockItemBase>>(
			assignmentResponse?.pupil_collection_blocks || [],
			{
				id: `${NEW_ASSIGNMENT_BLOCK_ID_PREFIX}${new Date().valueOf()}`,
				item_meta,
				type: AssignmentBlockType.ITEM,
				fragment_id: itemExternalId,
				position: addBlockModal.entity,
			} as AssignmentBlock
		) as AssignmentBlock[];

		updateBlocksInAssignmentResponseState(newBlocks);
	};
	const [renderedModals, confirmSliceModal, addBlockModal] = useBlockListModals(
		assignmentResponse?.pupil_collection_blocks || [],
		updateBlocksInAssignmentResponseState,
		{
			confirmSliceConfig: {
				responses: [],
			},
			addBookmarkFragmentConfig: {
				user,
				addFragmentCallback: onAddItem,
			},
		}
	);
	const setBlock = useAssignmentBlockChangeHandler(
		(assignmentResponse as any)?.pupil_collection_blocks, // TODO remove cast once Avo.Core.BlockItemBase is in typings repo
		updateBlocksInAssignmentResponseState
	);
	const renderBlockContent = useBlocks(setBlock);

	// Render

	return (
		<Container mode="horizontal">
			<Container mode="vertical">
				<Toolbar size="large">
					<ToolbarLeft>
						<Controller
							name="collection_title"
							control={control}
							render={({ field, fieldState: { error, isTouched } }) => (
								<FormGroup
									label={t(
										'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___naam-resultatenset'
									)}
									className="c-form-group--full-width"
								>
									<Flex orientation="vertical">
										<TextInput
											type="text"
											value={field.value || ''}
											onChange={(newTitle: string) => {
												setAssignmentResponse((prev) => {
													return {
														...prev,
														collection_title: newTitle,
													};
												});
												setValue('collection_title', newTitle, {
													shouldDirty: true,
													shouldTouch: true,
												});
											}}
										/>
									</Flex>

									{error && isTouched && (
										<span className="c-floating-error">
											{t(
												'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___een-titel-is-verplicht'
											)}
										</span>
									)}
								</FormGroup>
							)}
						/>
					</ToolbarLeft>
					<ToolbarRight>
						<Button
							type="primary"
							label={t(
								'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___bekijk-als-lesgever'
							)}
							onClick={noop}
						/>
					</ToolbarRight>
				</Toolbar>
			</Container>
			<Container mode="vertical">
				<BlockListEdit
					blocks={assignmentResponse?.pupil_collection_blocks || []}
					setBlocks={updateBlocksInAssignmentResponseState}
					config={{
						listSorter: {
							content: (item) => item && renderBlockContent(item),
							divider: (item) => (
								<Button
									icon="plus"
									type="secondary"
									onClick={() => {
										addBlockModal.setEntity(item?.position);
										addBlockModal.setOpen(true);
									}}
								/>
							),
						},
						listSorterItem: {
							onSlice: (item) => {
								confirmSliceModal.setEntity(item);
								confirmSliceModal.setOpen(true);
							},
						},
					}}
				/>
				<Container mode="vertical" className="c-empty-collection-placeholder">
					<Flex orientation="vertical" center>
						<img
							alt={t(
								'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___lege-collectie-placeholder-afbeelding'
							)}
							src={emptyCollectionPlaceholder}
						/>
						<Spacer margin={['top-large', 'bottom']}>
							<h2>
								{t(
									'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___mijn-collectie-is-nog-leeg'
								)}
							</h2>
						</Spacer>
						<p>
							{t(
								'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___ga-naar'
							)}{' '}
							<Button
								type="inline-link"
								label={t(
									'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___zoeken'
								)}
								onClick={() =>
									setTab(ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.SEARCH)
								}
							/>{' '}
							{t(
								'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___om-fragmenten-toe-te-voegen-of-druk-op-de-plus-knop-hierboven-als-je-tekstblokken-wil-aanmaken'
							)}
						</p>
					</Flex>
				</Container>
			</Container>
			{renderedModals}
		</Container>
	);
};

export default compose(withUser)(AssignmentResponsePupilCollectionTab) as FunctionComponent<
	AssignmentResponsePupilCollectionTabProps &
		Pick<UseFormReturn<AssignmentResponseFormState>, 'setValue' | 'control'>
>;
