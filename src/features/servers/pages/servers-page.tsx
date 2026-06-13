import { useState } from 'react'
import { PlusIcon, ServerOffIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/shared/components/ui/dialog'
import { useServerStore } from '../store/server-store'
import { ServerFormDialog } from '../components/server-form-dialog'
import { ServerCard } from '../components/server-card'
import type { ServerConfig } from '../types/server'

export function ServersPage() {
  const servers = useServerStore((s) => s.servers)
  const activeServerId = useServerStore((s) => s.activeServerId)
  const removeServer = useServerStore((s) => s.removeServer)

  const [formOpen, setFormOpen] = useState(false)
  const [editingServer, setEditingServer] = useState<ServerConfig | undefined>(undefined)
  const [deletingServer, setDeletingServer] = useState<ServerConfig | undefined>(undefined)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">WireMock Servers</h1>
          <p className="text-sm text-muted-foreground">
            Manage connections to your WireMock instances across environments.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingServer(undefined)
            setFormOpen(true)
          }}
        >
          <PlusIcon className="size-4" />
          Add server
        </Button>
      </div>

      {servers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-16 text-center">
          <ServerOffIcon className="size-10 text-muted-foreground" />
          <div>
            <p className="font-medium">No servers configured</p>
            <p className="text-sm text-muted-foreground">
              Add a WireMock server to start managing mappings, files, and requests.
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <PlusIcon className="size-4" />
            Add your first server
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              isActive={server.id === activeServerId}
              onEdit={() => {
                setEditingServer(server)
                setFormOpen(true)
              }}
              onDelete={() => setDeletingServer(server)}
            />
          ))}
        </div>
      )}

      <ServerFormDialog open={formOpen} onOpenChange={setFormOpen} server={editingServer} />

      <Dialog
        open={!!deletingServer}
        onOpenChange={(open) => !open && setDeletingServer(undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete server</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{deletingServer?.name}"? This only removes the
              connection from MockOps; it does not affect the WireMock instance itself.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingServer) {
                  removeServer(deletingServer.id)
                  toast.success(`Removed server "${deletingServer.name}"`)
                }
                setDeletingServer(undefined)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
