import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';
import NotFound from '@/views/NotFound';
import store from '@/store';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/auth/login',
    name: 'Login',
    component: () =>
      import(/* webpackChunkName: "about" */ '@/views/Auth/Login.vue'),
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () =>
      import(/* webpackChunkName: "about" */ '@/views/Auth/Register.vue'),
  },
  {
    path: '*',
    name: 'Not-Found',
    component: NotFound,
  },
];

const router = new VueRouter({
  routes,
});

router.beforeEach((to, from, next) => {
  const page = to.name;
  const publicPages = ['Login', 'Register', 'Not-Found'];
  const authRequired = !publicPages.includes(page);
  const loggedIn = store.getters.isLoggedIn;

  if (loggedIn && (page === 'Login' || page === 'Register'))
    return next({ replace: true, name: from.name });
  console.log('before', authRequired, loggedIn);
  if (authRequired && !loggedIn) return next({ replace: true, name: 'Login' });

  next();
});

export default router;
