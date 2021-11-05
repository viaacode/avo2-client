import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Avatar,
	Box,
	Button,
	Flex,
	FlexItem,
	FormGroup,
	Modal,
	ModalBody,
	Spacer,
	TextInput,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentContentLabel } from '@viaa/avo2-types/types/assignment';
import { ItemSchema } from '@viaa/avo2-types/types/item';

import { AssignmentLayout } from '../../../assignment/assignment.types';
import { renderContentLayoutOptionsButtons } from '../../helpers/render-content-layout-options-buttons';
import renderContentLink from '../../helpers/render-content-link';
import withUser, { UserProps } from '../../hocs/withUser';

import './QuickLaneModal.scss';

// Typings

interface SharedUrl {
	id?: string;
	title?: string;
	content_layout?: AssignmentLayout;
}

interface QuickLaneModalProps {
	modalTitle: string;
	isOpen: boolean;
	content?: Avo.Assignment.Content;
	content_label?: AssignmentContentLabel;
	onClose: () => void;
}

// State

const defaultSharedUrlState: SharedUrl = {
	id: '19c707d5-01e0-4e4c-bcfd-fc79b60d8e5a',
	title: undefined,
	content_layout: AssignmentLayout.PlayerAndText,
};

// Helpers

const buildSharedUrlHref = (id: string): string => {
	return `https://example.com/url/structure/${id}`;
};

// Unused, waiting on non-happy flow elaboration (aka. merge with publication flow)
// const isShareable = (content: Avo.Assignment.Content): boolean => {
// 	return (content as ItemSchema).is_published || (content as CollectionSchema).is_public;
// }

// Component

const QuickLaneModal: FunctionComponent<QuickLaneModalProps & UserProps> = ({
	modalTitle,
	isOpen,
	content,
	content_label,
	onClose,
	user,
}) => {
	const [t] = useTranslation();
	const [sharedUrl, setSharedUrl] = useState<SharedUrl>(defaultSharedUrlState);

	if (!sharedUrl.title && content?.title) {
		setSharedUrl({
			...sharedUrl,
			title: content.title,
		});
	}

	return (
		<Modal
			className="m-quick-lane-modal"
			title={modalTitle}
			size="medium"
			isOpen={isOpen}
			onClose={onClose}
			scrollable
		>
			{user && content ? (
				<ModalBody>
					{/* <pre>{JSON.stringify(sharedUrl)}</pre>
					<hr /> */}

					{content_label === 'ITEM' && (
						<Spacer margin={['bottom']}>
							<Avatar
								className="m-quick-lane-modal__avatar"
								dark={true}
								name={(content as ItemSchema).organisation.name}
								image={(content as ItemSchema).organisation.logo_url}
							/>
						</Spacer>
					)}

					<Spacer margin={content_label === 'ITEM' ? ['top', 'bottom'] : ['bottom']}>
						<FormGroup
							required
							label={t('shared/components/quick-lane-modal/quick-lane-modal___titel')}
						>
							<TextInput
								id="title"
								value={sharedUrl.title}
								onChange={(title: string) =>
									setSharedUrl({
										...sharedUrl,
										title,
									})
								}
							/>
						</FormGroup>
					</Spacer>

					<Spacer margin={['top', 'bottom']}>
						<FormGroup
							label={t(
								'shared/components/quick-lane-modal/quick-lane-modal___inhoud'
							)}
						>
							{content_label &&
								renderContentLink(
									{
										content_label,
										content_id: content.id.toString(),
									},
									content,
									user
								)}
						</FormGroup>
					</Spacer>

					<Spacer margin={['top', 'bottom']}>
						<FormGroup
							label={t(
								'shared/components/quick-lane-modal/quick-lane-modal___weergave-voor-leerlingen'
							)}
						>
							{renderContentLayoutOptionsButtons(sharedUrl, (value: string) => {
								setSharedUrl({
									...sharedUrl,
									content_layout: (value as unknown) as AssignmentLayout, // TS2353
								});
							})}
						</FormGroup>
					</Spacer>

					<Spacer margin={['top', 'bottom-small']}>
						<Box backgroundColor="gray" condensed>
							<Flex wrap justify="between" align="baseline">
								<FlexItem className="u-truncate m-quick-lane-modal__link">
									{sharedUrl.id && (
										<a href={buildSharedUrlHref(sharedUrl.id)}>
											{buildSharedUrlHref(sharedUrl.id)}
										</a>
									)}
								</FlexItem>
								<FlexItem shrink>
									<Spacer margin="left-small">
										<Button
											label={t(
												'shared/components/quick-lane-modal/quick-lane-modal___kopieer-link'
											)}
											onClick={() => {
												//
											}}
										/>
									</Spacer>
								</FlexItem>
							</Flex>
						</Box>
					</Spacer>
				</ModalBody>
			) : (
				<ModalBody>
					<Spacer margin={['bottom-small']}>
						{t(
							'shared/components/quick-lane-modal/quick-lane-modal___er-ging-iets-mis'
						)}
					</Spacer>
				</ModalBody>
			)}
		</Modal>
	);
};

export default withUser(QuickLaneModal) as FunctionComponent<QuickLaneModalProps>;
