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
import {
	formatDurationHoursMinutesSeconds,
	toSeconds,
} from '../../../shared/helpers/formatters/duration';
import { fetchPlayerToken } from '../../../shared/services/player-service';

interface CutFragmentModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	itemMetaData: Avo.Item.Response;
}

const CutFragmentModal: FunctionComponent<CutFragmentModalProps> = ({
	setIsOpen,
	isOpen,
	itemMetaData,
}) => {
	const [playerToken, setPlayerToken] = useState();
	const [fragmentStartTime, setFragmentStartTime] = useState<number>(0);
	const [fragmentEndTime, setFragmentEndTime] = useState<number>(
		toSeconds(itemMetaData.duration) || 0
	);

	const onSaveCut = () => {};

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
		!playerToken && fetchPlayerToken(itemMetaData.external_id).then(data => setPlayerToken(data));

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
						src={playerToken ? playerToken.toString() : null}
						poster={itemMetaData.thumbnail_path}
						title={itemMetaData.title}
						onInit={initFlowPlayer}
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
									<Button type="primary" label="Knippen" onClick={onSaveCut} disabled />
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
