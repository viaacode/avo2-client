import React, { FunctionComponent, useState } from 'react';

import {
	Button,
	Modal,
	ModalBody,
	MultiRange,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';

import { FlowPlayer } from '../../shared/components/FlowPlayer/FlowPlayer';
import { fetchPlayerToken } from '../../shared/services/player-service';

interface CutFragmentModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	item: any;
	externalId: string;
}

const CutFragmentModal: FunctionComponent<CutFragmentModalProps> = ({
	setIsOpen,
	isOpen,
	item,
	externalId,
}) => {
	const [playerToken, setPlayerToken] = useState();

	const onSaveCut = () => {};

	const initFlowPlayer = () =>
		!playerToken && fetchPlayerToken(externalId).then(data => setPlayerToken(data));

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
					{item && (
						<FlowPlayer
							src={playerToken ? playerToken.toString() : null}
							poster={item.thumbnail_path}
							title={item.title}
							onInit={initFlowPlayer}
						/>
					)}
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
