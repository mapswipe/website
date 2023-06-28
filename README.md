# Mapswipe Website

Next application for Mapswipe

## Development

Before you start, create `.env.local` file:

```bash
touch .env.local
```

Set these environment variables:

```env
MAPSWIPE_API_ENDPOINT=https://apps.mapswipe.org/api/
MAPSWIPE_COMMUNITY_API_ENDPOINT=https://api.mapswipe.org/graphql/
```

## Running

```bash
# Generate typings for the first time
docker-compose run --rm next bash -c 'yarn generate'

# Run frontend
docker-compose up next
```

## Run checks

```bash
docker-compose --profile test run --rm checks
```

## Building

```bash
docker-compose exec next bash -c 'yarn export'
```

## Automatic Deployment

Deployments will be triggered in 2 ways:

1. Anything pushed to `main` branch will trigger immediate deployment
to configured github io page.
2. Every day at UTC 00:01, deployment will be triggered with
latest data from MapSwipe database.
