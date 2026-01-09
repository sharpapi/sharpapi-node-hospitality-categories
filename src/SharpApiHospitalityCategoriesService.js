const { SharpApiCoreService, SharpApiJobTypeEnum } = require('@sharpapi/sharpapi-node-core');

/**
 * Service for generating hospitality product categories using SharpAPI.com
 */
class SharpApiHospitalityCategoriesService extends SharpApiCoreService {
  /**
   * Creates a new SharpApiHospitalityCategoriesService instance
   * @param {string} apiKey - Your SharpAPI API key
   * @param {string} [apiBaseUrl='https://sharpapi.com/api/v1'] - API base URL
   */
  constructor(apiKey, apiBaseUrl = 'https://sharpapi.com/api/v1') {
    super(apiKey, apiBaseUrl, '@sharpapi/sharpapi-node-hospitality-categories/1.0.1');
  }

  /**
   * Generates a list of suitable categories for the Hospitality type product
   * with relevance weights as float value (1.0-10.0) where 10 equals 100%, the highest relevance score.
   * Provide the product name and its parameters to get the best category matches possible.
   * Comes in handy with populating products catalogs data and bulk products' processing.
   *
   * @param {string} productName
   * @param {string|null} city
   * @param {string|null} country
   * @param {string|null} language
   * @param {number|null} maxQuantity
   * @param {string|null} voiceTone
   * @param {string|null} context
   * @returns {Promise<string>} - The status URL.
   */
  async hospitalityProductCategories(productName, city = null, country = null, language = null, maxQuantity = null, voiceTone = null, context = null) {
    const data = { content: productName };
    if (city) data.city = city;
    if (country) data.country = country;
    if (language) data.language = language;
    if (maxQuantity) data.max_quantity = maxQuantity;
    if (voiceTone) data.voice_tone = voiceTone;
    if (context) data.context = context;

    const response = await this.makeRequest('POST', SharpApiJobTypeEnum.TTH_HOSPITALITY_PRODUCT_CATEGORIES.url, data);
    return this.parseStatusUrl(response);
  }
}

module.exports = { SharpApiHospitalityCategoriesService };