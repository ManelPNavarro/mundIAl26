<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const toast = useToast()

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
