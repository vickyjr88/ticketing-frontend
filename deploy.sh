#!/bin/bash

# Web Ticketing Frontend Deployment Script
set -e

echo "🚀 Deploying Web Ticketing Frontend..."

# Configuration
ECR_REGISTRY="767398109480.dkr.ecr.us-east-1.amazonaws.com"
ECR_REPOSITORY="vdm-agency-ticketing-frontend"
API_URL="https://3.225.246.72/api"
EC2_HOST="3.225.246.72"
SSH_KEY="/Users/vickyjunior/projects/vdm/digital_agency/infrastructure/agency_keyb.pem"

# Build and push image
echo "📦 Building Docker image..."
docker build --platform linux/amd64 \
  --build-arg VITE_API_URL=$API_URL \
  -t $ECR_REGISTRY/$ECR_REPOSITORY:latest .

echo "🔐 Logging into ECR..."
export AWS_PROFILE=vdm-agency
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $ECR_REGISTRY

echo "⬆️ Pushing to ECR..."
docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

echo "🚀 Deploying to EC2..."
ssh -i $SSH_KEY ubuntu@$EC2_HOST << 'EOF'
  # Login to ECR
  aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin 767398109480.dkr.ecr.us-east-1.amazonaws.com
  
  # Stop and remove existing container
  docker stop ticketing-frontend || true
  docker rm ticketing-frontend || true
  
  # Pull and run latest image
  docker pull 767398109480.dkr.ecr.us-east-1.amazonaws.com/vdm-agency-ticketing-frontend:latest
  docker run -d --name ticketing-frontend \
    --network vdm-network \
    -p 3000:80 \
    767398109480.dkr.ecr.us-east-1.amazonaws.com/vdm-agency-ticketing-frontend:latest
  
  # Clean up old images
  docker image prune -f
EOF

echo "✅ Deployment complete!"
echo "🌐 Frontend available at: https://$EC2_HOST:3000"
echo "📚 API docs at: https://$EC2_HOST:4001/api/docs"
