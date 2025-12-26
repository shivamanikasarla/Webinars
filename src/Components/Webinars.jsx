import './Webinars.css'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import LiveCard from './LiveCard'
import UpcomingCard from './UpcomingCard'
import RecordedCard from './RecordedCard'

const Webinars = () => {
    const navigate = useNavigate()
    const [title, setTitle] = useState('')
    const [dateTime, setDateTime] = useState('')
    const [duration, setDuration] = useState(30)
    const [notes, setNotes] = useState('')
    const [cover, setCover] = useState(null)
    const [memberLimit, setMemberLimit] = useState(100)
    const [type, setType] = useState('upcoming')


    const [items, setItems] = useState([])
    const [filter, setFilter] = useState('all')

    const location = useLocation()

    useEffect(() => {
        loadItems()
    }, [])

    useEffect(() => {
        // pick up ?filter=live/upcoming/recorded if provided
        try {
            const params = new URLSearchParams(location.search)
            const f = params.get('filter') || params.get('type')
            if (f && ['live', 'upcoming', 'recorded', 'all'].includes(f)) setFilter(f)
        } catch (err) { }
    }, [location.search])

    const loadItems = () => {
        try {
            const keys = Object.keys(sessionStorage).filter(k => k.startsWith('webinar-'))
            const now = new Date()
            const data = keys.map(k => {
                const raw = sessionStorage.getItem(k)
                if (!raw) return null
                let parsed = JSON.parse(raw)

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
                return parsed
            }).filter(Boolean)
            // sort by dateTime if available
            data.sort((a, b) => (a.dateTime || '') > (b.dateTime || '') ? 1 : -1)
            setItems(data)
        } catch (err) { console.error(err) }
    }

    const handlePublish = (e) => {
        e && e.preventDefault()
        if (!title.trim()) { alert('Please enter a title'); return }
        const limit = parseInt(memberLimit, 10) || 0
        if (limit <= 0) { alert('Member limit must be a positive number'); return }

        // Automatic classification logic
        const now = new Date();
        const start = new Date(dateTime || Date.now()); // Default to now if empty, though input type=datetime-local usually handles it
        const durationMs = (parseInt(duration, 10) || 30) * 60 * 1000;
        const end = new Date(start.getTime() + durationMs);

        let autoType = 'upcoming';
        if (now >= start && now <= end) {
            autoType = 'live';
        } else if (now > end) {
            autoType = 'recorded';
        } else {
            autoType = 'upcoming';
        }

        const newItem = {
            id: Date.now().toString(),
            title,
            dateTime,
            duration,
            notes,
            cover,
            memberLimit: limit,
            attendedCount: 0,
            type: autoType
        };

        try {
            sessionStorage.setItem(`webinar-${newItem.id}`, JSON.stringify(newItem));
            window.dispatchEvent(new Event('webinar-added'));
        } catch (err) { console.error(err) }

        navigate('/');
    }

    const onCoverChange = (e) => {
        const f = e.target.files && e.target.files[0]
        if (f) setCover(URL.createObjectURL(f))
    }

    const visible = items.filter(i => filter === 'all' ? true : (i.type === filter))

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 }
    };

    return (
        <div className="create-page">
            <header className="create-header">
                <div className="left">
                    <button className="link-back" onClick={() => navigate(-1)}>&larr;</button>
                    <h2>Create a webinar</h2>
                </div>
                <div className="right">
                    <button className="btn publish" onClick={handlePublish}>Publish</button>
                </div>
            </header>

            <div className="create-container">
                <form className="create-form-main" onSubmit={handlePublish}>
                    <label className="field">
                        <div className="label">Webinar title *</div>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter webinar title" required />
                    </label>

                    <label className="field two">
                        <div className="label">Webinar date *</div>
                        <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
                    </label>

                    <label className="field two">
                        <div className="label">Webinar duration *</div>
                        <div className="duration-row">
                            <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} />
                            <span className="suffix">Minutes</span>
                        </div>
                    </label>

                    <label className="field">
                        <div className="label">Webinar description</div>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe the webinar" />
                    </label>

                    {/* Webinar type is chosen after publishing via modal */}

                    <label className="field two">
                        <div className="label">Member limit</div>
                        <input type="number" min="1" value={memberLimit} onChange={(e) => setMemberLimit(e.target.value)} />
                    </label>

                    <div className="form-actions-bottom">
                        <button type="submit" className="btn publish">Publish</button>
                    </div>
                </form>

                <aside className="create-sidebar">
                    <div className="upload-box">
                        <div className="upload-label">Upload cover Image</div>
                        <div className="upload-note">Cover size should be minimum 750x408 px</div>
                        <div className="upload-preview">
                            {cover ? <img src={cover} alt="cover" /> : <div className="placeholder">Preview</div>}
                        </div>
                        <label className="upload-button">
                            <input type="file" accept="image/*" onChange={onCoverChange} />
                            <span>Upload</span>
                        </label>
                    </div>
                </aside>
            </div>

            <section style={{ padding: '18px 28px' }}>

                <motion.div
                    className="webinar-cards"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {visible.length === 0 && <div className="empty">No webinars for this filter.</div>}
                    {visible.map(item => (
                        <motion.div key={item.id} style={{ minWidth: 280 }} variants={itemVariants}>
                            {item.type === 'live' && <LiveCard item={item} />}
                            {item.type === 'upcoming' && <UpcomingCard item={item} />}
                            {item.type === 'recorded' && <RecordedCard item={item} />}
                        </motion.div>
                    ))}
                </motion.div>
            </section>


        </div>
    )
}

export default Webinars