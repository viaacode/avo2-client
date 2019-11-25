import { mount, shallow } from 'enzyme';
import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import Footer from './Footer';

describe('<Footer />', () => {
	it('Should be able to render', () => {
		shallow(<Footer />);
	});

	it('Should correctly render the VIAA-link', () => {
		const footerComponent = shallow(<Footer />);

		const listItem = footerComponent
			.find('ul')
			.first()
			.find('li')
			.first();
		const anchor = listItem.find('a');

		expect(listItem.text()).toEqual('Een realisatie van VIAA.be');
		expect(anchor.prop('href')).toEqual('https://viaa.be');
	});

	it('Should correctly render the terms-and-conditions-link', () => {
		const footerComponent = mount(
			<Router>
				<Footer />
			</Router>
		);

		const listItem = footerComponent
			.find('ul')
			.first()
			.find('li')
			.at(1);

		const link = listItem.find(Link);

		expect(link.text()).toEqual('Gebruiksvoorwaarden');
		expect(link.prop('to')).toEqual('/gebruiksvoorwaarden');
	});

	it('Should correctly render the privacy-policy-link', () => {
		const footerComponent = mount(
			<Router>
				<Footer />
			</Router>
		);

		const listItem = footerComponent
			.find('ul')
			.first()
			.find('li')
			.at(2);
		const link = listItem.find(Link);

		expect(link.text()).toEqual('Privacyverklaring');
		expect(link.prop('to')).toEqual('/privacy');
	});

	it('Should correctly render the cookies-link', () => {
		const footerComponent = mount(
			<Router>
				<Footer />
			</Router>
		);

		const listItem = footerComponent
			.find('ul')
			.first()
			.find('li')
			.last();
		const link = listItem.find(Link);

		expect(link.text()).toEqual('Cookieverklaring');
		expect(link.prop('to')).toEqual('/cookies');
	});

	it('Should correctly render the help-link', () => {
		const footerComponent = mount(
			<Router>
				<Footer />
			</Router>
		);

		const listItem = footerComponent
			.find('ul')
			.last()
			.find('li');
		const link = listItem.find(Link);

		expect(link.text()).toEqual('Hulp');
		expect(link.prop('to')).toEqual('/help');
	});
});
