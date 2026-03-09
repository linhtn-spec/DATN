import { RouterProvider } from 'react-router-dom';
import ScrollToTop from 'react-scroll-to-top';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { router } from './routes/route';
import { UserProvider } from './store/user';

function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
      <ToastContainer
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" />
      <ScrollToTop
        smooth={true}
        width='15px'
        height='15px'
        style={{
          width: 30,
          height: 30,
          cursor: 'pointer',
        }}
        color={'rgb(146, 42, 141)'}
      />
    </UserProvider>
  )
}

export default App
