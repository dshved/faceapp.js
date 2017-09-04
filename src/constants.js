// Package Dependencies
const randomstring = require('randomstring')

/**
 * Generate a random Device ID
 * @returns {string}
 */
const generateDeviceID = () => randomstring.generate(16)

module.exports = {
  API_BASE_URL: 'https://node-03.faceapp.io',
  API_USER_AGENT: 'FaceApp/2.0.553 (Linux; Android 6.0)',
  generateDeviceID,
}
