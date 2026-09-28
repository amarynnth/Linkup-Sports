import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { IdentityProvider } from './context/IdentityContext'
import { SessionsProvider } from './context/SessionsContext'
import { FriendsProvider } from './context/FriendsContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { FavoritesProvider } from './context/FavoritesContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <IdentityProvider>
        <SessionsProvider>
          <FriendsProvider>
            <NotificationsProvider>
              <FavoritesProvider>
                <App />
              </FavoritesProvider>
            </NotificationsProvider>
          </FriendsProvider>
        </SessionsProvider>
      </IdentityProvider>
    </HashRouter>
  </StrictMode>,
)
