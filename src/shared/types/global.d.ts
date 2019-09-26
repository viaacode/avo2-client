export interface CustomWindow extends Window {
	_ENV_: {
		PROXY_URL: string;
		FLOW_PLAYER_TOKEN: string;
		FLOW_PLAYER_ID: string;
		PORT: string;
		NODE_ENV: string;
	};
	APP_INFO: {
		version: string;
		mode: 'development' | 'production' | 'test';
	};
}
