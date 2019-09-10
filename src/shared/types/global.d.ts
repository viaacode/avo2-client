interface Window {
	_ENV_: {
		PROXY_URL: string;
	};
	APP_INFO: {
		version: string;
		mode: 'development' | 'production' | 'test';
	};
}
