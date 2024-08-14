import type {AppMiddleware} from '@gravity-ui/expresskit';
import type {NodeKit} from '@gravity-ui/nodekit';
import cookieSession from 'cookie-session';
import passport from 'passport';
import type {VerifyCallback} from 'passport-openidconnect';
import OpenIDConnectStrategy from 'passport-openidconnect';

export function initKeycloak({
    nodekit,
    beforeAuth,
}: {
    nodekit: NodeKit;
    beforeAuth: AppMiddleware[];
}) {
    if (!nodekit.config.keycloakClientId) {
        throw new Error('Missing KEYCLOAK_CLIENT_ID in env');
    }
    if (!nodekit.config.keycloakSecretKey) {
        throw new Error('Missing KEYCLOAK_SECRET_KEY in env');
    }
    if (!nodekit.config.keycloakUri) {
        throw new Error('Missing KEYCLOAK_URI in env');
    }
    if (!nodekit.config.keycloakRealmName) {
        throw new Error('Missing KEYCLOAK_REALM_NAME in env');
    }
    if (!nodekit.config.keycloakCookieSecret) {
        throw new Error('Missing KEYCLOAK_COOKIE_SECRET in env');
    }
    passport.use(
        new OpenIDConnectStrategy(
            {
                issuer: `${nodekit.config.keycloakUri}/realms/${nodekit.config.keycloakRealmName}`,
                authorizationURL: `${nodekit.config.keycloakUri}/realms/${nodekit.config.keycloakRealmName}/protocol/openid-connect/auth`,
                tokenURL: `${nodekit.config.keycloakUri}/realms/${nodekit.config.keycloakRealmName}/protocol/openid-connect/token`,
                userInfoURL: `${nodekit.config.keycloakUri}/realms/${nodekit.config.keycloakRealmName}/protocol/openid-connect/userinfo`,
                clientID: nodekit.config.keycloakClientId,
                clientSecret: nodekit.config.keycloakSecretKey,
                callbackURL: `${nodekit.config.appHostUri}/api/auth/callback`,
                scope: ['openid', 'profile', 'email', 'offline_access'],
                prompt: 'login',
            },
            (
                _issuer: string,
                uiProfile: object,
                _idProfile: object,
                _context: object,
                _idToken: string | object,
                accessToken: string | object,
                refreshToken: string,
                _params: unknown,
                done: VerifyCallback,
            ) => {
                if (typeof accessToken !== 'string') {
                    throw new Error('Incorrect type of accessToken');
                }
                const {id, username} = uiProfile as any;
                return done(null, {accessToken, refreshToken, userId: id, username});
            },
        ),
    );

    passport.serializeUser((user: Express.User | null | undefined, done) => {
        done(null, user);
    });

    passport.deserializeUser(function (user: Express.User | null | undefined, done): void {
        done(null, user);
    });

    beforeAuth.push(
        cookieSession({
            name: 'keycloakCookieSecret',
            secret: nodekit.config.keycloakCookieSecret,
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 * 365,
        }),
    );

    beforeAuth.push(passport.initialize());
    beforeAuth.push(passport.session());
}
