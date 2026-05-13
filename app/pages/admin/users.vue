<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

interface AppUser {
  id: string
  email: string
  created_at: string
  is_admin: boolean
}

const supabase = useSupabaseClient()
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

// Invite modal
const inviteOpen = ref(false)
const inviteEmail = ref('')
const inviteLoading = ref(false)

async function inviteUser() {
  if (!inviteEmail.value.trim()) return

  inviteLoading.value = true
  try {
    const headers = await getAuthHeaders()
    await $fetch('/api/users/invite', {
      method: 'POST',
      headers,
      body: { email: inviteEmail.value.trim() },
    })
    toast.add({
      title: 'Invitación enviada',
      description: `Se ha enviado un enlace de acceso a ${inviteEmail.value}`,
      color: 'success',
    })
    inviteEmail.value = ''
    inviteOpen.value = false
    await loadUsers()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    toast.add({
      title: 'Error al invitar',
      description: msg,
      color: 'error',
    })
  } finally {
    inviteLoading.value = false
  }
}

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
  { key: 'email', label: 'Correo electrónico' },
  { key: 'is_admin', label: 'Rol' },
  { key: 'created_at', label: 'Registro' },
  { key: 'actions', label: '' },
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
      <UButton
        icon="i-lucide-user-plus"
        @click="inviteOpen = true"
      >
        Invitar usuario
      </UButton>
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
            <UAvatar :alt="row.email" size="xs" />
            <span class="text-sm font-medium text-foreground">{{ row.email }}</span>
          </div>
        </template>

        <template #is_admin-cell="{ row }">
          <UBadge
            :color="row.is_admin ? 'primary' : 'neutral'"
            variant="subtle"
            size="sm"
          >
            {{ row.is_admin ? 'Admin' : 'Jugador' }}
          </UBadge>
        </template>

        <template #created_at-cell="{ row }">
          <span class="text-sm text-muted">{{ formatDate(row.created_at) }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end gap-2">
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              :loading="roleLoading === row.id"
              :icon="row.is_admin ? 'i-lucide-shield-off' : 'i-lucide-shield-check'"
              @click="toggleRole(row)"
            >
              {{ row.is_admin ? 'Quitar admin' : 'Hacer admin' }}
            </UButton>
            <UButton
              variant="ghost"
              color="error"
              size="xs"
              icon="i-lucide-trash-2"
              @click="deleteTarget = row"
            >
              Eliminar
            </UButton>
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Invite Modal -->
    <UModal v-model:open="inviteOpen" title="Invitar usuario">
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-muted">
            Se enviará un enlace de acceso al correo indicado.
          </p>
          <UFormField label="Correo electrónico">
            <UInput
              v-model="inviteEmail"
              type="email"
              placeholder="compañero@empresa.com"
              class="w-full"
              :disabled="inviteLoading"
              @keyup.enter="inviteUser"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            variant="ghost"
            color="neutral"
            :disabled="inviteLoading"
            @click="inviteOpen = false"
          >
            Cancelar
          </UButton>
          <UButton
            :loading="inviteLoading"
            :disabled="!inviteEmail.trim()"
            @click="inviteUser"
          >
            Enviar invitación
          </UButton>
        </div>
      </template>
    </UModal>

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
