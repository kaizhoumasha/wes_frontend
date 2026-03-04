import { alovaInstance } from 'alova'
import VueHook from 'alova/vue'
import adapter from 'alova/adapter/xhr'

export const apiClient = alovaInstance({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1',
  statesHook: VueHook,
  requestAdapter: adapter,
  timeout: 10000,

  beforeRequest(method) {
    const token = localStorage.getItem('access_token')
    if (token) {
      method.config.headers.Authorization = `Bearer ${token}`
    }
  },

  responded: {
    onSuccess: (response) => {
      const { code, data, message } = response.data
      if (code !== 1000) {
        throw new Error(message || '请求失败')
      }
      return data
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token')
        window.location.href = '/login'
      }
      throw error
    }
  }
})
