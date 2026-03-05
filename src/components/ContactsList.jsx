import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon.jsx'
import '../styles/pages/ViewContactsPage.css'
import UpdateContactForm from './UpdateContactForm.jsx'
import ContactsSearch from './ContactsSearch.jsx'
import apiClient from '../api/client.js'
import { useAlert } from '../context/AlertContext.jsx'

const normalizeUrl = (value) => {
  const trimmed = value?.trim()
  if (!trimmed) {
    return null
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`
  }
  return `https://${trimmed}`
}

const normalizeSocialLinkFields = (link) => {
  const title = link?.title || ''
  const socialLink = link?.socialLink || ''
  const titleIsUrl = /^https?:\/\//i.test(title)
  const linkIsUrl = /^https?:\/\//i.test(socialLink)
  if (titleIsUrl && !linkIsUrl) {
    return { title: socialLink, socialLink: title }
  }
  return { title, socialLink }
}

function ContactsList({ title, contacts, fullContacts = null, hideUnfavourited = false }) {
  const { success, error: showError } = useAlert()

  const [activeId, setActiveId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [contactList, setContactList] = useState(contacts)
  const [fullContactMap, setFullContactMap] = useState(fullContacts || {})
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingContactIds, setLoadingContactIds] = useState({})
  const [deleteConfirmContact, setDeleteConfirmContact] = useState(null)

  useEffect(() => {
    setContactList(contacts)
  }, [contacts])

  useEffect(() => {
    if (fullContacts) {
      setFullContactMap(fullContacts)
    }
  }, [fullContacts])

    const fetchFullContact = async (id) => {
      if (fullContactMap?.[id]) {
        return
      }
      setLoadingContactIds((prev) => ({ ...prev, [id]: true }))
      try {
        const response = await apiClient.get(`/api/getFullContact/${id}`)
        setFullContactMap((prev) => ({ ...(prev || {}), [id]: response.data }))
      } catch (error) {
        console.error('Failed to load contact details.', error)
        showError(error?.response?.data?.message || 'Failed to load contact details.')
      } finally {
        setLoadingContactIds((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
      }
  }

  const toggleActive = (id) => {
    const nextId = activeId === id ? null : id
    setActiveId(nextId)
    if (nextId) {
      fetchFullContact(id)
      requestAnimationFrame(() => {
        const contentPane = document.querySelector('.scm-content')
        const rowEl = document.getElementById(`contact-row-${id}`)
        if (!contentPane || !rowEl) {
          return
        }
        const contentRect = contentPane.getBoundingClientRect()
        const rowRect = rowEl.getBoundingClientRect()
        const targetTop = contentPane.scrollTop + (rowRect.top - contentRect.top) - 10
        contentPane.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' })
      })
    }
  }

  const toggleEdit = (event, id) => {
    event.stopPropagation()
    setEditingId((prev) => {
      const nextId = prev === id ? null : id
      if (nextId) {
        fetchFullContact(nextId)
        const contentPane = document.querySelector('.scm-content')
        if (contentPane && typeof contentPane.scrollTo === 'function') {
          contentPane.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
      return nextId
    })
  }

  const closeEdit = () => {
    setEditingId(null)
  }

  const toggleFavourite = async (event, id) => {
    event.stopPropagation()
    const previousIsFavourite = contactList.find((contact) => contact.id === id)?.favourite
    const nextIsFavourite = !previousIsFavourite
    setContactList((prev) =>
      prev.map((contact) =>
        contact.id === id ? { ...contact, favourite: !contact.favourite } : contact,
      ),
    )
    setFullContactMap((prev) =>
      prev && prev[id] ? { ...prev, [id]: { ...prev[id], favourite: !prev[id].favourite } } : prev,
    )
    try {
      await apiClient.patch(`/api/updatefavourite/${id}`, null, {
        params: { value: nextIsFavourite },
      })
    } catch (error) {
      console.error('Failed to update favourite.', error)
      showError(error?.response?.data?.message || 'Failed to update favourite.')
      setContactList((prev) =>
        prev.map((contact) =>
          contact.id === id ? { ...contact, favourite: previousIsFavourite } : contact,
        ),
      )
      setFullContactMap((prev) =>
        prev && prev[id]
          ? { ...prev, [id]: { ...prev[id], favourite: previousIsFavourite } }
          : prev,
      )
    }
  }

  const handleUpdateContact = async (form) => {
    if (!editingId) {
      return
    }
    try {
      const response = await apiClient.patch(`/api/updateContact/${editingId}`, {
        ...form,
        socialLinks: form.socialLinks || [],
      })
      const updated = response.data
      setContactList((prev) =>
        prev.map((contact) =>
          contact.id === editingId
            ? {
                ...contact,
                name: updated.name ?? contact.name,
                phoneNumber: updated.phoneNumber ?? contact.phoneNumber,
                email: updated.email ?? contact.email,
                favourite: updated.favourite ?? contact.favourite,
              }
            : contact,
        ),
      )
      setFullContactMap((prev) => ({ ...(prev || {}), [editingId]: updated }))
      closeEdit()
      success('Contact updated successfully.')
    } catch (error) {
      console.error('Failed to update contact.', error)
      showError(error?.response?.data?.message || 'Failed to update contact.')
    }
  }

  const performDeleteContact = async (id) => {
    try {
      await apiClient.delete(`/api/deleteContact/${id}`)
      setContactList((prev) => prev.filter((contact) => contact.id !== id))
      setFullContactMap((prev) => {
        if (!prev || !prev[id]) {
          return prev
        }
        const next = { ...prev }
        delete next[id]
        return next
      })
      setActiveId((prev) => (prev === id ? null : prev))
      setEditingId((prev) => (prev === id ? null : prev))
      setDeleteConfirmContact((prev) => (prev?.id === id ? null : prev))
      success('Contact deleted successfully.')
    } catch (error) {
      console.error('Failed to delete contact.', error)
      showError(error?.response?.data?.message || 'Failed to delete contact.')
    }
  }

  const requestDeleteContact = (event, contact) => {
    event.stopPropagation()
    setDeleteConfirmContact(contact)
  }

  const closeDeleteConfirm = () => {
    setDeleteConfirmContact(null)
  }

  const confirmDeleteContact = async () => {
    if (!deleteConfirmContact?.id) {
      return
    }
    await performDeleteContact(deleteConfirmContact.id)
  }

  const normalizedSearch = searchTerm.toLowerCase()
  const editingContact = useMemo(() => {
    if (!editingId) {
      return null
    }
    const basicContact = contactList.find((contact) => contact.id === editingId) || {}
    const fullContact = fullContactMap?.[editingId] || {}
    return {
      ...basicContact,
      ...fullContact,
    }
  }, [editingId, contactList, fullContactMap])
  const portalRoot = document.body
  const filteredContacts = contactList.filter((contact) => {
    if (hideUnfavourited && !contact.favourite) {
      return false
    }
    if (!normalizedSearch) {
      return true
    }
    const haystack = [contact.name, contact.phoneNumber, contact.email]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(normalizedSearch)
  })

  return (
    <div className="scm-contacts-card">
      <div className="scm-contacts-card__body">
        <div className="d-flex align-items-center justify-content-between mb-3 scm-contacts-header">
          <h3 className="fw-semibold mb-0">{title}</h3>
          <span className="text-muted small scm-contacts-count">
            {filteredContacts.length} of {contactList.length}
          </span>
        </div>
        <ContactsSearch
          onSearch={setSearchTerm}
          className="scm-contacts-search"
          inputClassName="scm-contacts-search__input"
        />
        <div className="list-group scm-contact-list">
          {filteredContacts.map((contact) => {
            const isOpen = activeId === contact.id
            const fullContact = fullContactMap?.[contact.id]
            const isLoadingDetails = Boolean(loadingContactIds[contact.id])

            return (
              <div
                key={contact.id}
                id={`contact-row-${contact.id}`}
                className={`list-group-item scm-contact-row${isOpen ? ' is-open' : ''}`}
              >
                <div
                  className="scm-contact-toggle w-100"
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleActive(contact.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      toggleActive(contact.id)
                    }
                  }}
                >
                  <div>
                    <div className="fw-semibold">{contact.name}</div>
                    <div className="small text-muted">{contact.phoneNumber}</div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className={`scm-fav-toggle${contact.favourite ? ' is-active' : ''}`}
                      type="button"
                      onClick={(event) => toggleFavourite(event, contact.id)}
                      aria-pressed={contact.favourite}
                      aria-label={contact.favourite ? 'Remove from favourites' : 'Add to favourites'}
                    >
                      <Icon name={contact.favourite ? 'heart-filled' : 'heart'} />
                    </button>
                    <span className="scm-contact-chevron" aria-hidden="true">
                      <Icon name="chevron-down" />
                    </span>
                  </div>
                </div>
                {isOpen && (
                  <div className="scm-contact-panel border-top pt-3 mt-3">
                    {isLoadingDetails && !fullContact ? (
                      <div className="text-muted">Loading details...</div>
                    ) : (
                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <div className="text-muted small">Email</div>
                          <div className="fw-semibold">{fullContact?.email || '-'}</div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="text-muted small">Address</div>
                          <div className="fw-semibold">{fullContact?.address || '-'}</div>
                        </div>
                        <div className="col-12">
                          <div className="text-muted small">Description</div>
                          <div className="fw-semibold">{fullContact?.description || '-'}</div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="text-muted small">LinkedIn</div>
                          {fullContact?.linkedInLink ? (
                            <a href={fullContact.linkedInLink} target="_blank" rel="noreferrer">
                              {fullContact.linkedInLink}
                            </a>
                          ) : (
                            <div className="fw-semibold">-</div>
                          )}
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="text-muted small">Favourite</div>
                          <div className="fw-semibold">{fullContact?.favourite ? 'Yes' : 'No'}</div>
                        </div>
                        <div className="col-12">
                          <div className="text-muted small">Social Links</div>
                          {((fullContact?.socialLinksResponse || fullContact?.socialLinks || []).length) ? (
                            <div className="scm-social-list">
                              {(fullContact?.socialLinksResponse || fullContact?.socialLinks || []).map((link) => {
                                const normalized = normalizeSocialLinkFields(link)
                                const href = normalizeUrl(normalized.socialLink)
                                return (
                                  <div
                                    key={`${fullContact.id}-${normalized.title}`}
                                    className="scm-social-pill"
                                  >
                                    <span className="scm-social-pill__title">
                                      {normalized.title}
                                    </span>
                                    {href && (
                                      <a
                                        className="scm-social-pill__link"
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        {href}
                                      </a>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="fw-semibold">-</div>
                          )}
                        </div>
                        <div className="col-12 d-flex flex-wrap gap-2 pt-2">
                          <button
                            className="btn btn-outline-primary edit_contact_btn"
                            type="button"
                            onClick={(event) => toggleEdit(event, contact.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-outline-danger delete_contact_btn"
                            type="button"
                            onClick={(event) => requestDeleteContact(event, contact)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      {editingId && (
        <div className="scm-modal-backdrop scm-edit-backdrop" onClick={closeEdit} role="presentation">
          <div
            className="scm-modal scm-edit-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="scm-modal__header">
              <h4 className="fw-semibold mb-0">Update Contact</h4>
              <button className="btn btn-sm btn-ghost scm-modal-close-btn" type="button" onClick={closeEdit}>
                <Icon name="xmark" />
              </button>
            </div>
            <UpdateContactForm
              key={editingId}
              initialData={editingContact}
              onCancel={closeEdit}
              onSubmit={handleUpdateContact}
            />
          </div>
        </div>
      )}
      {deleteConfirmContact &&
        createPortal(
          <div
            className="scm-modal-backdrop scm-delete-backdrop"
            onClick={closeDeleteConfirm}
            role="presentation"
          >
            <div
              className="scm-modal scm-delete-confirm-modal"
              role="dialog"
              aria-modal="true"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="scm-modal__header">
                <h5 className="fw-semibold mb-0">Delete Contact</h5>
                <button className="btn btn-sm btn-ghost scm-modal-close-btn" type="button" onClick={closeDeleteConfirm}>
                  <Icon name="xmark" />
                </button>
              </div>
              <p className="mb-3">
                Delete <span className="fw-semibold">{deleteConfirmContact.name}</span> permanently?
              </p>
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-outline-primary edit_contact_btn" type="button" onClick={closeDeleteConfirm}>
                  Cancel
                </button>
                <button className="btn btn-outline-danger delete_contact_btn" type="button" onClick={confirmDeleteContact}>
                  Delete
                </button>
              </div>
            </div>
          </div>,
          portalRoot,
        )}
    </div>
  )
}

export default ContactsList
