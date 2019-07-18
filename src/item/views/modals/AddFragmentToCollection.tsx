import React, { FunctionComponent, useState } from 'react';

import {
	Button,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	Modal,
	ModalBody,
	ModalFooterLeft,
	ModalFooterRight,
	RadioButton,
	Select,
	Spacer,
	TextInput,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

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
}: AddFragmentToCollectionProps) => {
	// TODO create endpoint for existing collections + call and put in store
	const [existingCollections, setExistingCollections] = useState([]);
	const [createNewCollection, setCreateNewCollection] = useState(false);
	const [newCollectionName, setNewCollectionName] = useState('');
	const [selectedCollection, setSelectedCollection] = useState('');

	const addItemToCollection = () => {
		onClose();
	};

	return (
		<Modal
			title="Voeg fragment toe aan collectie"
			size="large"
			scrollable={true}
			isOpen={isOpen}
			onClose={onClose}
		>
			<ModalBody>
				<div className="u-spacer">
					<Form>
						<Grid>
							<Column size="2-7">
								<Container mode="vertical">
									<video
										src={`${itemInfo.thumbnail_path.split('/keyframes')[0]}/browse.mp4`}
										placeholder={itemInfo.thumbnail_path}
										style={{ width: '100%', display: 'block' }}
										controls={true}
									/>
								</Container>
							</Column>
							<Column size="2-5">
								<FormGroup label="Title">
									<TextInput id="title" value={itemInfo.dc_title} />
								</FormGroup>
								<FormGroup label="Beschrijving">
									{/* TODO replace with component TextArea once built */}
									<textarea id="description" value={itemInfo.dcterms_abstract} />
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
										{createNewCollection && (
											<TextInput
												placeholder="Type de naam van de nieuwe collectie"
												value={newCollectionName}
												onChange={setNewCollectionName}
											/>
										)}
									</Spacer>
								</FormGroup>
							</Column>
						</Grid>
					</Form>
				</div>
			</ModalBody>
			<ModalFooterLeft>
				<FormGroup>
					<Button label="Annuleren" type="secondary" block={true} onClick={onClose} />
				</FormGroup>
			</ModalFooterLeft>
			<ModalFooterRight>
				<FormGroup>
					<Button label="Toepassen" type="primary" block={true} onClick={addItemToCollection} />
				</FormGroup>
			</ModalFooterRight>
		</Modal>
	);
};
