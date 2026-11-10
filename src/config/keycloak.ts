import Keycloak, { type KeycloakConfig } from 'keycloak-js';

const keycloakConfig: KeycloakConfig = {
  url: 'http://localhost:8080',
  realm: 'my-app',
  clientId: 'react-app',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
