import {
	Button,
	ButtonToolbar,
	Column,
	Container,
	Form,
	Grid,
	Modal,
	ModalBody,
	MultiRange,
	Spacer,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { clamp } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import {
	formatDurationHoursMinutesSeconds,
	isMobileWidth,
	parseDuration,
	toSeconds,
} from '../../../shared/helpers';
import { getValidStartAndEnd } from '../../../shared/helpers/cut-start-and-end';
import withUser, { UserProps } from '../../../shared/hocs/withUser';
import { ToastService } from '../../../shared/services';
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
	const [t] = useTranslation();

	const [fragmentStartString, setFragmentStartString] = useState<string>(
		formatDurationHoursMinutesSeconds(0)
	);
	const [fragmentEndString, setFragmentEndString] = useState<string>(itemMetaData.duration);
	const [fragmentStartTime, setFragmentStartTime] = useState<number>(0);
	const [fragmentEndTime, setFragmentEndTime] = useState<number>(
		toSeconds(itemMetaData.duration) || 0
	);

	const minTime = 0;
	const maxTime: number = toSeconds(itemMetaData.duration) || 0;

	const clampDuration = (value: number): number => {
		return clamp(value, minTime, maxTime);
	};

	useEffect(() => {
		if (isOpen) {
			// Reset the state
			setFragmentStartTime(0);
			setFragmentEndTime(toSeconds(itemMetaData.duration) || 0);
		}
	}, [isOpen, itemMetaData.duration]);

	const onUpdateMultiRangeValues = (values: number[]) => {
		setFragmentStartTime(values[0]);
		setFragmentEndTime(values[1]);
		setFragmentStartString(formatDurationHoursMinutesSeconds(values[0]));
		setFragmentEndString(formatDurationHoursMinutesSeconds(values[1]));
	};

	const onApply = () => {
		const hasCut =
			fragmentEndTime !== toSeconds(itemMetaData.duration) || fragmentStartTime !== 0;
		return onAddToAssignmentCallback({ hasCut, fragmentStartTime, fragmentEndTime });
	};

	const updateStartAndEnd = (type: 'start' | 'end', value?: string) => {
		if (value) {
			// onChange event
			if (type === 'start') {
				setFragmentStartString(value);
			} else {
				setFragmentEndString(value);
			}
			if (/[0-9]{2}:[0-9]{2}:[0-9]{2}/.test(value)) {
				// full duration
				if (type === 'start') {
					const newStartTime = clampDuration(parseDuration(value));
					setFragmentStartTime(newStartTime);
					setFragmentStartString(formatDurationHoursMinutesSeconds(newStartTime));
					if (newStartTime > fragmentEndTime) {
						setFragmentEndTime(newStartTime);
						setFragmentEndString(formatDurationHoursMinutesSeconds(newStartTime));
					}
				} else {
					const newEndTime = clampDuration(parseDuration(value));
					setFragmentEndTime(newEndTime);
					setFragmentEndString(formatDurationHoursMinutesSeconds(newEndTime));
					if (newEndTime < fragmentStartTime) {
						setFragmentStartTime(newEndTime);
						setFragmentStartString(formatDurationHoursMinutesSeconds(newEndTime));
					}
				}
			}
			// else do nothing yet, until the user finishes the time entry
		} else {
			// on blur event
			if (type === 'start') {
				if (/[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/.test(fragmentStartString)) {
					const newStartTime = clampDuration(parseDuration(fragmentStartString));
					setFragmentStartTime(newStartTime);
					setFragmentStartString(formatDurationHoursMinutesSeconds(newStartTime));
					if (newStartTime > fragmentEndTime) {
						setFragmentEndTime(newStartTime);
						setFragmentEndString(formatDurationHoursMinutesSeconds(newStartTime));
					}
				} else {
					setFragmentStartTime(0);
					setFragmentStartString(formatDurationHoursMinutesSeconds(0));
					ToastService.danger(
						t(
							'item/components/modals/add-to-assignment-modal___de-ingevulde-starttijd-heeft-niet-het-correcte-formaat-uu-mm-ss'
						)
					);
				}
			} else {
				if (/[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/.test(fragmentEndString)) {
					const newEndTime = clampDuration(parseDuration(fragmentEndString));
					setFragmentEndTime(newEndTime);
					setFragmentEndString(formatDurationHoursMinutesSeconds(newEndTime));
					if (newEndTime < fragmentStartTime) {
						setFragmentStartTime(newEndTime);
						setFragmentStartString(formatDurationHoursMinutesSeconds(newEndTime));
					}
				} else {
					setFragmentEndTime(toSeconds(itemMetaData.duration) || 0);
					setFragmentEndString(
						formatDurationHoursMinutesSeconds(toSeconds(itemMetaData.duration) || 0)
					);
					ToastService.danger(
						t(
							'item/components/modals/add-to-assignment-modal___de-ingevulde-eindtijd-heeft-niet-het-correcte-formaat-uu-mm-ss'
						)
					);
				}
			}
		}
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
				title={t(
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
									cuePoints={{ start, end }}
									verticalLayout={isMobileWidth()}
								/>
								<Grid>
									<Column size="2-7">
										<Container mode="vertical" className="m-time-crop-controls">
											<TextInput
												value={fragmentStartString}
												onBlur={() => updateStartAndEnd('start')}
												onChange={(endTime) =>
													updateStartAndEnd('start', endTime)
												}
											/>
											<div className="m-multi-range-wrapper">
												<MultiRange
													values={[start, end]}
													onChange={onUpdateMultiRangeValues}
													min={0}
													max={fragmentDuration}
													step={1}
												/>
											</div>
											<TextInput
												value={fragmentEndString}
												onBlur={() => updateStartAndEnd('end')}
												onChange={(endTime) =>
													updateStartAndEnd('end', endTime)
												}
											/>
										</Container>
									</Column>
									<Column size="2-5">
										<Container mode="vertical" className="m-time-crop-controls">
											<Toolbar alignTop>
												<ToolbarRight>
													<ToolbarItem>
														<ButtonToolbar>
															<Button
																label={t(
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
																label={t(
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
