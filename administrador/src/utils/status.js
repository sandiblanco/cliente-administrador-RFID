export const STATUS = {
  FINISHED: 'Finalizado',
  PENDING: 'Pendiente',
}

export function getStatus(runner) {
  return runner.timestamp ? STATUS.FINISHED : STATUS.PENDING
}
