import { createMemoryHistory } from 'history';

import { ROUTE_PARTS } from '../constants';

import { buildLink, navigate } from './link';
import { RouteComponentProps } from 'react-router-dom';

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

describe('Link - navigate', () => {
	const history = createMemoryHistory() as unknown as RouteComponentProps['history'];
	const pushSpy = jest.spyOn(history, 'push');

	afterEach(() => {
		pushSpy.mockReset();
	});

	afterAll(() => {
		pushSpy.mockRestore();
	});

	it('Should navigate when correct params are passed', () => {
		navigate(history, routeWithParam, params);

		expect(pushSpy).toHaveBeenCalled();
		expect(pushSpy).toHaveBeenCalledTimes(1);
		expect(pushSpy).toHaveBeenCalledWith(linkWithParam);
	});

	it('Should navigate when search is passed', () => {
		navigate(history, routeWithParam, params, searchQuery);

		expect(pushSpy).toHaveBeenCalled();
		expect(pushSpy).toHaveBeenCalledTimes(1);
		expect(pushSpy).toHaveBeenCalledWith(`${linkWithParam}?${searchQuery}`);
	});

	it('Should abort navigation when wrong params are given', () => {
		navigate(history, routeWithParam, { uuid: 123 });

		expect(pushSpy).not.toHaveBeenCalled();
	});
});
