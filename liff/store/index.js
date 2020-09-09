export const state = () => ({
  liff: undefined,
  login: false,
  overlay: {
    show: true,
    text: '載入中',
    opacity: 1.0
  },
  // role:
  // -2 = not inited
  // -1 = not member
  // 0 = boss
  // 1 = employee
  profile: {
    displayName: '',
    pictureUrl: '',
    statusMessage: '',
    userId: '',
    role: -2
  }
})

export const mutations = {
  initliff (state, data) {
    state.liff = data
  },
  login (state, data) {
    state.login = data
  },
  overlay (state, data) {
    state.overlay = data
  },
  profile (state, data) {
    state.profile = data
  }
}

export const getters = {
  liff (state) {
    return state.liff
  },
  login (state) {
    return state.login
  },
  overlay (state) {
    return state.overlay
  },
  profile (state) {
    return state.profile
  }
}

export const strict = false
