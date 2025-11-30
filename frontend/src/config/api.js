import versionData from '../../../version.json'

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
export const FRONTEND_VERSION = versionData.version
