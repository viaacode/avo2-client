import {
	Button,
	ButtonToolbar,
	Container,
	Flex,
	FormGroup,
	MoreOptionsDropdown,
	TextInput,
	Toolbar,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import React, { Dispatch, FunctionComponent, SetStateAction, useState } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { UrlUpdateType } from 'use-query-params';

import { ReactComponent as PupilSvg } from '../../../../assets/images/leerling.svg';
import { CollectionBlockType } from '../../../../collection/collection.const';
import { BlockList } from '../../../../collection/components';
import EmptyStateMessage from '../../../../shared/components/EmptyStateMessage/EmptyStateMessage';
import { getMoreOptionsLabel } from '../../../../shared/constants';
import { isMobileWidth } from '../../../../shared/helpers';
import { useDraggableListModal } from '../../../../shared/hooks/use-draggable-list-modal';
import { ToastService } from '../../../../shared/services';
import {
	ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS,
	NEW_ASSIGNMENT_BLOCK_ID_PREFIX,
} from '../../../assignment.const';
import {
	Assignment_Response_v2,
	AssignmentResponseFormState,
	AssignmentResponseInfo,
	BaseBlockWithMeta,
	PupilCollectionFragment,
	PupilSearchFilterState,
} from '../../../assignment.types';
import { AssignmentBlockItemDescriptionType } from '../../../components/AssignmentBlockDescriptionButtons';
import { buildAssignmentSearchLink } from '../../../helpers/build-search-link';
import { insertMultipleAtPosition } from '../../../helpers/insert-at-position';
import {
	useAssignmentBlockChangeHandler,
	useBlockListModals,
	useBlocksList,
	useEditBlocks,
} from '../../../hooks';

import './AssignmentResponsePupilCollectionTab.scss';

enum MobileActionId {
	reorderBlocks = 'reorderBlocks',
	viewAsTeacher = 'viewAsTeacher',
}

interface AssignmentResponsePupilCollectionTabProps {
	pastDeadline: boolean;
	assignmentResponse: AssignmentResponseInfo;
	setAssignmentResponse: Dispatch<SetStateAction<Assignment_Response_v2>>;
	onShowPreviewClicked: () => void;
	setTab: (tab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS) => void;
	setFilterState: (state: PupilSearchFilterState, urlPushType?: UrlUpdateType) => void;
}

const AssignmentResponsePupilCollectionTab: FunctionComponent<
	AssignmentResponsePupilCollectionTabProps &
		Pick<UseFormReturn<AssignmentResponseFormState>, 'setValue' | 'control'>
> = ({
	pastDeadline,
	assignmentResponse,
	setAssignmentResponse,
	setValue,
	control,
	onShowPreviewClicked,
	setTab,
	setFilterState,
}) => {
	const [t] = useTranslation();
	const [isMobileOptionsMenuOpen, setIsMobileOptionsMenuOpen] = useState<boolean>(false);
	const [isDraggableListModalOpen, setIsDraggableListModalOpen] = useState<boolean>(false);

	const updateBlocksInAssignmentResponseState = (newBlocks: BaseBlockWithMeta[]) => {
		setAssignmentResponse(
			(prev: Assignment_Response_v2) =>
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
		setIsOpen: setIsDraggableListModalOpen,
	});

	// Effects

	// Events
	const [renderedModals, confirmSliceModal] = useBlockListModals(
		assignmentResponse?.pupil_collection_blocks || [],
		updateBlocksInAssignmentResponseState,
		{
			confirmSliceConfig: {
				responses: [],
			},
		}
	);
	const setBlock = useAssignmentBlockChangeHandler(
		assignmentResponse?.pupil_collection_blocks || [],
		updateBlocksInAssignmentResponseState
	);
	const renderBlockContent = useEditBlocks(setBlock, buildAssignmentSearchLink(setFilterState), [
		AssignmentBlockItemDescriptionType.original,
		AssignmentBlockItemDescriptionType.custom,
	]);
	const [renderedListSorter] = useBlocksList(
		// TODO rename to useEditBlockList and switch to component instead of hook
		assignmentResponse.pupil_collection_blocks || [],
		updateBlocksInAssignmentResponseState,
		{
			listSorter: {
				content: (item) => item && renderBlockContent(item),
				divider: (position: number) => (
					<Button
						icon="plus"
						type="secondary"
						onClick={() => {
							const newBlocks = insertMultipleAtPosition(
								assignmentResponse.pupil_collection_blocks || [],
								{
									id: `${NEW_ASSIGNMENT_BLOCK_ID_PREFIX}${new Date().valueOf()}`,
									assignment_response_id: assignmentResponse.id,
									type: CollectionBlockType.TEXT,
									position,
								} as PupilCollectionFragment
							);

							updateBlocksInAssignmentResponseState(newBlocks);
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
					label={getMoreOptionsLabel()}
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
					<Toolbar alignTop className="c-toolbar--no-height u-spacer-bottom-l">
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
										<Flex
											className="u-spacer-top-s u-spacer-bottom-s"
											orientation="vertical"
										>
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
						(assignmentResponse?.pupil_collection_blocks || []) as BaseBlockWithMeta[]
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

export default AssignmentResponsePupilCollectionTab;
