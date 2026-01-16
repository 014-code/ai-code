import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import BasicLayout from '@/layouts/BasicLayout';

const Home = lazy(() => import('@/pages/Code/Home'));
const Cases = lazy(() => import('@/pages/Code/Cases'));
const ForumList = lazy(() => import('@/pages/Forum/List'));
const ForumPublish = lazy(() => import('@/pages/Forum/Publish'));
const ForumDetail = lazy(() => import('@/pages/Forum/Detail'));
const AccountCenter = lazy(() => import('@/pages/Account/Center'));
const Chat = lazy(() => import('@/pages/Code/Chat'));
const AppEdit = lazy(() => import('@/pages/Code/AppEdit'));
const UserLogin = lazy(() => import('@/pages/User/Login'));
const UserRegister = lazy(() => import('@/pages/User/Register'));
const UserProfile = lazy(() => import('@/pages/User/Profile'));
const NotFound = lazy(() => import('@/pages/404/index'));

const AdminUser = lazy(() => import('@/pages/Admin/User'));
const AdminApp = lazy(() => import('@/pages/Admin/App'));
const AdminChatHistory = lazy(() => import('@/pages/Admin/ChatHistory'));

const SpaceList = lazy(() => import('@/pages/Space/List'));
const SpaceDetail = lazy(() => import('@/pages/Space/Detail'));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
);

const router = createBrowserRouter([
  {
    path: '/user',
    children: [
      { path: 'login', element: <Suspense fallback={<LoadingFallback />}><UserLogin /></Suspense> },
      { path: 'register', element: <Suspense fallback={<LoadingFallback />}><UserRegister /></Suspense> },
      { path: 'profile/:userId', element: <Suspense fallback={<LoadingFallback />}><UserProfile /></Suspense> },
    ],
  },
  {
    element: <BasicLayout />,
    children: [
      { index: true, element: <Suspense fallback={<LoadingFallback />}><Home /></Suspense> },
      { path: 'home', element: <Suspense fallback={<LoadingFallback />}><Home /></Suspense> },
      { path: 'space', element: <Suspense fallback={<LoadingFallback />}><SpaceList /></Suspense> },
      { path: 'cases', element: <Suspense fallback={<LoadingFallback />}><Cases /></Suspense> },
      { path: 'forum', element: <Suspense fallback={<LoadingFallback />}><ForumList /></Suspense> },
      {
        path: 'admin',
        children: [
          { index: true, element: <Suspense fallback={<LoadingFallback />}><AdminUser /></Suspense> },
          { path: 'user', element: <Suspense fallback={<LoadingFallback />}><AdminUser /></Suspense> },
          { path: 'app', element: <Suspense fallback={<LoadingFallback />}><AdminApp /></Suspense> },
          { path: 'chatHistory', element: <Suspense fallback={<LoadingFallback />}><AdminChatHistory /></Suspense> },
        ],
      },
    ],
  },
  { path: '/forum/publish', element: <Suspense fallback={<LoadingFallback />}><ForumPublish /></Suspense> },
  { path: '/forum/detail/:id', element: <Suspense fallback={<LoadingFallback />}><ForumDetail /></Suspense> },
  { path: '/space/:id', element: <Suspense fallback={<LoadingFallback />}><SpaceDetail /></Suspense> },
  { path: '/account/center', element: <Suspense fallback={<LoadingFallback />}><AccountCenter /></Suspense> },
  { path: '/chat/:appId', element: <Suspense fallback={<LoadingFallback />}><Chat /></Suspense> },
  { path: '/app/edit/:appId', element: <Suspense fallback={<LoadingFallback />}><AppEdit /></Suspense> },
  { path: '*', element: <Suspense fallback={<LoadingFallback />}><NotFound /></Suspense> },
]);

export default router;