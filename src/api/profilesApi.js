// src/api/profilesApi.js
import axiosClient from './axiosClient'

// axiosClient already sets X-API-Version: 1 globally.
// These helpers are thin wrappers — keep them consistent.

export const getProfiles = (params = {}) =>
  axiosClient.get('/api/profiles', { params })

export const getProfileById = (id) =>
  axiosClient.get(`/api/profiles/${id}`)

export const searchProfiles = (params = {}) =>
  axiosClient.get('/api/profiles/search', { params })

export const createProfile = (name) =>
  axiosClient.post('/api/profiles', { name })

export const deleteProfile = (id) =>
  axiosClient.delete(`/api/profiles/${id}`)

export const exportProfiles = (params = {}) =>
  axiosClient.get('/api/profiles/export', {
    params: { format: 'csv', ...params },
    responseType: 'blob',
  })