// Filtro de "semáforo" de entregas para la sección Corredores — mismo
// criterio de conteo que el ícono de RunnerInfoButton (ver
// deliveryClass ahí): gris si no se entregó nada, ámbar si falta una
// de las dos, verde si ya se entregaron ambas (camiseta + paquete de
// corredor). Se centraliza acá para no duplicar el conteo entre el
// ícono y este filtro.
function deliveredCount(runner) {
  return (runner.shirtDelivered ? 1 : 0) + (runner.kitDelivered ? 1 : 0)
}

export const DELIVERY_FILTERS = [
  { id: 'todos', label: 'Todos', dot: null, match: () => true },
  { id: 'pendiente', label: 'Pendiente', dot: 'gray', match: (runner) => deliveredCount(runner) === 0 },
  { id: 'parcial', label: 'Parcial', dot: 'warning', match: (runner) => deliveredCount(runner) === 1 },
  { id: 'completo', label: 'Completo', dot: 'success', match: (runner) => deliveredCount(runner) === 2 },
]
