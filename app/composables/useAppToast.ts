// Nuxt UI's toast progress bar defaults to depleting right-to-left, which reads as
// backwards while saving. `inverted` flips it to deplete left-to-right instead.
export function useAppToast() {
  const toast = useToast()

  return {
    ...toast,
    add: (options: Parameters<typeof toast.add>[0]) => toast.add({
      ...options,
      // `inverted` is a real UProgress prop forwarded at runtime; Toast's type only lists color/ui.
      progress: options.progress ?? ({ inverted: true } as Parameters<typeof toast.add>[0]['progress']),
    }),
  }
}
