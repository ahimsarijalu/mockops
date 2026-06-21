import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Switch } from '@/shared/components/ui/switch'
import { NoActiveServerState } from '@/shared/components/feedback/no-active-server-state'
import { useActiveServer } from '@/features/servers/store/server-store'
import { useUiStore, type Theme } from '@/shared/stores/ui-store'
import {
  useGlobalSettings,
  usePersistMappings,
  useResetMappingsToDefault,
  useResetServerState,
  useUpdateGlobalSettings,
} from '../api/use-settings'

type DelayDistributionType = 'uniform' | 'lognormal'

export function SettingsPage() {
  const server = useActiveServer()
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)

  const { data, isLoading, error } = useGlobalSettings(server)
  const updateSettings = useUpdateGlobalSettings(server)
  const persistMappings = usePersistMappings(server)
  const resetToDefault = useResetMappingsToDefault(server)
  const resetServerState = useResetServerState(server)

  const [fixedDelay, setFixedDelay] = useState('')
  const [proxyPassThrough, setProxyPassThrough] = useState(true)
  const [delayType, setDelayType] = useState<'none' | DelayDistributionType>('none')
  const [delayLower, setDelayLower] = useState('')
  const [delayUpper, setDelayUpper] = useState('')
  const [delayMedian, setDelayMedian] = useState('')
  const [delaySigma, setDelaySigma] = useState('')
  const [loadedServerId, setLoadedServerId] = useState<string | undefined>(undefined)
  const [confirmResetState, setConfirmResetState] = useState(false)
  const [confirmResetMappings, setConfirmResetMappings] = useState(false)

  if (data !== undefined && server?.id !== loadedServerId) {
    setFixedDelay(data.fixedDelay != null ? String(data.fixedDelay) : '')
    setProxyPassThrough(data.proxyPassThrough ?? true)
    setDelayType((data.delayDistribution?.type as DelayDistributionType | undefined) ?? 'none')
    setDelayLower(data.delayDistribution?.lower != null ? String(data.delayDistribution.lower) : '')
    setDelayUpper(data.delayDistribution?.upper != null ? String(data.delayDistribution.upper) : '')
    setDelayMedian(
      data.delayDistribution?.median != null ? String(data.delayDistribution.median) : '',
    )
    setDelaySigma(data.delayDistribution?.sigma != null ? String(data.delayDistribution.sigma) : '')
    setLoadedServerId(server?.id)
  }

  if (!server) {
    return (
      <NoActiveServerState description="Add and select a WireMock server to manage settings." />
    )
  }

  const handleSave = () => {
    updateSettings.mutate({
      fixedDelay: fixedDelay.trim() ? Number(fixedDelay) : null,
      proxyPassThrough,
      delayDistribution:
        delayType === 'none'
          ? undefined
          : delayType === 'uniform'
            ? {
                type: 'uniform',
                lower: delayLower.trim() ? Number(delayLower) : undefined,
                upper: delayUpper.trim() ? Number(delayUpper) : undefined,
              }
            : {
                type: 'lognormal',
                median: delayMedian.trim() ? Number(delayMedian) : undefined,
                sigma: delaySigma.trim() ? Number(delaySigma) : undefined,
              },
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Global response behavior for {server.name} and console preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Console preferences</CardTitle>
          <CardDescription>Stored locally in your browser.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={(value) => value && setTheme(value as Theme)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Global response settings</CardTitle>
          <CardDescription>
            Applied to all stubs on {server.name} via the WireMock settings API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : error ? (
            <div className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">
              {error instanceof Error ? error.message : 'Failed to load global settings'}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="fixedDelay">Fixed delay (ms)</Label>
                  <Input
                    id="fixedDelay"
                    type="number"
                    min={0}
                    value={fixedDelay}
                    onChange={(e) => setFixedDelay(e.target.value)}
                    placeholder="e.g. 0"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    id="proxyPassThrough"
                    checked={proxyPassThrough}
                    onCheckedChange={setProxyPassThrough}
                  />
                  <Label htmlFor="proxyPassThrough">
                    Proxy pass-through for unmatched requests
                  </Label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Delay distribution</Label>
                <Select
                  value={delayType}
                  onValueChange={(value) =>
                    value && setDelayType(value as 'none' | DelayDistributionType)
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="uniform">Uniform</SelectItem>
                    <SelectItem value="lognormal">Log-normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {delayType === 'uniform' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="delayLower">Lower bound (ms)</Label>
                    <Input
                      id="delayLower"
                      type="number"
                      min={0}
                      value={delayLower}
                      onChange={(e) => setDelayLower(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="delayUpper">Upper bound (ms)</Label>
                    <Input
                      id="delayUpper"
                      type="number"
                      min={0}
                      value={delayUpper}
                      onChange={(e) => setDelayUpper(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {delayType === 'lognormal' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="delayMedian">Median (ms)</Label>
                    <Input
                      id="delayMedian"
                      type="number"
                      min={0}
                      value={delayMedian}
                      onChange={(e) => setDelayMedian(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="delaySigma">Sigma</Label>
                    <Input
                      id="delaySigma"
                      type="number"
                      step="0.1"
                      min={0}
                      value={delaySigma}
                      onChange={(e) => setDelaySigma(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <Button onClick={handleSave} disabled={updateSettings.isPending}>
                Save settings
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Server actions</CardTitle>
          <CardDescription>
            Persist or reset stubs and journal state on {server.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => persistMappings.mutate()}
            disabled={persistMappings.isPending}
          >
            Save mappings to disk
          </Button>
          <Button variant="outline" onClick={() => setConfirmResetMappings(true)}>
            Reset mappings to default
          </Button>
          <Button variant="destructive" onClick={() => setConfirmResetState(true)}>
            Reset server state
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmResetMappings} onOpenChange={setConfirmResetMappings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset mappings to default</DialogTitle>
            <DialogDescription>
              This discards any in-memory mapping changes and reloads stubs from the mappings
              directory on disk. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                resetToDefault.mutate()
                setConfirmResetMappings(false)
              }}
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmResetState} onOpenChange={setConfirmResetState}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset server state</DialogTitle>
            <DialogDescription>
              This resets stub mappings, scenarios, and the request journal to their original state.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                resetServerState.mutate()
                setConfirmResetState(false)
              }}
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
