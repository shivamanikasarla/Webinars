import './WebinarDetail.css'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useLocation, useNavigate } from 'react-router-dom'

const WebinarDetail = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)

  useEffect(() => {
    // prefer location.state if available
    if (location.state && location.state.item) {
      setItem(location.state.item)
      return
    }
    try {
      const raw = sessionStorage.getItem(`webinar-${id}`)
      if (raw) setItem(JSON.parse(raw))
    } catch (err) {
      console.error(err)
    }
  }, [id, location.state])

  if (!item) {
    return (
      <div className="wd-container">
        <div className="wd-box">
          <p>Webinar not found.</p>
          <button className="btn" onClick={() => navigate('/webinars')}>Back</button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="wd-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="wd-box">
        <h2 className="wd-title">{item.title}</h2>
        {item.cover && <div className="wd-cover"><img src={item.cover} alt="cover" /></div>}
        <div className="wd-meta">
          {item.dateTime && <div className="wd-pill">📅 {new Date(item.dateTime).toLocaleString()}</div>}
          {item.type && <div className={`wd-pill type-${item.type}`}>{item.type.toUpperCase()}</div>}
          {item.memberLimit && <div className="wd-pill">👥 Limit: {item.memberLimit}</div>}
          <div className="wd-pill">⏳ {item.duration} min</div>
        </div>
        {item.notes && <div className="wd-notes"><h4>About this session</h4><p>{item.notes}</p></div>}
        <div className="wd-actions">
          <button className="btn secondary" onClick={() => navigate('/')}>&larr; Back to Webinars</button>
          <button className="btn primary" onClick={() => {
            try {
              const raw = sessionStorage.getItem(`webinar-${item.id}`)
              if (!raw) return alert('Item not found')
              const it = JSON.parse(raw)
              it.attendedCount = (it.attendedCount || 0) + 1
              sessionStorage.setItem(`webinar-${item.id}`, JSON.stringify(it))
              setItem(it)
              alert('Attendance recorded. Total: ' + it.attendedCount)
            } catch (err) { console.error(err) }
          }}>Record Attendance</button>
        </div>
      </div>
    </motion.div>
  )
}

export default WebinarDetail
