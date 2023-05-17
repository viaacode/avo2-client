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
import React, { FC, useEffect, useState } from 'react';

import { tHtml, tText } from '../../../helpers/translate';
import { ShareUserInfoRights } from '../ShareWithColleagues.types';

type EditShareUserRightsModalProps = {
	isOpen: boolean;
	handleClose: () => void;
	handleConfirm: (right: ShareUserInfoRights) => void;
	currentRight: ShareUserInfoRights;
};

const EditShareUserRightsModal: FC<EditShareUserRightsModalProps> = ({
	isOpen,
	handleClose,
	handleConfirm,
	currentRight,
}) => {
	const [right, setRight] = useState<ShareUserInfoRights>();
	const options = Object.values(ShareUserInfoRights).map((right) => ({
		label:
			right === ShareUserInfoRights.OWNER
				? tText('Eigenaarschap overdragen')
				: capitalize(right),
		value: right,
	}));

	useEffect(() => {
		setRight(currentRight);
	}, [currentRight]);

	const handleOnConfirm = () => {
		if (right) {
			handleConfirm(right);
		}
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
							value={right}
							onChange={(value) => setRight(value as ShareUserInfoRights)}
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
