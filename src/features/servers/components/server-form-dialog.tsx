import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useServerStore } from '../store/server-store'
import { serverFormSchema, type ServerFormValues } from '../schemas/server-schema'
import { SERVER_ENVIRONMENTS, type ServerConfig } from '../types/server'

interface ServerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  server?: ServerConfig
}

const defaultValues: ServerFormValues = {
  name: '',
  baseUrl: 'http://localhost:8080',
  environment: 'local',
  authType: 'none',
  username: '',
  password: '',
  token: '',
}

export function ServerFormDialog({ open, onOpenChange, server }: ServerFormDialogProps) {
  const addServer = useServerStore((s) => s.addServer)
  const updateServer = useServerStore((s) => s.updateServer)

  const form = useForm({
    defaultValues: server ? { ...defaultValues, ...server } : defaultValues,
    validators: { onChange: serverFormSchema },
    onSubmit: ({ value }) => {
      if (server) {
        updateServer(server.id, value)
        toast.success(`Updated server "${value.name}"`)
      } else {
        addServer({
          ...value,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          lastConnectionStatus: 'unknown',
        })
        toast.success(`Added server "${value.name}"`)
      }
      onOpenChange(false)
      form.reset()
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset()
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{server ? 'Edit server' : 'Add server'}</DialogTitle>
          <DialogDescription>
            Configure a WireMock instance to manage from MockOps.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field name="name">
            {(field) => {
              const hasError = field.state.meta.errors.length > 0
              return (
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g. QA Mock Server"
                    aria-invalid={hasError || undefined}
                    aria-describedby={hasError ? 'name-error' : undefined}
                  />
                  {hasError && (
                    <p id="name-error" className="text-xs text-destructive">
                      {field.state.meta.errors.map((e) => e?.message).join(', ')}
                    </p>
                  )}
                </div>
              )
            }}
          </form.Field>

          <form.Field name="baseUrl">
            {(field) => {
              const hasError = field.state.meta.errors.length > 0
              return (
                <div className="grid gap-1.5">
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input
                    id="baseUrl"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="http://localhost:8080"
                    aria-invalid={hasError || undefined}
                    aria-describedby={hasError ? 'baseUrl-error' : undefined}
                  />
                  {hasError && (
                    <p id="baseUrl-error" className="text-xs text-destructive">
                      {field.state.meta.errors.map((e) => e?.message).join(', ')}
                    </p>
                  )}
                </div>
              )
            }}
          </form.Field>

          <form.Field name="environment">
            {(field) => (
              <div className="grid gap-1.5">
                <Label htmlFor="environment">Environment</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as ServerFormValues['environment'])
                  }
                >
                  <SelectTrigger id="environment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVER_ENVIRONMENTS.map((env) => (
                      <SelectItem key={env.value} value={env.value}>
                        {env.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Field name="authType">
            {(field) => (
              <div className="grid gap-1.5">
                <Label htmlFor="authType">Authentication</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as ServerFormValues['authType'])
                  }
                >
                  <SelectTrigger id="authType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="basic">Basic Authentication</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.authType}>
            {(authType) =>
              authType === 'basic' ? (
                <div className="grid grid-cols-2 gap-4">
                  <form.Field name="username">
                    {(field) => {
                      const hasError = field.state.meta.errors.length > 0
                      return (
                        <div className="grid gap-1.5">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={hasError || undefined}
                            aria-describedby={hasError ? 'username-error' : undefined}
                          />
                          {hasError && (
                            <p id="username-error" className="text-xs text-destructive">
                              {field.state.meta.errors.map((e) => e?.message).join(', ')}
                            </p>
                          )}
                        </div>
                      )
                    }}
                  </form.Field>
                  <form.Field name="password">
                    {(field) => {
                      const hasError = field.state.meta.errors.length > 0
                      return (
                        <div className="grid gap-1.5">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={hasError || undefined}
                            aria-describedby={hasError ? 'password-error' : undefined}
                          />
                          {hasError && (
                            <p id="password-error" className="text-xs text-destructive">
                              {field.state.meta.errors.map((e) => e?.message).join(', ')}
                            </p>
                          )}
                        </div>
                      )
                    }}
                  </form.Field>
                </div>
              ) : authType === 'bearer' ? (
                <form.Field name="token">
                  {(field) => {
                    const hasError = field.state.meta.errors.length > 0
                    return (
                      <div className="grid gap-1.5">
                        <Label htmlFor="token">Bearer token</Label>
                        <Input
                          id="token"
                          type="password"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={hasError || undefined}
                          aria-describedby={hasError ? 'token-error' : undefined}
                        />
                        {hasError && (
                          <p id="token-error" className="text-xs text-destructive">
                            {field.state.meta.errors.map((e) => e?.message).join(', ')}
                          </p>
                        )}
                      </div>
                    )
                  }}
                </form.Field>
              ) : null
            }
          </form.Subscribe>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {server ? 'Save changes' : 'Add server'}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
