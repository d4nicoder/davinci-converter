/*
 *  MIT License
 *
 *  Copyright (c) 2020 Daniel Cañada García
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

import fs from 'fs'
import path from 'path'

const find = async (source: string): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    const stat = await fs.promises.stat(source)
    let files: string[] = []
    if (stat.isDirectory()) {
      const list = await fs.promises.readdir(source)

      for (let i = 0; i < list.length; i++) {
        const scanedFiles = await find(path.join(source, list[i]))
        files = files.concat(scanedFiles)
      }
    } else if (stat.isFile()) {
      // TODO: Check extensions
      if (/\.(mov|mp4|mpeg|avi|mkv|mp3|wav|aiff|flac)$/i.test(source)) {
        files = files.concat([source])
      }
    }
    resolve(files)
  })
}

export default find