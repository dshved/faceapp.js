// Local Dependencies
const constants = require('./constants')

// Package Dependencies
const superagent = require('superagent')

/**
 * @typedef {Object} Filter
 * @property {string} id
 * @property {string} title
 * @property {boolean} cropped
 */

/**
 * @typedef {Object} AvailableFilters
 * @property {string} code
 * @property {string} deviceID
 * @property {Filter[]} filters
 */

/**
 * @param {string|Buffer} file Input File
 * @returns {Promise.<AvailableFilters>}
 */
const getAvailableFilters = async file => {
  let deviceID = constants.API_DEVICE_ID
  try {
    let res = await superagent.post(`${constants.API_BASE_URL}/api/v3.0/photos`)
      .set('User-Agent', constants.API_USER_AGENT)
      .set('X-FaceApp-DeviceID', deviceID)
      .attach('file', file, 'image.png')

    let code = res.body.code
    let filters = res.body.add_to
      .map(o => ({
        id: o.filter_id,
        title: o.filter_id,
      }))

    return { code, deviceID, filters }
  } catch (err) {
    throw err
  }
}

/**
 * @param {AvailableFilters} args Input Object
 * @param {string} filterID Filter ID
 * @returns {Promise.<Buffer>}
 */
const getFilterImage = async (args, filterID = 'no-filter') => {
  let url = `${constants.API_BASE_URL}/api/v3.0/photos/${args.code}/filters/${filterID}`

  try {
    let res = await superagent.get(url)
      .set('User-Agent', constants.API_USER_AGENT)
      .set('X-FaceApp-DeviceID', args.deviceID)

    return res.body
  } catch (err) {
    throw err
  }
}

/**
 * @param {string|Buffer} path Path to Image OR Image Buffer
 * @param {string} [filterID] Filter ID
 * @returns {Promise.<Buffer>}
 * @example
 * let image = await faceApp('./path/to/image.png', 'female_2')
 */
const process = async (path, filterID) => {
  try {
    let arg = await getAvailableFilters(path)
    let img = await getFilterImage(arg, filterID)
    return img
  } catch (err) {
    if (err.status === 400) {
      /**
       * @type {string}
       */
      let code = err.response.body.err.code || ''
      // Known Error Codes
      if (code === 'photo_no_faces') throw new Error('No Faces found in Photo')
      else if (code === 'bad_filter_id') throw new Error('Invalid Filter ID')
      else throw err
    } else {
      throw err
    }
  }
}

/**
 * Lists all available filters
 * @param {boolean} [minimal=false] Whether to only return an array of filter IDs (no extra metadata)
 * @returns {Promise.<Filter[]>|Promise.<string[]>}
 */
const listFilters = async (minimal = false) => {
  try {
    let res = await superagent.get(constants.TEST_IMAGE_URL)
    let allFilters = await getAvailableFilters(res.body)
    return minimal ? allFilters.filters.map(a => a.id) : allFilters.filters
  } catch (err) {
    throw err
  }
}

module.exports = {
  process,
  listFilters,
}
