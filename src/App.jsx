import { useState } from "react";
import airplaneIcon from "./assets/airplane.svg";
import carIcon from "./assets/car.svg";
import trainIcon from "./assets/train.svg";

function App() {
  const [formData, setFormData] = useState({
    location: "",
    dateFrom: "",
    dateUntil: "",
    adults: 1,
    kids: 0,
    childAges: [],
    accommodationType: "Hotel",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Background image - replace with your beach photo path
  const backgroundImageUrl =
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80";

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "kids") {
      const numKids = parseInt(value) || 0;
      setFormData((prev) => ({
        ...prev,
        kids: numKids,
        // Resize childAges array to match number of children
        childAges: Array.from(
          { length: numKids },
          (_, i) => prev.childAges[i] || 0
        ),
      }));
    } else if (name.startsWith("childAge-")) {
      // Handle individual child age change
      const index = parseInt(name.split("-")[1]);
      const age = parseInt(value) || 0;
      setFormData((prev) => ({
        ...prev,
        childAges: prev.childAges.map((a, i) => (i === index ? age : a)),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "adults" ? parseInt(value) || 0 : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
      // API Integration
      // Replace this section with your actual API endpoint
      // Example for Booking.com/Expedia would require API keys
      // For now, using enhanced mock data that simulates real API response

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Enhanced mock accommodation data with photos, URLs, and reviews
      const mockResults = [
        {
          id: 1,
          name: "Oceanview Resort",
          location: formData.location || "Beachside",
          type: formData.accommodationType,
          price: "$120/night",
          rating: 4.5,
          reviewCount: 234,
          description: "Beautiful oceanfront property with stunning views",
          photo:
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
          url: "https://booking.com/hotel/oceanview-resort",
          reviews: [
            {
              author: "Sarah M.",
              rating: 5,
              comment: "Amazing views and excellent service!",
            },
            {
              author: "John D.",
              rating: 4,
              comment: "Great location, very clean and comfortable.",
            },
          ],
        },
        {
          id: 2,
          name: "Coastal Paradise Hotel",
          location: formData.location || "Beachside",
          type: formData.accommodationType,
          price: "$95/night",
          rating: 4.3,
          reviewCount: 189,
          description: "Comfortable stay near the beach with modern amenities",
          photo:
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
          url: "https://expedia.com/hotel/coastal-paradise",
          reviews: [
            {
              author: "Emma L.",
              rating: 5,
              comment: "Perfect for families, kids loved it!",
            },
            {
              author: "Mike T.",
              rating: 4,
              comment: "Good value for money, nice pool area.",
            },
          ],
        },
        {
          id: 3,
          name: "Sunset Beach Lodge",
          location: formData.location || "Beachside",
          type: formData.accommodationType,
          price: "$110/night",
          rating: 4.7,
          reviewCount: 312,
          description: "Charming lodge with easy beach access",
          photo:
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
          url: "https://booking.com/hotel/sunset-beach-lodge",
          reviews: [
            {
              author: "Lisa K.",
              rating: 5,
              comment: "Romantic setting, perfect sunset views!",
            },
            {
              author: "David R.",
              rating: 5,
              comment: "Best stay of our vacation, highly recommend!",
            },
          ],
        },
        {
          id: 4,
          name: "Tropical Haven",
          location: formData.location || "Beachside",
          type: formData.accommodationType,
          price: "$85/night",
          rating: 4.2,
          reviewCount: 156,
          description: "Affordable accommodation in a great location",
          photo:
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
          url: "https://expedia.com/hotel/tropical-haven",
          reviews: [
            {
              author: "Chris P.",
              rating: 4,
              comment: "Budget-friendly with good amenities.",
            },
            {
              author: "Anna W.",
              rating: 4,
              comment: "Clean rooms and friendly staff.",
            },
          ],
        },
        {
          id: 5,
          name: "Seaside Retreat",
          location: formData.location || "Beachside",
          type: formData.accommodationType,
          price: "$130/night",
          rating: 4.6,
          reviewCount: 278,
          description: "Luxury accommodation with premium amenities",
          photo:
            "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop",
          url: "https://booking.com/hotel/seaside-retreat",
          reviews: [
            {
              author: "Robert H.",
              rating: 5,
              comment: "Luxury at its finest, worth every penny!",
            },
            {
              author: "Maria G.",
              rating: 4,
              comment: "Beautiful property, excellent service.",
            },
          ],
        },
      ];

      setResults(mockResults);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="w-full max-w-[800px] bg-white shadow-2xl p-6 md:p-8 lg:p-10"
        style={{
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.98)",
        }}
      >
        {/* Content Flex: Title/Description on left, Form on right with equal width */}
        <div className="flex lg:flex-row gap-6 lg:gap-8 items-center">
          {/* Title and Description Section - Left Side */}
          <div className="flex-1 text-center lg:text-left flex flex-col justify-center">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#4682B4] mb-4"
              style={{ fontFamily: "'Caveat Brush', cursive", fontWeight: 400 }}
            >
              Where do you want to stay?
            </h1>
            <p
              className="text-sm md:text-base text-black"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Discover stays that fit your needs—whether you're planning a
              weekend escape, a family holiday, or a long-term adventure.
            </p>
          </div>

          {/* Search Form - Right Side */}
          <div className="flex-1 w-full">
            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-6 md:p-8"
              aria-label="Accommodation search form"
            >
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter destination"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4682B4] focus:border-transparent outline-none"
                  required
                  aria-required="true"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="dateFrom"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date From
                  </label>
                  <input
                    type="date"
                    id="dateFrom"
                    name="dateFrom"
                    value={formData.dateFrom}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4682B4] focus:border-transparent outline-none"
                    required
                    aria-required="true"
                  />
                </div>

                <div>
                  <label
                    htmlFor="dateUntil"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date Until
                  </label>
                  <input
                    type="date"
                    id="dateUntil"
                    name="dateUntil"
                    value={formData.dateUntil}
                    onChange={handleChange}
                    min={
                      formData.dateFrom ||
                      new Date().toISOString().split("T")[0]
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4682B4] focus:border-transparent outline-none"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="adults"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Adults
                  </label>
                  <input
                    type="number"
                    id="adults"
                    name="adults"
                    value={formData.adults}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4682B4] focus:border-transparent outline-none"
                    required
                    aria-required="true"
                  />
                </div>

                <div>
                  <label
                    htmlFor="kids"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Number of Children
                  </label>
                  <input
                    type="number"
                    id="kids"
                    name="kids"
                    value={formData.kids}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4682B4] focus:border-transparent outline-none"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {formData.kids > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Children Ages
                  </label>
                  {Array.from({ length: formData.kids }, (_, index) => (
                    <div key={index}>
                      <label
                        htmlFor={`childAge-${index}`}
                        className="block text-xs font-medium text-gray-600 mb-1"
                      >
                        Child {index + 1} Age
                      </label>
                      <select
                        id={`childAge-${index}`}
                        name={`childAge-${index}`}
                        value={formData.childAges[index] || 0}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4682B4] focus:border-transparent outline-none"
                        required
                        aria-required="true"
                      >
                        {Array.from({ length: 17 }, (_, i) => (
                          <option key={i} value={i}>
                            {i === 0
                              ? "Select age"
                              : `${i} ${i === 1 ? "year" : "years"} old`}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label
                  htmlFor="accommodationType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Accommodation Type
                </label>
                <select
                  id="accommodationType"
                  name="accommodationType"
                  value={formData.accommodationType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4682B4] focus:border-transparent outline-none"
                  required
                  aria-required="true"
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Airbnb">Airbnb</option>
                  <option value="Cabin">Cabin</option>
                  <option value="Campsite">Campsite</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#4682B4] text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-[#3a6a94] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:ring-offset-2"
                aria-label="Search for accommodations"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Loading Animation */}
        {loading && (
          <div
            className="mt-8 flex justify-center items-center space-x-6"
            aria-live="polite"
            aria-label="Loading accommodations"
          >
            <div
              className="animate-bounce"
              style={{ animationDelay: "0s", width: "48px", height: "48px" }}
            >
              <img
                src={airplaneIcon}
                alt="Airplane"
                className="w-full h-full"
              />
            </div>
            <div
              className="animate-bounce"
              style={{ animationDelay: "0.2s", width: "48px", height: "48px" }}
            >
              <img src={carIcon} alt="Car" className="w-full h-full" />
            </div>
            <div
              className="animate-bounce"
              style={{ animationDelay: "0.4s", width: "48px", height: "48px" }}
            >
              <img src={trainIcon} alt="Train" className="w-full h-full" />
            </div>
          </div>
        )}

        {/* Results Section */}
        {!loading && searched && results.length > 0 && (
          <div className="mt-8 space-y-6" aria-label="Search results">
            <h2
              className="text-2xl font-bold text-gray-800 mb-4"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Search Results
            </h2>
            {results.map((result) => (
              <div
                key={result.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Photo */}
                  <div className="md:w-1/3 h-48 md:h-auto">
                    <img
                      src={result.photo}
                      alt={result.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="md:w-2/3 p-4 md:p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">
                          {result.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          <span className="font-medium">{result.type}</span> •{" "}
                          {result.location}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-[#4682B4] whitespace-nowrap ml-4">
                        {result.price}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-3 text-sm">
                      {result.description}
                    </p>

                    {/* Rating and Review Count */}
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        <span className="text-yellow-500 text-lg">★</span>
                        <span className="ml-1 text-gray-700 font-semibold">
                          {result.rating}
                        </span>
                      </div>
                      <span className="ml-2 text-gray-500 text-sm">
                        ({result.reviewCount} reviews)
                      </span>
                    </div>

                    {/* Reviews Preview */}
                    {result.reviews && result.reviews.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <p className="text-sm font-semibold text-gray-700">
                          Recent Reviews:
                        </p>
                        {result.reviews.slice(0, 2).map((review, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 p-2 rounded text-sm"
                          >
                            <div className="flex items-center mb-1">
                              <span className="font-medium text-gray-800">
                                {review.author}
                              </span>
                              <span className="ml-2 text-yellow-500">
                                {"★".repeat(review.rating)}
                                {"☆".repeat(5 - review.rating)}
                              </span>
                            </div>
                            <p className="text-gray-600 italic">
                              "{review.comment}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Book Now Link */}
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[#4682B4] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3a6a94] transition-colors duration-200 text-center mt-auto"
                      aria-label={`Book ${result.name} on booking site`}
                    >
                      View Details & Book
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="mt-8 text-center text-gray-600" aria-live="polite">
            <p>No accommodations found. Please try a different search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
