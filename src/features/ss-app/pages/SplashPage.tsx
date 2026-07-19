import type { ThemeMode } from '../app/App'
import type { UserSession } from '../services/auth'
import { MoonIcon, SunIcon } from '../components/icons/NavigationIcons'

type SplashPageProps = {
  authError: string | null
  isSigningIn: boolean
  onGetStarted: () => void
  onSignIn: () => Promise<void>
  onToggleTheme: () => void
  session: UserSession | null
  theme: ThemeMode
}

export function SplashPage({
  authError,
  isSigningIn,
  onGetStarted,
  onSignIn,
  onToggleTheme,
  session,
  theme,
}: SplashPageProps) {
  return (
    <main className="app-shell splash-shell">
      <button
        type="button"
        className="theme-toggle floating-theme-toggle"
        onClick={onToggleTheme}
      >
        {theme === 'light' ? (
          <MoonIcon className="theme-icon" />
        ) : (
          <SunIcon className="theme-icon" />
        )}
        {/* {theme === 'light' ? 'Dark' : 'Light'} */}
      </button>

      <section className="splash-card">
        <p className="eyebrow">ss.ai workspace</p>
        <h1>Start with a clean screenshot workspace.</h1>
        <p className="splash-subtitle">
          Capture, organize, and search screenshots from Cloud, Telegram, and
          Local Storage — all in one place.
        </p>
        <div className="splash-actions">
          <button
            type="button"
            className="primary-button"
            disabled={isSigningIn}
            onClick={session ? onGetStarted : onSignIn}
          >
            {session
              ? 'Open dashboard'
              : isSigningIn
                ? 'Connecting...'
                : 'Sign in with Google'}
          </button>
          <button type="button" className="secondary-button" onClick={onGetStarted}>
            Continue without sign-in
          </button>
        </div>
        {authError ? <p className="status-message error">{authError}</p> : null}
      </section>
    </main>
  )
}
