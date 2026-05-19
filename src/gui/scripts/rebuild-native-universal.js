const { spawnSync } = require('child_process')
const { copyFileSync, existsSync, mkdirSync, rmSync } = require('fs')
const { join, resolve } = require('path')

if (process.platform !== 'darwin') {
  throw new Error('Universal native rebuilds are only supported on macOS.')
}

const appDir = resolve(__dirname, '..')
const rebuildBin = join(appDir, 'node_modules', '.bin', 'electron-rebuild')
const addonPath = join(appDir, 'node_modules', 'lc3interface', 'build', 'Release', 'lc3interface.node')
const scratchDir = join(appDir, 'node_modules', '.cache', 'lc3interface-universal')

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: appDir,
    env: { ...process.env, ...env },
    stdio: 'inherit'
  })

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`)
  }
}

rmSync(scratchDir, { recursive: true, force: true })
mkdirSync(scratchDir, { recursive: true })

for (const arch of ['x64', 'arm64']) {
  run(rebuildBin, ['-f', '-w', 'lc3interface', '--arch', arch], {
    npm_config_arch: arch,
    npm_config_target_arch: arch
  })

  if (!existsSync(addonPath)) {
    throw new Error(`Expected ${addonPath} after rebuilding ${arch}`)
  }

  copyFileSync(addonPath, join(scratchDir, `lc3interface-${arch}.node`))
}

run('lipo', [
  '-create',
  join(scratchDir, 'lc3interface-x64.node'),
  join(scratchDir, 'lc3interface-arm64.node'),
  '-output',
  addonPath
])
run('lipo', ['-info', addonPath])
