import captureStackTrace from 'capture-stack-trace';

import { generateRandomId } from './uuid.js';

export class CustomError {
	public message: string;
	public innerException: any | null;
	public additionalInfo: any | null;
	public identifier: string = generateRandomId();
	public name = 'Error';
	public stackTrace: string;
	public timestamp: string = new Date().toISOString();

	constructor(
		message = 'Something went wrong',
		innerException: any = null,
		additionalInfo: any = null
	) {
		this.message = message;
		this.innerException = innerException;
		this.additionalInfo = additionalInfo;
		captureStackTrace(this, this.constructor);

		if (innerException && typeof innerException.stack === 'string') {
			this.stackTrace = innerException.stack;
		} else {
			this.stackTrace = new Error().stack || '';
		}
	}

	public toString = (): string => {
		return JSON.stringify(
			this,
			// Avoid huge request object in error json
			(key, value) => (key === 'request' ? '[request]' : value)
		);
	};
}
