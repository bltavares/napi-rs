export type SupportedArch = 'x64' | 'arm64'

const CpuToNodeArch: { [index: string]: SupportedArch } = {
  x86_64: 'x64',
  aarch64: 'arm64',
}

const SysToNodePlatform: { [index: string]: NodeJS.Platform } = {
  linux: 'linux',
  freebsd: 'freebsd',
  darwin: 'darwin',
  windows: 'win32',
}

export interface PlatformDetail {
  platform: NodeJS.Platform
  platformArchABI: string
  arch: SupportedArch
  raw: string
  abi: string | null
}

export const DefaultPlatforms: PlatformDetail[] = [
  {
    platform: 'win32',
    arch: 'x64',
    abi: 'msvc',
    platformArchABI: 'win32-x64-msvc',
    raw: 'x86_64-pc-windows-msvc',
  },
  {
    platform: 'darwin',
    arch: 'x64',
    abi: null,
    platformArchABI: 'darwin-x64',
    raw: 'x86_64-apple-darwin',
  },
  {
    platform: 'linux',
    arch: 'x64',
    abi: 'gnu',
    platformArchABI: 'linux-x64-gnu',
    raw: 'x86_64-unknown-linux-gnu',
  },
]

/**
 * A triple is a specific format for specifying a target architecture.
 * Triples may be referred to as a target triple which is the architecture for the artifact produced, and the host triple which is the architecture that the compiler is running on.
 * The general format of the triple is `<arch><sub>-<vendor>-<sys>-<abi>` where:
 *   - `arch` = The base CPU architecture, for example `x86_64`, `i686`, `arm`, `thumb`, `mips`, etc.
 *   - `sub` = The CPU sub-architecture, for example `arm` has `v7`, `v7s`, `v5te`, etc.
 *   - `vendor` = The vendor, for example `unknown`, `apple`, `pc`, `nvidia`, etc.
 *   - `sys` = The system name, for example `linux`, `windows`, `darwin`, etc. none is typically used for bare-metal without an OS.
 *   - `abi` = The ABI, for example `gnu`, `android`, `eabi`, etc.
 */
export function parseTriple(triple: string): PlatformDetail {
  const [cpu, , sys, abi = null] = triple.split('-')
  const platformName = assert(
    SysToNodePlatform[sys],
    `Not support to ${sys}, supported: ${Object.keys(SysToNodePlatform).join(
      ', ',
    )}`,
  )
  const arch = assert(
    CpuToNodeArch[cpu],
    `Not support to ${cpu}, supported: ${Object.keys(CpuToNodeArch).join(
      ', ',
    )}`,
  )
  return {
    platform: platformName,
    arch,
    abi,
    platformArchABI: abi
      ? `${platformName}-${arch}-${abi}`
      : `${platformName}-${arch}`,
    raw: triple,
  }
}

function assert<T>(value: T | undefined, msg: string): T {
  if (value == null) {
    throw new TypeError(msg)
  }
  return value!
}
