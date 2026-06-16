<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

const gravatarUrl = ref('')

async function computeGravatarUrl() {
  const email = (user.value?.email ?? '').trim().toLowerCase()
  if (!email) return
  const msgBuffer = new TextEncoder().encode(email)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
  gravatarUrl.value = `https://gravatar.com/avatar/${hashHex}?d=mp`
}

computeGravatarUrl()

const name = ref(user.value?.user_metadata?.name ?? '')
const savingName = ref(false)
const canSaveName = computed(() => name.value.trim().length > 0 && name.value.trim() !== (user.value?.user_metadata?.name ?? ''))

async function saveName() {
  if (!canSaveName.value) return
  savingName.value = true
  try {
    const { error } = await supabase.auth.updateUser({ data: { name: name.value.trim() } })
    if (error) throw error
    toast.add({ title: 'Nombre actualizado', color: 'success' })
  } catch (e: unknown) {
    toast.add({ title: 'Error al actualizar', description: e instanceof Error ? e.message : 'Error desconocido', color: 'error' })
  } finally {
    savingName.value = false
  }
}

const password = ref('')
const confirm = ref('')
const saving = ref(false)

const mismatch = computed(() => confirm.value.length > 0 && password.value !== confirm.value)
const canSave = computed(() => password.value.length >= 6 && password.value === confirm.value)

async function save() {
  if (!canSave.value) return
  saving.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: password.value })
    if (error) throw error
    toast.add({ title: 'Contraseña actualizada', color: 'success' })
    password.value = ''
    confirm.value = ''
  } catch (e: unknown) {
    toast.add({ title: 'Error al actualizar', description: e instanceof Error ? e.message : 'Error desconocido', color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-sm space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Ajustes</h1>
      <p class="text-sm text-muted mt-1">Gestiona tu cuenta.</p>
    </div>

    <UCard>
      <template #header>
        <h2 class="font-semibold text-foreground">Nombre</h2>
      </template>
      <div class="space-y-4">
        <UFormField label="Tu nombre">
          <UInput v-model="name" type="text" placeholder="Cómo te llamamos" class="w-full" @keyup.enter="saveName" />
        </UFormField>
        <UButton :disabled="!canSaveName" :loading="savingName" icon="i-lucide-user" class="w-full justify-center" @click="saveName">
          Guardar nombre
        </UButton>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-semibold text-foreground">Avatar</h2>
      </template>
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <UAvatar :src="gravatarUrl" :alt="user?.email" size="lg" />
          <div class="text-sm text-muted">
            Tu avatar se obtiene de <a href="https://gravatar.com" target="_blank" rel="noopener" class="text-primary underline">gravatar.com</a>
          </div>
        </div>
        <ol class="list-decimal list-inside text-sm text-muted space-y-1">
          <li>Inicia sesión en <a href="https://gravatar.com" target="_blank" rel="noopener" class="text-primary underline">gravatar.com</a></li>
          <li>Añade o escoge tu correo de Filmin</li>
          <li>Sube tu avatar y guarda</li>
        </ol>
        <p class="text-sm text-muted">
          <a href="https://filmin.slack.com/archives/C024LAJ61UZ/p1781106169890159" target="_blank" rel="noopener" class="text-primary underline">Ver instrucciones detalladas en Slack</a>
        </p>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-semibold text-foreground">Cambiar contraseña</h2>
      </template>
      <div class="space-y-4">
        <UFormField label="Nueva contraseña">
          <UInput v-model="password" type="password" placeholder="Mínimo 6 caracteres" class="w-full" />
        </UFormField>
        <UFormField label="Confirmar contraseña" :error="mismatch ? 'Las contraseñas no coinciden' : undefined">
          <UInput v-model="confirm" type="password" placeholder="Repite la contraseña" class="w-full" :status="mismatch ? 'error' : undefined" />
        </UFormField>
        <UButton :disabled="!canSave" :loading="saving" icon="i-lucide-lock" class="w-full justify-center" @click="save">
          Guardar contraseña
        </UButton>
      </div>
    </UCard>
  </div>
</template>
