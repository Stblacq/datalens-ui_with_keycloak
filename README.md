# DataLens

### Prerequisites

[Install docker](https://docs.docker.com/engine/install/)

[Install docker compose plugin](https://docs.docker.com/compose/install/linux/) if it not already installed

### Start project in dev mode

Install Node.js >= v18.17.0 manually or via [node version manager](https://github.com/nvm-sh/nvm).

Start project in dev mode:

```bash
# Start backend for datalens:
git clone git@github.com:datalens-tech/datalens.git
cd datalens
docker compose -f docker-compose-dev.yml up

# Start datalens ui in dev mode:
git clone git@github.com:datalens-tech/datalens-ui.git
cd ui
npm ci
npm run dev
```

Now you can open datalens in dev mode at [http://localhost:3030](http://localhost:3030)

### Credentials for postgres

Hostname:

```
pg-demo-connection
```

Port:

```
5432
```

Path to database:

```
demo
```

Username:

```
demo
```

Password:

```
demo
```


## Keycloak Support

This fork introduces support for Keycloak, allowing you to leverage Keycloak for authentication and authorization within the application.

Refer to [Datalens With Keycloak](https://github.com/Stblacq/datalens_with_keycloak?tab=readme-ov-file#keycloak-support) for documentation on this.
