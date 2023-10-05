const fs = require('fs');

const CI_ENV_VARIABLES = {
	ENV: process.env.NODE_ENV,
	PORT: process.env.PORT,
	PROXY_URL: process.env.PROXY_URL,
	FLOW_PLAYER_TOKEN: process.env.FLOW_PLAYER_TOKEN,
	FLOW_PLAYER_ID: process.env.FLOW_PLAYER_ID,
	ZENDESK_KEY: process.env.ZENDESK_KEY,
	LDAP_DASHBOARD_PEOPLE_URL: process.env.LDAP_DASHBOARD_PEOPLE_URL,
	SSUM_ACCOUNT_EDIT_URL: process.env.SSUM_ACCOUNT_EDIT_URL,
	SSUM_PASSWORD_EDIT_URL: process.env.SSUM_PASSWORD_EDIT_URL,
	GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
	MOUSEFLOW_ANALYTICS_ID: process.env.MOUSEFLOW_ANALYTICS_ID,
};

let envVariables = {};

if (fs.existsSync('.env')) {
	const envFile = fs.readFileSync('.env').toString();
	const lines = envFile.split('\n').map((line) => line.trim());

	lines.forEach((line) => {
		const [envKey, ...envValueParts] = line.split('=');
		const envValue = envValueParts.join('=');

		if (!CI_ENV_VARIABLES[envKey] || CI_ENV_VARIABLES[envKey][0] === '$') {
			envVariables[envKey] = envValue;
		} else {
			envVariables[envKey] = CI_ENV_VARIABLES[envKey];
		}
	});
} else {
	envVariables = CI_ENV_VARIABLES;
}

let outputString = 'window._ENV_ = {\n';

Object.keys(envVariables).forEach((envName) => {
	if (envName) {
		outputString += `\t\"${envName}\": \"${envVariables[envName]}\",\n`;
	}
});

outputString += '};';

fs.writeFileSync('./env-config.js', outputString);
