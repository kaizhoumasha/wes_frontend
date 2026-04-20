import { describe, expect, it, vi } from 'vitest'
import { createCoalescedAsyncTask } from '@/utils/createCoalescedAsyncTask'

describe('createCoalescedAsyncTask', () => {
  it('keeps overlapping callers pending until the queued rerun completes', async () => {
    let runCount = 0
    let resumeFirstRun: (() => void) | null = null
    let resumeSecondRun: (() => void) | null = null

    const task = createCoalescedAsyncTask(async () => {
      runCount += 1

      await new Promise<void>(resolve => {
        if (runCount === 1) {
          resumeFirstRun = resolve
          return
        }

        resumeSecondRun = resolve
      })
    })

    const firstRun = task()
    const secondRun = task()

    let secondResolved = false
    void secondRun.then(() => {
      secondResolved = true
    })

    await Promise.resolve()
    expect(secondResolved).toBe(false)

    resumeFirstRun?.()
    await vi.waitFor(() => {
      expect(runCount).toBe(2)
    })
    expect(secondResolved).toBe(false)

    resumeSecondRun?.()

    await Promise.all([firstRun, secondRun])
    expect(secondResolved).toBe(true)
  })

  it('coalesces overlapping calls into sequential executions', async () => {
    const steps: string[] = []
    let resumeFirstRun: (() => void) | null = null

    const task = createCoalescedAsyncTask(async () => {
      steps.push('start')

      await new Promise<void>(resolve => {
        if (!resumeFirstRun) {
          resumeFirstRun = resolve
          return
        }

        resolve()
      })

      steps.push('end')
    })

    const firstRun = task()
    const secondRun = task()
    const thirdRun = task()

    expect(steps).toEqual(['start'])

    resumeFirstRun?.()

    await Promise.all([firstRun, secondRun, thirdRun])

    expect(steps).toEqual(['start', 'end', 'start', 'end'])
  })

  it('does not drop a rerun requested while the current execution is finishing', async () => {
    const task = vi.fn(async () => {
      if (task.mock.calls.length === 1) {
        await rerun()
      }
    })

    const rerun = createCoalescedAsyncTask(task)

    await rerun()

    expect(task).toHaveBeenCalledTimes(2)
  })
})
