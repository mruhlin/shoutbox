#!/usr/bin/env bash
# start redis
redis-server &

# deploy comments rest service on port 3000
cd comments-rest
rails server -b 0.0.0.0 -p 3000 -e development -d

# deploy comments stream service on port 3001
cd ../comments-stream
rails server Puma -b 0.0.0.0 -p 3001 -e production -d

# deploy photos service on port 3002
cd ../photo-service
mkdir public
mkdir public/photoUploads
rails server -b 0.0.0.0 -p 3002 -e development -d

# compile jsx etc
cd ..
#jsx --extension jsx ./ui/src ./ui
gulp

mkdir logs
mkdir logs/nginx

# deploy nginx on port 80
sudo nginx -c nginx.conf -p `pwd`