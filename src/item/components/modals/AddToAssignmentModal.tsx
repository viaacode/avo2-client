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
import type { Avo } from '@viaa/avo2-types';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import TimeCropControls from '../../../shared/components/TimeCropControls/TimeCropControls';
import { isMobileWidth, toSeconds } from '../../../shared/helpers';
import { getValidStartAndEnd } from '../../../shared/helpers/cut-start-and-end';
import { setModalVideoSeekTime } from '../../../shared/helpers/set-modal-video-seek-time';
import withUser, { UserProps } from '../../../shared/hocs/withUser';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ItemTrimInfo } from '../../item.types';
import ItemVideoDescription from '../ItemVideoDescription';

import './AddToAssignmentModal.scss';

interface AddToAssignmentModalProps {
	itemMetaData: Avo.Item.Item;
	isOpen: boolean;
	onClose: () => void;
	onAddToAssignmentCallback: (trimInfo: ItemTrimInfo) => void;
}

const AddToAssignmentModal: FunctionComponent<
	AddToAssignmentModalProps & RouteComponentProps & UserProps
> = ({ itemMetaData, isOpen, onClose, onAddToAssignmentCallback }) => {
	const { tText } = useTranslation();

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
		return onAddToAssignmentCallback({ hasCut, fragmentStartTime, fragmentEndTime });
	};

	const renderAddToAssignmentModal = () => {
		const fragmentDuration = toSeconds(itemMetaData.duration) || 0;
		const [start, end] = getValidStartAndEnd(
			fragmentStartTime,
			fragmentEndTime,
			fragmentDuration
		);

		return (
			<Modal
				title={tText(
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
								<ItemVideoDescription
									itemMetaData={itemMetaData}
									showTitle
									showDescription
									canPlay={isOpen}
									cuePointsLabel={{ start, end }}
									verticalLayout={isMobileWidth()}
								/>
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
																	onAddToAssignmentCallback({
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

	return renderAddToAssignmentModal();
};

export default compose(
	withRouter,
	withUser
)(AddToAssignmentModal) as FunctionComponent<AddToAssignmentModalProps>;
