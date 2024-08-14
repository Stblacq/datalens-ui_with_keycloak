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
    const {
        keycloakClientId,
        keycloakSecretKey,
        keycloakUri,
        keycloakRealmName,
        keycloakCookieSecret,
        appHostUri,
    } = nodekit.config;

    passport.use(
        new OpenIDConnectStrategy(
            {
                issuer: `${keycloakUri}/realms/${keycloakRealmName}`,
                authorizationURL: `${keycloakUri}/realms/${keycloakRealmName}/protocol/openid-connect/auth`,
                tokenURL: `${keycloakUri}/realms/${keycloakRealmName}/protocol/openid-connect/token`,
                userInfoURL: `${keycloakUri}/realms/${keycloakRealmName}/protocol/openid-connect/userinfo`,
                clientID: keycloakClientId,
                clientSecret: keycloakSecretKey,
                callbackURL: `${appHostUri}/api/auth/callback`,
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
            secret: keycloakCookieSecret,
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 * 365,
        }),
    );

    beforeAuth.push(passport.initialize());
    beforeAuth.push(passport.session());
}
