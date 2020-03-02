import { FunctionComponent } from 'react';

import { getEnv } from '../../shared/helpers';

interface KlaarJsonViewProps {}

const KlaarJsonView: FunctionComponent<KlaarJsonViewProps> = () => {
	window.location.href = `${getEnv('PROXY_URL')}/klaar/klaar.json`;
	return null;
};

export default KlaarJsonView;
