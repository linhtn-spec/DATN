import { RouterProvider } from 'react-router-dom';
import ScrollToTop from 'react-scroll-to-top';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { router } from './routes/route';
import { UserProvider } from './store/user';

import { ConfigProvider } from 'antd';
import { themeColors } from './theme';

if (typeof document !== 'undefined') {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', themeColors.primary);
  root.style.setProperty('--secondary-color', themeColors.secondary);
  root.style.setProperty('--accent-color', themeColors.accent);
  root.style.setProperty('--bg-color', themeColors.background);
  root.style.setProperty('--text-color', themeColors.text);
  root.style.setProperty('--surface-color', themeColors.surface);
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: themeColors.primary,
          colorBgLayout: themeColors.background,
          colorBgContainer: themeColors.surface,
          colorText: themeColors.text,
          borderRadius: 12,
          fontFamily: '"Inter", sans-serif',
          colorError: '#EF4444',
          colorSuccess: '#10B981',
          colorWarning: '#F59E0B',
          colorInfo: '#3B82F6',
        },
        components: {
          Button: {
            controlHeight: 44,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
          Input: {
            controlHeight: 44,
          },
          Select: {
             controlHeight: 44,
          },
          Card: {
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            borderRadius: 16,
          }
        }
      }}
    >
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
          color={themeColors.primary}
        />
      </UserProvider>
    </ConfigProvider>
  )
}

export default App
