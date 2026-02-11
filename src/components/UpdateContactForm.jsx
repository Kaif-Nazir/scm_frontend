import { useEffect, useState } from 'react'

const emptyForm = {
  name: '',
  phoneNumber: '',
  email: '',
  address: '',
  picture: '',
  description: '',
  linkedInLink: '',
  favourite: false,
  socialLinks: [],
}

function UpdateContactForm({ initialData, onCancel, onSubmit }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!initialData) {
      setForm(emptyForm)
      return
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
    const rawLinks = initialData.socialLinksResponse || initialData.socialLinks || []
    setForm({
      name: initialData.name || '',
      phoneNumber: initialData.phoneNumber || '',
      email: initialData.email || '',
      address: initialData.address || '',
      picture: initialData.picture || '',
      description: initialData.description || '',
      linkedInLink: initialData.linkedInLink || '',
      favourite: Boolean(initialData.favourite),
      socialLinks: rawLinks.map(normalizeSocialLink),
    })
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
      <div className="row g-3">
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
        <div className="col-12 d-flex align-items-center gap-2">
          <input
            className="form-check-input"
            id="update-favourite"
            name="favourite"
            type="checkbox"
            checked={form.favourite}
            onChange={handleChange}
          />
          <label className="form-check-label fw-semibold" htmlFor="update-favourite">
            Mark as favourite
          </label>
        </div>
      </div>
      <div className="mt-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h5 className="fw-semibold mb-0">Social Links</h5>
          <button className="btn btn-outline-primary btn-sm" type="button" onClick={addSocialLink}>
            Add Link
          </button>
        </div>
        <div className="d-grid gap-3">
          {form.socialLinks.length === 0 ? (
            <div className="text-muted">No social links added.</div>
          ) : (
            form.socialLinks.map((link, index) => (
              <div className="row g-2 align-items-end" key={`social-${index}`}>
                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted" htmlFor={`social-title-${index}`}>
                    Title
                  </label>
                  <input
                    className="form-control"
                    id={`social-title-${index}`}
                    type="text"
                    value={link.title}
                    onChange={(event) => updateSocialLink(index, 'title', event.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small text-muted" htmlFor={`social-link-${index}`}>
                    Link
                  </label>
                  <input
                    className="form-control"
                    id={`social-link-${index}`}
                    type="url"
                    value={link.socialLink}
                    onChange={(event) => updateSocialLink(index, 'socialLink', event.target.value)}
                  />
                </div>
                <div className="col-12 col-md-2">
                  <button
                    className="btn btn-outline-danger w-100"
                    type="button"
                    onClick={() => removeSocialLink(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="d-flex flex-wrap gap-2 pt-3">
        <button className="btn btn-primary" type="submit">
          Save Changes
        </button>
        <button className="btn btn-ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default UpdateContactForm
