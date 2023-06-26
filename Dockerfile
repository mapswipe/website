FROM node:18-buster-slim

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
        git bash g++ make \
    # Clean-up
    && rm -rf /var/lib/apt/lists/* \
    # Add /code as safe directory
    && git config --global --add safe.directory /code

WORKDIR /code
