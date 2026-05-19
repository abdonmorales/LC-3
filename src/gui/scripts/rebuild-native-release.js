const { spawnSync } = require('child_process')
const { resolve } = require('path')

const appDir = resolve(__dirname, '..')
const script = process.platform === 'darwin' ? 'rebuild:native:universal' : 'rebuild:native'
const yarnBin = process.platform === 'win32' ? 'yarn.cmd' : 'yarn'

const result = spawnSync(yarnBin, [script], {
  cwd: appDir,
  stdio: 'inherit',
  shell: process.platform === 'win32'
})

if (result.status !== 0) {
  process.exit(result.status || 1)
}
