# Mapswipe Website

Next application for Mapswipe

## Development

Before you start, create `.env` file and set the environment variables

```bash
touch .env
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
