export interface CustomWindow extends Window {
	APP_INFO: {
		version: string;
		mode: 'development' | 'production' | 'test';
	};
}
