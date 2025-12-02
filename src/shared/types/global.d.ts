interface Window {
  // Environment values that are injected using the env-config.js during build
  _ENV_: {
    PROXY_URL: string;
    FLOW_PLAYER_TOKEN: string;
    FLOW_PLAYER_ID: string;
    ZENDESK_KEY: string;
    LDAP_DASHBOARD_PEOPLE_URL: string;
    SSUM_ACCOUNT_EDIT_URL: string;
    SSUM_PASSWORD_EDIT_URL: string;
    GOOGLE_ANALYTICS_ID: string;
    MOUSEFLOW_ANALYTICS_ID: string;
    PORT: string;
    NODE_ENV: string;
    ENV: 'local' | 'qas' | 'production';
    KLASCEMENT_URL: string;
    REGISTER_URL: string;
  };
  // Application version info
  APP_INFO: {
    version: string;
    mode: 'development' | 'production' | 'test';
  };
  // Zendesk widget
  zE: (...args) => unknown;
  // React router ssr
  __staticRouterHydrationData?: any;
}
