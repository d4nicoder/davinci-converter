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
      if (/\.(mov|mp4|mpeg|avi|mkv)$/i.test(source)) {
        files = files.concat([source])
      }
    }
    resolve(files)
  })
}

export default find