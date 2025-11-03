export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { path: '/user/login', component: './User/Login' },
      { path: '/user/register', component: './User/Register' },
    ],
  },
  { path: '/home', icon: 'smile', component: './Code/Home', name: '首页' },
  { path: '/chat/:appId', component: './Code/Chat', name: '应用对话', layout: false },
  { path: '/app/edit/:appId', component: './Code/AppEdit', name: '编辑应用', layout: false },
  {
    path: '/admin',
    icon: 'crown',
    name: '管理页',
    access: 'canAdmin',
    routes: [
      { path: '/admin', redirect: '/admin/user' },
      { icon: 'table', path: '/admin/user', component: './Admin/User', name: '用户管理' },
      { icon: 'table', path: '/admin/app', component: './Admin/App', name: '应用管理' },
      { icon: 'table', path: '/admin/chatHistory', component: './Admin/ChatHistory', name: '对话管理' },
    ],
  },
  { path: '/', redirect: '/home' },
  { path: '*', layout: false, component: './404' },
];
