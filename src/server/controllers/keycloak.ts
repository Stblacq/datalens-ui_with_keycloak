import type {Request, Response} from '@gravity-ui/expresskit';

export async function logout(req: Request, res: Response) {
    if (!req.ctx.config.keycloakClientId) {
        throw new Error('Missing KEYCLOAK_CLIENT_ID in env');
    }

    req.logOut((err) => {
        if (err) {
            throw err;
        }
    });
    const url =
        `${req.ctx.config.keycloakUri}/realms/${req.ctx.config.keycloakRealmName}/protocol/openid-connect/logout?` +
        new URLSearchParams({
            post_logout_redirect_uri: req.ctx.config.appHostUri + '/auth',
            client_id: req.ctx.config.keycloakClientId,
        });

    res.redirect(url);
}
