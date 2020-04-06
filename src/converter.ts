import { spawn } from 'child_process'
import fsExtra from 'fs-extra'
import path from 'path'

const audioCodec = 'pcm_s16le'
// const videoCodec = 'prores_ks'
const videoCodec = 'prores_ks'

// const com = '-vcodec dnxhd -profile:v dnxhr_sq -pix_fmt yuv422p -acodec pcm_s16le -s 1920x1080 -f mov -y' // Good quality extra high size
// const com = '-vcodec dnxhd -profile:v dnxhr_hq -pix_fmt yuv422p -acodec pcm_s16le -s 1920x1080 -f mov -y' // Good quality high size
// const com = '-vcodec prores -profile:v 3 -pix_fmt yuv422p -acodec pcm_s16le -s 1920x1080 -f mov -y' // Very good quality very high size
// const com = '-vcodec prores_ks -profile:v 0 -qscale:v 9 -vendor ap10 -pix_fmt yuv422p10le -acodec pcm_s16le -s 1920x1080 -f mov -y' // Good quality low size
const com = '-vcodec prores_ks -profile:v 0 -qscale:v 11 -vendor ap10 -pix_fmt yuv422p10le -acodec pcm_s16le -s 1920x1080 -f mov -y' // Very good quality very high size
// const com = '-vcodec prores_ks -profile:v 0 -qscale:v 5 -vendor ap10 -pix_fmt yuv422p10le -acodec pcm_s16le -s 1920x1080 -f mov -y' // Very good quality very high size

export default class Converter {
  private showProgress: boolean = false
  public progress () {
    this.showProgress = true
  }

  public async convert (source: string, destination: string) {
    return new Promise(async (resolve, reject) => {
      await fsExtra.ensureDir(path.dirname(destination), {mode: 0o2777})
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