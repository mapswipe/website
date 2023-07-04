#!/bin/bash -e

if [ -z "$MAPSWIPE_API_ENDPOINT" ]
then
    echo "Please set \$MAPSWIPE_API_ENDPOINT"
    exit 1
fi

# ROOT_DIR = ../
ROOT_DIR=$(dirname "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )")

# Remove trailing slash if present
MAPSWIPE_API_ENDPOINT=${MAPSWIPE_API_ENDPOINT%/}

DESTINATION_DIR=$ROOT_DIR/cache
mkdir -p $DESTINATION_DIR

function download_file(){
    echo "Downloading $2: $1"
    # Download file hash
    curl -s $1.md5 --output $DESTINATION_DIR/$2.md5

    if [ ! -f $DESTINATION_DIR/$2 ]; then
        curl $1 --output $DESTINATION_DIR/$2
    else
        # Check if hash is changed
        set +e
        echo -n `cat $DESTINATION_DIR/$2.md5` $DESTINATION_DIR/$2 | md5sum --status --check
        ERROR_CODE=$?
        set -e
        if ! [ "$ERROR_CODE" == "0" ]; then
            curl $1 --output $DESTINATION_DIR/$2
        fi
    fi
}

download_file $MAPSWIPE_API_ENDPOINT/website-data/overall-endpoints.csv overall-endpoints.csv
download_file $MAPSWIPE_API_ENDPOINT/website-data/project-history.zip project-history.zip

download_file $MAPSWIPE_API_ENDPOINT/projects/projects_centroid.geojson projects_centroid.geojson
download_file $MAPSWIPE_API_ENDPOINT/projects/projects_geom.geojson projects_geom.geojson

unzip -o $DESTINATION_DIR/project-history.zip -d $DESTINATION_DIR/project-history

# Get last modified date
LAST_MODIFIED_RAW=`curl --head -i $MAPSWIPE_API_ENDPOINT/website-data/overall-endpoints.csv 2>&1 | grep '^Last-Modified:'`
LAST_MODIFIED=${LAST_MODIFIED_RAW:15}

if ! [[ -z "${GITHUB_ENV}" ]]; then
    # Set to github variable using MAPSWIPE_API_LAST_MODIFIED_EPOCH
    echo "Setting env.MAPSWIPE_API_LAST_MODIFIED_EPOCH variable"
    echo "MAPSWIPE_API_LAST_MODIFIED_EPOCH=$(date --date="$LAST_MODIFIED" +%s)" >> "$GITHUB_ENV"
fi
