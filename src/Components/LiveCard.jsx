import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Webinars.css'

const LiveCard = ({ item }) => {
  const navigate = useNavigate()
  return (
    <motion.div
      className="class-item webinar-card"
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {item.cover && <div className="card-cover"><img src={item.cover} alt="cover" /></div>}
      <div style={{ padding: '10px' }}>
        <div className="ci-title">{item.title}</div>
        <div className="ci-time">{item.dateTime ? new Date(item.dateTime).toLocaleString() : 'No date'}</div>
        <div className="ci-notes">{item.notes && item.notes.slice(0, 120)}</div>
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 12, color: '#0f172a', fontWeight: 600 }}>Live</span>
            {item.memberLimit && <div style={{ fontSize: 12, color: '#64748b' }}>Limit: {item.memberLimit}</div>}
          </div>
          <button className="btn" onClick={() => navigate(`/webinar/${item.id}`, { state: { item } })}>View</button>
        </div>
      </div>
    </motion.div>
  )
}

export default LiveCard
