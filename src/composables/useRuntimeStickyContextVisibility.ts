import { nextTick, onBeforeUnmount, onMounted, ref, type Ref, watch } from 'vue'

interface RuntimeStickyContextVisibilityOptions {
  heroRef: Ref<HTMLElement | null>
  scrollRootRef?: Ref<HTMLElement | null>
  enabled?: Ref<boolean>
}

function resolveObserverRoot(element?: HTMLElement | null): HTMLElement | null {
  if (!element) {
    return null
  }

  const style = window.getComputedStyle(element)
  const canScroll = /(auto|scroll|overlay)/.test(style.overflowY)
  return canScroll && element.scrollHeight > element.clientHeight + 1 ? element : null
}

export function useRuntimeStickyContextVisibility(options: RuntimeStickyContextVisibilityOptions): Ref<boolean> {
  const visible = ref(false)
  let observer: IntersectionObserver | null = null

  function stopObserver() {
    observer?.disconnect()
    observer = null
  }

  async function startObserver() {
    stopObserver()
    visible.value = false

    if (options.enabled && !options.enabled.value) {
      return
    }

    await nextTick()

    const heroElement = options.heroRef.value
    if (!heroElement) {
      return
    }

    observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (!entry) {
          visible.value = false
          return
        }

        const rootTop = entry.rootBounds?.top ?? 0
        visible.value = !entry.isIntersecting && entry.boundingClientRect.bottom <= rootTop
      },
      {
        root: resolveObserverRoot(options.scrollRootRef?.value),
        threshold: 0,
      }
    )

    observer.observe(heroElement)
  }

  function handleResize() {
    void startObserver()
  }

  onMounted(() => {
    void startObserver()
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    stopObserver()
    window.removeEventListener('resize', handleResize)
  })

  watch(
    () => [options.heroRef.value, options.scrollRootRef?.value, options.enabled?.value],
    () => {
      void startObserver()
    },
    { flush: 'post' }
  )

  return visible
}
