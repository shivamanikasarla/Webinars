import './FirstPage.css'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import LiveCard from './LiveCard'
import UpcomingCard from './UpcomingCard'
import RecordedCard from './RecordedCard'

const FirstPage = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [activeFilter, setActiveFilter] = useState('upcoming') // Default filter
  const [counts, setCounts] = useState({ live: 0, upcoming: 0, recorded: 0 })
  const [loadError, setLoadError] = useState(null)
  const location = useLocation()

  const loadData = () => {
    try {
      setLoadError(null)
      const keys = Object.keys(sessionStorage).filter(k => k.startsWith('webinar-'))
      const loadedItems = []
      const now = new Date()

      keys.forEach(k => {
        try {
          const raw = sessionStorage.getItem(k)
          if (!raw) return
          let parsed = JSON.parse(raw)
          if (parsed) {
            // Re-eval status
            if (parsed.dateTime && parsed.duration) {
              const start = new Date(parsed.dateTime)
              const durationMs = (parseInt(parsed.duration, 10) || 30) * 60 * 1000
              const end = new Date(start.getTime() + durationMs)
              let newType = 'upcoming'
              if (now >= start && now <= end) newType = 'live'
              else if (now > end) newType = 'recorded'

              if (parsed.type !== newType) {
                parsed.type = newType
                sessionStorage.setItem(k, JSON.stringify(parsed))
              }
            }
            loadedItems.push(parsed)
          }
        } catch (e) {
          console.warn('FirstPage: skipping invalid webinar key', k, e)
        }
      })

      // Sort by date/time
      loadedItems.sort((a, b) => (a.dateTime || '') > (b.dateTime || '') ? 1 : -1)
      setItems(loadedItems)

      const grouped = { live: 0, upcoming: 0, recorded: 0 }
      loadedItems.forEach(d => {
        const t = d.type || 'upcoming'
        if (grouped[t] !== undefined) grouped[t]++
      })

      setCounts(grouped)

      // If current filter has no items but others do, maybe switch? (Optional UX improvement, keeping simple for now)

    } catch (err) {
      setLoadError(err.message || String(err))
    }
  }

  useEffect(() => {
    loadData()
    const handler = () => loadData()
    window.addEventListener('webinar-added', handler)
    return () => window.removeEventListener('webinar-added', handler)
  }, [location.pathname])

  const hasAny = counts.live + counts.upcoming + counts.recorded > 0

  return (
    <div className="firstpage-container">

      {/* ===== TOP NAVBAR (ONLY NEW PART) ===== */}
      <nav className="navbar navbar-light bg-white border-bottom">
        <div className="container-fluid px-4">
          <span className="navbar-brand mb-0 h6 fw-semibold text-dark">
            Webinars
          </span>

          <button
            className="btn btn-theme btn-sm"
            onClick={() => navigate('/webinars?create=1')}
          >
            + Create
          </button>
        </div>
      </nav>

      {/* ===== EXISTING CONTENT (UNCHANGED) ===== */}
      <div className="fp-box">
        <main className="fp-main">

          {loadError && (
            <div style={{ background: '#fee', color: '#601', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              Error loading webinars: {loadError}
            </div>
          )}

          {!hasAny ? (
            <>
              <h1 className="fp-heading">Your trusted lead generator</h1>

              <div className="fp-features">
                <div className="fp-feature">
                  <span className="fp-icon"></span>
                  <div>
                    <h4>Host free webinars to expand your lead pool</h4>
                    <p>Your go-to traction channel to collect the maximum number of leads</p>
                  </div>
                </div>

                <div className="fp-feature">
                  <span className="fp-icon"></span>
                  <div>
                    <h4>Find your best leads with paid webinars</h4>
                    <p>Easily double down on your ROI maximizing leads</p>
                  </div>
                </div>

                <div className="fp-feature">
                  <span className="fp-icon"></span>
                  <div>
                    <h4>Instantly accessible webinar recordings</h4>
                    <p>Your content is always repurposable and up for sale</p>
                  </div>
                </div>
              </div>

              <button
                className="primary-btn fp-cta"
                onClick={() => navigate('/webinars?create=1&type=live')}
              >
                + Create your webinar
              </button>
            </>
          ) : (
            <div className="fp-dashboard">
              <h1 className="fp-heading" style={{ marginBottom: 32 }}>Your Webinars</h1>

              <div className="fp-filter-bar">
                {['live', 'upcoming', 'recorded'].map(type => (
                  <button
                    key={type}
                    className={`fp-filter-btn ${activeFilter === type ? 'active' : ''}`}
                    onClick={() => setActiveFilter(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                    <span className="fp-filter-count">({counts[type]})</span>
                  </button>
                ))}
              </div>

              <div className="fp-content-area">
                {items.filter(i => i.type === activeFilter).length === 0 ? (
                  <div className="fp-empty-state">
                    <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
                    <div>No {activeFilter} webinars found</div>
                    <button className="secondary-btn" style={{ marginTop: 16 }} onClick={() => navigate('/webinars?create=1')}>Schedule a Webinar</button>
                  </div>
                ) : (
                  <div className="fp-cards-grid">
                    {items.filter(i => i.type === activeFilter).map(item => (
                      <div key={item.id} className="fp-list-item-wrapper">
                        {item.type === 'live' && <LiveCard item={item} />}
                        {item.type === 'upcoming' && <UpcomingCard item={item} />}
                        {item.type === 'recorded' && <RecordedCard item={item} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}


        </main>
      </div>
    </div>
  )
}

export default FirstPage
