
import '../styles/components/MainFront.css'

export default function MainFront({ onGetStarted }) {
  return (
    <div className="hero">
      <p className="text-uppercase small text-muted mb-2">Smart Contact Manager</p>
      <h1 className="display-5 fw-semibold">Keep every connection organized and close.</h1>
      <p className="lead text-muted">
        Start by building your contact space. Next up: contacts list, detail view, and favorite
        highlights.
      </p>
      <div className="scm-mainfront-cta-wrap">
        <button
          id="scm-home-get-started-btn"
          className="scm-home-get-started-btn"
          type="button"
          onClick={() => onGetStarted?.()}
        >
          Get Started
          <span className="scm-home-get-started-btn__icon" aria-hidden="true">
            <svg
              height="24"
              width="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0h24v24H0z" fill="none"></path>
              <path
                d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                fill="currentColor"
              ></path>
            </svg>
          </span>
        </button>
      </div>
    </div>
  )
}
