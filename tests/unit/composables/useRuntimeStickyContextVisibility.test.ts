import { defineComponent, h, nextTick, ref, type Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRuntimeStickyContextVisibility } from '@/composables/useRuntimeStickyContextVisibility'

class MockIntersectionObserver {
  disconnect = vi.fn()
  observe = vi.fn()
  unobserve = vi.fn()

  constructor(
    private readonly callback: IntersectionObserverCallback,
    public readonly options?: IntersectionObserverInit
  ) {}

  trigger(entry: Partial<IntersectionObserverEntry>) {
    this.callback([entry as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }
}

async function flushObserverSetup() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

function setScrollableRoot(element: HTMLElement) {
  Object.defineProperty(element, 'scrollHeight', { value: 800, configurable: true })
  Object.defineProperty(element, 'clientHeight', { value: 200, configurable: true })
}

function mountHarness(enabledRef: Ref<boolean> = ref(true)) {
  const harness = {
    visible: ref(false),
    heroRef: ref<HTMLElement | null>(null),
    rootRef: ref<HTMLElement | null>(null),
    enabled: enabledRef
  }

  const component = defineComponent({
    setup() {
      harness.visible = useRuntimeStickyContextVisibility({
        heroRef: harness.heroRef,
        scrollRootRef: harness.rootRef,
        enabled: harness.enabled
      })

      return () =>
        h('div', { ref: harness.rootRef, class: 'scroll-root' }, [
          h('section', { ref: harness.heroRef, class: 'hero' }, 'hero')
        ])
    }
  })

  return { wrapper: mount(component), harness }
}

describe('useRuntimeStickyContextVisibility', () => {
  let observers: MockIntersectionObserver[]
  let getComputedStyleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    observers = []
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn((callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
        const observer = new MockIntersectionObserver(callback, options)
        observers.push(observer)
        return observer
      })
    )
    getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      overflowY: 'auto'
    } as CSSStyleDeclaration)
  })

  afterEach(() => {
    getComputedStyleSpy.mockRestore()
    vi.unstubAllGlobals()
  })

  it('shows the sticky context only after the hero scrolls above the observer root', async () => {
    const { wrapper, harness } = mountHarness()
    setScrollableRoot(wrapper.find('.scroll-root').element as HTMLElement)

    await flushObserverSetup()

    expect(observers.at(-1)?.options?.root).toBe(wrapper.find('.scroll-root').element)
    observers.at(-1)?.trigger({
      isIntersecting: false,
      boundingClientRect: { bottom: -1 } as DOMRectReadOnly,
      rootBounds: { top: 0 } as DOMRectReadOnly
    })
    expect(harness.visible.value).toBe(true)

    observers.at(-1)?.trigger({
      isIntersecting: true,
      boundingClientRect: { bottom: 120 } as DOMRectReadOnly,
      rootBounds: { top: 0 } as DOMRectReadOnly
    })
    expect(harness.visible.value).toBe(false)

    wrapper.unmount()
  })

  it('waits for enabled before observing and disconnects on unmount', async () => {
    const enabled = ref(false)
    const { wrapper } = mountHarness(enabled)

    await flushObserverSetup()

    expect(observers).toHaveLength(0)

    enabled.value = true
    setScrollableRoot(wrapper.find('.scroll-root').element as HTMLElement)
    await flushObserverSetup()

    expect(observers).toHaveLength(1)
    wrapper.unmount()
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1)
  })
})
