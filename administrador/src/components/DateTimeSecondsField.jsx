// Campo compuesto fecha + hora + segundos, usado en vez de un único
// <input type="datetime-local">: en iOS/iPadOS el picker nativo de ese
// tipo no expone una rueda de segundos (aunque tenga step="1"), así que
// para poder editar con precisión de segundos desde el celular/tablet se
// arma a mano con tres inputs — date, time y un número para los segundos.
export default function DateTimeSecondsField({ label, date, time, seconds, onChange, required }) {
  return (
    <label className="modal-field">
      {label}
      <div className="datetime-seconds-row">
        <input
          type="date"
          value={date}
          onChange={(event) => onChange({ date: event.target.value, time, seconds })}
          required={required}
        />
        <input
          type="time"
          value={time}
          onChange={(event) => onChange({ date, time: event.target.value, seconds })}
          required={required}
        />
        <input
          type="number"
          className="datetime-seconds-input"
          inputMode="numeric"
          min="0"
          max="59"
          placeholder="seg"
          value={seconds}
          onChange={(event) => onChange({ date, time, seconds: event.target.value })}
          required={required}
        />
      </div>
    </label>
  )
}
