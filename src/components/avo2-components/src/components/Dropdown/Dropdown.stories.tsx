import React, { ReactElement, useState } from 'react';

import { storiesOf } from '@storybook/react';

import { action } from '../../helpers/action';

import { Dropdown } from './Dropdown';

const DropdownStoryComponent = ({ children }: { children: ReactElement }) => {
	const [isOpen, setOpen] = useState(false);

	const open = () => {
		action('onOpen')();
		setOpen(true);
	};

	const close = () => {
		action('onClose')();
		setOpen(false);
	};

	const childrenWithProps = React.cloneElement(children, {
		isOpen,
		onOpen: open,
		onClose: close,
	});

	return childrenWithProps;
};

storiesOf('Dropdown', module)
	.addParameters({ jest: ['Dropdown'] })
	.add('Dropdown', () => (
		<DropdownStoryComponent>
			<Dropdown label="Show options" isOpen={false}>
				<span className="c-menu__item">Aluminium</span>
				<span className="c-menu__item">Cadmium</span>
				<span className="c-menu__item">Dubnium</span>
				<span className="c-menu__item">Potassium</span>
			</Dropdown>
		</DropdownStoryComponent>
	))
	.add('Dropdown up', () => (
		<div style={{ paddingTop: '200px' }}>
			<DropdownStoryComponent>
				<Dropdown label="Show options" isOpen={false} placement={'top'}>
					<span className="c-menu__item">Aluminium</span>
					<span className="c-menu__item">Cadmium</span>
					<span className="c-menu__item">Dubnium</span>
					<span className="c-menu__item">Potassium</span>
				</Dropdown>
			</DropdownStoryComponent>
		</div>
	))
	.add('Dropdown autosized', () => (
		<DropdownStoryComponent>
			<Dropdown label="Show options" isOpen={false} autoSize={true}>
				<span className="c-menu__item">Aluminium</span>
				<span className="c-menu__item">Cadmium</span>
				<span className="c-menu__item">Dubnium</span>
				<span className="c-menu__item">Potassium</span>
			</Dropdown>
		</DropdownStoryComponent>
	))
	.add('Dropdown autosized bottom-start', () => (
		<DropdownStoryComponent>
			<Dropdown label="Show options" isOpen={false} placement={'bottom-start'} autoSize={true}>
				<span className="c-menu__item">Aluminium</span>
				<span className="c-menu__item">Cadmium</span>
				<span className="c-menu__item">Dubnium</span>
				<span className="c-menu__item">Potassium</span>
			</Dropdown>
		</DropdownStoryComponent>
	))
	.add('Dropdown autosized bottom-end', () => (
		<div>
			<DropdownStoryComponent>
				<Dropdown label="Show options" isOpen={false} placement={'bottom-end'} autoSize={true}>
					<span className="c-menu__item">Aluminium</span>
					<span className="c-menu__item">Cadmium</span>
					<span className="c-menu__item">Dubnium</span>
					<span className="c-menu__item">Potassium</span>
				</Dropdown>
			</DropdownStoryComponent>
		</div>
	))
	.add('Dropdown autosized top-start', () => (
		<div style={{ paddingTop: '200px' }}>
			<DropdownStoryComponent>
				<Dropdown label="Show options" isOpen={false} placement={'top-start'} autoSize={true}>
					<span className="c-menu__item">Aluminium</span>
					<span className="c-menu__item">Cadmium</span>
					<span className="c-menu__item">Dubnium</span>
					<span className="c-menu__item">Potassium</span>
				</Dropdown>
			</DropdownStoryComponent>
		</div>
	))
	.add('Dropdown autosized top-end', () => (
		<div style={{ paddingTop: '200px' }}>
			<DropdownStoryComponent>
				<Dropdown label="Show options" isOpen={false} placement={'top-end'} autoSize={true}>
					<span className="c-menu__item">Aluminium</span>
					<span className="c-menu__item">Cadmium</span>
					<span className="c-menu__item">Dubnium</span>
					<span className="c-menu__item">Potassium</span>
				</Dropdown>
			</DropdownStoryComponent>
		</div>
	));
