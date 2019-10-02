import React, { FunctionComponent, useState } from 'react';

import {
	Button,
	Container,
	Modal,
	ModalBody,
	MultiRange,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { FlowPlayer } from '../../../shared/components/FlowPlayer/FlowPlayer';
import { formatDurationHoursMinutesSeconds } from '../../../shared/helpers/formatters/duration';
import { toSeconds } from '../../../shared/helpers/parsers/duration';
import { fetchPlayerTicket } from '../../../shared/services/player-service';

interface CutFragmentModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	itemMetaData: Avo.Item.Response;
	updateFragmentProperty: (value: any, fieldName: string, fragmentId: number) => void;
	updateCuePoints: (cuepoints: any) => void;
	fragment: Avo.Collection.Fragment;
}

const CutFragmentModal: FunctionComponent<CutFragmentModalProps> = ({
	setIsOpen,
	isOpen,
	itemMetaData,
	updateFragmentProperty,
	fragment,
	updateCuePoints,
}) => {
	const [playerTicket, setPlayerTicket] = useState<string>();
	const [fragmentStartTime, setFragmentStartTime] = useState<number>(fragment.start_oc || 0);
	const [fragmentEndTime, setFragmentEndTime] = useState<number>(
		fragment.end_oc || toSeconds(itemMetaData.duration) || 0
	);

	const onSaveCut = () => {
		updateFragmentProperty(fragmentStartTime, 'start_oc', fragment.id);
		updateFragmentProperty(fragmentEndTime, 'end_oc', fragment.id);
		updateCuePoints({
			start: fragmentStartTime,
			end: fragmentEndTime,
		});
		setIsOpen(false);
	};

	/**
	 * Converts a duration of the format "00:03:36" to number of seconds and stores it under the appropriate state
	 * @param timeString
	 * @param startOrEnd
	 */
	const setFragmentTime = (timeString: string, startOrEnd: 'start' | 'end') => {
		const setFunctions = {
			start: setFragmentStartTime,
			end: setFragmentEndTime,
		};
		const seconds = toSeconds(timeString);

		if (seconds !== null) {
			setFunctions[startOrEnd](seconds);
		}
	};

	const onUpdateMultiRangeValues = (values: number[]) => {
		setFragmentStartTime(values[0]);
		setFragmentEndTime(values[1]);
	};

	const initFlowPlayer = () =>
		!playerTicket &&
		fetchPlayerTicket(itemMetaData.external_id).then(data => setPlayerTicket(data));

	// TODO: Replace publisher, published_at by real publisher
	return (
		<Modal
			isOpen={isOpen}
			title="Knip fragment"
			size="medium"
			onClose={() => setIsOpen(!isOpen)}
			scrollable={true}
		>
			<ModalBody>
				<>
					<FlowPlayer
						src={playerTicket ? playerTicket.toString() : null}
						poster={itemMetaData.thumbnail_path}
						title={itemMetaData.title}
						onInit={initFlowPlayer}
						subtitles={['30-12-2011', 'VRT']}
					/>
					<Container mode="vertical" className="m-time-crop-controls">
						<TextInput
							value={formatDurationHoursMinutesSeconds(fragmentStartTime)}
							onChange={timeString => setFragmentTime(timeString, 'start')}
						/>
						<div className="m-multi-range-wrapper">
							<MultiRange
								values={[fragmentStartTime, fragmentEndTime]}
								onChange={onUpdateMultiRangeValues}
								min={0}
								max={toSeconds(itemMetaData.duration) || 0}
								step={1}
							/>
						</div>
						<TextInput
							value={formatDurationHoursMinutesSeconds(fragmentEndTime)}
							onChange={timeString => setFragmentTime(timeString, 'end')}
						/>
					</Container>
					<Toolbar spaced>
						<ToolbarRight>
							<ToolbarItem>
								<div className="c-button-toolbar">
									<Button type="secondary" label="Annuleren" onClick={() => setIsOpen(false)} />
									<Button type="primary" label="Knippen" onClick={onSaveCut} />
								</div>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</>
			</ModalBody>
		</Modal>
	);
};

export default CutFragmentModal;
