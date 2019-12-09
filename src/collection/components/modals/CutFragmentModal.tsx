import { clamp, get } from 'lodash-es';
import React, { FunctionComponent, KeyboardEvent, useState } from 'react';

import {
	Button,
	ButtonToolbar,
	Container,
	FlowPlayer,
	Modal,
	ModalBody,
	MultiRange,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { formatDurationHoursMinutesSeconds, getEnv, toSeconds } from '../../../shared/helpers';
import { fetchPlayerTicket } from '../../../shared/services/player-ticket-service';
import { getVideoStills } from '../../../shared/services/stills-service';
import toastService from '../../../shared/services/toast-service';

import { getValidationErrorsForStartAndEnd } from '../../collection.helpers';
import { FragmentPropertyUpdateInfo } from '../../collection.types';

interface CutFragmentModalProps {
	isOpen: boolean;
	itemMetaData: Avo.Item.Item;
	fragment: Avo.Collection.Fragment;
	updateFragmentProperties: (updateInfos: FragmentPropertyUpdateInfo[]) => void;
	updateCuePoints: (cuepoints: any) => void;
	onClose: () => void;
}

const CutFragmentModal: FunctionComponent<CutFragmentModalProps> = ({
	onClose,
	isOpen,
	itemMetaData,
	updateFragmentProperties,
	fragment,
	updateCuePoints,
}) => {
	// Save initial state for reusability purposess
	const { start, end, startString, endString } = {
		start: fragment.start_oc || 0,
		end: fragment.end_oc || toSeconds(itemMetaData.duration, true) || 0,
		startString: formatDurationHoursMinutesSeconds(fragment.start_oc || 0),
		endString: formatDurationHoursMinutesSeconds(
			fragment.end_oc || toSeconds(itemMetaData.duration, true) || 0
		),
	};

	const [playerTicket, setPlayerTicket] = useState<string>();
	const [fragmentStart, setFragmentStart] = useState<number>(start);
	const [fragmentEnd, setFragmentEnd] = useState<number>(end);
	const [fragmentStartString, setFragmentStartString] = useState<string>(startString);
	const [fragmentEndString, setFragmentEndString] = useState<string>(endString);

	const getValidationErrors = (): string[] => {
		const startTime = toSeconds(fragmentStartString, true);
		const endTime = toSeconds(fragmentEndString, true);

		return getValidationErrorsForStartAndEnd({
			...fragment,
			start_oc: startTime,
			end_oc: endTime,
		});
	};

	const onSaveCut = async () => {
		setFragmentStart(toSeconds(fragmentStartString, true) as number);
		setFragmentEnd(toSeconds(fragmentEndString, true) as number);
		setFragmentStartString(formatDurationHoursMinutesSeconds(fragmentStart));
		setFragmentEndString(formatDurationHoursMinutesSeconds(fragmentEnd));

		const errors = getValidationErrors();

		if (errors && errors.length) {
			toastService.danger(errors);

			return;
		}

		const startTime = toSeconds(fragmentStartString, true);
		const endTime = toSeconds(fragmentEndString, true);

		const videoStills = await getVideoStills([
			{ externalId: fragment.external_id, startTime: startTime || 0 },
		]);

		updateFragmentProperties([
			{ value: startTime, fieldName: 'start_oc' as const, fragmentId: fragment.id },
			{ value: endTime, fieldName: 'end_oc' as const, fragmentId: fragment.id },
			...(videoStills && videoStills.length > 0
				? [
						{
							value: {
								...(fragment.item_meta || {}),
								thumbnail_path: videoStills[0].thumbnailImagePath,
							},
							fieldName: 'item_meta' as const,
							fragmentId: fragment.id,
						},
				  ]
				: []),
		]);
		updateCuePoints({
			start: startTime,
			end: endTime,
		});
		onClose();
	};

	const onCancelCut = () => {
		// Reset to default state
		setFragmentStart(start);
		setFragmentEnd(end);
		setFragmentStartString(startString);
		setFragmentEndString(endString);

		// Close modal
		onClose();
	};

	/**
	 * Checks in the text input fields have a correct value
	 */
	const parseTimes = () => {
		// Limit start end and times between 0 and fragment duration
		let startTime = toSeconds(fragmentStartString, true) as number;
		let endTime = toSeconds(fragmentEndString, true) as number;
		const duration =
			(fragment.item_meta &&
				fragment.item_meta.duration &&
				toSeconds(fragment.item_meta.duration)) ||
			0;
		if (startTime) {
			startTime = clamp(startTime, 0, duration);
			setFragmentStart(startTime);
			setFragmentStartString(formatDurationHoursMinutesSeconds(startTime));
		}
		if (endTime) {
			endTime = clamp(endTime, 0, duration);
			setFragmentEnd(endTime);
			setFragmentEndString(formatDurationHoursMinutesSeconds(endTime));
		}
	};

	const onUpdateMultiRangeValues = (values: number[]) => {
		setFragmentStart(values[0]);
		setFragmentEnd(values[1]);
		setFragmentStartString(formatDurationHoursMinutesSeconds(values[0]));
		setFragmentEndString(formatDurationHoursMinutesSeconds(values[1]));
	};

	const handleOnKeyUp = (evt: KeyboardEvent<HTMLInputElement>) => {
		if (evt.keyCode === 13 || evt.which === 13) {
			parseTimes();
		}
	};

	const initFlowPlayer = () =>
		!playerTicket &&
		fetchPlayerTicket(itemMetaData.external_id).then(data => setPlayerTicket(data));

	// TODO: Replace publisher, published_at by real publisher
	return (
		<Modal isOpen={isOpen} title="Knip fragment" size="medium" onClose={onClose} scrollable>
			<ModalBody>
				<>
					<FlowPlayer
						src={playerTicket ? playerTicket.toString() : null}
						poster={itemMetaData.thumbnail_path}
						title={itemMetaData.title}
						onInit={initFlowPlayer}
						subtitles={['30-12-2011', 'VRT']}
						token={getEnv('FLOW_PLAYER_TOKEN')}
						dataPlayerId={getEnv('FLOW_PLAYER_ID')}
						logo={get(itemMetaData, 'organisation.logo_url')}
					/>
					<Container mode="vertical" className="m-time-crop-controls">
						<TextInput
							value={fragmentStartString}
							onChange={setFragmentStartString}
							onBlur={parseTimes}
							onKeyUp={handleOnKeyUp}
						/>
						<div className="m-multi-range-wrapper">
							<MultiRange
								values={[fragmentStart, fragmentEnd]}
								onChange={onUpdateMultiRangeValues}
								min={0}
								max={toSeconds(itemMetaData.duration, true) || 0}
								step={1}
							/>
						</div>
						<TextInput
							value={fragmentEndString}
							onChange={setFragmentEndString}
							onBlur={parseTimes}
							onKeyUp={handleOnKeyUp}
						/>
					</Container>
					<Toolbar spaced>
						<ToolbarRight>
							<ToolbarItem>
								<ButtonToolbar>
									<Button type="secondary" label="Annuleren" onClick={onCancelCut} />
									<Button type="primary" label="Knippen" onClick={onSaveCut} />
								</ButtonToolbar>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</>
			</ModalBody>
		</Modal>
	);
};

export default CutFragmentModal;
