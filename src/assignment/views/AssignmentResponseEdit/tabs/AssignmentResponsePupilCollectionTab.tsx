import {
	Button,
	ButtonToolbar,
	Container,
	Flex,
	FormGroup,
	TextInput,
	Toolbar,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import React, { Dispatch, FunctionComponent, SetStateAction, useState } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { compose } from 'redux';

import { ItemsService } from '../../../../admin/items/items.service';
import { ReactComponent as PupilSvg } from '../../../../assets/images/leerling.svg';
import { BlockList } from '../../../../collection/components';
import EmptyStateMessage from '../../../../shared/components/EmptyStateMessage/EmptyStateMessage';
import MoreOptionsDropdown from '../../../../shared/components/MoreOptionsDropdown/MoreOptionsDropdown';
import { isMobileWidth } from '../../../../shared/helpers';
import withUser, { UserProps } from '../../../../shared/hocs/withUser';
import { useDraggableListModal } from '../../../../shared/hooks/use-draggable-list-modal';
import { ToastService } from '../../../../shared/services';
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
import {
	useAssignmentBlockChangeHandler,
	useBlockListModals,
	useBlocksList,
	useEditBlocks,
} from '../../../hooks';
import { CustomFieldOption } from '../../../hooks/assignment-block-description-buttons';

import './AssignmentResponsePupilCollectionTab.scss';

enum MobileActionId {
	reorderBlocks = 'reorderBlocks',
	viewAsTeacher = 'viewAsTeacher',
}

interface AssignmentResponsePupilCollectionTabProps {
	pastDeadline: boolean;
	assignmentResponse: Avo.Assignment.Response_v2;
	setAssignmentResponse: Dispatch<SetStateAction<Avo.Assignment.Response_v2>>;
	onShowPreviewClicked: () => void;
	setTab: (tab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS) => void;
}

const AssignmentResponsePupilCollectionTab: FunctionComponent<
	AssignmentResponsePupilCollectionTabProps &
		Pick<UseFormReturn<AssignmentResponseFormState>, 'setValue' | 'control'> &
		UserProps
> = ({
	pastDeadline,
	assignmentResponse,
	setAssignmentResponse,
	setValue,
	control,
	onShowPreviewClicked,
	setTab,
	user,
}) => {
	const [t] = useTranslation();
	const [isMobileOptionsMenuOpen, setIsMobileOptionsMenuOpen] = useState<boolean>(false);
	const [isDraggableListModalOpen, setIsDraggableListModalOpen] = useState<boolean>(false);

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

	// UI

	const [draggableListButton, draggableListModal] = useDraggableListModal({
		modal: {
			items: assignmentResponse.pupil_collection_blocks,
			isOpen: isDraggableListModalOpen,
			onClose: (updatedBlocks?: PupilCollectionFragment[]) => {
				setIsDraggableListModalOpen(false);
				if (updatedBlocks) {
					const newBlocks = updatedBlocks.map((item, i) => ({
						...item,
						position: assignmentResponse.pupil_collection_blocks?.[i]?.position || 0,
					}));

					updateBlocksInAssignmentResponseState(newBlocks);
				}
			},
		},
	});

	// Effects

	// Events
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
	const renderBlockContent = useEditBlocks(setBlock, [
		CustomFieldOption.original,
		CustomFieldOption.custom,
	]);
	const [renderedListSorter] = useBlocksList(
		// TODO rename to useEditBlockList and switch to component instead of hook
		assignmentResponse.pupil_collection_blocks || [],
		updateBlocksInAssignmentResponseState,
		{
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
		}
	);

	const executeMobileButtonAction = (action: MobileActionId) => {
		switch (action) {
			case MobileActionId.reorderBlocks:
				setIsDraggableListModalOpen(true);
				break;

			case MobileActionId.viewAsTeacher:
				onShowPreviewClicked();
				break;

			default:
				ToastService.danger(
					t(
						'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___knop-actie-niet-gekend'
					)
				);
		}
	};

	// Render

	const renderActionButtons = () => {
		if (isMobileWidth()) {
			return (
				<MoreOptionsDropdown
					isOpen={isMobileOptionsMenuOpen}
					onOpen={() => setIsMobileOptionsMenuOpen(true)}
					onClose={() => setIsMobileOptionsMenuOpen(false)}
					menuItems={[
						{
							label: t(
								'collection/components/collection-or-bundle-edit___herorden-fragmenten'
							),
							id: MobileActionId.reorderBlocks,
						},
						{
							label: t(
								'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___bekijk-als-lesgever'
							),
							id: MobileActionId.viewAsTeacher,
						},
					]}
					onOptionClicked={(action) =>
						executeMobileButtonAction(action as MobileActionId)
					}
				/>
			);
		}
		return (
			<ButtonToolbar>
				{!!assignmentResponse?.pupil_collection_blocks?.length && draggableListButton}
				<Button
					type="primary"
					label={t(
						'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___bekijk-als-lesgever'
					)}
					onClick={onShowPreviewClicked}
				/>
			</ButtonToolbar>
		);
	};

	const renderPupilCollectionBlocks = () => {
		return (
			<>
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
						<ToolbarRight>{renderActionButtons()}</ToolbarRight>
					</Toolbar>
				</Container>
				<Container mode="vertical">
					{renderedListSorter}
					{!assignmentResponse?.pupil_collection_blocks?.length && (
						<EmptyStateMessage
							img={<PupilSvg />}
							title={t(
								'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___mijn-collectie-is-nog-leeg'
							)}
							message={
								<>
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
									)}{' '}
									<a href="/hulp" target="_blank">
										{t(
											'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___hier'
										)}
									</a>
									{'.'}
								</>
							}
						/>
					)}
				</Container>
			</>
		);
	};

	const renderReadOnlyPupilCollectionBlocks = () => {
		return (
			<Container mode="vertical">
				<BlockList
					blocks={
						(assignmentResponse?.pupil_collection_blocks ||
							[]) as Avo.Core.BlockItemBase[]
					}
				/>
			</Container>
		);
	};

	return (
		<Container mode="horizontal">
			{pastDeadline ? renderReadOnlyPupilCollectionBlocks() : renderPupilCollectionBlocks()}
			{renderedModals}
			{draggableListModal}
		</Container>
	);
};

export default compose(withUser)(AssignmentResponsePupilCollectionTab) as FunctionComponent<
	AssignmentResponsePupilCollectionTabProps &
		Pick<UseFormReturn<AssignmentResponseFormState>, 'setValue' | 'control'>
>;
