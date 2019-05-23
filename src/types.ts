// TODO use interface from avo2-types package

export interface IFilterResponse {
	results: IFilterItem[];
	count: number;
}

export interface IFilterItem {
	name: string;
	thumbnailUrl: string;
	// ....
}

export interface IFilters {
	searchTerm: string;
	typeIds: number[];
	educationLevelIds: number[];
	domainIds: number[];
	broadcastDate: {
		from: string; // ISO date string
		until: string; // ISO date string
	};
	languageIds: number[];
	subjects: number[];
	series: number[];
	length: {
		max: number;
		min: number;
	};
	provider: number[];
}
