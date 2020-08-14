import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	ButtonToolbar,
	Form,
	FormGroup,
	Modal,
	ModalBody,
	ModalFooterRight,
	Select,
	TagInfo,
	TagsInput,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';

import { PickerItem } from '../../types';

export type AddOrRemove = 'add' | 'remove';

interface ChangeLabelsModalProps {
	initialAuthor?: PickerItem;
	isOpen: boolean;
	labels: TagInfo[];
	onClose?: () => void;
	callback: (addOrRemove: AddOrRemove, selectedLabels: TagInfo[]) => void;
}

const ChangeLabelsModal: FunctionComponent<ChangeLabelsModalProps> = ({
	onClose = () => {},
	isOpen,
	labels,
	callback,
}) => {
	const [t] = useTranslation();

	const [selectedLabels, setSelectedLabels] = useState<TagInfo[] | null>(null);
	const [addOrRemove, setAddOrRemove] = useState<AddOrRemove>('add');

	const handleClose = () => {
		setSelectedLabels(null);
		setAddOrRemove('add');
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			title={t(
				'admin/shared/components/change-labels-modal/change-labels-modal___labels-aanpassen'
			)}
			size="small"
			onClose={handleClose}
		>
			<ModalBody>
				<Form>
					<FormGroup
						label={t(
							'admin/shared/components/change-labels-modal/change-labels-modal___labels-toevoegen-of-verwijderen'
						)}
					>
						<Select
							options={[
								{
									label: t(
										'admin/shared/components/change-labels-modal/change-labels-modal___toevoegen'
									),
									value: 'add',
								},
								{
									label: t(
										'admin/shared/components/change-labels-modal/change-labels-modal___verwijderen'
									),
									value: 'delete',
								},
							]}
							value={addOrRemove}
							onChange={setAddOrRemove as (value: string) => void}
						/>
					</FormGroup>
					<FormGroup
						label={t(
							'admin/shared/components/change-labels-modal/change-labels-modal___labels'
						)}
					>
						<TagsInput
							options={labels}
							value={selectedLabels || undefined}
							onChange={setSelectedLabels}
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
									label={t(
										'admin/shared/components/change-labels-modal/change-labels-modal___annuleren'
									)}
									onClick={handleClose}
								/>
								<Button
									type="primary"
									label={
										addOrRemove === 'add'
											? t(
													'admin/shared/components/change-labels-modal/change-labels-modal___toevoegen'
											  )
											: t(
													'admin/shared/components/change-labels-modal/change-labels-modal___verwijderen'
											  )
									}
									onClick={() => {
										callback(addOrRemove, selectedLabels || []);
										handleClose();
									}}
								/>
							</ButtonToolbar>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalFooterRight>
		</Modal>
	);
};

export default ChangeLabelsModal;
