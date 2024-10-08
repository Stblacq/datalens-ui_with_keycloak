import cluster from 'cluster';

// Without this import shared object is empty in runtime and it should be exactly here
import '../shared';
import {AuthType} from '../shared/constants/common';
import type {AppEnvironment} from '../shared/constants/common';
import {getAppEndpointsConfig} from '../shared/endpoints';

import {appEnv} from './app-env';
import {getOpensourceLayoutConfig} from './components/layout/opensource-layout-config';
import authKeycloak from './middlewares/auth-keycloak';
import authZitadel from './middlewares/auth-zitadel';
import {convertConnectionType} from './modes/charts/plugins/ql/utils/connection';
import initOpensourceApp from './modes/opensource/app';
import {nodekit} from './nodekit';
import {registry} from './registry';
import {registerAppPlugins} from './registry/utils/register-app-plugins';

registry.registerGetLayoutConfig(getOpensourceLayoutConfig);
registry.registerConvertConnectorTypeToQLConnectionType(convertConnectionType);

registerAppPlugins();

nodekit.config.endpoints = getAppEndpointsConfig(
    appEnv as AppEnvironment.Production | AppEnvironment.Development,
);

if (nodekit.config.authType === AuthType.Zitadel) {
    nodekit.config.appAuthHandler = authZitadel;
} else if (nodekit.config.authType === AuthType.Keycloak) {
    nodekit.config.appAuthHandler = authKeycloak;
}

const app = initOpensourceApp(nodekit);
registry.setupApp(app);

if (nodekit.config.workers && nodekit.config.workers > 1 && cluster.isPrimary) {
    for (let i = 0; i < nodekit.config.workers; i++) {
        cluster.fork();
    }
} else {
    app.run();
}

if (process.env?.['LOCAL_DEV_PORT']) {
    import('./local-dev');
}
