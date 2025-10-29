#!/bin/bash
# ============================================
# Docker Build Script with Environment Variables
# ============================================
# Usage: ./docker-build-args.sh
# Or: bash docker-build-args.sh

# Load environment from .env.local or .env.production
set -a
if [ -f .env.production ]; then
  source .env.production
  echo "✅ Loaded .env.production"
elif [ -f .env.local ]; then
  source .env.local
  echo "✅ Loaded .env.local"
else
  echo "❌ Error: No .env.local or .env.production found"
  exit 1
fi
set +a

# Docker Hub username (CHANGE THIS!)
DOCKER_USERNAME="your-dockerhub-username"

# Image name
IMAGE_NAME="vietexplore-ai"

# Version (update này cho mỗi release)
VERSION="3.0.0"

# Tags
TAGS=(
  "${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
  "${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
  "${DOCKER_USERNAME}/${IMAGE_NAME}:production"
)

echo "================================================"
echo "🐳 Building VietExplore-AI Docker Image"
echo "================================================"
echo "Username: ${DOCKER_USERNAME}"
echo "Image: ${IMAGE_NAME}"
echo "Version: ${VERSION}"
echo "Tags:"
for tag in "${TAGS[@]}"; do
  echo "  - ${tag}"
done
echo "================================================"
echo ""

# Build command
echo "🔨 Building image..."
docker build \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="${NEXT_PUBLIC_FIREBASE_API_KEY}" \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}" \
  --build-arg NEXT_PUBLIC_FIREBASE_DATABASE_URL="${NEXT_PUBLIC_FIREBASE_DATABASE_URL}" \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="${NEXT_PUBLIC_FIREBASE_PROJECT_ID}" \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}" \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}" \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="${NEXT_PUBLIC_FIREBASE_APP_ID}" \
  --build-arg NEXT_PUBLIC_CLARITY_PROJECT_ID="${NEXT_PUBLIC_CLARITY_PROJECT_ID}" \
  --build-arg NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL}" \
  --build-arg NEXT_PUBLIC_ENABLE_AI_FEATURES="${NEXT_PUBLIC_ENABLE_AI_FEATURES:-false}" \
  --build-arg NEXT_PUBLIC_ENABLE_ANALYTICS="${NEXT_PUBLIC_ENABLE_ANALYTICS:-true}" \
  --build-arg SITE_URL="${SITE_URL}" \
  -t "${DOCKER_USERNAME}/${IMAGE_NAME}:latest" \
  -t "${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}" \
  -t "${DOCKER_USERNAME}/${IMAGE_NAME}:production" \
  .

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Build successful!"
  echo ""
  echo "================================================"
  echo "📦 Image Details"
  echo "================================================"
  docker images | grep "${IMAGE_NAME}"
  echo ""
  echo "================================================"
  echo "🚀 Next Steps"
  echo "================================================"
  echo "1. Test locally:"
  echo "   docker run -p 3000:3000 --env-file .env.production ${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
  echo ""
  echo "2. Push to Docker Hub:"
  echo "   docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
  echo "   docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
  echo "   docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:production"
  echo ""
  echo "3. Or use the push script:"
  echo "   ./docker-push.sh"
  echo "================================================"
else
  echo ""
  echo "❌ Build failed!"
  echo "Check errors above and fix them."
  exit 1
fi
