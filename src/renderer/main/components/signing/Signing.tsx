import { observer } from 'mobx-react-lite'
import LunaToolbar, { LunaToolbarSpace } from 'luna-toolbar/react'
import LunaModal from 'luna-modal'
import { useState, useEffect, useCallback } from 'react'
import { t } from 'common/util'
import ToolbarIcon from 'share/renderer/components/ToolbarIcon'
import Style from './Signing.module.scss'
import className from 'licia/className'
import {
  ISigningProfile,
  ISigningProfileInput,
  SigningScheme,
} from 'common/types'

type Mode = 'sign' | 'profiles'
type ProfileFormMode = 'list' | 'create' | 'edit'

function mapProfileError(message: string): string {
  if (message.includes('Encryption unavailable')) {
    return t('encryptionUnavailable')
  }
  if (message.includes('Profile name required')) {
    return t('profileNameRequired')
  }
  if (message.includes('Profile name duplicate')) {
    return t('profileNameDuplicate')
  }
  if (message.includes('Profile not found')) {
    return t('profileNotFound')
  }
  if (message.includes('Keystore file not found')) {
    return t('keystoreNotFound')
  }
  if (message.includes('APK file not found')) {
    return t('apkNotFound')
  }
  if (message.includes('Keystore password required')) {
    return t('keystorePasswordRequired')
  }
  if (message.includes('Key password required')) {
    return t('keyPasswordRequired')
  }
  if (message.includes('Keystore path required')) {
    return t('keystorePathRequired')
  }
  if (message.includes('Key alias required')) {
    return t('keyAliasRequired')
  }
  if (message.includes('Java not found')) {
    return t('javaNotFound')
  }
  return message
}

function schemeLabel(scheme: SigningScheme): string {
  if (scheme === 'v1') return 'V1'
  if (scheme === 'v2') return 'V2'
  return 'V1 + V2'
}

export default observer(function Signing() {
  const [mode, setMode] = useState<Mode>('sign')

  const [profiles, setProfiles] = useState<ISigningProfile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState('')

  // Sign mode state
  const [apkPath, setApkPath] = useState('')
  const [scheme, setScheme] = useState<SigningScheme>('v1v2')
  const [signing, setSigning] = useState(false)
  const [signResult, setSignResult] = useState<{
    success: boolean
    message: string
    path?: string
  } | null>(null)

  // Profile management state
  const [profileFormMode, setProfileFormMode] = useState<ProfileFormMode>('list')
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null)
  const [profileName, setProfileName] = useState('')
  const [keystorePath, setKeystorePath] = useState('')
  const [keystorePass, setKeystorePass] = useState('')
  const [keyAlias, setKeyAlias] = useState('')
  const [keyPass, setKeyPass] = useState('')
  const [profileScheme, setProfileScheme] = useState<SigningScheme>('v1v2')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')

  const loadProfiles = useCallback(async () => {
    try {
      const list = await main.getSigningProfiles()
      setProfiles(list)
      setSelectedProfileId((prev) => {
        if (prev && list.some((p) => p.id === prev)) {
          return prev
        }
        return list[0]?.id || ''
      })
    } catch {
      setProfiles([])
    }
  }, [])

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  useEffect(() => {
    if (selectedProfileId) {
      const profile = profiles.find((p) => p.id === selectedProfileId)
      if (profile) {
        setScheme(profile.scheme)
      }
    }
  }, [selectedProfileId, profiles])

  async function selectApk() {
    const { filePaths } = await main.showOpenDialog({
      filters: [{ name: 'APK', extensions: ['apk'] }],
    })
    if (filePaths.length > 0) {
      setApkPath(filePaths[0])
    }
  }

  async function selectKeystore() {
    const { filePaths } = await main.showOpenDialog({
      filters: [{ name: 'Keystore', extensions: ['jks', 'keystore', 'p12'] }],
    })
    if (filePaths.length > 0) {
      setKeystorePath(filePaths[0])
    }
  }

  async function handleSign() {
    if (!apkPath || !selectedProfileId) return

    const { canceled, filePath } = await main.showSaveDialog({
      defaultPath: apkPath.replace(/\.apk$/i, '_signed.apk'),
      filters: [{ name: 'APK', extensions: ['apk'] }],
    })
    if (canceled || !filePath) return

    setSigning(true)
    setSignResult(null)
    try {
      await main.signApkWithProfile(
        apkPath,
        selectedProfileId,
        filePath,
        scheme,
      )
      setSignResult({
        success: true,
        message: t('signSuccess'),
        path: filePath,
      })
    } catch (e: any) {
      setSignResult({
        success: false,
        message: t('signFailed', {
          error: mapProfileError(e.message || String(e)),
        }),
      })
    } finally {
      setSigning(false)
    }
  }

  function revealSignedApk(filePath: string) {
    main.showItemInFolder(filePath)
  }

  function resetProfileForm() {
    setProfileName('')
    setKeystorePath('')
    setKeystorePass('')
    setKeyAlias('')
    setKeyPass('')
    setProfileScheme('v1v2')
    setEditingProfileId(null)
    setProfileError('')
  }

  function openCreateProfile() {
    resetProfileForm()
    setProfileFormMode('create')
  }

  function openEditProfile(profile: ISigningProfile) {
    setProfileName(profile.name)
    setKeystorePath(profile.keystorePath)
    setKeystorePass('')
    setKeyAlias(profile.keyAlias)
    setKeyPass('')
    setProfileScheme(profile.scheme)
    setEditingProfileId(profile.id)
    setProfileError('')
    setProfileFormMode('edit')
  }

  function cancelProfileForm() {
    resetProfileForm()
    setProfileFormMode('list')
  }

  async function saveProfile() {
    setProfileError('')
    if (!trimName(profileName)) {
      setProfileError(t('profileNameRequired'))
      return
    }
    if (!keystorePath) {
      setProfileError(t('keystorePathRequired'))
      return
    }
    if (!trimName(keyAlias)) {
      setProfileError(t('keyAliasRequired'))
      return
    }
    if (profileFormMode === 'create' && !keystorePass) {
      setProfileError(t('keystorePasswordRequired'))
      return
    }
    if (profileFormMode === 'create' && !keyPass) {
      setProfileError(t('keyPasswordRequired'))
      return
    }

    const input: ISigningProfileInput = {
      name: trimName(profileName),
      keystorePath,
      keystorePass,
      keyAlias: trimName(keyAlias),
      keyPass,
      scheme: profileScheme,
    }

    setProfileSaving(true)
    try {
      if (profileFormMode === 'edit' && editingProfileId) {
        await main.updateSigningProfile(editingProfileId, input)
      } else {
        const created = await main.addSigningProfile(input)
        setSelectedProfileId(created.id)
      }
      await loadProfiles()
      cancelProfileForm()
    } catch (e: any) {
      setProfileError(mapProfileError(e.message || String(e)))
    } finally {
      setProfileSaving(false)
    }
  }

  async function deleteProfile(profile: ISigningProfile) {
    const confirmed = await LunaModal.confirm(
      t('deleteProfileConfirm', { name: profile.name }),
    )
    if (!confirmed) return
    try {
      await main.deleteSigningProfile(profile.id)
      if (selectedProfileId === profile.id) {
        setSelectedProfileId('')
      }
      await loadProfiles()
    } catch (e: any) {
      setProfileError(mapProfileError(e.message || String(e)))
    }
  }

  function renderProfileForm() {
    const isEdit = profileFormMode === 'edit'
    return (
      <div className={Style.form}>
        <div className={Style.field}>
          <label>{t('profileName')}</label>
          <input
            type="text"
            value={profileName}
            placeholder={t('profileNamePlaceholder')}
            onChange={(e) => setProfileName(e.target.value)}
          />
        </div>
        <div className={Style.field}>
          <label>{t('keystoreFile')}</label>
          <span className={Style.filePath}>{keystorePath || '-'}</span>
          <button className={Style.fileBtn} onClick={selectKeystore}>
            {t('selectKeystore')}
          </button>
        </div>
        <div className={Style.field}>
          <label>{t('keystorePassword')}</label>
          <input
            type="password"
            value={keystorePass}
            placeholder={isEdit ? t('passwordUnchanged') : ''}
            onChange={(e) => setKeystorePass(e.target.value)}
          />
        </div>
        <div className={Style.field}>
          <label>{t('keyAlias')}</label>
          <input
            type="text"
            value={keyAlias}
            onChange={(e) => setKeyAlias(e.target.value)}
          />
        </div>
        <div className={Style.field}>
          <label>{t('keyPassword')}</label>
          <input
            type="password"
            value={keyPass}
            placeholder={isEdit ? t('passwordUnchanged') : ''}
            onChange={(e) => setKeyPass(e.target.value)}
          />
        </div>
        <div className={Style.field}>
          <label>{t('signingScheme')}</label>
          <select
            value={profileScheme}
            onChange={(e) =>
              setProfileScheme(e.target.value as SigningScheme)
            }
          >
            <option value="v1">V1</option>
            <option value="v2">V2</option>
            <option value="v1v2">V1 + V2</option>
          </select>
        </div>
        {profileError && (
          <div className={className(Style.result, Style.error)}>
            {profileError}
          </div>
        )}
        <div className={Style.actions}>
          <button
            className={Style.secondaryBtn}
            onClick={cancelProfileForm}
            disabled={profileSaving}
          >
            {t('cancel')}
          </button>
          <button
            className={Style.signBtn}
            onClick={saveProfile}
            disabled={profileSaving}
          >
            {profileSaving ? t('saving') : t('save')}
          </button>
        </div>
      </div>
    )
  }

  function renderProfileList() {
    return (
      <div className={Style.profilePanel}>
        <div className={Style.profileHeader}>
          <button className={Style.signBtn} onClick={openCreateProfile}>
            {t('addSigningProfile')}
          </button>
        </div>
        {profiles.length === 0 ? (
          <div className={Style.hint}>{t('noSigningProfiles')}</div>
        ) : (
          <div className={Style.profileList}>
            {profiles.map((profile) => (
              <div key={profile.id} className={Style.profileItem}>
                <div className={Style.profileMain}>
                  <div className={Style.profileName}>{profile.name}</div>
                  <div className={Style.profileMeta}>
                    <span title={profile.keystorePath}>
                      {profile.keystorePath}
                    </span>
                    <span>
                      {t('keyAlias')}: {profile.keyAlias}
                    </span>
                    <span>
                      {t('signingScheme')}: {schemeLabel(profile.scheme)}
                    </span>
                  </div>
                </div>
                <div className={Style.profileActions}>
                  <button
                    className={Style.fileBtn}
                    onClick={() => openEditProfile(profile)}
                  >
                    {t('edit')}
                  </button>
                  <button
                    className={Style.fileBtn}
                    onClick={() => deleteProfile(profile)}
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {profileError && (
          <div className={className(Style.result, Style.error)}>
            {profileError}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="panel-with-toolbar">
      <LunaToolbar className="panel-toolbar">
        <ToolbarIcon
          icon="manage"
          title={t('signApk')}
          state={mode === 'sign' ? 'active' : ''}
          onClick={() => setMode('sign')}
        />
        <ToolbarIcon
          icon="list"
          title={t('manageSigningProfiles')}
          state={mode === 'profiles' ? 'active' : ''}
          onClick={() => {
            setMode('profiles')
            setProfileFormMode('list')
            setProfileError('')
            loadProfiles()
          }}
        />
        <LunaToolbarSpace />
      </LunaToolbar>
      <div className={Style.body}>
        {mode === 'sign' && (
          <div className={Style.form}>
            <div className={Style.field}>
              <label>{t('apkFile')}</label>
              <span className={Style.filePath}>{apkPath || '-'}</span>
              <button className={Style.fileBtn} onClick={selectApk}>
                {t('selectApk')}
              </button>
            </div>
            {profiles.length === 0 ? (
              <div className={Style.emptyGuide}>
                <div className={Style.hint}>{t('noSigningProfiles')}</div>
                <button
                  className={Style.signBtn}
                  onClick={() => {
                    setMode('profiles')
                    openCreateProfile()
                  }}
                >
                  {t('addSigningProfile')}
                </button>
              </div>
            ) : (
              <>
                <div className={Style.field}>
                  <label>{t('selectSigningProfile')}</label>
                  <select
                    value={selectedProfileId}
                    onChange={(e) => setSelectedProfileId(e.target.value)}
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className={Style.fileBtn}
                    onClick={() => {
                      setMode('profiles')
                      setProfileFormMode('list')
                      loadProfiles()
                    }}
                  >
                    {t('manage')}
                  </button>
                </div>
                <div className={Style.field}>
                  <label>{t('signingScheme')}</label>
                  <select
                    value={scheme}
                    onChange={(e) =>
                      setScheme(e.target.value as SigningScheme)
                    }
                  >
                    <option value="v1">V1</option>
                    <option value="v2">V2</option>
                    <option value="v1v2">V1 + V2</option>
                  </select>
                </div>
                <div className={Style.actions}>
                  <button
                    className={Style.signBtn}
                    disabled={signing || !apkPath || !selectedProfileId}
                    onClick={handleSign}
                  >
                    {signing ? t('signingInProgress') : t('signBtn')}
                  </button>
                </div>
              </>
            )}
            {signResult && (
              <div
                className={className(Style.result, {
                  [Style.success]: signResult.success,
                  [Style.error]: !signResult.success,
                })}
              >
                <div className={Style.resultTitle}>{signResult.message}</div>
                {signResult.success && signResult.path && (
                  <button
                    type="button"
                    className={Style.resultPath}
                    title={t('showInFolder')}
                    onClick={() => revealSignedApk(signResult.path!)}
                  >
                    {signResult.path}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {mode === 'profiles' &&
          (profileFormMode === 'list'
            ? renderProfileList()
            : renderProfileForm())}
      </div>
    </div>
  )
})

function trimName(value: string) {
  return value.trim()
}
