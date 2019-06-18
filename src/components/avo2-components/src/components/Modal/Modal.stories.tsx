import React, { Fragment, ReactElement, useState } from 'react';

import { storiesOf } from '@storybook/react';

import { Button } from '../Button/Button';

import { Modal } from './Modal';
import { ModalBody, ModalFooterLeft, ModalFooterRight } from './Modal.slots';

const ModalStoryComponent = ({ children }: { children: ReactElement }) => {
	const [isOpen, setOpen] = useState(false);

	const childrenWithProps = React.cloneElement(children, { isOpen, onClose: () => setOpen(false) });

	return (
		<Fragment>
			<Button onClick={() => setOpen(true)} label="Open modal" />
			{childrenWithProps}
		</Fragment>
	);
};

storiesOf('Modal', module)
	.addParameters({ jest: ['Modal', 'ModalBackdrop'] })
	.add('Modal', () => (
		<ModalStoryComponent>
			<Modal title="Modal title" isOpen={false}>
				<ModalBody>
					<p>
						It doesn't matter where this modal occurs in the source code, React automatically moves
						it to the root.
					</p>
				</ModalBody>
				<ModalFooterLeft>
					<Button type="secondary" label="Cancel" />
				</ModalFooterLeft>
				<ModalFooterRight>
					<Button type="primary" label="Ok" />
				</ModalFooterRight>
			</Modal>
		</ModalStoryComponent>
	))
	.add('Small modal', () => (
		<ModalStoryComponent>
			<Modal isOpen={true} title="Modal title" size="small">
				<ModalBody>
					<p>
						It doesn't matter where this modal occurs in the source code, React automatically moves
						it to the root.
					</p>
				</ModalBody>
				<ModalFooterRight>
					<Button type="primary" label="Ok" />
				</ModalFooterRight>
			</Modal>
		</ModalStoryComponent>
	))
	.add('Medium modal', () => (
		<ModalStoryComponent>
			<Modal isOpen={true} title="Modal title" size="medium">
				<ModalBody>
					<p>
						It doesn't matter where this modal occurs in the source code, React automatically moves
						it to the root.
					</p>
				</ModalBody>
				<ModalFooterRight>
					<Button type="primary" label="Ok" />
				</ModalFooterRight>
			</Modal>
		</ModalStoryComponent>
	))
	.add('Fullscreen modal', () => (
		<ModalStoryComponent>
			<Modal isOpen={true} title="Modal title" size="fullscreen">
				<ModalBody>
					<p>
						It doesn't matter where this modal occurs in the source code, React automatically moves
						it to the root.
					</p>
				</ModalBody>
				<ModalFooterRight>
					<Button type="primary" label="Ok" />
				</ModalFooterRight>
			</Modal>
		</ModalStoryComponent>
	))
	.add('Auto-height modal', () => (
		<ModalStoryComponent>
			<Modal isOpen={true} title="Modal title" size="auto">
				<ModalBody>
					<p>
						It doesn't matter where this modal occurs in the source code, React automatically moves
						it to the root.
					</p>
				</ModalBody>
				<ModalFooterRight>
					<Button type="primary" label="Ok" />
				</ModalFooterRight>
			</Modal>
		</ModalStoryComponent>
	));
