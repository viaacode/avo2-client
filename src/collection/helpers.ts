export function isVideoFragment(fragmentInfo: { external_id: string | undefined }) {
	return fragmentInfo.external_id && fragmentInfo.external_id !== '-1';
}
