import { useEffect, useState } from 'react'

function SidebarNav({ menuItems, activeSection, onSelect }) {
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const initialExpanded = {}

    menuItems.forEach((item) => {
      if (item.children?.length) {
        initialExpanded[item.key] = activeSection.startsWith(`${item.key}-`)
      }
    })

    return initialExpanded
  })

  useEffect(() => {
    const parentKey = activeSection.split('-')[0]

    setExpandedGroups((currentState) => {
      if (!Object.prototype.hasOwnProperty.call(currentState, parentKey)) {
        return currentState
      }

      if (currentState[parentKey]) {
        return currentState
      }

      return { ...currentState, [parentKey]: true }
    })
  }, [activeSection])

  const handleGroupClick = (item) => {
    setExpandedGroups((currentState) => ({
      ...currentState,
      [item.key]: !currentState[item.key],
    }))

    // If the group is opened from a different section, default to the first submenu option.
    if (item.children?.length && !activeSection.startsWith(`${item.key}-`)) {
      onSelect(item.children[0].key)
    }
  }

  return (
    <nav className="nav nav-pills flex-column gap-2 sidebar-nav">
      {menuItems.map((item) => {
        if (item.children?.length) {
          const isGroupActive = activeSection.startsWith(`${item.key}-`)
          const isExpanded = expandedGroups[item.key] ?? false
          const submenuId = `sidebarSubmenu-${item.key}`

          return (
            <div key={item.key} className="sidebar-submenu-group">
              <button
                type="button"
                className={`nav-link text-start d-flex align-items-center fw-medium py-2 sidebar-nav-button sidebar-nav-toggle-button ${
                  isGroupActive ? 'active' : 'link-body-emphasis'
                }`}
                onClick={() => handleGroupClick(item)}
                aria-expanded={isExpanded}
                aria-controls={submenuId}
              >
                <span className="d-flex align-items-center flex-grow-1">
                  <i className={`bi ${item.icon} me-2 menu-icon`} aria-hidden="true" />
                  {item.label}
                </span>
                <i
                  className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} sidebar-submenu-chevron`}
                  aria-hidden="true"
                />
              </button>

              {isExpanded && (
                <div id={submenuId} className="sidebar-submenu nav flex-column mt-1">
                  {item.children.map((child) => (
                    <button
                      key={child.key}
                      type="button"
                      className={`nav-link text-start d-flex align-items-center fw-medium py-2 sidebar-submenu-button ${
                        activeSection === child.key ? 'active' : 'link-body-emphasis'
                      }`}
                      onClick={() => onSelect(child.key)}
                    >
                      <i className={`bi ${child.icon} me-2 menu-icon`} aria-hidden="true" />
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        }

        return (
          <button
            key={item.key}
            type="button"
            className={`nav-link text-start d-flex align-items-center fw-medium py-2 sidebar-nav-button ${
              activeSection === item.key ? 'active' : 'link-body-emphasis'
            }`}
            onClick={() => onSelect(item.key)}
          >
            <i className={`bi ${item.icon} me-2 menu-icon`} aria-hidden="true" />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

export default SidebarNav
