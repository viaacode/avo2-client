import { APP_PATH } from '../../../../constants';

const APP_PATH_ARRAY = Object.entries(APP_PATH);

// Return static items from APP_PATH
export const fetchStatic = (limit: number) =>
	new Promise(resolve => {
		resolve(parseStaticItems(APP_PATH_ARRAY, limit));
	});

export const parseStaticItems = (raw: any, limit: number) => {
	const filteredItems = raw.slice(0, limit).filter((item: any) => !item[1].includes(':'));

	const parsedStaticItems = filteredItems.map((item: any) => ({
		label: item[0],
		value: {
			type: 'content',
			value: item[1],
		},
	}));

	const staticOptions = {
		label: 'static',
		options: parsedStaticItems,
	};

	return staticOptions;
};
