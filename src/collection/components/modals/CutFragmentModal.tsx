import {
	Button,
	ButtonToolbar,
	Modal,
	ModalBody,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { noop } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ItemVideoDescription } from '../../../item/components';
import TimeCropControls from '../../../shared/components/TimeCropControls/TimeCropControls';
import { isMobileWidth, toSeconds } from '../../../shared/helpers';
import { getValidStartAndEnd } from '../../../shared/helpers/cut-start-and-end';
import { setModalVideoSeekTime } from '../../../shared/helpers/set-modal-video-seek-time';
import { ToastService } from '../../../shared/services';
import { VideoStillService } from '../../../shared/services/video-stills-service';
import { getValidationErrorsForStartAndEnd } from '../../collection.helpers';
import { CollectionAction } from '../CollectionOrBundleEdit';

import './CutFragmentModal.scss';

export interface CutFragmentModalProps {
	isOpen: boolean;
	itemMetaData: Avo.Item.Item;
	index: number;
	fragment: Pick<
		Avo.Collection.Fragment,
		'start_oc' | 'end_oc' | 'item_meta' | 'thumbnail_path' | 'external_id'
	>;
	changeCollectionState: (action: CollectionAction) => void;
	onClose: () => void;
	onConfirm?: (update: Pick<Avo.Collection.Fragment, 'start_oc' | 'end_oc'>) => void;
}

const CutFragmentModal: FunctionComponent<CutFragmentModalProps> = ({
	isOpen,
	itemMetaData,
	index,
	fragment,
	changeCollectionState = noop,
	onClose,
	onConfirm,
}) => {
	const [t] = useTranslation();

	// Save initial state for reusability purposes
	const [start, end] = getValidStartAndEnd(
		fragment.start_oc,
		fragment.end_oc,
		toSeconds(itemMetaData.duration)
	);

	const [fragmentStartTime, setFragmentStartTime] = useState<number>(start || 0);
	const [fragmentEndTime, setFragmentEndTime] = useState<number>(
		end || toSeconds(itemMetaData.duration) || 0
	);

	const getValidationErrors = (): string[] => {
		return getValidationErrorsForStartAndEnd({
			...fragment,
			start_oc: fragmentStartTime,
			end_oc: fragmentEndTime,
		});
	};

	const onSaveCut = async () => {
		const errors = getValidationErrors();

		if (errors && errors.length) {
			ToastService.danger(errors);

			return;
		}

		const hasNoCut = fragmentStartTime === 0 && fragmentEndTime === fragmentDuration;

		changeCollectionState({
			index,
			type: 'UPDATE_FRAGMENT_PROP',
			fragmentProp: 'start_oc',
			fragmentPropValue: hasNoCut ? null : fragmentStartTime,
		});

		changeCollectionState({
			index,
			type: 'UPDATE_FRAGMENT_PROP',
			fragmentProp: 'end_oc',
			fragmentPropValue: hasNoCut ? null : fragmentEndTime,
		});

		try {
			const videoStill: string = hasNoCut
				? itemMetaData.thumbnail_path
				: await VideoStillService.getVideoStill(
						fragment.external_id,
						(fragmentStartTime || 0) * 1000
				  );

			if (videoStill) {
				changeCollectionState({
					index,
					type: 'UPDATE_FRAGMENT_PROP',
					fragmentProp: 'thumbnail_path',
					fragmentPropValue: videoStill,
				});
			}
		} catch (error) {
			console.warn('Failed to update video still.', error);
		}

		changeCollectionState({
			index,
			type: 'UPDATE_FRAGMENT_PROP',
			fragmentProp: 'start_oc',
			fragmentPropValue: fragmentStartTime,
		});

		changeCollectionState({
			index,
			type: 'UPDATE_FRAGMENT_PROP',
			fragmentProp: 'end_oc',
			fragmentPropValue: fragmentEndTime,
		});

		onConfirm &&
			onConfirm({
				start_oc: hasNoCut ? null : fragmentStartTime,
				end_oc: hasNoCut ? null : fragmentEndTime,
			});

		onClose();
	};

	const onCancelCut = () => {
		// Reset to default state
		setFragmentStartTime(start || 0);
		setFragmentEndTime(end || toSeconds(itemMetaData.duration) || 0);

		// Close modal
		onClose();
	};

	const fragmentDuration: number = toSeconds(itemMetaData.duration, true) || 0;
	return (
		<Modal
			isOpen={isOpen}
			title={t('collection/components/modals/cut-fragment-modal___knip-fragment')}
			size="auto"
			onClose={onClose}
			scrollable
			className="m-cut-fragment-modal"
		>
			<ModalBody>
				<ItemVideoDescription
					itemMetaData={itemMetaData}
					showTitle
					showDescription={false}
					canPlay={isOpen}
					cuePointsLabel={{
						start: fragmentStartTime,
						end: fragmentEndTime,
					}}
					verticalLayout={isMobileWidth()}
				/>
				<TimeCropControls
					className="u-spacer-top-l u-spacer-bottom-l"
					startTime={fragmentStartTime}
					endTime={fragmentEndTime}
					minTime={0}
					maxTime={fragmentDuration}
					onChange={(newStartTime: number, newEndTime: number) => {
						if (newStartTime !== fragmentStartTime) {
							setModalVideoSeekTime(newStartTime);
						} else if (newEndTime !== fragmentEndTime) {
							setModalVideoSeekTime(newEndTime);
						}
						setFragmentStartTime(newStartTime);
						setFragmentEndTime(newEndTime);
					}}
				/>
				<Toolbar spaced>
					<ToolbarRight>
						<ToolbarItem>
							<ButtonToolbar>
								<Button
									type="secondary"
									label={t(
										'collection/components/modals/cut-fragment-modal___annuleren'
									)}
									onClick={onCancelCut}
								/>
								<Button
									type="primary"
									label={t(
										'collection/components/modals/cut-fragment-modal___knippen'
									)}
									onClick={onSaveCut}
								/>
							</ButtonToolbar>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalBody>
		</Modal>
	);
};

export default CutFragmentModal;
