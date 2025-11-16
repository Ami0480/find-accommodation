# Find Your Accommodation

A beautiful, responsive one-page accommodation search website built with React, Tailwind CSS, and modern web technologies.

## Features

- 🏖️ Beautiful full-page beach background image
- 🔍 Comprehensive search form with location, date range (from/until), people, and accommodation type filters
- 📸 Rich results display with photos, linked URLs, and customer reviews
- ✨ Smooth loading animations with airplane, car, and train icons
- 📱 Fully responsive design for mobile and desktop
- ♿ Accessible and SEO-friendly
- 🔒 Secure HTTPS-only requests
- 🎨 Clean flex layout with equal-width sections

## Technologies Used

- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Google Fonts** - Caveat Brush and Lato fonts

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Adding Your Beach Photo

To replace the background image with your own beach photo:

1. Place your beach photo in the `public` folder (e.g., `public/beach-background.jpg`)
2. Open `src/App.jsx`
3. Find the line with `backgroundImageUrl` (around line 16)
4. Replace the URL with your image path:
```javascript
const backgroundImageUrl = '/beach-background.jpg'
```

Alternatively, you can use an external image URL (ensure it's served over HTTPS).

### Connecting to StayAPI (Production)

The website uses Netlify serverless functions to securely handle API calls. **API keys are never exposed in the frontend code.**

StayAPI provides comprehensive hotel data including real images, reviews, prices, and booking URLs.

#### Quick Setup:

1. **Get StayAPI credentials** from [stayapi.com](https://stayapi.com/)
   - Sign up for a free account
   - Get your API key from the dashboard

2. **Deploy to Netlify:**
   - Push your code to GitHub
   - Connect repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

3. **Add Environment Variables in Netlify:**
   - Go to Site settings → Environment variables
   - Add `STAYAPI_KEY` with your API key
   - Redeploy your site

4. **See `NETLIFY_SETUP.md` for detailed instructions**

#### Local Development:

1. Create a `.env` file in the root directory:
```bash
STAYAPI_KEY=your_stayapi_key_here
```

2. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

3. Run with Netlify Dev:
```bash
netlify dev
```

This starts both the Vite dev server and Netlify Functions locally.

#### API Response Format:

The serverless function returns data in this format:
```javascript
{
  results: [
    {
      id: "hotel-id",
      name: "Hotel Name",
      location: "City Code",
      type: "Hotel",
      price: "$120",
      rating: 4.5,
      reviewCount: 234,
      description: "Hotel description",
      photo: "https://image-url.com/photo.jpg",
      url: "https://booking-link.com",
      reviews: [
        { author: "Guest", rating: 5, comment: "Great stay!" }
      ]
    }
  ]
}
```

## Project Structure

```
find-accommodation/
├── netlify/
│   └── functions/
│       └── search-accommodations.js  # Serverless function for API calls
├── public/              # Static assets (add your beach photo here)
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles with Tailwind
├── index.html           # HTML template with SEO meta tags
├── netlify.toml         # Netlify configuration
├── API_INTEGRATION.md   # Guide for connecting to real APIs
├── NETLIFY_SETUP.md     # Detailed Netlify deployment guide
└── tailwind.config.js
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder, ready for deployment.

## Features Breakdown

### Search Form
- **Location**: Text input for destination
- **Date From**: Date picker for check-in date (minimum date is today)
- **Date Until**: Date picker for check-out date (must be after check-in)
- **Adults**: Number input for adult guests
- **Kids**: Number input for children
- **Accommodation Type**: Dropdown with options (Hotel, Airbnb, Cabin, Campsite)

### Layout
- **Container**: 800px max-width, white background, 16px border-radius, centered
- **Flex Layout**: Title/paragraph on left, search form on right, equal width (50/50 split)
- **Responsive**: Stacks vertically on mobile, side-by-side on desktop

### Results Display
- Shows up to 5 accommodation results
- Each result displays:
  - **Photo**: High-quality accommodation image
  - **Name and Price**: Prominent display
  - **Type and Location**: Category and destination
  - **Description**: Property overview
  - **Rating**: Star rating with review count
  - **Reviews**: Recent customer reviews with ratings
  - **Book Now Link**: Direct link to booking site (opens in new tab)

### Loading Animation
- Animated icons (✈️ 🚗 🚆) with bounce effect
- Staggered animation delays for visual appeal

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for personal and commercial use.
