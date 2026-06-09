<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

interface AppUser {
  id: string
  email: string
  last_sign_in_at: string | null
  is_admin: boolean
  predictions_filled: number
  total_matches: number
  awards_filled: number
}

const supabase = useSupabaseClient()
const currentUser = useSupabaseUser()
const toast = useToast()

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {}
}

// Users list
const users = ref<AppUser[]>([])
const pending = ref(false)
const fetchError = ref<string | null>(null)

async function loadUsers() {
  pending.value = true
  fetchError.value = null
  try {
    const headers = await getAuthHeaders()
    users.value = await $fetch<AppUser[]>('/api/users', { headers })
  } catch (e: unknown) {
    fetchError.value = e instanceof Error ? e.message : 'Error al cargar los usuarios'
  } finally {
    pending.value = false
  }
}

await loadUsers()


// Role toggle
const roleLoading = ref<string | null>(null)

async function toggleRole(user: AppUser) {
  roleLoading.value = user.id
  try {
    const headers = await getAuthHeaders()
    await $fetch(`/api/users/${user.id}/role`, {
      method: 'PATCH',
      headers,
      body: { is_admin: !user.is_admin },
    })
    toast.add({
      title: 'Rol actualizado',
      description: `${user.email} ahora es ${!user.is_admin ? 'administrador' : 'jugador'}`,
      color: 'success',
    })
    await loadUsers()
  } catch {
    toast.add({ title: 'Error al cambiar el rol', color: 'error' })
  } finally {
    roleLoading.value = null
  }
}

// Delete
const deleteTarget = ref<AppUser | null>(null)
const deleteLoading = ref(false)

async function deleteUser() {
  if (!deleteTarget.value) return

  deleteLoading.value = true
  try {
    const headers = await getAuthHeaders()
    await $fetch(`/api/users/${deleteTarget.value.id}`, {
      method: 'DELETE',
      headers,
    })
    toast.add({
      title: 'Usuario eliminado',
      description: `${deleteTarget.value.email} ha sido eliminado`,
      color: 'success',
    })
    deleteTarget.value = null
    await loadUsers()
  } catch {
    toast.add({ title: 'Error al eliminar el usuario', color: 'error' })
  } finally {
    deleteLoading.value = false
  }
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

const columns = [
  { accessorKey: 'email', header: 'Correo electrónico' },
  { accessorKey: 'is_admin', header: 'Rol' },
  { accessorKey: 'predictions_filled', header: 'Partidos' },
  { accessorKey: 'last_sign_in_at', header: 'Última conexión' },
  { id: 'actions', header: '' },
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">
          Usuarios
        </h1>
        <p class="text-sm text-muted mt-1">
          Gestiona los participantes de la porra
        </p>
      </div>
      <UTooltip text="Crea usuarios desde el panel de Supabase">
        <UButton
          icon="i-lucide-external-link"
          color="neutral"
          variant="outline"
          :to="`https://supabase.com/dashboard/project/_/auth/users`"
          target="_blank"
        >
          Añadir usuario
        </UButton>
      </UTooltip>
    </div>

    <UAlert
      v-if="fetchError"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Error al cargar los usuarios"
      :description="fetchError"
    />

    <UCard v-else>
      <UTable
        :data="users"
        :columns="columns"
        :loading="pending"
      >
        <template #email-cell="{ row }">
          <div class="flex items-center gap-2">
            <UAvatar :alt="row.original.email" size="xs" />
            <span class="text-sm font-medium text-foreground">{{ row.original.email }}</span>
          </div>
        </template>

        <template #is_admin-cell="{ row }">
          <UBadge
            :color="row.original.is_admin ? 'primary' : 'neutral'"
            variant="subtle"
            size="sm"
          >
            {{ row.original.is_admin ? 'Admin' : 'Jugador' }}
          </UBadge>
        </template>

        <template #predictions_filled-cell="{ row }">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-foreground tabular-nums">
                {{ row.original.predictions_filled }}/{{ row.original.total_matches }}
              </span>
              <div class="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  class="h-full rounded-full bg-primary transition-all"
                  :style="{ width: `${row.original.total_matches ? Math.round(row.original.predictions_filled / row.original.total_matches * 100) : 0}%` }"
                />
              </div>
            </div>
            <span
              class="text-xs tabular-nums"
              :class="row.original.awards_filled === 4 ? 'text-primary font-medium' : 'text-muted'"
            >
              {{ row.original.awards_filled }}/4
            </span>
          </div>
        </template>

        <template #last_sign_in_at-cell="{ row }">
          <span class="text-sm text-muted">{{ row.original.last_sign_in_at ? formatDate(row.original.last_sign_in_at) : '—' }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end gap-2">
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              :loading="roleLoading === row.original.id"
              :icon="row.original.is_admin ? 'i-lucide-shield-off' : 'i-lucide-shield-check'"
              :disabled="row.original.id === currentUser?.id"
              @click="toggleRole(row.original)"
            >
              {{ row.original.is_admin ? 'Quitar admin' : 'Hacer admin' }}
            </UButton>
            <UButton
              variant="ghost"
              color="error"
              size="xs"
              icon="i-lucide-trash-2"
              @click="deleteTarget = row.original"
            >
              Eliminar
            </UButton>
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Delete Confirmation Modal -->
    <UModal
      :open="!!deleteTarget"
      title="Eliminar usuario"
      @update:open="(v) => { if (!v) deleteTarget = null }"
    >
      <template #body>
        <p class="text-sm text-muted">
          Esta acción eliminará permanentemente la cuenta de
          <span class="font-medium text-foreground">{{ deleteTarget?.email }}</span>.
          Esta acción no se puede deshacer.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            variant="ghost"
            color="neutral"
            :disabled="deleteLoading"
            @click="deleteTarget = null"
          >
            Cancelar
          </UButton>
          <UButton
            color="error"
            :loading="deleteLoading"
            @click="deleteUser"
          >
            Eliminar
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
