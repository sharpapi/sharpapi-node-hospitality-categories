![SharpAPI GitHub cover](https://sharpapi.com/sharpapi-github-php-bg.jpg "SharpAPI Node.js Client")

# Hospitality Product Categorization API for Node.js

## 🏨 Automatically categorize hospitality products with AI — powered by SharpAPI.

[![npm version](https://img.shields.io/npm/v/@sharpapi/sharpapi-node-hospitality-categories.svg)](https://www.npmjs.com/package/@sharpapi/sharpapi-node-hospitality-categories)
[![License](https://img.shields.io/npm/l/@sharpapi/sharpapi-node-hospitality-categories.svg)](https://github.com/sharpapi/sharpapi-node-client/blob/master/LICENSE.md)

**SharpAPI Hospitality Product Categorization** uses AI to automatically categorize hotels, resorts, vacation rentals, and other hospitality products based on their descriptions. Perfect for travel platforms, booking systems, and hospitality management tools.

---

## 📋 Table of Contents

1. [Requirements](#requirements)
2. [Installation](#installation)
3. [Usage](#usage)
4. [API Documentation](#api-documentation)
5. [Response Format](#response-format)
6. [Examples](#examples)
7. [License](#license)

---

## Requirements

- Node.js >= 16.x
- npm or yarn

---

## Installation

### Step 1. Install the package via npm:

```bash
npm install @sharpapi/sharpapi-node-hospitality-categories
```

### Step 2. Get your API key

Visit [SharpAPI.com](https://sharpapi.com/) to get your API key.

---

## Usage

```javascript
const { SharpApiHospitalityCategoriesService } = require('@sharpapi/sharpapi-node-hospitality-categories');

const apiKey = process.env.SHARP_API_KEY;
const service = new SharpApiHospitalityCategoriesService(apiKey);

const propertyDescription = `
Luxury beachfront resort with private villas, infinity pool, spa,
and fine dining restaurant. All-inclusive package available.
Perfect for romantic getaways and honeymoons.
`;

async function categorizeProperty() {
  try {
    const statusUrl = await service.categorizeProduct(propertyDescription);
    console.log('Job submitted. Status URL:', statusUrl);

    const result = await service.fetchResults(statusUrl);
    console.log('Categories:', result.getResultJson());
  } catch (error) {
    console.error('Error:', error.message);
  }
}

categorizeProperty();
```

---

## API Documentation

### Methods

#### `categorizeProduct(productDescription: string, maxCategories?: number): Promise<string>`

Categorizes a hospitality product based on its description.

**Parameters:**
- `productDescription` (string, required): The property/product description to categorize
- `maxCategories` (number, optional): Maximum number of categories to return (default: 5)

**Returns:**
- Promise<string>: Status URL for polling the job result

---

## Response Format

The API returns categories with relevance scores (weight: 0-10):

```json
{
  "categories": [
    {
      "name": "Luxury Beach Resort",
      "weight": 10,
      "subcategories": ["All-Inclusive", "Spa Resort", "Romantic Getaway"]
    },
    {
      "name": "Boutique Hotel",
      "weight": 7,
      "subcategories": ["Beachfront", "Adults Only"]
    },
    {
      "name": "Honeymoon Destination",
      "weight": 9,
      "subcategories": ["Romantic", "Luxury"]
    }
  ]
}
```

**Weight Scale:**
- `10`: Perfect match
- `8-9`: Highly relevant
- `6-7`: Moderately relevant
- `4-5`: Somewhat relevant
- `1-3`: Slightly relevant

---

## Examples

### Basic Categorization

```javascript
const { SharpApiHospitalityCategoriesService } = require('@sharpapi/sharpapi-node-hospitality-categories');

const service = new SharpApiHospitalityCategoriesService(process.env.SHARP_API_KEY);

const property = 'Budget-friendly city hotel near train station with free WiFi and breakfast';

service.categorizeProduct(property)
  .then(statusUrl => service.fetchResults(statusUrl))
  .then(result => {
    const categories = result.getResultJson();
    console.log('📂 Property Categories:');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (relevance: ${cat.weight}/10)`);
      if (cat.subcategories) {
        console.log(`   Subcategories: ${cat.subcategories.join(', ')}`);
      }
    });
  })
  .catch(error => console.error('Categorization failed:', error));
```

### Batch Property Categorization

```javascript
const service = new SharpApiHospitalityCategoriesService(process.env.SHARP_API_KEY);

const properties = [
  'Mountain ski lodge with heated pool and après-ski bar',
  'Downtown business hotel with conference facilities and gym',
  'Family-friendly resort with kids club and water park',
  'Historic boutique hotel in restored Victorian mansion'
];

async function categorizeAll(properties) {
  const categorized = await Promise.all(
    properties.map(async (property) => {
      const statusUrl = await service.categorizeProduct(property, 3);
      const result = await service.fetchResults(statusUrl);
      const categories = result.getResultJson();

      return {
        property,
        primary_category: categories[0]?.name,
        all_categories: categories.map(c => c.name)
      };
    })
  );

  return categorized;
}

const results = await categorizeAll(properties);
console.log('Categorized properties:', results);
```

### Travel Platform Integration

```javascript
const service = new SharpApiHospitalityCategoriesService(process.env.SHARP_API_KEY);

async function enrichPropertyListing(property) {
  const fullDescription = `
    ${property.name}
    ${property.description}
    Amenities: ${property.amenities.join(', ')}
    Location: ${property.location}
  `;

  const statusUrl = await service.categorizeProduct(fullDescription);
  const result = await service.fetchResults(statusUrl);
  const categories = result.getResultJson();

  // Get high-relevance categories
  const primaryCategories = categories
    .filter(cat => cat.weight >= 7)
    .map(cat => cat.name);

  // Extract tags from subcategories
  const tags = categories
    .flatMap(cat => cat.subcategories || [])
    .filter((tag, index, self) => self.indexOf(tag) === index);

  return {
    ...property,
    categories: primaryCategories,
    tags: tags,
    searchable_text: [...primaryCategories, ...tags].join(' '),
    categorization_confidence: categories[0]?.weight || 0
  };
}

const property = {
  id: 'PROP-12345',
  name: 'Seaside Paradise Resort',
  description: 'Luxury oceanfront resort with private beach',
  amenities: ['Pool', 'Spa', 'Restaurant', 'Bar'],
  location: 'Cancun, Mexico'
};

const enrichedProperty = await enrichPropertyListing(property);
console.log('Enriched listing:', enrichedProperty);
```

### Smart Search Filter Generation

```javascript
const service = new SharpApiHospitalityCategoriesService(process.env.SHARP_API_KEY);

async function generateSearchFilters(propertyDescriptions) {
  const allCategories = new Map();

  for (const description of propertyDescriptions) {
    const statusUrl = await service.categorizeProduct(description);
    const result = await service.fetchResults(statusUrl);
    const categories = result.getResultJson();

    categories.forEach(cat => {
      if (!allCategories.has(cat.name)) {
        allCategories.set(cat.name, 0);
      }
      allCategories.set(cat.name, allCategories.get(cat.name) + 1);
    });
  }

  // Convert to filter options
  const filters = Array.from(allCategories.entries())
    .map(([category, count]) => ({
      value: category.toLowerCase().replace(/\s+/g, '_'),
      label: category,
      count: count
    }))
    .sort((a, b) => b.count - a.count);

  return filters;
}

const sampleDescriptions = [
  'Beach resort with water sports...',
  'Mountain lodge with skiing...',
  'City hotel with conference rooms...'
];

const searchFilters = await generateSearchFilters(sampleDescriptions);
console.log('Available search filters:', searchFilters);
```

---

## Use Cases

- **Travel Booking Platforms**: Auto-categorize hotel listings
- **Property Management Systems**: Organize properties by type
- **Search & Discovery**: Enable filtered search by category
- **Content Management**: Tag and organize hospitality content
- **Recommendation Engines**: Match properties to user preferences
- **Market Analysis**: Analyze property types in portfolios
- **Inventory Management**: Classify accommodation inventory

---

## Hospitality Categories

The system recognizes various property types:

**Accommodation Types:**
- Luxury Hotels & Resorts
- Budget & Economy Hotels
- Boutique Hotels
- Business Hotels
- Extended Stay Hotels
- Vacation Rentals
- Bed & Breakfast
- Hostels

**Specialized Categories:**
- Beach Resorts
- Mountain Lodges
- Spa Resorts
- Golf Resorts
- All-Inclusive Resorts
- Family Resorts
- Adults-Only Properties
- Pet-Friendly Hotels

**Purpose-Based:**
- Romantic Getaways
- Business Travel
- Family Vacations
- Adventure Travel
- Wellness Retreats

---

## API Endpoint

**POST** `/tth/hospitality_product_categories`

For detailed API specifications, refer to:
- [Postman Documentation](https://documenter.getpostman.com/view/31106842/2sBXVeGsVg)
- [Product Page](https://sharpapi.com/en/catalog/ai/travel-tourism-hospitality/hospitality-product-categorization)

---

## Related Packages

- [@sharpapi/sharpapi-node-tours-activities-categories](https://www.npmjs.com/package/@sharpapi/sharpapi-node-tours-activities-categories) - Tours categorization
- [@sharpapi/sharpapi-node-travel-review-sentiment](https://www.npmjs.com/package/@sharpapi/sharpapi-node-travel-review-sentiment) - Review sentiment
- [@sharpapi/sharpapi-node-product-categories](https://www.npmjs.com/package/@sharpapi/sharpapi-node-product-categories) - General product categorization
- [@sharpapi/sharpapi-node-client](https://www.npmjs.com/package/@sharpapi/sharpapi-node-client) - Full SharpAPI SDK

---

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.

---

## Support

- **Documentation**: [SharpAPI.com Documentation](https://sharpapi.com/documentation)
- **Issues**: [GitHub Issues](https://github.com/sharpapi/sharpapi-node-client/issues)
- **Email**: contact@sharpapi.com

---

**Powered by [SharpAPI](https://sharpapi.com/) - AI-Powered API Workflow Automation**
