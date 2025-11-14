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

### Connecting to a Real API

The current implementation uses mock data for demonstration. To connect to a real accommodation API (Booking.com, Expedia, or other providers):

1. See the detailed guide in `API_INTEGRATION.md` for step-by-step instructions
2. Open `src/App.jsx`
3. Find the `handleSubmit` function (around line 27)
4. Replace the mock data section with your API call

For quick reference, the API should return data in this format:
```javascript
{
  results: [
    {
      id: 1,
      name: "Hotel Name",
      location: "City, Country",
      type: "Hotel",
      price: "$120/night",
      rating: 4.5,
      reviewCount: 234,
      description: "Hotel description",
      photo: "https://image-url.com/photo.jpg",
      url: "https://booking-link.com",
      reviews: [
        { author: "John D.", rating: 5, comment: "Great stay!" }
      ]
    }
  ]
}
```

## Project Structure

```
find-accommodation/
├── public/              # Static assets (add your beach photo here)
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles with Tailwind
├── index.html           # HTML template with SEO meta tags
├── API_INTEGRATION.md   # Guide for connecting to real APIs
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
