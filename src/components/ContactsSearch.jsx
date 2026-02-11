import { useEffect, useState } from 'react'

function ContactsSearch({
  onSearch,
  label = 'Search contacts',
  placeholder = 'Search by name, phone, or email',
  debounceMs = 250,
  inputId = 'contact-search',
}) {
  const [term, setTerm] = useState('')

  useEffect(() => {
    const handle = setTimeout(() => {
      onSearch?.(term.trim())
    }, debounceMs)
    return () => clearTimeout(handle)
  }, [term, debounceMs, onSearch])

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className="form-control"
        type="search"
        placeholder={placeholder}
        value={term}
        onChange={(event) => setTerm(event.target.value)}
      />
    </div>
  )
}

export default ContactsSearch
