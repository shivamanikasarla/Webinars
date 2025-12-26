
import './App.css'
import Webinars from './Components/Webinars'
import WebinarDetail from './Components/WebinarDetail'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import FirstPage from './Components/FirstPage';
import AnimatedRoutes from './Components/AnimatedRoutes';
import { BrowserRouter } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
