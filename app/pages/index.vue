<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center">
    <div>
      <h1 class="text-3xl font-bold text-foreground mb-2">
        mundIAl 26
      </h1>
      <p class="text-muted text-sm">
        Porra del Mundial de Fútbol 2026
      </p>
    </div>

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
  </div>
</template>
