import {
	Button,
	ButtonToolbar,
	Column,
	Container,
	Form,
	Grid,
	Modal,
	ModalBody,
	Spacer,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC, useEffect, useState } from 'react';

import { TimeCropControls } from '../../../shared/components/TimeCropControls/TimeCropControls.js';
import { getValidStartAndEnd } from '../../../shared/helpers/cut-start-and-end.js';
import { isMobileWidth } from '../../../shared/helpers/media-query.js';
import { toSeconds } from '../../../shared/helpers/parsers/duration.js';
import { setModalVideoSeekTime } from '../../../shared/helpers/set-modal-video-seek-time.js';
import { tHtml } from '../../../shared/helpers/translate-html.js';
import { tText } from '../../../shared/helpers/translate-text.js';
import { type ItemTrimInfo } from '../../item.types.js';
import { ItemVideoDescription } from '../ItemVideoDescription.js';

import './CutFragmentModal.scss';

interface CutFragmentForAssignmentModalProps {
	itemMetaData: Avo.Item.Item;
	isOpen: boolean;
	onClose: () => void;
	afterCutCallback: (trimInfo: ItemTrimInfo) => void;
}

/**
 * Used to optionally cut a video/audio fragment
 * Used for teachers that want to add a video/audio to an assignment
 * But also for pupils that want to add a video/audio to their assignment collection
 * @param itemMetaData
 * @param isOpen
 * @param onClose
 * @param afterCutCallback
 * @constructor
 */
export const CutFragmentForAssignmentModal: FC<CutFragmentForAssignmentModalProps> = ({
	itemMetaData,
	isOpen,
	onClose,
	afterCutCallback,
}) => {
	const [fragmentStartTime, setFragmentStartTime] = useState<number>(0);
	const [fragmentEndTime, setFragmentEndTime] = useState<number>(
		toSeconds(itemMetaData.duration) || 0
	);

	useEffect(() => {
		if (isOpen) {
			// Reset the state
			setFragmentStartTime(0);
			setFragmentEndTime(toSeconds(itemMetaData.duration) || 0);
		}
	}, [isOpen, itemMetaData.duration]);

	const onApply = () => {
		const hasCut =
			fragmentEndTime !== toSeconds(itemMetaData.duration) || fragmentStartTime !== 0;
		return afterCutCallback({ hasCut, fragmentStartTime, fragmentEndTime });
	};

	const renderCutFragmentModal = () => {
		const fragmentDuration = toSeconds(itemMetaData.duration) || 0;
		const [start, end] = getValidStartAndEnd(
			fragmentStartTime,
			fragmentEndTime,
			fragmentDuration
		);

		return (
			<Modal
				title={tHtml(
					'item/components/modals/add-to-assignment-modal___knip-fragment-optioneel'
				)}
				size="extra-large"
				isOpen={isOpen}
				onClose={onClose}
				scrollable
			>
				<ModalBody>
					<div className="c-modal__body-add-fragment">
						<Spacer>
							<Form>
								{
									<ItemVideoDescription
										itemMetaData={itemMetaData}
										showTitle
										showMetadata={false}
										enableMetadataLink={false}
										showDescription
										canPlay={isOpen}
										cuePointsLabel={{ start, end }}
										verticalLayout={isMobileWidth()}
										trackPlayEvent={false}
									/>
								}
								<Grid>
									<Column size="2-7" className="u-spacer-top-l u-spacer-bottom-l">
										<TimeCropControls
											startTime={fragmentStartTime}
											endTime={fragmentEndTime}
											minTime={0}
											maxTime={fragmentDuration}
											onChange={(
												newStartTime: number,
												newEndTime: number
											) => {
												if (newStartTime !== fragmentStartTime) {
													setModalVideoSeekTime(newStartTime);
												} else if (newEndTime !== fragmentEndTime) {
													setModalVideoSeekTime(newEndTime);
												}
												setFragmentStartTime(newStartTime);
												setFragmentEndTime(newEndTime);
											}}
										/>
									</Column>
									<Column size="2-5">
										<Container mode="vertical" className="m-time-crop-controls">
											<Toolbar alignTop>
												<ToolbarRight>
													<ToolbarItem>
														<ButtonToolbar>
															<Button
																label={tText(
																	'item/components/modals/add-to-assignment-modal___overslaan'
																)}
																type="secondary"
																block
																onClick={() =>
																	afterCutCallback({
																		hasCut: false,
																		fragmentStartTime: 0,
																		fragmentEndTime: 0,
																	})
																}
															/>
															<Button
																label={tText(
																	'item/components/modals/add-to-assignment-modal___knip'
																)}
																type="primary"
																block
																onClick={onApply}
															/>
														</ButtonToolbar>
													</ToolbarItem>
												</ToolbarRight>
											</Toolbar>
										</Container>
									</Column>
								</Grid>
							</Form>
						</Spacer>
					</div>
				</ModalBody>
			</Modal>
		);
	};

	return renderCutFragmentModal();
};
