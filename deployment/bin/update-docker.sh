#!/usr/bin/env bash
set -e
# Load the aliases for kubectl
source ${HOME}/.bashrc
cd ${HOME}/tabula-rasa
docker_port=5000
docker_url="localhost:${docker_port}"
docker_url="registry.gitlab.com/gokaart/tabula-rasa"
backend_name="${docker_url}/tabula-rasa-backend:$(git describe --tags --dirty)"
frontend_name="${docker_url}/tabula-rasa-frontend:$(git describe --tags --dirty)"

# Build the images
docker build -t ${backend_name} backend
docker build -t ${frontend_name} front-end

# Stop/remove old containers
docker stop registry || echo "No registry running"
docker stop tabula-rasa-frontend || echo "No frontend running"
docker stop tabula-rasa-backend || echo "No backend running"
sleep 5
docker rm registry || echo "No registry container"
docker rm tabula-rasa-frontend || echo "No frontend container"
docker rm tabula-rasa-backend || echo "No backend container"
sleep 5
# Push to local docker registry
docker run -d -p ${docker_port}:5000 --restart=always --name registry registry:2
echo ${backend_name}
echo ${frontend_name}
sleep 10
docker push ${backend_name}
docker push ${frontend_name}

# Start docker images
#docker run -d -p 3000:80 --restart=always --name tabula-rasa-frontend ${frontend_name}
#docker run -d -p 3001:8000 --restart=always --name tabula-rasa-backend ${backend_name}

docker image prune --filter "label=maintainer=taylor.smock@kaart.com" --force --filter="until=8h"
docker system prune --force --volumes
docker system prune --force --all --filter="until=48h"

# Update the images for K8s
kubectl --namespace tabula-rasa --record deployment.apps/frontend-deployment set image deployment.v1.apps/frontend-deployment tabula-rasa-frontend=${frontend_name}
kubectl --namespace tabula-rasa --record deployment.apps/backend-deployment set image deployment.v1.apps/backend-deployment tabula-rasa-backend=${backend_name}

#docker system prune --all --volumes
