import { useState } from 'react'

export default function RunnerInput({ onSubmit, disabled = false }) {
  const [value, setValue] = useState('')

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
    <input
      type="text"
      value={value}
      placeholder="ID del corredor"
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      autoFocus
    />
  )
}
