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
  positionFilter?: string
}>()

const model = defineModel<string | null>()

const query = ref('')
const open = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const filtered = computed(() => {
  const list = props.positionFilter
    ? props.players.filter(p => p.position === props.positionFilter)
    : props.players
  const q = normalize(query.value.trim())
  if (!q) return list
  return list.filter(p =>
    normalize(p.name).includes(q) ||
    normalize(p.team?.name ?? '').includes(q)
  )
})

const selected = computed(() =>
  props.players.find(p => p.id === model.value) ?? null
)

function openDropdown() {
  if (props.disabled) return
  query.value = ''
  open.value = true
  nextTick(() => inputRef.value?.focus())
}

function select(player: Player) {
  model.value = player.id
  query.value = ''
  open.value = false
}

function clear() {
  model.value = null
  query.value = ''
  open.value = false
}

// close on click outside
const containerRef = ref<HTMLElement | null>(null)
function onClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    open.value = false
    query.value = ''
  }
}
onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div ref="containerRef" class="relative">
    <!-- Trigger -->
    <button
      v-if="!open"
      type="button"
      class="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm transition-colors hover:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="disabled"
      @click="openDropdown"
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

    <!-- Search input (replaces trigger while open) -->
    <div v-else class="flex items-center gap-2 px-3 py-2 rounded-md border border-primary bg-background ring-1 ring-primary/30">
      <UIcon name="i-lucide-search" class="size-3.5 text-muted shrink-0" />
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        class="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
        placeholder="Buscar jugador o equipo..."
      />
      <UIcon name="i-lucide-x" class="size-3.5 text-muted hover:text-foreground cursor-pointer shrink-0" @mousedown.prevent="clear" />
    </div>

    <!-- Dropdown -->
    <div
      v-if="open"
      class="absolute z-50 top-full mt-1 left-0 right-0 rounded-md border border-border shadow-xl overflow-hidden bg-white dark:bg-neutral-900"
    >
      <div class="max-h-60 overflow-y-auto">
        <div v-if="!filtered.length" class="px-3 py-6 text-center text-xs text-muted">
          Sin resultados
        </div>
        <button
          v-for="player in filtered"
          :key="player.id"
          type="button"
          class="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm transition-colors text-left bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          :class="player.id === model ? 'text-primary !bg-primary/10' : 'text-foreground'"
          @mousedown.prevent="select(player)"
        >
          <span class="font-medium truncate">{{ player.name }}</span>
          <span class="text-xs text-muted shrink-0">{{ player.team?.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
