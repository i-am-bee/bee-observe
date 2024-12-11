/**
 * Copyright 2024 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directory = path.resolve(__dirname, '../src/types/generated');

async function addJsExtensions(dir) {
  const files = await fs.promises.readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.lstat(filePath);
    if (stat.isDirectory()) {
      await addJsExtensions(filePath);
    } else if (file.endsWith('.ts')) {
      let content = await fs.promises.readFile(filePath, 'utf8');
      content = content.replace(/(from\s+['"](\.?\.\/[^'"]+))(?<!\.js)(?=['"])/g, '$1.js');
      await fs.promises.writeFile(filePath, content, 'utf8');
    }
  }
}

addJsExtensions(directory)
  .then(() => console.log('Added .js extensions to imports in generated TypeScript files.'))
  .catch(console.error);
