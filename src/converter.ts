import { spawn } from 'child_process'
import fsExtra from 'fs-extra'
import path from 'path'

const audioCodec = 'pcm_s16le'
// const videoCodec = 'prores_ks'
const videoCodec = 'prores_ks'

const com = '-vcodec dnxhd -acodec pcm_s16le -r 30000/1001 -b:v 36M -pix_fmt yuv422p -f mov'

export default class Converter {
  private showProgress: boolean = false

  construct () {

  }

  public progress () {
    this.showProgress = true
  }

  public async convert (source: string, destination: string) {
    return new Promise(async (resolve, reject) => {
      await fsExtra.ensureDir(path.dirname(destination))
      const command = ['-i', source].concat(com.split(' '))
      command.push(destination)
      console.log(destination)
  
      const cmd = spawn('ffmpeg', command)
  
      if (this.showProgress) {
        cmd.stderr.on('data', (data) => {
          console.log(data.toString())
        })
      }

      cmd.stdout.on('data', (message) => {
        console.log(message)
      })

      cmd.on('error', (err) => {
        console.error(err)
      })
  
      cmd.on('exit', (code) => {
        console.log(`Salida con código ${code}`)
        if (code !== 0) {
          reject(code)
        } else {
          resolve()
        }
      })
    })
  }
}