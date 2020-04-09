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

import { spawn } from 'child_process'
import fsExtra, { existsSync } from 'fs-extra'
import path from 'path'
import ProgressBar from 'progress'

const qualityOptions: any = {
  low: '-vcodec prores_ks -profile:v 0 -qscale:v 11 -vendor ap10 -pix_fmt yuv422p10le -acodec pcm_s16le -f mov -y -progress pipe:1',
  mid: '-vcodec prores_ks -profile:v 0 -qscale:v 9 -vendor ap10 -pix_fmt yuv422p10le -acodec pcm_s16le -f mov -y -progress pipe:1',
  high: '-vcodec prores_ks -profile:v 0 -qscale:v 5 -vendor ap10 -pix_fmt yuv422p10le -acodec pcm_s16le -f mov -y -progress pipe:1',
  extreme: '-vcodec prores_ks -profile:v 0 -pix_fmt yuv422p -acodec pcm_s16le -f mov -y -progress pipe:1'
}

const comAudio = '-acodec pcm_s16le -f wav -n -progress pipe:1'

export default class Converter {
  private showProgress: boolean = false
  private showDebug: boolean = false
  private quality: string = ''
  private totalFrames = 0

  private async _getDuration (source: string) {
    return new Promise((resolve, reject) => {
      const com = spawn('ffprobe', ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', source])

      let rawJson: string = ''
      com.stdout.on('data', (data) => {
        rawJson += data.toString()
      })

      com.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error('File format not recognized'))
        } else {
          let json
          try {
            json = JSON.parse(rawJson)
          } catch (e) {
            reject(e)
            return
          }
          let audioFrames = 0
          for (const stream of json.streams) {
            if (stream.codec_type === 'video') {
              this.totalFrames = parseInt(stream.nb_frames, 10)
            } else if (stream.codec_type === 'audio') {
              audioFrames = parseInt(stream.nb_frames, 10)
            }
          }

          if (this.totalFrames === 0) {
            this.totalFrames = audioFrames
          }
          resolve()
        }
      })
    })
  }

  public constructor (quality: string) {
    this.quality = quality
  }
  public progress () {
    this.showProgress = true
  }

  public debug () {
    this.showDebug = true
  }

  public async convert (sourceType: string, source: string, destination: string, fileNumber: number, total: number) {
    return new Promise(async (resolve, reject) => {
      try {
        await this._getDuration(source)
      } catch (e) {
        reject(e)
        return
      }

      try {
        const exists = fsExtra.existsSync(destination)
        if (exists && process.env.OVERWRITE !== '1') {
          console.log(`${fileNumber}/${total} File ${destination} already exists`)
          resolve()
          return
        }
      } catch (e) {
        console.error(e)
      }

      await fsExtra.ensureDir(path.dirname(destination), {mode: 777})
      let command: string[] = []
      const qualityCommand: string = qualityOptions[this.quality]

      if (sourceType === 'video') {
        command = ['-i', source].concat(qualityCommand.split(' '))
      } else if (sourceType === 'audio') {
        command = ['-i', source].concat(comAudio.split(' '))
      } else {
        reject(new Error('Invalid source format'))
        return
      }
      command.push(destination)

      const cmd = spawn('ffmpeg', command)

      if (this.showDebug) {
        cmd.stderr.on('data', (data) => {
          console.log(data.toString())
        })
      }

      if (this.showProgress && !this.showDebug) {

        let truncatedName: string
        if (source.length >= 30) {
          truncatedName = source.substr(0, 27) + '...'
        } else {
          truncatedName = source + new Array(31 - source.length).join(' ')
        }

        const bar = new ProgressBar(`${fileNumber}/${total} - ${truncatedName} [:bar] :percent :etas`, {
          complete: '=',
          incomplete: ' ',
          // width: 100,
          total: this.totalFrames
        })

        let previousFrame = 0
        cmd.stdout.on('data', (data) => {
          const tLines: any = data.toString().split('\n');
          const progress: any = {};
          for (let i = 0; i < tLines.length; i++) {
              const key = tLines[i].split('=');
              if (typeof key[0] !== 'undefined' && typeof key[1] !== 'undefined') {
                  progress[key[0]] = key[1];

                  if (key[0] === 'frame' && this.totalFrames > 0) {
                    const frame = parseInt(key[1], 10)
                    const increment: number = frame - previousFrame
                    bar.tick(increment)
                    previousFrame = frame + 0
                  }
              }
          }
        })
      }

      cmd.on('error', (err) => {
        console.error(err)
      })

      cmd.on('exit', (code) => {
        if (code !== 0) {
          reject(code)
        } else {
          try {
            fsExtra.chmodSync(destination, '777')
          } catch (e) {
            console.error(e)
          }
          resolve()
        }
      })
    })
  }
}