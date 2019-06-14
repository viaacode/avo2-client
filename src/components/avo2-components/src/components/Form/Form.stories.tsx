import React, { Fragment } from 'react';

import { storiesOf } from '@storybook/react';

import { Button, Select, TextInput } from '../..';
import { Form } from './Form';
import { FormGroup } from './FormGroup';

storiesOf('Form', module)
	.addParameters({ jest: ['Form', 'FormGroup'] })
	.add('Form', () => (
		<Form>
			<FormGroup labelFor="name" label="Name">
				<input type="text" id="name" />
			</FormGroup>
			<FormGroup labelFor="email" label="Email address">
				<input type="email" id="email" />
			</FormGroup>
			<FormGroup labelFor="pass" label="Password">
				<input type="password" id="pass" />
			</FormGroup>
			<FormGroup labelFor="pref" label="Preference">
				<select id="pref">
					<option>Option A</option>
					<option>Option B</option>
					<option>Option C</option>
				</select>
			</FormGroup>
		</Form>
	))
	.add('Horizontal form', () => (
		<Form type="horizontal">
			<FormGroup labelFor="name" label="Name">
				<input type="text" id="name" />
			</FormGroup>
			<FormGroup labelFor="email" label="Email address">
				<input type="email" id="email" />
			</FormGroup>
			<FormGroup labelFor="pass" label="Password">
				<input type="password" id="pass" />
			</FormGroup>
			<FormGroup labelFor="pref" label="Preference">
				<select id="pref">
					<option>Option A</option>
					<option>Option B</option>
					<option>Option C</option>
				</select>
			</FormGroup>
		</Form>
	))
	.add('Inline form', () => (
		<Fragment>
			<Form type="inline">
				<FormGroup labelFor="name" label="Name">
					<TextInput id="name" />
				</FormGroup>
				<FormGroup labelFor="email" label="Email address">
					<TextInput id="email" placeholder="Email" />
				</FormGroup>
				<FormGroup labelFor="pass" label="Password">
					<TextInput placeholder="Password" id="pass" />
				</FormGroup>
				<FormGroup labelFor="pref" label="Preference">
					<Select
						id="pref"
						options={[
							{ label: 'Option A', value: 'option-a' },
							{ label: 'Option B', value: 'option-a' },
							{ label: 'Option C', value: 'option-a' },
						]}
					/>
				</FormGroup>
			</Form>
			<br />
			<Form type="inline">
				<FormGroup labelFor="search" inlineMode="grow">
					<TextInput placeholder="Enter you search term (grow)" />
				</FormGroup>
				<FormGroup labelFor="pass" inlineMode="shrink">
					<Button label="Search (shrink)" />
				</FormGroup>
			</Form>
		</Fragment>
	))
	.add('Form validation', () => (
		<Form>
			<FormGroup labelFor="name" label="Name" error="Please enter a valid name">
				<input type="text" id="name" />
			</FormGroup>
			<FormGroup labelFor="email" label="Email address" error="Please enter a valid e-mail address">
				<input type="email" id="email" />
			</FormGroup>
			<FormGroup labelFor="pass" label="Password" error="Please enter a valid e-mail address">
				<input type="password" id="pass" />
			</FormGroup>
			<FormGroup labelFor="pref" label="Preference">
				<select id="pref">
					<option>Option A</option>
					<option>Option B</option>
					<option>Option C</option>
				</select>
			</FormGroup>
		</Form>
	));
