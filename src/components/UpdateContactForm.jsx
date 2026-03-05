import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'

const emptyForm = {
  name: '',
  phoneNumber: '',
  email: '',
  address: '',
  description: '',
  linkedInLink: '',
  favourite: false,
  socialLinks: [],
}

const normalizeSocialLink = (link) => {
  const title = link?.title || ''
  const socialLink = link?.socialLink || ''
  const titleIsUrl = /^https?:\/\//i.test(title)
  const linkIsUrl = /^https?:\/\//i.test(socialLink)
  if (titleIsUrl && !linkIsUrl) {
    return { title: socialLink, socialLink: title }
  }
  return { title, socialLink }
}

const buildForm = (initialData) => {
  if (!initialData) {
    return {
      ...emptyForm,
      socialLinks: [],
    }
  }
  const rawLinks = initialData.socialLinksResponse || initialData.socialLinks || []
  return {
    name: initialData.name || '',
    phoneNumber: initialData.phoneNumber || '',
    email: initialData.email || '',
    address: initialData.address || '',
    description: initialData.description || '',
    linkedInLink: initialData.linkedInLink || '',
    favourite: Boolean(initialData.favourite),
    socialLinks: rawLinks.map(normalizeSocialLink),
  }
}

function UpdateContactForm({ initialData, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => buildForm(initialData))

  useEffect(() => {
    setForm(buildForm(initialData))
  }, [initialData])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const updateSocialLink = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, idx) =>
        idx === index ? { ...link, [field]: value } : link,
      ),
    }))
  }

  const addSocialLink = () => {
    setForm((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { title: '', socialLink: '' }],
    }))
  }

  const removeSocialLink = (index) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, idx) => idx !== index),
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit?.(form)
  }

  return (
    <form className="scm-update-form" onSubmit={handleSubmit}>
      <div className="row g-3 scm-update-form-grid">
        <div className="col-12 col-lg-7">
          <div className="row g-2">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold" htmlFor="update-name">
                Name
              </label>
              <input
                className="form-control"
                id="update-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold" htmlFor="update-phone">
                Phone Number
              </label>
              <input
                className="form-control"
                id="update-phone"
                name="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={handleChange}
                minLength={10}
                maxLength={10}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold" htmlFor="update-email">
                Email
              </label>
              <input
                className="form-control"
                id="update-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold" htmlFor="update-linkedin">
                LinkedIn Link
              </label>
              <input
                className="form-control"
                id="update-linkedin"
                name="linkedInLink"
                type="url"
                value={form.linkedInLink}
                onChange={handleChange}
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold" htmlFor="update-address">
                Address
              </label>
              <input
                className="form-control"
                id="update-address"
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold" htmlFor="update-description">
                Description
              </label>
              <textarea
                className="form-control"
                id="update-description"
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <div className="col-12">
              <input
                className="scm-favourite-card__input"
                id="update-favourite"
                name="favourite"
                type="checkbox"
                checked={form.favourite}
                onChange={handleChange}
              />
              <label className="scm-favourite-card" htmlFor="update-favourite">
                <svg
                  className="scm-favourite-card__icon"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                  height="24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <div className="scm-favourite-card__action">
                  <span className="scm-favourite-card__text scm-favourite-card__text--add">
                    Add to Favorites
                  </span>
                  <span className="scm-favourite-card__text scm-favourite-card__text--added">
                    Added to Favorites
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-5 scm-update-social-col">
          <div className="scm-update-social-panel">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <h5 className="fw-semibold mb-0">Social Links</h5>
              <button
                className="btn btn-outline-primary btn-sm social-add-btn"
                type="button"
                onClick={addSocialLink}
              >
                Add Link
              </button>
            </div>
            <div className="d-grid gap-3 scm-update-social-list">
              {form.socialLinks.length === 0 ? (
                <div className="text-muted">No social links added.</div>
              ) : (
                form.socialLinks.map((link, index) => (
                  <div className="scm-social-editor-item" key={`social-${index}`}>
                    <button
                      className="social-remove-icon-btn"
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      aria-label={`Remove social link ${index + 1}`}
                    >
                      <Icon name="xmark" />
                    </button>
                    <div className="scm-social-editor-field">
                      <label className="form-label small text-muted" htmlFor={`social-title-${index}`}>
                        Title <span className="text-danger ms-1">*</span>
                      </label>
                      <input
                        className="form-control"
                        id={`social-title-${index}`}
                        type="text"
                        value={link.title}
                        onChange={(event) => updateSocialLink(index, 'title', event.target.value)}
                        required
                      />
                    </div>
                    <div className="scm-social-editor-field">
                      <label className="form-label small text-muted" htmlFor={`social-link-${index}`}>
                        Link <span className="text-danger ms-1">*</span>
                      </label>
                      <input
                        className="form-control"
                        id={`social-link-${index}`}
                        type="url"
                        value={link.socialLink}
                        onChange={(event) => updateSocialLink(index, 'socialLink', event.target.value)}
                        required
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex flex-wrap gap-2 pt-2 scm-update-form-actions">
        <button className="btn btn-outline-primary edit_contact_btn" type="submit">
          Save Changes
        </button>
        <button className="btn btn-outline-secondary cancel_contact_btn" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default UpdateContactForm
