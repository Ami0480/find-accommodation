import { useState, useEffect } from "react";
import airplaneIcon from "./assets/airplane.svg";
import carIcon from "./assets/car.svg";
import trainIcon from "./assets/train.svg";
import "./App.css";

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
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cityDisplay, setCityDisplay] = useState("");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [filters, setFilters] = useState({
    sortBy: "popularity", // popularity, rating, price-low, price-high, distance
    minPrice: "",
    maxPrice: "",
    minRating: "",
  });

  const backgroundImageUrl =
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80";

  // City name to IATA code mapping with full names
  const cityCodeMap = {
    "new york": { code: "NYC", name: "New York" },
    "new york city": { code: "NYC", name: "New York" },
    "los angeles": { code: "LAX", name: "Los Angeles" },
    chicago: { code: "CHI", name: "Chicago" },
    miami: { code: "MIA", name: "Miami" },
    "san francisco": { code: "SFO", name: "San Francisco" },
    boston: { code: "BOS", name: "Boston" },
    seattle: { code: "SEA", name: "Seattle" },
    "las vegas": { code: "LAS", name: "Las Vegas" },
    orlando: { code: "ORL", name: "Orlando" },
    washington: { code: "WAS", name: "Washington" },
    london: { code: "LON", name: "London" },
    paris: { code: "PAR", name: "Paris" },
    rome: { code: "ROM", name: "Rome" },
    barcelona: { code: "BCN", name: "Barcelona" },
    amsterdam: { code: "AMS", name: "Amsterdam" },
    berlin: { code: "BER", name: "Berlin" },
    madrid: { code: "MAD", name: "Madrid" },
    vienna: { code: "VIE", name: "Vienna" },
    prague: { code: "PRG", name: "Prague" },
    dublin: { code: "DUB", name: "Dublin" },
    tokyo: { code: "TYO", name: "Tokyo" },
    bangkok: { code: "BKK", name: "Bangkok" },
    singapore: { code: "SIN", name: "Singapore" },
    "hong kong": { code: "HKG", name: "Hong Kong" },
    seoul: { code: "SEL", name: "Seoul" },
    dubai: { code: "DXB", name: "Dubai" },
    sydney: { code: "SYD", name: "Sydney" },
    melbourne: { code: "MEL", name: "Melbourne" },
    brisbane: { code: "BNE", name: "Brisbane" },
    perth: { code: "PER", name: "Perth" },
    adelaide: { code: "ADL", name: "Adelaide" },
    auckland: { code: "AKL", name: "Auckland" },
  };

  // Reverse map for code to name
  const codeToNameMap = {};
  Object.values(cityCodeMap).forEach((city) => {
    codeToNameMap[city.code] = city.name;
  });

  const getCityCode = (input) => {
    const normalized = input.toLowerCase().trim();
    if (input.length === 3) {
      const upperCode = input.toUpperCase();
      return { code: upperCode, name: codeToNameMap[upperCode] || upperCode };
    }
    const cityData = cityCodeMap[normalized];
    if (cityData) {
      return cityData;
    }
    return { code: input.toUpperCase(), name: input };
  };

  // Format location for display text
  const displayText = (location) => {
    if (!location) return "";

    // Try to get formatted name from city code map
    const normalized = location.toLowerCase().trim();
    const cityData = cityCodeMap[normalized];

    if (cityData && cityData.name) {
      return cityData.name;
    }

    // If it's a 3-letter code, try to get the name
    if (location.length === 3) {
      const name = codeToNameMap[location.toUpperCase()];
      if (name) {
        return name;
      }
    }

    // Otherwise, capitalize the first letter of each word
    return location
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "kids") {
      const numKids = parseInt(value) || 0;
      setFormData((prev) => ({
        ...prev,
        kids: numKids,
        childAges: Array.from(
          { length: numKids },
          (_, i) => prev.childAges[i] || ""
        ),
      }));
    } else if (name.startsWith("childAge-")) {
      const index = parseInt(name.split("-")[1]);
      const age = value === "" ? "" : parseInt(value);
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

  // Filter and sort results
  const applyFilters = () => {
    let filtered = [...results];

    // Price filter
    if (filters.minPrice) {
      filtered = filtered.filter(
        (r) => r.priceNumber && r.priceNumber >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(
        (r) => r.priceNumber && r.priceNumber <= parseFloat(filters.maxPrice)
      );
    }

    // Rating filter
    if (filters.minRating) {
      filtered = filtered.filter(
        (r) => r.rating >= parseFloat(filters.minRating)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "popularity":
          return (b.popularityScore || 0) - (a.popularityScore || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "price-low":
          return (a.priceNumber || Infinity) - (b.priceNumber || Infinity);
        case "price-high":
          return (b.priceNumber || 0) - (a.priceNumber || 0);
        default:
          return 0;
      }
    });

    setFilteredResults(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters when filters or results change
  useEffect(() => {
    if (results.length > 0) {
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, results]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
      console.log("Starting API request...");

      // Use location as-is for StayAPI (it accepts city names)
      const locationForSearch = formData.location;
      const formattedLocation = displayText(locationForSearch);

      console.log(
        `Searching for location: "${locationForSearch}" (${formattedLocation})`
      );

      const response = await fetch("/.netlify/functions/search-hotels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: locationForSearch, // StayAPI accepts city names directly
          dateFrom: formData.dateFrom,
          dateUntil: formData.dateUntil,
          adults: formData.adults,
          kids: formData.kids || 0,
          childAges: formData.childAges || [],
          accommodationType: formData.accommodationType,
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        alert(`Server error (${response.status}): ${errorText}`);
        setResults([]);
        setCityDisplay("");
        return;
      }

      const responseData = await response.json();
      console.log("API response:", responseData);

      // Handle the response from Netlify function
      if (responseData.message) {
        alert(responseData.message);
        setResults([]);
        setCityDisplay("");
        return;
      }

      const hotelResults = responseData.results || [];

      if (hotelResults.length === 0) {
        alert(
          `No hotels found for "${formattedLocation}". Try:\n- Different dates\n- Major cities: New York, London, Paris, Tokyo, Sydney, Perth`
        );
        setResults([]);
        setCityDisplay("");
        return;
      }

      console.log("Hotels found:", hotelResults.length);
      setCityDisplay(formattedLocation);
      setResults(hotelResults);
      setFilteredResults(hotelResults);
      setSelectedHotel(null);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      alert(`Error: ${error.message}. Check console for details.`);
      setResults([]);
      setCityDisplay("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="app-container"
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
      }}
    >
      <div className="main-container">
        <div className="content-layout">
          <div className="title-section">
            <h1 className="title">Where do you want to stay?</h1>
            <p className="subtitle">
              Discover stays that fit your needs—whether you're planning a
              weekend escape, a family holiday, or a long-term adventure.
            </p>
          </div>

          <div className="form-section">
            <form
              onSubmit={handleSubmit}
              className="search-form"
              aria-label="Accommodation search form"
            >
              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., New York, London, Paris"
                  className="form-input"
                  required
                />
                <p className="form-hint">
                  Enter city name or code (NYC, LON, PAR, etc.)
                </p>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="dateFrom" className="form-label">
                    Check-in
                  </label>
                  <input
                    type="date"
                    id="dateFrom"
                    name="dateFrom"
                    value={formData.dateFrom}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dateUntil" className="form-label">
                    Check-out
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
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="adults" className="form-label">
                    Adults
                  </label>
                  <input
                    type="number"
                    id="adults"
                    name="adults"
                    value={formData.adults}
                    onChange={handleChange}
                    min="1"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="kids" className="form-label">
                    Children
                  </label>
                  <input
                    type="number"
                    id="kids"
                    name="kids"
                    value={formData.kids}
                    onChange={handleChange}
                    min="0"
                    className="form-input"
                  />
                </div>
              </div>

              {formData.kids > 0 && (
                <div className="children-ages">
                  <label className="form-label">Children Ages</label>
                  {Array.from({ length: formData.kids }, (_, index) => (
                    <div key={index} className="form-group">
                      <label
                        htmlFor={`childAge-${index}`}
                        className="form-label-small"
                      >
                        Child {index + 1} Age
                      </label>
                      <select
                        id={`childAge-${index}`}
                        name={`childAge-${index}`}
                        value={formData.childAges[index] || ""}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="">Select age</option>
                        {Array.from({ length: 17 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>{`${i + 1} ${
                            i === 0 ? "year" : "years"
                          } old`}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="accommodationType" className="form-label">
                  Accommodation Type
                </label>
                <select
                  id="accommodationType"
                  name="accommodationType"
                  value={formData.accommodationType}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Resort">Resort</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                </select>
              </div>

              <button type="submit" className="submit-button">
                Search Hotels
              </button>
            </form>
          </div>
        </div>

        {loading && (
          <div className="loading-container" aria-live="polite">
            <div className="loading-icon">
              <img src={airplaneIcon} alt="Searching" />
            </div>
            <div className="loading-icon">
              <img src={carIcon} alt="Searching" />
            </div>
            <div className="loading-icon">
              <img src={trainIcon} alt="Searching" />
            </div>
          </div>
        )}

        {!loading && searched && results.length > 0 && (
          <div className="results-section" aria-label="Search results">
            <h2 className="results-title">
              Available Hotels in {cityDisplay} ({filteredResults.length} of{" "}
              {results.length})
            </h2>

            {/* Filters */}
            <div className="filters-container">
              <div className="filter-group">
                <label htmlFor="sortBy" className="filter-label">
                  Sort by:
                </label>
                <select
                  id="sortBy"
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="popularity">Popularity</option>
                  <option value="rating">Rating (High to Low)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="minPrice" className="filter-label">
                  Min Price:
                </label>
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="$0"
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="maxPrice" className="filter-label">
                  Max Price:
                </label>
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="$1000"
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="minRating" className="filter-label">
                  Min Rating:
                </label>
                <select
                  id="minRating"
                  name="minRating"
                  value={filters.minRating}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">Any</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
            </div>

            {/* Google Map with all hotels */}
            {filteredResults.some((r) => r.latitude && r.longitude) && (
              <div className="main-map-container">
                <h3 className="map-title">Select a hotel from the map:</h3>
                <div className="main-map-wrapper">
                  <iframe
                    className="main-map-embed"
                    title="All hotels map"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${filteredResults
                      .filter((r) => r.latitude && r.longitude)
                      .map((r) => `${r.latitude},${r.longitude}`)
                      .join("|")}&output=embed`}
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="map-hint">
                  Click on a hotel marker to view details, or scroll down to see
                  all results
                </p>
              </div>
            )}

            {filteredResults.length === 0 ? (
              <div className="no-results" aria-live="polite">
                <p className="no-results-title">No hotels match your filters</p>
                <p className="no-results-text">
                  Try adjusting your filter criteria.
                </p>
              </div>
            ) : (
              filteredResults.map((result) => (
                <div
                  key={result.id}
                  className={`result-card ${
                    selectedHotel?.id === result.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedHotel(result)}
                >
                  <div className="result-content">
                    {result.photo ? (
                      <div className="result-image-container">
                        <img
                          src={result.photo}
                          alt={result.name}
                          className="result-image"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="result-image-container no-image">
                        <div className="no-image-placeholder">
                          No Image Available
                        </div>
                      </div>
                    )}

                    <div className="result-details">
                      <div className="result-header">
                        <div>
                          <h3 className="result-name">{result.name}</h3>
                          <p className="result-meta">
                            <span className="result-meta-type">
                              {result.type}
                            </span>{" "}
                            •{" "}
                            {typeof result.location === "string"
                              ? result.location
                              : result.location?.address ||
                                result.location?.name ||
                                "Location not available"}
                          </p>
                        </div>
                        <span className="result-price">{result.price}</span>
                      </div>

                      <p className="result-description">{result.description}</p>

                      <div className="result-rating">
                        <div>
                          <span className="rating-stars">★</span>
                          <span className="rating-value">
                            {typeof result.rating === "number"
                              ? result.rating.toFixed(1)
                              : result.rating}
                          </span>
                        </div>
                        <span className="rating-count">
                          ({result.reviewCount} reviews)
                        </span>
                      </div>

                      {result.reviews && result.reviews.length > 0 && (
                        <div className="reviews-section">
                          <p className="reviews-title">Recent Reviews:</p>
                          {result.reviews.slice(0, 2).map((review, idx) => (
                            <div key={idx} className="review-item">
                              <div className="review-header">
                                <span className="review-author">
                                  {review.author}
                                </span>
                                <span className="review-stars">
                                  {"★".repeat(Math.min(5, review.rating))}
                                  {"☆".repeat(Math.max(0, 5 - review.rating))}
                                </span>
                              </div>
                              <p className="review-comment">
                                "{review.comment}"
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {result.latitude && result.longitude && (
                        <div className="map-container">
                          <iframe
                            className="map-embed"
                            title={`Map of ${result.name}`}
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={`https://www.google.com/maps?q=${result.latitude},${result.longitude}&output=embed&zoom=15`}
                            allowFullScreen
                          ></iframe>
                          <div className="map-link">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${result.latitude},${result.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="map-link-text"
                            >
                              View on Google Maps
                            </a>
                          </div>
                        </div>
                      )}

                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="book-button"
                      >
                        View Details & Book
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="no-results" aria-live="polite">
            <p className="no-results-title">No hotels found</p>
            <p className="no-results-text">
              Try adjusting your search dates or choosing a different location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
