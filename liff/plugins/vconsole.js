import VConsole from 'vconsole'
const vConsole = process.env.NODE_ENV.trim() !== 'production' ? new VConsole() : ''
export default vConsole
