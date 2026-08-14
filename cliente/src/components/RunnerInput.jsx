import { useEffect, useRef, useState } from 'react'

export default function RunnerInput({ onSubmit, disabled = false }) {
  const inputRef = useRef(null)
  const [value, setValue] = useState('')

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus()
    }
  }, [disabled])

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      const id = value.trim()
      if (!disabled && id !== '') {
        setValue('')
        onSubmit(id)
      }
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={value}
        placeholder="ID del corredor"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <p className="input-hint">Presione Enter para registrar la llegada</p>
    </>
  )
}
