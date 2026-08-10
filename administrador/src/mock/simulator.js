import CONFIG from '../config'
import { finishNextPending } from './data'

export function startSimulator(emit) {
  const timer = setInterval(() => {
    const finished = finishNextPending()
    if (finished) {
      emit(finished)
    }
  }, CONFIG.mock.intervalMs)
  return timer
}

export function stopSimulator(timer) {
  clearInterval(timer)
}
