<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

const name = ref(user.value?.user_metadata?.name ?? '')
const saving = ref(false)

const hasName = computed(() => !!(user.value?.user_metadata?.name))

async function saveName() {
  if (!name.value.trim()) return
  saving.value = true
  try {
    const { error } = await supabase.auth.updateUser({ data: { name: name.value.trim() } })
    if (error) throw error
    name.value = name.value.trim()
  } catch (e: unknown) {
    toast.add({ title: 'Error al guardar', description: e instanceof Error ? e.message : 'Error desconocido', color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center">
    <div>
      <h1 class="text-3xl font-bold text-foreground mb-2">
        {{ hasName ? `Hola, ${user?.user_metadata?.name}!` : 'mundIAl 26' }}
      </h1>
      <p class="text-muted text-sm">
        Porra del Mundial de Fútbol 2026
      </p>
    </div>

    <template v-if="!hasName">
      <div class="w-full max-w-sm space-y-3">
        <p class="text-sm font-medium text-foreground">¿Cómo te llamamos?</p>
        <div class="flex gap-2">
          <UInput
            v-model="name"
            type="text"
            placeholder="Tu nombre"
            class="flex-1"
            size="lg"
            autofocus
            @keyup.enter="saveName"
          />
          <UButton
            size="lg"
            :disabled="!name.trim()"
            :loading="saving"
            icon="i-lucide-arrow-right"
            @click="saveName"
          />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-sm">
        <NuxtLink to="/predictions" class="h-full">
          <UCard class="hover:ring-2 hover:ring-primary transition-all cursor-pointer text-center h-full flex flex-col items-center justify-center py-6">
            <UIcon name="i-lucide-pencil" class="size-8 text-primary mb-3" />
            <p class="font-semibold text-foreground">Predicciones</p>
            <p class="text-xs text-muted mt-1">Introduce tus resultados</p>
          </UCard>
        </NuxtLink>

        <NuxtLink to="/ranking" class="h-full">
          <UCard class="hover:ring-2 hover:ring-primary transition-all cursor-pointer text-center h-full flex flex-col items-center justify-center py-6">
            <UIcon name="i-lucide-trophy" class="size-8 text-primary mb-3" />
            <p class="font-semibold text-foreground">Ranking</p>
            <p class="text-xs text-muted mt-1">Clasificación general</p>
          </UCard>
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
