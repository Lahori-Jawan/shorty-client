import Vue from 'vue';
import Vuex from 'vuex';
import { axios } from '@/config/axios';
import { TokenService } from '@/services/Token';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    loading: null,
    user: null,
    notification: {
      message: '',
      type: '',
    },
    urls: [],
    isModalActive: false,
  },

  getters: {
    isLoggedIn: (state) => !!state.user,
    purchasedUrls: (state) => (state.user ? state.user.purchased : []),
    isModalChanged: (state) =>
      Boolean(state.notification.message.trim().length),
    activeDomain: (state, getters) =>
      getters.purchasedUrls.find((url) => url.active) || {
        domain: state.user.default,
      },
  },

  mutations: {
    SET_USER(state, data) {
      state.user = data;
    },
    SET_NOTIFICATION(state, { message, type = 'SUCCESS' }) {
      state.notification.message = message;
      state.notification.type = type;
      // state.isModalActive = Boolean(message.length);
    },
    SET_URLS(state, urls) {
      state.urls = urls;
    },
    UPDATE_URLS(state, url) {
      state.urls.push(url);
    },
    TOGGLE_MODAL(state) {
      state.isModalActive = !state.isModalActive;
    },
    RESET_STATE(state) {
      state.user = null;
      state.urls = [];
      state.notification = { message: '', type: '' };
      state.isModalActive = false;
      // state.loading = false;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
  },

  actions: {
    async Register({ commit }, credentials) {
      commit('SET_LOADING', true);
      try {
        const { message, user } = (
          await axios.post('/auth/register', { ...credentials })
        ).data;
        console.log({ user });
        commit('SET_USER', user);
        commit('SET_NOTIFICATION', { message });
        TokenService.setToken(user.accessToken);
      } catch (error) {
        console.log('error @Register', error);
        commit('SET_NOTIFICATION', {
          message: error.data.message || 'Something bad happened',
          type: 'ERROR',
        });
      }
      commit('SET_LOADING', false);
    },
    async Login({ commit }, credentials) {
      commit('SET_LOADING', true);
      try {
        const { message, user } = (
          await axios.post('/auth/login', { ...credentials })
        ).data;
        commit('SET_USER', user);
        commit('SET_NOTIFICATION', { message });
        TokenService.setToken(user.accessToken);
      } catch (error) {
        console.log('error', error);
        commit('SET_NOTIFICATION', {
          message: error.data.message || 'Something bad happened',
          type: 'ERROR',
        });
      }
      commit('SET_LOADING', false);
    },
    async Logout({ commit }, message = '') {
      commit('SET_LOADING', true);
      try {
        // await axios.post('/api/auth/logout');
        TokenService.clearStorage();
        commit('RESET_STATE');
        commit('SET_NOTIFICATION', { message });
      } catch (error) {
        console.log('logout error', error);
        commit('SET_NOTIFICATION', {
          message: error.data.message || 'Something bad happened',
          type: 'ERROR',
        });
      }
      commit('SET_LOADING', false);
    },
    async GetUser({ commit }) {
      commit('SET_LOADING', true);
      try {
        const { data } = await axios.get('/api/users/user');
        const { message, user } = data;
        console.log({ user, message });
        commit('SET_USER', user);
        TokenService.setToken(user.accessToken);
      } catch (error) {
        console.log('error @GetUser', error);
        commit('RESET_STATE');

        if (error && error.status == 403) return;

        commit('SET_NOTIFICATION', {
          message: error.data.message || 'Something bad happened',
          type: 'ERROR',
        });
        TokenService.clearStorage();
        commit('SET_LOADING', false);
      }
      commit('SET_LOADING', false);
    },
    async GetUrls({ commit }) {
      try {
        const { data } = await axios.get('/api/users/urls');
        const { urls } = data;
        console.log({ urls });
        commit('SET_URLS', urls);
      } catch (error) {
        console.log('error @GetUrls', error);

        if (error.status == 403) return;

        commit('SET_NOTIFICATION', {
          message: error.data.message || 'Something bad happened',
          type: 'ERROR',
        });
      }
    },
    async GenerateShortUrl({ commit }, originalURL) {
      commit('SET_LOADING', true);
      try {
        const { data } = await axios.post('/api/users/shorten-url', {
          url: originalURL,
        });
        const { message, url } = data;
        commit('UPDATE_URLS', url);
        commit('SET_NOTIFICATION', { message });
        commit('TOGGLE_MODAL');
      } catch (error) {
        console.log('error', error);

        if (error.status == 403) return;

        commit('SET_NOTIFICATION', {
          message: error.data.message || 'Something bad happened',
          type: 'ERROR',
        });
      }
      commit('SET_LOADING', false);
    },
    async SetActiveDomain({ commit }, domainId) {
      commit('SET_LOADING', true);
      try {
        const { data } = await axios.post('/api/users/set-active-domain', {
          domainId,
        });
        const { message, user } = data;
        commit('SET_USER', user);
        commit('SET_NOTIFICATION', { message });
        TokenService.setToken(user.accessToken);
      } catch (error) {
        console.log('error', error);

        if (error.status == 403) return;

        commit('SET_NOTIFICATION', {
          message: error.data.message || 'Something bad happened',
          type: 'ERROR',
        });
      }
      commit('SET_LOADING', false);
    },
    async PurchaseDomain({ commit }, domains) {
      commit('SET_LOADING', true);
      try {
        const { data } = await axios.post('/api/users/purchase', {
          domains,
        });
        const { message, user } = data;
        commit('SET_USER', user);
        commit('SET_NOTIFICATION', { message });
        // commit('TOGGLE_MODAL');
      } catch (error) {
        console.log('error', error);

        if (error.status == 403) return;

        commit('SET_NOTIFICATION', {
          message: error.data.message || 'Something bad happened',
          type: 'ERROR',
        });
      }
      commit('SET_LOADING', false);
    },
  },

  modules: {},
});

export default store;
