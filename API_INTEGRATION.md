# API Integration Guide

This guide explains how to integrate real accommodation APIs into the Find Your Accommodation website.

## Current Implementation

The website currently uses mock data that simulates a real API response. The mock data includes all required fields:
- `id`: Unique identifier
- `name`: Accommodation name
- `location`: Location string
- `type`: Accommodation type
- `price`: Price per night
- `rating`: Numeric rating (0-5)
- `reviewCount`: Number of reviews
- `description`: Description text
- `photo`: Image URL
- `url`: Booking link URL
- `reviews`: Array of review objects with `author`, `rating`, and `comment`

## API Options

### Option 1: RapidAPI - Hotel Booking APIs

Several hotel booking APIs are available on RapidAPI:

1. **Amadeus Hotel Search API**
   - Endpoint: `https://api.amadeus.com/v2/shopping/hotel-offers`
   - Requires: API key from Amadeus
   - Documentation: https://developers.amadeus.com/self-service/category/hotels

2. **Booking.com API (via RapidAPI)**
   - Search for "Booking.com" on RapidAPI marketplace
   - Requires: RapidAPI subscription
   - Note: Official Booking.com API requires partnership

3. **Expedia API (via RapidAPI)**
   - Search for "Expedia" on RapidAPI marketplace
   - Requires: RapidAPI subscription

### Option 2: Custom Backend Proxy

Since Booking.com and Expedia don't offer free public APIs, you can create a backend proxy:

1. Create a Node.js/Express backend
2. Use web scraping (with proper permissions) or affiliate APIs
3. Expose your own REST API endpoint
4. Connect your React app to your backend

### Option 3: Alternative Free APIs

1. **OpenTripMap API** (for attractions, can be adapted)
   - Free tier available
   - Documentation: https://opentripmap.io/docs

2. **Foursquare Places API**
   - Free tier available
   - Can find hotels and accommodations
   - Documentation: https://developer.foursquare.com/

## Integration Steps

### Step 1: Update the API Call

In `src/App.jsx`, find the `handleSubmit` function and replace the mock data section:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setSearched(true)
  setResults([])

  try {
    // Replace with your API endpoint
    const response = await fetch(
      `https://your-api-endpoint.com/search?` +
      `location=${encodeURIComponent(formData.location)}&` +
      `dateFrom=${formData.dateFrom}&` +
      `dateUntil=${formData.dateUntil}&` +
      `adults=${formData.adults}&` +
      `kids=${formData.kids}&` +
      `type=${formData.accommodationType}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add your API key here if required
          // 'Authorization': 'Bearer YOUR_API_KEY',
          // 'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
        }
      }
    )

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    
    // Transform API response to match expected format
    const transformedResults = data.results.map((item, index) => ({
      id: item.id || index + 1,
      name: item.name || item.hotelName,
      location: item.location || item.address || formData.location,
      type: item.type || formData.accommodationType,
      price: item.price || item.rate || `$${item.pricePerNight}/night`,
      rating: item.rating || item.starRating || 0,
      reviewCount: item.reviewCount || item.numberOfReviews || 0,
      description: item.description || item.overview || '',
      photo: item.photo || item.image || item.images?.[0] || '',
      url: item.url || item.bookingUrl || item.deepLink || '#',
      reviews: item.reviews || []
    }))

    setResults(transformedResults.slice(0, 5)) // Limit to 5 results
  } catch (error) {
    console.error('Error fetching accommodations:', error)
    setResults([])
  } finally {
    setLoading(false)
  }
}
```

### Step 2: Environment Variables

For API keys, use environment variables:

1. Create a `.env` file in the root directory:
```
VITE_API_KEY=your_api_key_here
VITE_API_URL=https://your-api-endpoint.com
```

2. Update your API call to use environment variables:
```javascript
const apiKey = import.meta.env.VITE_API_KEY
const apiUrl = import.meta.env.VITE_API_URL
```

3. Add `.env` to `.gitignore` to keep your keys secure

### Step 3: Error Handling

The current implementation includes basic error handling. You may want to add:
- User-friendly error messages
- Retry logic for failed requests
- Rate limiting handling
- Network error detection

### Step 4: Testing

Test your API integration with:
- Valid search queries
- Invalid locations
- Date ranges
- Different accommodation types
- Network failures

## Example: Amadeus API Integration

```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setSearched(true)
  setResults([])

  try {
    // First, get an access token (Amadeus requires OAuth)
    const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: import.meta.env.VITE_AMADEUS_CLIENT_ID,
        client_secret: import.meta.env.VITE_AMADEUS_CLIENT_SECRET,
      })
    })

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Then search for hotels
    const searchResponse = await fetch(
      `https://test.api.amadeus.com/v2/shopping/hotel-offers?` +
      `cityCode=${getCityCode(formData.location)}&` +
      `checkInDate=${formData.dateFrom}&` +
      `checkOutDate=${formData.dateUntil}&` +
      `adults=${formData.adults}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    )

    const searchData = await searchResponse.json()
    // Transform and set results...
  } catch (error) {
    console.error('Error:', error)
  } finally {
    setLoading(false)
  }
}
```

## Security Considerations

1. **Never expose API keys in client-side code** - Use environment variables
2. **Use HTTPS only** - All API calls should be over HTTPS
3. **Implement CORS properly** - If using a backend proxy
4. **Rate limiting** - Respect API rate limits
5. **Input validation** - Validate all user inputs before sending to API

## Support

For API-specific questions, refer to:
- API provider documentation
- RapidAPI support (if using RapidAPI)
- Your backend team (if using custom proxy)

