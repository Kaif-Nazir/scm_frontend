import { createContext, useContext } from 'react'

const AppNavContext = createContext({
  activeItem: 'Dashboard',
  setActiveItem: () => {},
  navAction: null,
  setNavAction: () => {},
})

export function useAppNav() {
  return useContext(AppNavContext)
}

export default AppNavContext
