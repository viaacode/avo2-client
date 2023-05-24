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
import { capitalize } from 'lodash-es';
import React, { FC, useEffect, useState } from 'react';

import { tHtml, tText } from '../../../helpers/translate';
import { findRightByValue } from '../ShareWithColleagues.helpers';
import { ShareRightsType, ShareUserInfoRights } from '../ShareWithColleagues.types';

type EditShareUserRightsModalProps = {
	isOpen: boolean;
	handleClose: () => void;
	handleConfirm: (right: ShareRightsType) => void;
	currentRight: ShareUserInfoRights;
};

const EditShareUserRightsModal: FC<EditShareUserRightsModalProps> = ({
	isOpen,
	handleClose,
	handleConfirm,
	currentRight,
}) => {
	const [right, setRight] = useState<ShareUserInfoRights>(currentRight);
	const options = Object.values(ShareUserInfoRights).map((right) => ({
		label:
			right === ShareUserInfoRights.OWNER
				? tText(
						'shared/components/share-with-colleagues/modals/edit-share-user-rights-modal___eigenaarschap-overdragen'
				  )
				: capitalize(right),
		value: right,
	}));

	useEffect(() => {
		if (isOpen) {
			setRight(currentRight);
		}
	}, [currentRight, isOpen]);

	const handleOnConfirm = () => {
		if (right) {
			handleConfirm(findRightByValue(right));
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			title={tHtml(
				'shared/components/share-with-colleagues/modals/edit-share-user-rights-modal___rol-van-gebruiker-aanpassen'
			)}
			size="small"
			onClose={handleClose}
		>
			<ModalBody>
				<Form>
					<FormGroup
						label={tText(
							'shared/components/share-with-colleagues/modals/edit-share-user-rights-modal___rol-van-gebruiker'
						)}
					>
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
									label={tText(
										'shared/components/share-with-colleagues/modals/edit-share-user-rights-modal___annuleer'
									)}
									onClick={handleClose}
								/>

								<Button
									type="primary"
									label={tText(
										'shared/components/share-with-colleagues/modals/edit-share-user-rights-modal___bevestigen'
									)}
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
