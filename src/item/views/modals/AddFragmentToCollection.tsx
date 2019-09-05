import React, { FunctionComponent, useState } from 'react';

import {
	Button,
	Column,
	Form,
	FormGroup,
	Grid,
	Modal,
	ModalBody,
	ModalFooterRight,
	RadioButton,
	Select,
	Spacer,
	TextArea,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import './AddFragmentToCollection.scss';

interface AddFragmentToCollectionProps {
	externalId: string;
	itemInfo: Avo.Item.Response;
	isOpen: boolean;
	onClose: () => void;
}

export const AddFragmentToCollection: FunctionComponent<AddFragmentToCollectionProps> = ({
	externalId,
	itemInfo,
	isOpen,
	onClose = () => {},
}) => {
	// TODO create endpoint for existing collections + call and put in store
	const [existingCollections] = useState([]);
	const [createNewCollection, setCreateNewCollection] = useState(false);
	const [selectedCollection, setSelectedCollection] = useState('');

	const addItemToCollection = () => {
		onClose();
	};

	return (
		<Modal
			title="Voeg fragment toe aan collectie"
			size="auto"
			scrollable={true}
			isOpen={isOpen}
			onClose={onClose}
		>
			<ModalBody>
				<div className="c-modal__body-add-fragment">
					<Spacer>
						<Form>
							<Grid>
								<Column size="2-7">
									<video
										src={`${itemInfo.thumbnail_path.split('/keyframes')[0]}/browse.mp4`}
										placeholder={itemInfo.thumbnail_path}
										style={{ width: '100%', display: 'block' }}
										controls={true}
									/>
								</Column>
								<Column size="2-5">
									<FormGroup label="Title">
										<TextInput id="title" value={itemInfo.title} />
									</FormGroup>
									<FormGroup label="Beschrijving">
										{/* TODO replace with component TextArea once built */}
										<TextArea id="description" value={itemInfo.description} />
									</FormGroup>
									<FormGroup label="Collectie">
										<Spacer margin="bottom">
											<RadioButton
												label="Voeg toe aan bestaande collectie"
												checked={!createNewCollection}
												value="existing"
												name="collection"
												onChange={checked => setCreateNewCollection(!checked)}
											/>
											{!createNewCollection && (
												<Select
													id="existingCollection"
													options={[
														{ label: 'Kies collectie', value: '', disabled: true },
														...existingCollections,
													]}
													value={selectedCollection}
													onChange={setSelectedCollection}
												/>
											)}
										</Spacer>
										<Spacer margin="bottom">
											<RadioButton
												label="Voeg toe aan bestaande collectie"
												checked={createNewCollection}
												value="new"
												name="collection"
											/>
										</Spacer>
									</FormGroup>
								</Column>
							</Grid>
						</Form>
					</Spacer>
				</div>
			</ModalBody>
			<ModalFooterRight>
				<Toolbar spaced>
					<ToolbarRight>
						<ToolbarItem>
							<div className="c-button-toolbar">
								<Button label="Annuleren" type="link" block={true} onClick={onClose} />
								<Button
									label="Toepassen"
									type="primary"
									block={true}
									onClick={addItemToCollection}
								/>
							</div>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalFooterRight>
		</Modal>
	);
};
