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

import Converter from './converter'
import find from './find'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()


const printOptions = () => {
  console.log(`
  Usage: davinci-converter [options] --input <source_folder> --output <destination_folder>

  Options:
   --no-progress          Hide the progress bar for each conversion
   --debug                Show ffmpeg debug information (disables the progress bar)
   --overwrite            Overwrite destination files
   -q, --quality          Set the output quality. Values: low,mid,high,extreme
   -i, --input            Input folder to search for files
   -o, --output           Output folder to put the encoded files

  Full documentation on: <https://gitlab.com/danitetus/davinci-converter.git>
  `)
}

const init = async () => {
  if (!process.env.SOURCE) {
    printOptions()
    console.log('Error: Missing source folder')
    process.exit(1)
  }

  if (!process.env.DESTINATION) {
    printOptions()
    console.log('Error: Missing destination folder')
    process.exit(1)
  }

  const source = process.env.SOURCE
  const destination = process.env.DESTINATION

  // Search for all files inside source folder
  const files = await find(source)

  const fileErrors: string[] = []

  const quality: string = process.env.QUALITY && /^(low|mid|high|extreme)$/.test(process.env.QUALITY) ? process.env.QUALITY : 'low'

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const conv =  new Converter(quality)
    // Progress bar enabled by default
    if (process.env.PROGRESS !== '0') {
      conv.progress()
    }

    // If debug, progress is disabled
    if (process.env.DEBUG === '1') {
      conv.debug()
    }

    const sourceType = /\.(mp3|wav|aiff|flac)$/i.test(file) ? 'audio' : 'video'
    const extension = sourceType === 'video' ? 'mov' : 'wav'

    const dest = path.join(destination, `${file.replace(source, '')}.${extension}`)
    try {
      await conv.convert(sourceType, file, dest, i + 1, files.length)
      await fs.promises.chmod(dest, '0777')
    } catch (e) {
      console.error(e)
      fileErrors.push(file)
    }
  }

  if (fileErrors.length > 0) {
    console.error(`
    ******************************************************
    ******************************************************
    ********************** ERRORS ************************
    ******************************************************
    ******************************************************
    `)
    fileErrors.forEach((f) => {
      console.error(f)
    })
  }

  process.exit(0)

}
// Detecting options
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i]
  const next = i + 1 <= process.argv.length ? process.argv[i + 1] : null

  if (arg === '--no-progress') {
    process.env.PROGRESS = '0'
  } else if (arg === '--debug') {
    process.env.DEBUG = '1'
  } else if ((arg === '--quality' || arg === '-q') && next !== null) {
    if (!/^(low|mid|high|extreme)$/.test(next)) {
      printOptions()
      console.error('Error: Quality argument invalid')
      process.exit(1)
    }
    process.env.QUALITY = next
  } else if (arg === '--overwrite') {
    process.env.OVERWRITE = '1'
  } else if ((arg === '-i' || arg === '--input') && next !== null) {
    process.env.SOURCE = next
  } else if ((arg === '-o' || arg === '--output') && next !== null) {
    process.env.DESTINATION = next
  }
}

init()
  .then(() => {
    console.log('Finish')
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(2)
  })
