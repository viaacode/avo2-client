export const isVideoFragment = (fragmentInfo: { external_id: string | undefined }) => {
	return fragmentInfo.external_id && fragmentInfo.external_id !== '-1';
};

export const getInitialChar = (value: string | null) => (value ? value[0] : '');
