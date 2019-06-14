import React from 'react';

import { storiesOf } from '@storybook/react';

import { action } from '../../helpers/action';

import { Button } from '../Button/Button';

import { Modal } from './Modal';
import { ModalBody, ModalFooterLeft, ModalFooterRight } from './Modal.slots';

storiesOf('Modal', module)
	.addParameters({ jest: ['Modal', 'ModalBackdrop'] })
	.add('Modal', () => (
		<Modal isOpen={true} title="Modal title" onClose={action('closed')}>
			<ModalBody>
				<p>
					It doesn't matter where this modal occurs in the source code, React automatically moves it
					to the root.
				</p>
			</ModalBody>
			<ModalFooterLeft>
				<Button type="secondary" label="Cancel" />
			</ModalFooterLeft>
			<ModalFooterRight>
				<Button type="primary" label="Ok" />
			</ModalFooterRight>
		</Modal>
	))
	.add('Small modal', () => (
		<Modal isOpen={true} title="Modal title" size="small">
			<ModalBody>
				<p>
					It doesn't matter where this modal occurs in the source code, React automatically moves it
					to the root.
				</p>
			</ModalBody>
			<ModalFooterRight>
				<Button type="primary" label="Ok" />
			</ModalFooterRight>
		</Modal>
	))
	.add('Medium modal', () => (
		<Modal isOpen={true} title="Modal title" size="medium">
			<ModalBody>
				<p>
					It doesn't matter where this modal occurs in the source code, React automatically moves it
					to the root.
				</p>
			</ModalBody>
			<ModalFooterRight>
				<Button type="primary" label="Ok" />
			</ModalFooterRight>
		</Modal>
	))
	.add('Fullscreen modal', () => (
		<Modal isOpen={true} title="Modal title" size="fullscreen">
			<ModalBody>
				<p>
					It doesn't matter where this modal occurs in the source code, React automatically moves it
					to the root.
				</p>
			</ModalBody>
			<ModalFooterRight>
				<Button type="primary" label="Ok" />
			</ModalFooterRight>
		</Modal>
	))
	.add('Auto-height modal', () => (
		<Modal isOpen={true} title="Modal title" size="auto">
			<ModalBody>
				<p>
					It doesn't matter where this modal occurs in the source code, React automatically moves it
					to the root.
				</p>
			</ModalBody>
			<ModalFooterRight>
				<Button type="primary" label="Ok" />
			</ModalFooterRight>
		</Modal>
	));
