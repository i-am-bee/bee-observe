#!/bin/bash
# Copyright 2025 IBM Corp.
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

cd "$(dirname "$0")"

# Check if the 'otelcol' file already exists
if [ ! -f otelcol ]; then
  echo "otelcol file not found. Downloading and extracting..."
  
  curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.115.1/otelcol_0.115.1_darwin_arm64.tar.gz
  
  tar -xvf otelcol_0.115.1_darwin_arm64.tar.gz

  ## clean unnecessary files
  rm otelcol_0.115.1_darwin_arm64.tar.gz
  rm README.MD
else
  echo "otelcol file already exists. Skipping download and extraction."
fi
