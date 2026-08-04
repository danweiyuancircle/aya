import childProcess from 'node:child_process'
import { handleEvent, resolveResources } from 'share/main/lib/util'
import {
  ISignatureInfo,
  ISigningProfile,
  ISigningProfileInput,
  IpcSignApk,
  IpcVerifyApk,
  IpcGetInstalledAppSignature,
  IpcGetSigningProfiles,
  IpcAddSigningProfile,
  IpcUpdateSigningProfile,
  IpcDeleteSigningProfile,
  IpcSignApkWithProfile,
  SigningScheme,
} from 'common/types'
import { shell } from './adb/base'
import * as file from './adb/file'
import { getSigningStore } from './store'
import trim from 'licia/trim'
import uuid from 'licia/uuid'
import os from 'node:os'
import path from 'node:path'
import fs from 'fs-extra'
import { safeStorage } from 'electron'

interface StoredSigningProfile extends ISigningProfile {
  keystorePassEnc: string
  keyPassEnc: string
}

function getApksignerJar() {
  return resolveResources('apksigner.jar')
}

function spawnJava(args: string[]): Promise<{
  stdout: string
  stderr: string
  code: number | null
}> {
  return new Promise((resolve, reject) => {
    const cp = childProcess.spawn('java', args, {
      env: { ...process.env },
    })

    let stdout = ''
    let stderr = ''

    cp.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    cp.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    cp.on('error', () => {
      reject(new Error('Java not found'))
    })

    cp.on('close', (code) => {
      resolve({ stdout, stderr, code })
    })
  })
}

function encryptSecret(plain: string): string {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Encryption unavailable')
  }
  return safeStorage.encryptString(plain).toString('base64')
}

function decryptSecret(enc: string): string {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Encryption unavailable')
  }
  return safeStorage.decryptString(Buffer.from(enc, 'base64'))
}

function toPublicProfile(stored: StoredSigningProfile): ISigningProfile {
  return {
    id: stored.id,
    name: stored.name,
    keystorePath: stored.keystorePath,
    keyAlias: stored.keyAlias,
    scheme: stored.scheme,
    createdAt: stored.createdAt,
    updatedAt: stored.updatedAt,
  }
}

function getProfiles(): StoredSigningProfile[] {
  const store = getSigningStore()
  const profiles = store.get('profiles') as StoredSigningProfile[] | undefined
  return profiles ? profiles.slice() : []
}

function setProfiles(profiles: StoredSigningProfile[]) {
  getSigningStore().set('profiles', profiles)
}

function validateInput(
  input: ISigningProfileInput,
  options: { requirePasswords: boolean },
) {
  const name = trim(input.name || '')
  if (!name) {
    throw new Error('Profile name required')
  }
  if (!trim(input.keystorePath || '')) {
    throw new Error('Keystore path required')
  }
  if (!trim(input.keyAlias || '')) {
    throw new Error('Key alias required')
  }
  if (!['v1', 'v2', 'v1v2'].includes(input.scheme)) {
    throw new Error('Invalid signing scheme')
  }
  if (options.requirePasswords) {
    if (!input.keystorePass) {
      throw new Error('Keystore password required')
    }
    if (!input.keyPass) {
      throw new Error('Key password required')
    }
  }
  return name
}

function assertNameUnique(name: string, excludeId?: string) {
  const lower = name.toLowerCase()
  const conflict = getProfiles().find(
    (p) => p.id !== excludeId && p.name.toLowerCase() === lower,
  )
  if (conflict) {
    throw new Error('Profile name duplicate')
  }
}

function schemeToFlags(scheme: SigningScheme): {
  v1Enabled: boolean
  v2Enabled: boolean
} {
  return {
    v1Enabled: scheme === 'v1' || scheme === 'v1v2',
    v2Enabled: scheme === 'v2' || scheme === 'v1v2',
  }
}

const signApk: IpcSignApk = async function (
  apkPath,
  keystorePath,
  keystorePass,
  keyAlias,
  keyPass,
  outputPath,
  v1Enabled,
  v2Enabled,
) {
  if (!(await fs.pathExists(keystorePath))) {
    throw new Error('Keystore file not found')
  }
  if (!(await fs.pathExists(apkPath))) {
    throw new Error('APK file not found')
  }

  const jar = getApksignerJar()
  const args = [
    '-jar',
    jar,
    'sign',
    '--ks',
    keystorePath,
    '--ks-pass',
    `pass:${keystorePass}`,
    '--ks-key-alias',
    keyAlias,
    '--key-pass',
    `pass:${keyPass}`,
    `--v1-signing-enabled=${v1Enabled}`,
    `--v2-signing-enabled=${v2Enabled}`,
    // apksigner defaults v3/v4 to on; UI only offers V1/V2/V1+V2 so keep them off
    '--v3-signing-enabled=false',
    // v4 writes a sidecar .idsig next to the APK; not needed for normal install/sign flows
    '--v4-signing-enabled=false',
    '--out',
    outputPath,
    apkPath,
  ]

  const { stdout, stderr, code } = await spawnJava(args)
  console.log('[signApk] exit code:', code)
  console.log('[signApk] stdout:', stdout)
  console.log('[signApk] stderr:', stderr)
  if (code !== 0) {
    const errMsg = trim(stderr) || trim(stdout) || 'Sign failed'
    throw new Error(errMsg)
  }

  // Clean up any leftover v4 idsig if an older apksigner still produced one
  const idsigPath = `${outputPath}.idsig`
  if (await fs.pathExists(idsigPath)) {
    await fs.remove(idsigPath).catch(() => {})
  }
}

function parseSignatureInfo(output: string): ISignatureInfo {
  const info: ISignatureInfo = {
    schemeVersion: '',
    subject: '',
    issuer: '',
    validFrom: '',
    validUntil: '',
    md5: '',
    sha1: '',
    sha256: '',
  }

  const lines = output.split('\n')
  for (const line of lines) {
    const trimmed = trim(line)
    if (trimmed.startsWith('Verified using v1 scheme')) {
      if (trimmed.includes('true')) {
        info.schemeVersion += info.schemeVersion ? ', V1' : 'V1'
      }
    }
    if (trimmed.startsWith('Verified using v2 scheme')) {
      if (trimmed.includes('true')) {
        info.schemeVersion += info.schemeVersion ? ', V2' : 'V2'
      }
    }
    if (trimmed.startsWith('Verified using v3 scheme')) {
      if (trimmed.includes('true')) {
        info.schemeVersion += info.schemeVersion ? ', V3' : 'V3'
      }
    }
    if (trimmed.startsWith('Subject:')) {
      info.subject = trimmed.substring(9).trim()
    }
    if (trimmed.startsWith('Issuer:')) {
      info.issuer = trimmed.substring(7).trim()
    }
    if (trimmed.startsWith('Valid from:')) {
      const parts = trimmed.substring(11).split(' until: ')
      info.validFrom = parts[0].trim()
      if (parts[1]) {
        info.validUntil = parts[1].trim()
      }
    }
    if (trimmed.startsWith('MD5:') || trimmed.includes('MD5 digest:')) {
      info.md5 = trimmed.split(':').slice(-1)[0].trim()
    }
    if (trimmed.startsWith('SHA-1:') || trimmed.includes('SHA-1 digest:')) {
      info.sha1 = trimmed.split(':').slice(-1)[0].trim()
    }
    if (trimmed.startsWith('SHA-256:') || trimmed.includes('SHA-256 digest:')) {
      info.sha256 = trimmed.split(':').slice(-1)[0].trim()
    }
  }

  return info
}

const verifyApk: IpcVerifyApk = async function (apkPath) {
  const jar = getApksignerJar()
  const args = ['-jar', jar, 'verify', '--verbose', '--print-certs', apkPath]

  const { stdout, stderr, code } = await spawnJava(args)
  if (code !== 0) {
    throw new Error(trim(stderr) || trim(stdout) || 'Verify failed')
  }

  return parseSignatureInfo(stdout)
}

const getInstalledAppSignature: IpcGetInstalledAppSignature = async function (
  deviceId,
  packageName,
) {
  // Get APK path from device
  const pmResult = await shell(deviceId, `pm path ${packageName}`)
  const apkLine = trim(pmResult).split('\n')[0]
  if (!apkLine || !apkLine.startsWith('package:')) {
    throw new Error('APK path not found')
  }
  const remoteApkPath = apkLine.substring(8).trim()

  // Pull APK to local temp
  const tmpApk = path.join(os.tmpdir(), `aya_sig_${Date.now()}.apk`)
  try {
    const buf = await file.pullFileData(deviceId, remoteApkPath)
    await fs.writeFile(tmpApk, buf)

    // Verify locally using apksigner
    const jar = getApksignerJar()
    const args = ['-jar', jar, 'verify', '--verbose', '--print-certs', tmpApk]

    const { stdout, stderr, code } = await spawnJava(args)
    if (code !== 0) {
      throw new Error(trim(stderr) || trim(stdout) || 'Verify failed')
    }

    return parseSignatureInfo(stdout)
  } finally {
    // Clean up temp file
    fs.remove(tmpApk).catch(() => {})
  }
}

const getSigningProfiles: IpcGetSigningProfiles = async function () {
  return getProfiles().map(toPublicProfile)
}

const addSigningProfile: IpcAddSigningProfile = async function (input) {
  const name = validateInput(input, { requirePasswords: true })
  assertNameUnique(name)

  const now = Date.now()
  const stored: StoredSigningProfile = {
    id: uuid(),
    name,
    keystorePath: trim(input.keystorePath),
    keyAlias: trim(input.keyAlias),
    scheme: input.scheme,
    keystorePassEnc: encryptSecret(input.keystorePass),
    keyPassEnc: encryptSecret(input.keyPass),
    createdAt: now,
    updatedAt: now,
  }

  const profiles = getProfiles()
  profiles.push(stored)
  setProfiles(profiles)

  return toPublicProfile(stored)
}

const updateSigningProfile: IpcUpdateSigningProfile = async function (
  id,
  input,
) {
  const profiles = getProfiles()
  const index = profiles.findIndex((p) => p.id === id)
  if (index < 0) {
    throw new Error('Profile not found')
  }

  const existing = profiles[index]
  const requirePasswords = false
  const name = validateInput(input, { requirePasswords })
  assertNameUnique(name, id)

  if (!existing.keystorePassEnc && !input.keystorePass) {
    throw new Error('Keystore password required')
  }
  if (!existing.keyPassEnc && !input.keyPass) {
    throw new Error('Key password required')
  }

  const updated: StoredSigningProfile = {
    ...existing,
    name,
    keystorePath: trim(input.keystorePath),
    keyAlias: trim(input.keyAlias),
    scheme: input.scheme,
    keystorePassEnc: input.keystorePass
      ? encryptSecret(input.keystorePass)
      : existing.keystorePassEnc,
    keyPassEnc: input.keyPass
      ? encryptSecret(input.keyPass)
      : existing.keyPassEnc,
    updatedAt: Date.now(),
  }

  profiles[index] = updated
  setProfiles(profiles)

  return toPublicProfile(updated)
}

const deleteSigningProfile: IpcDeleteSigningProfile = async function (id) {
  const profiles = getProfiles()
  const next = profiles.filter((p) => p.id !== id)
  if (next.length === profiles.length) {
    throw new Error('Profile not found')
  }
  setProfiles(next)
}

const signApkWithProfile: IpcSignApkWithProfile = async function (
  apkPath,
  profileId,
  outputPath,
  scheme,
) {
  const profiles = getProfiles()
  const profile = profiles.find((p) => p.id === profileId)
  if (!profile) {
    throw new Error('Profile not found')
  }

  const keystorePass = decryptSecret(profile.keystorePassEnc)
  const keyPass = decryptSecret(profile.keyPassEnc)
  const effectiveScheme = scheme || profile.scheme
  const { v1Enabled, v2Enabled } = schemeToFlags(effectiveScheme)

  await signApk(
    apkPath,
    profile.keystorePath,
    keystorePass,
    profile.keyAlias,
    keyPass,
    outputPath,
    v1Enabled,
    v2Enabled,
  )
}

export function init() {
  handleEvent('signApk', signApk)
  handleEvent('verifyApk', verifyApk)
  handleEvent('getInstalledAppSignature', getInstalledAppSignature)
  handleEvent('getSigningProfiles', getSigningProfiles)
  handleEvent('addSigningProfile', addSigningProfile)
  handleEvent('updateSigningProfile', updateSigningProfile)
  handleEvent('deleteSigningProfile', deleteSigningProfile)
  handleEvent('signApkWithProfile', signApkWithProfile)
}
