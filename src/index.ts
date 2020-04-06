import Converter from './converter'
import find from './find'
import fs from 'fs'
import path from 'path'

const init = async (source: string, destination: string) => {
  // Search for all files inside source folder
  const files = await find(source)
  destination = path.resolve(destination)

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const dest = path.join(destination, `${file.replace(source, '')}.mov`)
    console.log(`Converting ${file}`)
    const conv =  new Converter()
    conv.progress()
    await conv.convert(file, dest)
    await fs.promises.chmod(dest, '0777')
  }

}

if (process.argv.length < 4) {
  console.error('Missing arguments')
  process.exit(1)
}
const source = process.argv[2]
const destination = process.argv[3]

init(source, destination)
  .then(() => {
    console.log('Finish')
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(2)
  })
