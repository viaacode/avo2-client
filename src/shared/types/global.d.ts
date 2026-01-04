interface Window {
  // Environment values that are injected using the env-config.js during build
  _ENV_: {
    CLIENT_URL: string;
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
  // Google Analytics
  ga?: Ga;
}

interface FieldsObject {
  [fieldName: string]: any;
}

interface SendFields extends FieldsObject {
  hitType?: string;
  eventCategory?: string;
  eventAction?: string;
  eventLabel?: string;
  eventValue?: number;
  page?: string;
  title?: string;
  location?: string;
  nonInteraction?: boolean;
  transport?: string;
}

interface Tracker {
  get(fieldName: string): any;
  set(fieldName: string, value: any): void;
  set(fieldsObject: FieldsObject): void;
  send(hitType: string, ...args: any[]): void;
  send(fieldsObject: SendFields): void;
  /** Usually returns the tracker's name, e.g. "t0" or a custom name */
  get(name: 'name'): string;
}

interface CreateOptions extends FieldsObject {
  cookieDomain?: string | 'auto';
  name?: string;
  allowLinker?: boolean;
  siteSpeedSampleRate?: number;
  sampleRate?: number;
  storage?: 'cookie' | 'none';
  clientId?: string;
  userId?: string;
}

interface Ga {
  (command: string, ...fields: any[]): void;

  create(
    trackingId: string,
    cookieDomain?: string | 'auto',
    name?: string,
  ): Tracker;
  create(trackingId: string, options?: CreateOptions): Tracker;

  getByName(name: string): Tracker | undefined;
  getAll(): Tracker[];
  remove(name: string): void;

  loaded?: boolean;
  answer?: number;

  q?: Array<IArguments>;
  l?: number;
}
