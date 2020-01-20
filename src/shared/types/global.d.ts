interface Window {
	_ENV_: {
		PROXY_URL: string;
		FLOW_PLAYER_TOKEN: string;
		FLOW_PLAYER_ID: string;
		ZENDESK_KEY: string;
		PORT: string;
		NODE_ENV: string;
		ENV: 'local' | 'qas' | 'production';
	};
	APP_INFO: {
		version: string;
		mode: 'development' | 'production' | 'test';
	};
}
