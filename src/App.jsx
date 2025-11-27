import { useState, useEffect } from "react";

function App() {
  const [formData, setFormData] = useState({
    location: "",
    dateFrom: "",
    dateUntil: "",
    adults: 1,
    kids: 0,
    rooms: 1,
  });
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cityDisplay, setCityDisplay] = useState("");
  const [filters, setFilters] = useState({
    sortBy: "popularity",
    minPrice: "",
    maxPrice: "",
    minRating: "",
  });

  const backgroundImageUrl =
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["adults", "kids", "rooms"].includes(name)
        ? parseInt(value) || 0
        : value,
    }));
  };

  const applyFilters = () => {
    let filtered = [...results];

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
    if (filters.minRating) {
      filtered = filtered.filter(
        (r) => r.rating >= parseFloat(filters.minRating)
      );
    }

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "popularity":
          return (b.reviewScore || 0) - (a.reviewScore || 0);
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

  useEffect(() => {
    if (results.length > 0) {
      applyFilters();
    }
  }, [filters, results]);

  const searchDestination = async (query) => {
    const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

    if (!RAPIDAPI_KEY) {
      throw new Error("API key is missing. Check your .env file");
    }

    const url = `https://booking-com.p.rapidapi.com/v1/hotels/locations?locale=en-gb&name=${encodeURIComponent(
      query
    )}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(
        `Failed to search destination (Status: ${response.status}). Check your API subscription.`
      );
    }

    const data = await response.json();
    return data;
  };

  const searchHotels = async (destId, checkIn, checkOut, adults, rooms) => {
    const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

    if (!RAPIDAPI_KEY) {
      throw new Error("API key is missing. Check your .env file");
    }

    const url = `https://booking-com.p.rapidapi.com/v1/hotels/search?
  dest_id=${destId}
  &dest_type=city
  &checkin_date=${checkIn}
  &checkout_date=${checkOut}
  &adults_number=${adults}
  &room_number=${rooms}
  &units=metric
  &locale=en-gb
  &order_by=popularity
  &filter_by_currency=AUD`.replace(/\s+/g, "");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(
        `Failed to search hotels (Status: ${response.status}). Check your API subscription.`
      );
    }

    const data = await response.json();
    return data;
  };

  const handleSubmit = async () => {
    if (
      !formData.location ||
      !formData.dateFrom ||
      !formData.dateUntil ||
      !formData.adults
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
      console.log("Searching for destination:", formData.location);

      const destData = await searchDestination(formData.location);

      if (!destData || destData.length === 0) {
        alert(
          `No destinations found for "${formData.location}". Try a different location.`
        );
        setResults([]);
        setCityDisplay("");
        return;
      }

      const destination =
        destData.find((d) => d.dest_type === "city") || destData[0];
      const destId = destination.dest_id;
      const destName = destination.name || formData.location;

      console.log("Found destination:", destName, "ID:", destId);
      setCityDisplay(destName);

      const hotelsData = await searchHotels(
        destId,
        formData.dateFrom,
        formData.dateUntil,
        formData.adults,
        formData.rooms
      );

      if (!hotelsData || !hotelsData.result || hotelsData.result.length === 0) {
        alert(`No hotels found for these dates. Try different dates.`);
        setResults([]);
        return;
      }

      const transformedResults = hotelsData.result.map((hotel, index) => ({
        id: hotel.hotel_id || `hotel-${index}`,
        name: hotel.hotel_name || "Hotel",
        type: hotel.accommodation_type_name || "Hotel",
        location: {
          address: hotel.address || "",
          name: hotel.city || destName,
        },
        price: hotel.composite_price_breakdown?.gross_amount_per_night?.value
          ? `${hotel.composite_price_breakdown.gross_amount_per_night.currency} ${hotel.composite_price_breakdown.gross_amount_per_night.value}`
          : hotel.min_total_price
          ? `${hotel.currency_code} ${hotel.min_total_price}`
          : "Price not available",
        priceNumber:
          hotel.composite_price_breakdown?.gross_amount_per_night?.value ||
          hotel.min_total_price ||
          null,
        description:
          hotel.hotel_name_trans ||
          hotel.hotel_name ||
          "Comfortable accommodation",
        rating: hotel.review_score ? hotel.review_score / 2 : 4.0,
        reviewScore: hotel.review_score || 8.0,
        reviewCount: hotel.review_nr || 0,
        photo: hotel.max_photo_url || hotel.main_photo_url || null,
        latitude: hotel.latitude || null,
        longitude: hotel.longitude || null,
        url:
          hotel.url || `https://www.booking.com/hotel/${hotel.hotel_id}.html`,
        distance: hotel.distance ? `${hotel.distance} km from center` : null,
      }));

      console.log("Hotels found:", transformedResults.length);
      setResults(transformedResults);
      setFilteredResults(transformedResults);
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
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{ textAlign: "center", marginBottom: "40px", color: "white" }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            Where do you want to stay?
          </h1>
          <p style={{ fontSize: "18px", opacity: 0.9 }}>
            Discover stays that fit your needs—whether you're planning a weekend
            escape, a family holiday, or a long-term adventure.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "32px",
            marginBottom: "40px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., New York, London, Paris"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "16px",
                }}
              />
              <p style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                Enter city name
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Check-in
                </label>
                <input
                  type="date"
                  name="dateFrom"
                  value={formData.dateFrom}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "16px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Check-out
                </label>
                <input
                  type="date"
                  name="dateUntil"
                  value={formData.dateUntil}
                  onChange={handleChange}
                  min={
                    formData.dateFrom || new Date().toISOString().split("T")[0]
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "16px",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Adults
                </label>
                <input
                  type="number"
                  name="adults"
                  value={formData.adults}
                  onChange={handleChange}
                  min="1"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "16px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Children
                </label>
                <input
                  type="number"
                  name="kids"
                  value={formData.kids}
                  onChange={handleChange}
                  min="0"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "16px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Rooms
                </label>
                <input
                  type="number"
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleChange}
                  min="1"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "16px",
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "18px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Search Hotels
            </button>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "white" }}>
            <div style={{ fontSize: "24px" }}>Searching for hotels...</div>
          </div>
        )}

        {!loading && searched && results.length > 0 && (
          <div>
            <h2
              style={{ color: "white", fontSize: "32px", marginBottom: "20px" }}
            >
              Available Hotels in {cityDisplay} ({filteredResults.length} of{" "}
              {results.length})
            </h2>

            <div
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                }}
              >
                <option value="popularity">Sort by Popularity</option>
                <option value="rating">Rating (High to Low)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
              </select>
            </div>

            {filteredResults.map((result) => (
              <div
                key={result.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "20px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  {result.photo ? (
                    <img
                      src={result.photo}
                      alt={result.name}
                      style={{
                        width: "200px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "200px",
                        height: "150px",
                        backgroundColor: "#f3f4f6",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#9ca3af",
                      }}
                    >
                      No Image
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: "300px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            marginBottom: "8px",
                          }}
                        >
                          {result.name}
                        </h3>
                        <p style={{ color: "#666", marginBottom: "8px" }}>
                          {result.type} •{" "}
                          {result.location?.address || result.location?.name}
                        </p>
                        {result.distance && (
                          <p style={{ color: "#666", fontSize: "14px" }}>
                            📍 {result.distance}
                          </p>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#2563eb",
                        }}
                      >
                        {result.price}
                      </div>
                    </div>

                    <p style={{ marginBottom: "12px", color: "#444" }}>
                      {result.description}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "16px",
                      }}
                    >
                      <span style={{ color: "#f59e0b", fontSize: "20px" }}>
                        ★
                      </span>
                      <span style={{ fontWeight: "600" }}>
                        {typeof result.rating === "number"
                          ? result.rating.toFixed(1)
                          : result.rating}
                      </span>
                      <span style={{ color: "#666" }}>
                        ({result.reviewCount} reviews)
                      </span>
                    </div>

                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        padding: "12px 24px",
                        backgroundColor: "#2563eb",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "6px",
                        fontWeight: "600",
                      }}
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
          <div style={{ textAlign: "center", padding: "40px", color: "white" }}>
            <h2 style={{ fontSize: "24px", marginBottom: "12px" }}>
              No hotels found
            </h2>
            <p>
              Try adjusting your search dates or choosing a different location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
