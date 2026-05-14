<script setup lang="ts">
interface Player {
  id: string
  name: string
  position: string | null
  team: { name: string } | null
}

const props = defineProps<{
  players: Player[]
  placeholder?: string
  disabled?: boolean
}>()

const model = defineModel<string | null>()

const query = ref('')

const filtered = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return props.players
  return props.players.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.team?.name.toLowerCase().includes(q)
  )
})

const selected = computed(() =>
  props.players.find(p => p.id === model.value) ?? null
)

const open = ref(false)

function select(player: Player) {
  model.value = player.id
  query.value = ''
  open.value = false
}

function clear() {
  model.value = null
  query.value = ''
}
</script>

<template>
  <UPopover v-model:open="open" :disabled="disabled">
    <button
      type="button"
      class="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm transition-colors hover:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="disabled"
      @click="open = !open"
    >
      <span v-if="selected" class="text-foreground truncate">{{ selected.name }}</span>
      <span v-else class="text-muted truncate">{{ placeholder ?? 'Buscar jugador...' }}</span>
      <div class="flex items-center gap-1 shrink-0">
        <UIcon
          v-if="selected"
          name="i-lucide-x"
          class="size-3.5 text-muted hover:text-foreground"
          @click.stop="clear"
        />
        <UIcon name="i-lucide-chevrons-up-down" class="size-3.5 text-muted" />
      </div>
    </button>

    <template #content>
      <div class="w-72 p-1">
        <div class="px-2 pb-1">
          <UInput
            v-model="query"
            placeholder="Buscar..."
            size="sm"
            icon="i-lucide-search"
            autofocus
          />
        </div>
        <div class="max-h-60 overflow-y-auto">
          <div v-if="!filtered.length" class="px-3 py-6 text-center text-xs text-muted">
            Sin resultados
          </div>
          <button
            v-for="player in filtered"
            :key="player.id"
            type="button"
            class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded text-sm hover:bg-muted/50 transition-colors text-left"
            :class="player.id === model ? 'bg-primary/10 text-primary' : 'text-foreground'"
            @click="select(player)"
          >
            <span class="font-medium truncate">{{ player.name }}</span>
            <span class="text-xs text-muted shrink-0">{{ player.team?.name }}</span>
          </button>
        </div>
      </div>
    </template>
  </UPopover>
</template>
