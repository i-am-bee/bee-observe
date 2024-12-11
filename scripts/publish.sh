# Copyright 2024 IBM Corp.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -e

REPOSITORY="docker.io"
USER="iambeeagent"
PLATFORMS="linux/amd64,linux/arm64"
SERVICE_NAME="bee-observe"

VERSION=$(node -p -e "require('./package.json').version")
if [ -n "$VERSION" ]; then
  echo "Version: $VERSION"
else
    echo "Version not found."
    exit 1
fi

# Remove any existing manifest
docker manifest rm "$USER/$SERVICE_NAME" 2>/dev/null || true

# Build the images for multiple platforms
docker buildx build --platform "$PLATFORMS" -t "$REPOSITORY/$USER/$SERVICE_NAME:latest" -t "$REPOSITORY/$USER/$SERVICE_NAME:$VERSION" --push .

# Create and push the manifest
docker manifest create "$REPOSITORY/$USER/$SERVICE_NAME:latest" \
  "$REPOSITORY/$USER/$SERVICE_NAME:latest" \
  "$REPOSITORY/$USER/$SERVICE_NAME:$VERSION"

docker manifest push "$REPOSITORY/$USER/$SERVICE_NAME:latest"
docker manifest push "$REPOSITORY/$USER/$SERVICE_NAME:$VERSION"
