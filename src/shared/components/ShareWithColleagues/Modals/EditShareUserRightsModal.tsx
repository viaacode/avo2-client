import {
	Button,
	ButtonToolbar,
	Form,
	FormGroup,
	Modal,
	ModalBody,
	ModalFooterRight,
	Select,
	type SelectOption,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import React, { type FC, useEffect, useState } from 'react';

import { tHtml, tText } from '../../../helpers/translate';
import { findRightByValue } from '../ShareWithColleagues.helpers';
import { type ContributorInfoRight } from '../ShareWithColleagues.types';

type EditShareUserRightsModalProps = {
	isOpen: boolean;
	handleClose: () => void;
	handleConfirm: (right: ContributorInfoRight) => void;
	toEditContributorRight: ContributorInfoRight;
	options: SelectOption<ContributorInfoRight>[];
};

const EditShareUserRightsModal: FC<EditShareUserRightsModalProps> = ({
	isOpen,
	handleClose,
	handleConfirm,
	toEditContributorRight,
	options,
}) => {
	const [right, setRight] = useState<ContributorInfoRight>(toEditContributorRight);

	useEffect(() => {
		if (isOpen) {
			setRight(toEditContributorRight);
		}
	}, [toEditContributorRight, isOpen]);

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
							onChange={(value) => setRight(value as ContributorInfoRight)}
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
