<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

interface Team { id: string, name: string }
interface Awards {
  winner_team_id: string | null
  best_player: string | null
  best_young_player: string | null
  top_scorer: string | null
  best_goalkeeper: string | null
}

const supabase = useSupabaseClient()
const toast = useToast()

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
}

const headers = await getAuthHeaders()
const [{ data: allTeams }, fetched] = await Promise.all([
  useFetch<Team[]>('/api/teams'),
  $fetch<Awards>('/api/admin/awards', { headers }),
])

const awards = ref<Awards>({
  winner_team_id: fetched?.winner_team_id ?? null,
  best_player: fetched?.best_player ?? null,
  best_young_player: fetched?.best_young_player ?? null,
  top_scorer: fetched?.top_scorer ?? null,
  best_goalkeeper: fetched?.best_goalkeeper ?? null,
})

const original = { ...awards.value }
const saving = ref(false)

const isDirty = computed(() =>
  (Object.keys(awards.value) as (keyof Awards)[]).some(k => awards.value[k] !== original[k])
)

const teamOptions = computed(() =>
  (allTeams.value ?? []).map(t => ({ label: t.name, value: t.id }))
)

async function save() {
  saving.value = true
  try {
    const h = await getAuthHeaders()
    await $fetch('/api/admin/awards', { method: 'PATCH', headers: h, body: awards.value })
    Object.assign(original, awards.value)
    toast.add({ title: 'Premios guardados', color: 'success' })
  } catch {
    toast.add({ title: 'Error al guardar', color: 'error' })
  } finally {
    saving.value = false
  }
}

function reset() {
  awards.value = { ...original }
}

const AWARD_FIELDS = [
  { key: 'best_player' as const, label: 'Mejor jugador (MVP)', placeholder: 'Nombre del jugador' },
  { key: 'best_young_player' as const, label: 'Mejor jugador joven', placeholder: 'Nombre del jugador' },
  { key: 'top_scorer' as const, label: 'Máximo goleador', placeholder: 'Nombre del jugador' },
  { key: 'best_goalkeeper' as const, label: 'Mejor portero', placeholder: 'Nombre del jugador' },
]
</script>

<template>
  <div class="space-y-8 max-w-md">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Premios oficiales</h1>
        <p class="text-sm text-muted mt-1">Introduce los ganadores reales una vez finalice el torneo.</p>
      </div>
      <div class="flex gap-2">
        <UButton variant="outline" color="neutral" size="sm" :disabled="!isDirty" @click="reset">
          Descartar
        </UButton>
        <UButton size="sm" :loading="saving" :disabled="!isDirty" icon="i-lucide-save" @click="save">
          Guardar
        </UButton>
      </div>
    </div>

    <UCard>
      <div class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Equipo campeón</label>
          <USelect
            v-model="awards.winner_team_id"
            :items="teamOptions"
            value-key="value"
            label-key="label"
            placeholder="Selecciona un equipo..."
          />
        </div>
        <div v-for="field in AWARD_FIELDS" :key="field.key" class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">{{ field.label }}</label>
          <UInput v-model="awards[field.key]" :placeholder="field.placeholder" />
        </div>
      </div>
    </UCard>
  </div>
</template>
