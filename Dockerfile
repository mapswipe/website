FROM node:18-buster-slim

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
        git bash g++ make \
        # For pre-commit
        python3-pip \
    && pip3 install --no-cache-dir setuptools pre-commit \
    # Clean-up
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code

# Initial commands runs
RUN git config --global --add safe.directory /code
