# Dev-only image; the app is mounted by docker-compose and built there.
FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code
