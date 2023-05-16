import { ShareUserInfoRights } from './ShareDropdown.types';

export const shareUserRightToString = (right: ShareUserInfoRights) => {
	return (right as unknown as string).toLocaleLowerCase();
};
