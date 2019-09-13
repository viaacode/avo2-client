export interface CustomWindow extends Window {
	_ENV_: {
		PROXY_URL: string;
		PORT: string;
	};
	APP_INFO: {
		version: string;
		mode: 'development' | 'production' | 'test';
	};
}
