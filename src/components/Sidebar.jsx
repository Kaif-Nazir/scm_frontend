import { useState } from 'react'
import Icon from './Icon.jsx'
import '../styles/components/Sidebar.css'

const navItems = [
  { label: 'Dashboard', icon: 'chart' },
  { label: 'Add Contact', icon: 'plus' },
  { label: 'View Contacts', icon: 'list' },
  { label: 'Favourites', icon: 'heart' },
  { label: 'Profile', icon: 'user' },
  { label: 'Logout', icon: 'logout' },
]

function Sidebar({ activeItem, onSelect }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`scm-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="scm-sidebar__header">
        <span className="scm-sidebar__title">Menu</span>
        <button
          className="btn btn-sm btn-ui"
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label="Toggle sidebar"
        >
          <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} />
        </button>
      </div>
      <nav className="scm-sidebar__nav">
        {navItems.map((item) => (
          <button
            className={`scm-sidebar__item${activeItem === item.label ? ' is-active' : ''}`}
            type="button"
            key={item.label}
            onClick={() => onSelect?.(item.label)}
          >
            <span className="scm-sidebar__icon">
              <Icon name={item.icon} />
            </span>
            <span className="scm-sidebar__label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
