import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { useNavigate, useParams, Routes, Route } from 'react-router-dom'
import { Sun, Moon, Plus } from 'lucide-react'
import { LocalConnector } from '@real-life-stack/local-connector'
import { MockConnector } from '@real-life-stack/mock-connector'
import type { DataInterface, Group } from '@real-life-stack/data-interface'
import { hasGroups, isAuthenticatable, hasMessaging, hasSignedClaims, hasProfile } from '@real-life-stack/data-interface'
import {
  ConnectorProvider,
  useConnector,
  useGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useInviteMember,
  useRemoveMember,
  useCurrentUser,
  useContacts,
  useVerification,
  useRelayStatus,
  AppShell,
  AppShellMain,
  Navbar,
  NavbarStart,
  NavbarCenter,
  NavbarEnd,
  ModuleTabs,
  BottomNav,
  UserMenu,
  Button,
  GroupDialog,
  ContactsDialog,
  VerificationDialog,
  IncomingVerificationDialog,
  IncomingSpaceInviteDialog,
  MutualVerificationDialog,
  RelayStatusBadge,
  IncomingEventsProvider,
  useIncomingEvents,
  ConnectorSwitcher,
} from '@real-life-stack/toolkit'
import type {
  Workspace,
  Module,
  UserData,
  ConnectorOption,
  GroupDialogMode,
} from '@real-life-stack/toolkit'
import { MacherProfileDialog } from '../modules/profile/MacherProfileDialog'
import { macherProfileConfig } from '../modules/profile/macher-profile-config'
import { getProfileConfig } from '../modules/types'
import { useProfileExtension, splitProfileUpdates } from '../modules/profile/use-profile-extension'
// Modul-Registrierung — alle Module einmalig beim App-Start registrieren.
// Wir importieren die ModuleDefinitions direkt + rufen registerModule manuell,
// damit Reihenfolge + Initialisierung deterministisch sind.
import { registerModule, getModuleConfig } from '../modules/registry'
import { mapModule } from '../modules/map'
import { kanbanModule } from '../modules/kanban'
import { marketplaceModule } from '../modules/marketplace'
import { calendarModule } from '../modules/calendar'
import { modulschmiedeModule, useAvailableModules } from '../modules/modulschmiede'
import { membersModule } from '../modules/members'
import { themeModule } from '../modules/theme'
import { useSpaceTheme } from '../themes/use-space-theme'
import { SpaceSettings, type SpaceSettingsTab } from '../settings/SpaceSettings'
import { MacherWorkspaceSwitcher } from '../spaces/MacherWorkspaceSwitcher'
import { SpaceHierarchyBar } from '../spaces/SpaceHierarchyBar'

registerModule(mapModule)
registerModule(kanbanModule)
registerModule(marketplaceModule)
registerModule(calendarModule)
registerModule(modulschmiedeModule)
registerModule(membersModule)
registerModule(themeModule)

const STORAGE_KEY_CONNECTOR = 'macher-connector'
const STORAGE_KEY_GROUP = 'macher-active-group'
const STORAGE_KEY_MODULE = 'macher-active-module'

const CONNECTOR_OPTIONS: ConnectorOption[] = [
  { id: 'local', name: 'Lokal', description: 'IndexedDB, persistent' },
  { id: 'mock', name: 'Mock', description: 'In-Memory, kein Speichern' },
  { id: 'wot', name: 'Web of Trust', description: 'E2E-verschluesselt, Multi-Device' },
]

// --- Incoming Event Dialogs ---

function IncomingEventDialogs({ onCloseVerifyDialog }: { onCloseVerifyDialog?: () => void }) {
  const connector = useConnector()
  const { data: currentUser } = useCurrentUser()
  const { incomingVerification, spaceInvite, mutualVerification, dismiss } = useIncomingEvents()

  const handleCounterVerify = async () => {
    if (!incomingVerification || !hasSignedClaims(connector)) return
    await connector.counterVerify(incomingVerification.fromId)
    dismiss()
  }

  const navigate = useNavigate()
  const handleOpenSpace = () => {
    if (spaceInvite) navigate(`/app/spaces/${spaceInvite.spaceId}/feed`)
    dismiss()
  }

  useEffect(() => {
    if (incomingVerification || mutualVerification) onCloseVerifyDialog?.()
  }, [incomingVerification, mutualVerification, onCloseVerifyDialog])

  return (
    <>
      <IncomingVerificationDialog
        open={!!incomingVerification}
        fromId={incomingVerification?.fromId ?? ''}
        fromName={incomingVerification?.fromName}
        fromAvatar={incomingVerification?.fromAvatar}
        onConfirm={handleCounterVerify}
        onReject={dismiss}
      />
      <IncomingSpaceInviteDialog
        open={!!spaceInvite}
        spaceName={spaceInvite?.spaceName ?? ''}
        spaceImage={spaceInvite?.spaceImage}
        inviterName={spaceInvite?.fromName}
        onOpen={handleOpenSpace}
        onDismiss={dismiss}
      />
      <MutualVerificationDialog
        open={!!mutualVerification}
        peerName={mutualVerification?.fromName}
        peerAvatar={mutualVerification?.fromAvatar}
        myName={currentUser?.displayName}
        myAvatar={currentUser?.avatarUrl}
        onDismiss={dismiss}
      />
    </>
  )
}

// --- Relay Status ---

function RelayStatusBadgeWrapper() {
  const { state, pendingCount } = useRelayStatus()
  return <RelayStatusBadge state={state} pendingCount={pendingCount} />
}

// --- Main Home ---

function MacherHome({ activeConnectorId, onConnectorChange }: { activeConnectorId: string; onConnectorChange: (id: string) => void; }) {
  const connector = useConnector()
  const navigate = useNavigate()
  const { spaceId: urlSpaceId, module: urlModule } = useParams<{ spaceId?: string; module?: string }>()
  const { data: groups } = useGroups()
  const createGroup = useCreateGroup()
  const updateGroup = useUpdateGroup()
  const deleteGroup = useDeleteGroup()
  const inviteMember = useInviteMember()
  const removeMember = useRemoveMember()
  const { data: currentUser } = useCurrentUser()
  const { activeContacts, pendingContacts, contacts: allContacts, removeContact, updateContactName, supportsContacts } = useContacts()
  const verification = useVerification()

  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [contactsDialogOpen, setContactsDialogOpen] = useState(false)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [groupDialogMode, setGroupDialogMode] = useState<GroupDialogMode>({ type: 'create' })
  const [isDark, setIsDark] = useState(false)
  const [spaceSettingsOpen, setSpaceSettingsOpen] = useState(false)
  const [spaceSettingsTab, setSpaceSettingsTab] = useState<SpaceSettingsTab>('general')
  const [spaceSettingsModuleId, setSpaceSettingsModuleId] = useState<string | null>(null)

  const OVERVIEW_WORKSPACE: Workspace = { id: '__overview__', name: 'Alle Werkstaetten', scope: 'overview' }
  const workspaces: Workspace[] = useMemo(
    () => [
      OVERVIEW_WORKSPACE,
      ...groups.map((g) => ({
        id: g.id,
        name: g.name,
        avatar: (g.data?.image as string | undefined) ?? (g.data?.avatar as string | undefined),
        scope: g.data?.scope as string | undefined,
      })),
    ],
    [groups]
  )

  const activeWorkspace: Workspace | null = useMemo(() => {
    if (urlSpaceId) {
      const found = workspaces.find((w) => w.id === urlSpaceId)
      if (found) return found
    }
    const savedId = localStorage.getItem(STORAGE_KEY_GROUP)
    if (savedId) {
      const found = workspaces.find((w) => w.id === savedId)
      if (found) return found
    }
    return workspaces[0] ?? null
  }, [urlSpaceId, workspaces])

  // Default-Module fuer Overview oder Spaces ohne eigene Konfig
  // Funktions-Module — diese erscheinen als Tabs in der Navbar.
  // Konfigurations-Module (theme, members, modulschmiede) leben jetzt im
  // Vollbild-Settings unter dem Zahnrad in der Navbar.
  const DEFAULT_MODULE_IDS = ['map', 'kanban', 'calendar', 'marketplace']
  // Meta-Module die IMMER sichtbar sind (auch wenn ein Space sie nicht in
  // group.data.modules hat). Das sind die Schaufenster-Module der Macher-Map:
  // Marketplace + Kalender zum Probieren, Modulschmiede zum Bauen.
  // Funktions-Module die immer als Tab sichtbar sein sollen, auch wenn ein
  // Space sie nicht in group.data.modules hat.
  const ALWAYS_VISIBLE_MODULES = ['marketplace', 'calendar']

  const isOverview = activeWorkspace?.scope === 'overview'
  const activeGroup = isOverview ? null : groups.find((g) => g.id === activeWorkspace?.id) ?? null

  // Theme aus group.data.theme aufs Document anwenden — bei Space-Wechsel
  // werden die CSS-Variablen automatisch aktualisiert.
  useSpaceTheme(activeGroup)

  const openSpaceSettings = useCallback((tab: SpaceSettingsTab = 'general', moduleId: string | null = null) => {
    setSpaceSettingsTab(tab)
    setSpaceSettingsModuleId(moduleId)
    setSpaceSettingsOpen(true)
  }, [])
  const groupModuleIds = useMemo(() => {
    if (isOverview) return DEFAULT_MODULE_IDS
    const groupMods = (activeGroup?.data?.modules as string[] | undefined) ?? DEFAULT_MODULE_IDS
    // ALWAYS_VISIBLE haengen wir an wenn nicht schon drin
    const merged = [...groupMods]
    for (const id of ALWAYS_VISIBLE_MODULES) {
      if (!merged.includes(id)) merged.push(id)
    }
    return merged
  }, [isOverview, activeGroup])

  // Modul-Definitionen: Code-Module (Registry) + Daten-Module (WoT-Templates).
  // useAvailableModules merged beide; gespeicherte Templates erscheinen
  // automatisch als Tabs sobald sie in der Modul-ID-Liste auftauchen.
  // Wir nehmen alle Daten-Templates UNION mit den expliziten group-modules
  // damit auch frisch gespeicherte Module ohne Group-Update sichtbar werden.
  const moduleDefs = useAvailableModules(groupModuleIds)

  // activeModule bestimmen: URL → localStorage → erstes verfuegbares Modul
  const activeModule = useMemo(() => {
    if (urlModule && moduleDefs.some((m) => m.id === urlModule)) return urlModule
    const saved = localStorage.getItem(STORAGE_KEY_MODULE)
    if (saved && moduleDefs.some((m) => m.id === saved)) return saved
    return moduleDefs[0]?.id ?? 'map'
  }, [urlModule, moduleDefs])

  useEffect(() => {
    if (workspaces.length === 0) return
    if (!urlSpaceId && activeWorkspace) {
      navigate(`/app/spaces/${activeWorkspace.id}/${activeModule}`, { replace: true })
    }
  }, [workspaces.length, urlSpaceId, activeWorkspace, activeModule, navigate])

  useEffect(() => {
    if (activeWorkspace && hasGroups(connector)) {
      connector.setCurrentGroup(activeWorkspace.scope === 'overview' ? null : activeWorkspace.id)
    }
  }, [activeWorkspace?.id, connector])

  useEffect(() => {
    if (activeWorkspace) localStorage.setItem(STORAGE_KEY_GROUP, activeWorkspace.id)
    if (urlModule && moduleDefs.some((m) => m.id === urlModule)) {
      localStorage.setItem(STORAGE_KEY_MODULE, urlModule)
    }
  }, [activeWorkspace?.id, urlModule, moduleDefs])

  const supportsMessaging = hasMessaging(connector)

  // Module-Tabs (Icons + Labels) direkt aus den Modul-Definitionen
  const modules: Module[] = useMemo(
    () => moduleDefs.map((m) => ({ id: m.id, label: m.label, icon: m.icon })),
    [moduleDefs]
  )

  // Aktive Modul-Definition fuer Render
  const activeModuleDef = useMemo(
    () => moduleDefs.find((m) => m.id === activeModule) ?? null,
    [moduleDefs, activeModule]
  )

  const handleWorkspaceChange = useCallback((workspace: Workspace) => {
    const group = groups.find((g) => g.id === workspace.id)
    const mods = (group?.data?.modules as string[] | undefined) ?? ['map', 'kanban', 'marketplace']
    const mod = mods.includes(activeModule) ? activeModule : (mods[0] ?? 'map')
    navigate(`/app/spaces/${workspace.id}/${mod}`)
  }, [groups, activeModule, navigate])

  const handleModuleChange = (moduleId: string) => {
    if (activeWorkspace) navigate(`/app/spaces/${activeWorkspace.id}/${moduleId}`)
  }

  const openCreateDialog = useCallback(() => {
    setGroupDialogMode({ type: 'create' })
    setGroupDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((workspace: Workspace) => {
    if (workspace.scope === 'overview') return
    // Edit-Aktion am Workspace-Switcher → Vollbild-Space-Settings
    setSpaceSettingsTab('general')
    setSpaceSettingsModuleId(null)
    setSpaceSettingsOpen(true)
  }, [])

  // Master-Profil (name, bio, avatar) aus Antons WoT-Connector
  const [masterProfile, setMasterProfile] = useState<Record<string, unknown>>({})
  useEffect(() => {
    if (!hasProfile(connector)) return
    connector.getMyProfile().then((item) => {
      if (item?.data) setMasterProfile(item.data as Record<string, unknown>)
    }).catch(() => {})
  }, [connector])

  // Extension-Profil (skills, offers, needs, address, phone, ...) aus eigenem Item
  const { data: extensionData, update: updateExtension } = useProfileExtension()

  // Header-Avatar/Name: Extension ist Source-of-Truth (Antons doc.profile.* persistiert nicht),
  // Master als Fallback, currentUser als Last-Resort.
  const userData: UserData = useMemo(
    () => ({
      id: currentUser?.id ?? '',
      name: (extensionData.name as string) || (masterProfile.name as string) || currentUser?.displayName || 'Macher',
      email: '',
      avatar: (extensionData.avatar as string) || (masterProfile.avatar as string) || currentUser?.avatarUrl,
    }),
    [currentUser, masterProfile, extensionData]
  )

  // Profil-Konfig: aus aktivem Space lesen, sonst Macher-Default
  const profileConfig = useMemo(() => {
    return getProfileConfig(activeGroup?.data, macherProfileConfig)
  }, [activeGroup])

  // Profil-Daten fuer Dialog: Extension hat Vorrang vor Master (Persistenz-Bug)
  const profileData = useMemo(() => ({
    did: currentUser?.id ?? '',
    ...masterProfile,
    ...extensionData,
    name: (extensionData.name as string) || (masterProfile.name as string) || currentUser?.displayName || '',
    avatar: (extensionData.avatar as string) || (masterProfile.avatar as string) || currentUser?.avatarUrl,
  }), [currentUser, masterProfile, extensionData])

  const handleSaveProfile = useCallback(async (updates: Record<string, unknown>) => {
    const { master, extension } = splitProfileUpdates(updates)

    // Master-Felder ueber Antons WoT-Connector
    if (Object.keys(master).length > 0 && hasProfile(connector)) {
      await connector.updateMyProfile(master)
      setMasterProfile((prev) => ({ ...prev, ...master }))
    }

    // Extension-Felder als eigenes Item
    if (Object.keys(extension).length > 0) {
      await updateExtension(extension)
    }
  }, [connector, updateExtension])

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <AppShell>
      <Navbar>
        <NavbarStart>
          {activeWorkspace ? (
            <MacherWorkspaceSwitcher
              workspaces={workspaces}
              groups={groups}
              activeWorkspace={activeWorkspace}
              onWorkspaceChange={handleWorkspaceChange}
              onCreateWorkspace={openCreateDialog}
              onEditWorkspace={openEditDialog}
            />
          ) : (
            <Button variant="outline" size="sm" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Gruppe
            </Button>
          )}
        </NavbarStart>
        <NavbarCenter>
          <ModuleTabs
            modules={modules}
            activeModule={activeModule}
            onModuleChange={handleModuleChange}
          />
        </NavbarCenter>
        <NavbarEnd>
          {supportsMessaging && <RelayStatusBadgeWrapper />}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <UserMenu
            user={userData}
            onProfile={() => setProfileDialogOpen(true)}
            onContacts={supportsContacts ? () => setContactsDialogOpen(true) : undefined}
            contactCount={activeContacts.length}
            onVerify={() => setVerifyDialogOpen(true)}
            onLogout={activeConnectorId === 'wot' && isAuthenticatable(connector) ? async () => {
              await connector.logout()
              window.location.reload()
            } : undefined}
          />
        </NavbarEnd>
      </Navbar>

      <AppShellMain withBottomNav={!activeModuleDef?.fullWidth}>
        {activeGroup && (
          <SpaceHierarchyBar
            group={activeGroup}
            allGroups={groups}
            onNavigate={(id) => {
              const target = workspaces.find((w) => w.id === id)
              if (target) handleWorkspaceChange(target)
            }}
          />
        )}
        {activeModuleDef ? (() => {
          const View = activeModuleDef.View
          const moduleConfig = getModuleConfig(activeGroup, activeModuleDef.id, activeModuleDef.defaultConfig)
          const viewProps = {
            spaceId: activeWorkspace?.id ?? null,
            activeGroup,
            allGroups: groups,
            config: moduleConfig,
            onOpenSettings: (tab?: string, moduleId?: string) => {
              openSpaceSettings(
                (tab as SpaceSettingsTab) ?? 'general',
                moduleId ?? null,
              )
            },
          }
          return activeModuleDef.fullWidth ? (
            <View {...viewProps} />
          ) : (
            <div className="container mx-auto px-4 pt-6 max-w-5xl">
              <View {...viewProps} />
            </div>
          )
        })() : (
          <div className="container mx-auto px-4 pt-12 max-w-md text-center">
            <p className="text-lg font-medium text-foreground">Modul nicht gefunden</p>
            <p className="text-sm text-muted-foreground mt-2">Das Modul "{activeModule}" ist nicht registriert.</p>
          </div>
        )}
      </AppShellMain>

      <BottomNav
        items={modules.map((m) => ({ id: m.id, label: m.label, icon: m.icon }))}
        activeItem={activeModule}
        onItemChange={handleModuleChange}
      />

      {/* Dialogs */}
      <GroupDialog
        key={groupDialogMode.type === 'edit' ? `edit-${groupDialogMode.group.id}` : 'create'}
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        mode={groupDialogMode}
        currentUserId={currentUser?.id}
        contacts={allContacts}
        onCreateGroup={async (name) => {
          const group = await createGroup(name)
          handleWorkspaceChange({ id: group.id, name: group.name })
        }}
        onUpdateGroup={async (id, updates) => { await updateGroup(id, updates) }}
        onDeleteGroup={async (id) => {
          await deleteGroup(id)
          if (activeWorkspace?.id === id) {
            const remaining = workspaces.filter((w) => w.id !== id)
            if (remaining.length > 0) handleWorkspaceChange(remaining[0])
            else { localStorage.removeItem(STORAGE_KEY_GROUP); navigate('/app') }
          }
        }}
        onInviteMember={async (groupId, userId) => { await inviteMember(groupId, userId) }}
        onRemoveMember={async (groupId, userId) => { await removeMember(groupId, userId) }}
      />

      <MacherProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        config={profileConfig}
        profile={profileData}
        contactCount={activeContacts.length}
        onSave={handleSaveProfile}
      />

      <ContactsDialog
        open={contactsDialogOpen}
        onOpenChange={setContactsDialogOpen}
        activeContacts={activeContacts}
        pendingContacts={pendingContacts}
        onRemove={removeContact}
        onEditName={updateContactName}
        onVerify={() => { setContactsDialogOpen(false); setVerifyDialogOpen(true) }}
      />

      <VerificationDialog
        open={verifyDialogOpen}
        onOpenChange={setVerifyDialogOpen}
        challenge={verification.challenge}
        peerInfo={verification.peerInfo}
        isProcessing={verification.isProcessing}
        error={verification.error}
        onCreateChallenge={verification.createChallenge}
        onScanChallenge={verification.scanChallenge}
        onConfirmVerification={verification.confirmVerification}
        onReset={verification.reset}
      />

      <IncomingEventDialogs onCloseVerifyDialog={() => setVerifyDialogOpen(false)} />

      <SpaceSettings
        open={spaceSettingsOpen}
        onClose={() => setSpaceSettingsOpen(false)}
        spaceId={activeGroup?.id ?? null}
        activeGroup={activeGroup}
        initialTab={spaceSettingsTab}
        initialModuleId={spaceSettingsModuleId}
      />

      {new URLSearchParams(window.location.search).has('dev') && (
        <div className="fixed bottom-20 left-4 z-50">
          <ConnectorSwitcher
            connectors={CONNECTOR_OPTIONS}
            activeConnector={activeConnectorId}
            onConnectorChange={onConnectorChange}
          />
        </div>
      )}
    </AppShell>
  )
}

// --- Auth Gate ---

const LazyDIDAuthScreen = lazy(() =>
  import('@real-life-stack/wot-connector/components').then((m) => ({
    default: m.DIDAuthScreen,
  }))
)

function AuthGate({ connector, children }: { connector: DataInterface; children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(() => {
    if (!isAuthenticatable(connector)) return true
    return connector.getAuthState().current.status === 'authenticated'
  })

  if (authenticated) return <>{children}</>

  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><div className="animate-pulse text-muted-foreground">Lade Auth...</div></div>}>
      <LazyDIDAuthScreen
        connector={connector as unknown as import('@real-life-stack/wot-connector').WotConnector}
        onAuthenticated={() => setAuthenticated(true)}
      />
    </Suspense>
  )
}

// --- Connector Factory ---

const macherMapDemoData = {
  items: [] as any[],
  groups: [
    { id: 'macher-map', name: 'Macher-Map', createdBy: 'macher-1', createdAt: '2026-04-28T00:00:00.000Z', data: { scope: 'group', description: 'Werkstaetten, Abenteuer und Macher in deiner Naehe', modules: ['map', 'kanban'], access: 'open', roles: ['admin', 'member'], memberCount: 1 } },
  ],
  users: [
    { id: 'macher-1', displayName: 'Macher', avatarUrl: undefined },
  ],
  groupMembers: {
    'macher-map': ['macher-1'],
  } as Record<string, string[]>,
  groupItems: {} as Record<string, string[]>,
}

const MACHER_DATA_VERSION = 2

async function resetLocalData() {
  const dbs = await indexedDB.databases()
  for (const db of dbs) {
    if (db.name) indexedDB.deleteDatabase(db.name)
  }
  localStorage.clear()
  localStorage.setItem('macher-data-version', String(MACHER_DATA_VERSION))
  window.location.reload()
}

function ensureCleanData() {
  const stored = localStorage.getItem('macher-data-version')
  if (stored !== String(MACHER_DATA_VERSION)) {
    resetLocalData()
    return true
  }
  return false
}

async function createConnector(type: string): Promise<DataInterface> {
  if (type === 'wot') {
    console.log('[Macher] Lade WoT-Connector...')
    const { WotConnector } = await import('@real-life-stack/wot-connector')
    console.log('[Macher] WoT-Connector geladen, initialisiere...')
    const connector = new WotConnector({
      relayUrl: import.meta.env.VITE_RELAY_URL ?? 'wss://relay.utopia-lab.org',
      profilesUrl: import.meta.env.VITE_PROFILE_SERVICE_URL ?? 'https://profiles.utopia-lab.org',
      vaultUrl: import.meta.env.VITE_VAULT_URL ?? 'https://vault.utopia-lab.org',
    })
    await connector.init()
    console.log('[Macher] WoT-Connector bereit, Auth-Status:', connector.getAuthState().current.status)
    return connector
  }
  if (type === 'mock') {
    const c = new MockConnector()
    await c.init()
    return c
  }
  const c = new LocalConnector(macherMapDemoData)
  await c.init()
  return c
}

function getInitialConnectorId(): string {
  const params = new URLSearchParams(window.location.search)
  if (params.has('reset')) {
    resetLocalData()
    return 'local'
  }
  return params.get('connector') ?? localStorage.getItem(STORAGE_KEY_CONNECTOR) ?? 'local'
}

// --- App Root ---

export default function MacherApp() {
  const [resetting] = useState(() => ensureCleanData())
  const [connectorId, setConnectorId] = useState(getInitialConnectorId)
  const [connector, setConnector] = useState<DataInterface | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (resetting) return
    localStorage.setItem(STORAGE_KEY_CONNECTOR, connectorId)
    setLoading(true)
    setConnector(null)
    setError(null)
    let cancelled = false
    let instance: DataInterface | null = null
    createConnector(connectorId).then((c) => {
      if (cancelled) return
      instance = c
      setConnector(c)
      setLoading(false)
    }).catch((err) => {
      console.error('[MacherApp] Connector-Fehler:', err)
      if (!cancelled) {
        setError(err?.message ?? String(err))
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
      if (instance) instance.dispose()
    }
  }, [connectorId, resetting])

  if (resetting) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Daten werden aktualisiert...</div>
      </div>
    )
  }

  if (error) {
    const connectorName = CONNECTOR_OPTIONS.find((o) => o.id === connectorId)?.name ?? connectorId
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="max-w-md space-y-4 text-center">
          <p className="text-lg font-semibold text-destructive">Connector "{connectorName}" konnte nicht geladen werden</p>
          <pre className="text-sm text-muted-foreground bg-muted p-3 rounded-lg overflow-auto max-h-40 text-left">{error}</pre>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => setConnectorId('local')}>Zurueck zu Lokal</Button>
            <Button onClick={() => { setError(null); setLoading(true); setConnector(null); createConnector(connectorId).then(c => { setConnector(c); setLoading(false) }).catch(e => { setError(e?.message ?? String(e)); setLoading(false) }) }}>
              Nochmal versuchen
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading || !connector) {
    const connectorName = CONNECTOR_OPTIONS.find((o) => o.id === connectorId)?.name ?? connectorId
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Lade {connectorName}...
        </div>
      </div>
    )
  }

  return (
    <ConnectorProvider connector={connector} key={connectorId}>
      <IncomingEventsProvider>
        <AuthGate connector={connector}>
          <Routes>
            <Route path="spaces/:spaceId/:module" element={<MacherHome activeConnectorId={connectorId} onConnectorChange={setConnectorId} />} />
            <Route path="spaces/:spaceId" element={<MacherHome activeConnectorId={connectorId} onConnectorChange={setConnectorId} />} />
            <Route path="*" element={<MacherHome activeConnectorId={connectorId} onConnectorChange={setConnectorId} />} />
          </Routes>
        </AuthGate>
      </IncomingEventsProvider>
    </ConnectorProvider>
  )
}
