import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChartSimple,
  faChevronLeft,
  faChevronRight,
  faHeart,
  faListUl,
  faPlus,
  faRightFromBracket,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import '../styles/components/Sidebar.css'

const navItems = [
  { label: 'Dashboard', icon: faChartSimple },
  { label: 'Add Contact', icon: faPlus },
  { label: 'View Contacts', icon: faListUl },
  { label: 'Favourites', icon: faHeart },
  { label: 'Profile', icon: faUser },
  { label: 'Logout', icon: faRightFromBracket },
]

function Sidebar({ activeItem, onSelect }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`scm-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="scm-sidebar__header">
        <span className="scm-sidebar__title">Menu</span>
        <button
          className="btn btn-sm btn-theme"
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label="Toggle sidebar"
        >
          <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
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
              <FontAwesomeIcon icon={item.icon} />
            </span>
            <span className="scm-sidebar__label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
