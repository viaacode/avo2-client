/**
 * @jest-environment jsdom
 */

import { ROUTE_PARTS } from '../constants/index.js';

import { buildLink } from './build-link.js';

// import { navigate } from './link';

const route = `/${ROUTE_PARTS.search}`;
const routeWithParam = `/${ROUTE_PARTS.collections}/:id/${ROUTE_PARTS.edit}`;
const params = { id: 123 };
const linkWithParam = routeWithParam.replace(':id', params.id.toString());
const searchQuery = 'query={"serie":"["KLAAR"]"}';

describe('Link - buildLink', () => {
	it('Should build a link when correct params are passed', () => {
		expect(buildLink(routeWithParam, params)).toEqual(linkWithParam);
	});

	it('Should return an empty string when wrong params are given', () => {
		expect(buildLink(routeWithParam)).toEqual('');
		expect(buildLink(routeWithParam, { uuid: 123 })).toEqual('');
	});

	it('Should build a link when search is passed', () => {
		expect(buildLink(route, {}, searchQuery)).toEqual(`${route}?${searchQuery}`);
	});
});
