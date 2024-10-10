import { OrderDirection } from '../../search/search.const';

export function toggleSortOrder(oldSortOrder: string | null | undefined): OrderDirection {
	return oldSortOrder === OrderDirection.asc ? OrderDirection.desc : OrderDirection.asc;
}
