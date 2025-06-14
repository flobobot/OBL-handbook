#!/bin/bash

# Load env vars (optional: create a .env file and source it here)
# source .env

# Expected: export NETLIFY_AUTH_TOKEN=...
#           export NETLIFY_SITE_ID_OBL=...
#           export NETLIFY_SITE_ID_AE=...

echo "Deploying OLD BLUE LAST..."
cd envs/old-blue-last
netlify deploy --auth $NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID_OBL --prod --dir=.

cd ../../envs/adam-and-eve
echo "Deploying ADAM & EVE..."
netlify deploy --auth $NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID_AE --prod --dir=.

cd ../../
