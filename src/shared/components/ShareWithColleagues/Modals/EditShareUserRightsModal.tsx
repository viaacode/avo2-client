import {
	Button,
	ButtonToolbar,
	Form,
	FormGroup,
	Modal,
	ModalBody,
	ModalFooterRight,
	Select,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { capitalize } from 'lodash';
import React, { FC, useState } from 'react';

import { tHtml, tText } from '../../../helpers/translate';
import { ShareUserInfoRights } from '../ShareWithColleagues.types';

type EditShareUserRightsModalProps = {
	isOpen: boolean;
	handleClose: () => void;
	handleConfirm: (right: ShareUserInfoRights) => void;
};

const EditShareUserRightsModal: FC<EditShareUserRightsModalProps> = ({
	isOpen,
	handleClose,
	handleConfirm,
}) => {
	const initialRight = ShareUserInfoRights.VIEWER;
	const [currentRight, setCurrentRight] = useState<ShareUserInfoRights>(initialRight);
	const options = Object.values(ShareUserInfoRights).map((right) => ({
		label:
			right === ShareUserInfoRights.OWNER
				? tText('Eigenaarschap overdragen')
				: capitalize(right),
		value: right,
	}));

	const handleOnConfirm = () => {
		handleConfirm(currentRight);
		setCurrentRight(initialRight);
	};

	return (
		<Modal
			isOpen={isOpen}
			title={tHtml('Rol van gebruiker aanpassen')}
			size="small"
			onClose={handleClose}
		>
			<ModalBody>
				<Form>
					<FormGroup label={tText('Rol van gebruiker')}>
						<Select
							className="c-rights-select"
							options={options}
							value={currentRight}
							onChange={(value) => setCurrentRight(value as ShareUserInfoRights)}
						/>
					</FormGroup>
				</Form>
			</ModalBody>
			<ModalFooterRight>
				<Toolbar>
					<ToolbarRight>
						<ToolbarItem>
							<ButtonToolbar>
								<Button
									type="secondary"
									label={tText('Annuleer')}
									onClick={handleClose}
								/>

								<Button
									type="primary"
									label={tText('Bevestigen')}
									onClick={handleOnConfirm}
								/>
							</ButtonToolbar>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalFooterRight>
		</Modal>
	);
};

export default EditShareUserRightsModal;
