import { createAlova } from 'alova'
import VueHook from 'alova/vue'
import adapterFetch from 'alova/fetch'
import { env } from '@/config/env'

export const apiClient = createAlova({
  baseURL: env.apiBaseUrl,
  statesHook: VueHook,
  requestAdapter: adapterFetch(),
  timeout: 10000,

  beforeRequest(method) {
    const token = localStorage.getItem('access_token')
    if (token) {
      method.config.headers.Authorization = `Bearer ${token}`
    }
  },

  responded: {
    onSuccess: async (response) => {
      const json = await response.json()
      const { code, data, message } = json
      if (code !== 1000) {
        throw new Error(message || '请求失败')
      }
      return data
    },
    onError: (error) => {
      // 对于网络错误或 fetch 抛出的异常
      console.error('请求错误:', error)
      // 可以在这里处理 401 等特定错误
      // 注意: fetch adapter 的错误结构与 axios 不同
      throw error
    }
  }
})
