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

import { getEnv } from '../../../shared/helpers/env';
import { formatDurationHoursMinutesSeconds } from '../../../shared/helpers/formatters/duration';
import { toSeconds } from '../../../shared/helpers/parsers/duration';
import { fetchPlayerTicket } from '../../../shared/services/player-ticket-service';
import toastService, { TOAST_TYPE } from '../../../shared/services/toast-service';
import { getValidationErrorsForStartAndEndTime } from '../../helpers/validation';

export interface FragmentPropertyUpdateInfo {
	value: string | number | boolean | null;
	fieldName: keyof Avo.Collection.Fragment;
	fragmentId: number;
}

interface CutFragmentModalProps {
	isOpen: boolean;
	onClose: () => void;
	itemMetaData: Avo.Item.Item;
	updateFragmentProperties: (updateInfos: FragmentPropertyUpdateInfo[]) => void;
	updateCuePoints: (cuepoints: any) => void;
	fragment: Avo.Collection.Fragment;
}

const CutFragmentModal: FunctionComponent<CutFragmentModalProps> = ({
	onClose,
	isOpen,
	itemMetaData,
	updateFragmentProperties,
	fragment,
	updateCuePoints,
}) => {
	const [playerTicket, setPlayerTicket] = useState<string>();
	const [fragmentStartTime, setFragmentStartTime] = useState<number>(fragment.start_oc || 0);
	const [fragmentEndTime, setFragmentEndTime] = useState<number>(
		fragment.end_oc || toSeconds(itemMetaData.duration, true) || 0
	);
	const [fragmentStartTimeString, setFragmentStartTimeString] = useState<string>(
		formatDurationHoursMinutesSeconds(fragment.start_oc || 0)
	);
	const [fragmentEndTimeString, setFragmentEndTimeString] = useState<string>(
		formatDurationHoursMinutesSeconds(
			fragment.end_oc || toSeconds(itemMetaData.duration, true) || 0
		)
	);

	const getValidationErrors = (): string[] => {
		const start = toSeconds(fragmentStartTimeString, true);
		const end = toSeconds(fragmentEndTimeString, true);

		return getValidationErrorsForStartAndEndTime({
			...fragment,
			start_oc: start,
			end_oc: end,
		});
	};

	const onSaveCut = () => {
		const errors = getValidationErrors();
		if (errors && errors.length) {
			toastService(
				<>
					{errors.map(error => (
						<>
							{error}
							{errors.length > 1 ? (
								<>
									<br />
									<br />
								</>
							) : null}
						</>
					))}
				</>,
				TOAST_TYPE.DANGER
			);
			return;
		}

		const start = toSeconds(fragmentStartTimeString, true);
		const end = toSeconds(fragmentEndTimeString, true);

		updateFragmentProperties([
			{ value: start, fieldName: 'start_oc' as const, fragmentId: fragment.id },
			{ value: end, fieldName: 'end_oc' as const, fragmentId: fragment.id },
		]);
		updateCuePoints({
			start,
			end,
		});
		onClose();
	};

	/**
	 * Checks in the text input fields have a correct value
	 */
	const parseTimes = () => {
		const errors = getValidationErrors();
		if (errors && errors.length) {
			return;
		}

		setFragmentStartTime(toSeconds(fragmentStartTimeString, true) as number);
		setFragmentEndTime(toSeconds(fragmentEndTimeString, true) as number);
		setFragmentStartTimeString(formatDurationHoursMinutesSeconds(fragmentStartTime));
		setFragmentEndTimeString(formatDurationHoursMinutesSeconds(fragmentEndTime));
	};

	const onUpdateMultiRangeValues = (values: number[]) => {
		setFragmentStartTimeString(formatDurationHoursMinutesSeconds(values[0]));
		setFragmentEndTimeString(formatDurationHoursMinutesSeconds(values[1]));
		setFragmentStartTime(values[0]);
		setFragmentEndTime(values[1]);
	};

	const handleOnKeyUp = (evt: KeyboardEvent<HTMLInputElement>) => {
		if (evt.keyCode || evt.which === 13) {
			parseTimes();
		}
	};

	const initFlowPlayer = () =>
		!playerTicket &&
		fetchPlayerTicket(itemMetaData.external_id).then(data => setPlayerTicket(data));

	// TODO: Replace publisher, published_at by real publisher
	return (
		<Modal isOpen={isOpen} title="Knip fragment" size="medium" onClose={onClose} scrollable={true}>
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
					/>
					<Container mode="vertical" className="m-time-crop-controls">
						<TextInput
							value={fragmentStartTimeString}
							onChange={setFragmentStartTimeString}
							onBlur={parseTimes}
							onKeyUp={handleOnKeyUp}
						/>
						<div className="m-multi-range-wrapper">
							<MultiRange
								values={[fragmentStartTime, fragmentEndTime]}
								onChange={onUpdateMultiRangeValues}
								min={0}
								max={toSeconds(itemMetaData.duration, true) || 0}
								step={1}
							/>
						</div>
						<TextInput
							value={fragmentEndTimeString}
							onChange={setFragmentEndTimeString}
							onBlur={parseTimes}
							onKeyUp={handleOnKeyUp}
						/>
					</Container>
					<Toolbar spaced>
						<ToolbarRight>
							<ToolbarItem>
								<ButtonToolbar>
									<Button type="secondary" label="Annuleren" onClick={onClose} />
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
