import { useState, useEffect } from "react";

function App() {
  const [formData, setFormData] = useState({
    location: "",
    dateFrom: "",
    dateUntil: "",
    adults: 1,
    kids: 0,
    rooms: 1,
    childrenAges: [],
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
    minRooms: "",
    minBeds: "",
    suburb: "",
  });

  const backgroundImageUrl =
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80";

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "kids") {
      const numKids = parseInt(value) || 0;
      const currentAges = formData.childrenAges;

      if (numKids > currentAges.length) {
        const newAges = [
          ...currentAges,
          ...Array(numKids - currentAges.length).fill(""),
        ];
        setFormData((prev) => ({
          ...prev,
          kids: numKids,
          childrenAges: newAges,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          kids: numKids,
          childrenAges: currentAges.slice(0, numKids),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: ["adults", "rooms"].includes(name)
          ? parseInt(value) || 0
          : value,
      }));
    }
  };

  const handleChildAgeChange = (index, age) => {
    const newAges = [...formData.childrenAges];
    newAges[index] = age === "" ? "" : parseInt(age);
    setFormData((prev) => ({
      ...prev,
      childrenAges: newAges,
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
    if (filters.minRooms) {
      filtered = filtered.filter(
        (r) => r.roomCount && r.roomCount >= parseInt(filters.minRooms)
      );
    }
    if (filters.minBeds) {
      filtered = filtered.filter(
        (r) => r.bedCount && r.bedCount >= parseInt(filters.minBeds)
      );
    }
    if (filters.suburb) {
      filtered = filtered.filter(
        (r) =>
          r.location?.name
            ?.toLowerCase()
            .includes(filters.suburb.toLowerCase()) ||
          r.location?.address
            ?.toLowerCase()
            .includes(filters.suburb.toLowerCase())
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

  const searchHotels = async (
    destId,
    checkIn,
    checkOut,
    adults,
    rooms,
    childrenAges
  ) => {
    const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

    if (!RAPIDAPI_KEY) {
      throw new Error("API key is missing. Check your .env file");
    }

    let url = `https://booking-com.p.rapidapi.com/v1/hotels/search?dest_id=${destId}&dest_type=city&checkin_date=${checkIn}&checkout_date=${checkOut}&adults_number=${adults}&room_number=${rooms}&units=metric&locale=en-gb&order_by=popularity&filter_by_currency=AUD`;

    const validAges = childrenAges.filter((age) => age !== "" && age !== null);
    if (validAges.length > 0) {
      const childrenAgesParam = validAges
        .map((age, i) => `children_age=${age}`)
        .join("&");
      url += `&children_number=${validAges.length}&${childrenAgesParam}`;
    }

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

    if (
      formData.kids > 0 &&
      formData.childrenAges.some((age) => age === "" || age === null)
    ) {
      alert("Please enter ages for all children (0-16 years)");
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
        formData.rooms,
        formData.childrenAges
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
        roomCount: hotel.unit_configuration_label
          ? (hotel.unit_configuration_label.match(/\d+/g) || [1])[0]
          : 1,
        bedCount: hotel.unit_configuration_label
          ? (hotel.unit_configuration_label.match(/\d+/g) || [1]).reduce(
              (a, b) => parseInt(a) + parseInt(b),
              0
            )
          : 1,
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
        padding: "40px 20px",
      }}
    >
      <style>{`
        @media (min-width: 768px) {
          .hero-section {
            flex-direction: row !important;
            align-items: center !important;
            gap: 60px !important;
          }
          .hero-text {
            flex: 1 !important;
            text-align: left !important;
          }
          .search-form-container {
            flex: 1 !important;
          }
        }
        @media (min-width: 640px) {
          .date-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
          .guest-grid {
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 20px !important;
          }
        }
        @media (min-width: 768px) {
          .filter-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "40px",
            marginBottom: "60px",
          }}
          className="hero-section"
        >
          <div
            style={{ textAlign: "center", color: "white" }}
            className="hero-text"
          >
            <h1
              style={{
                fontSize: "clamp(3rem, 6vw, 5rem)",
                fontFamily: "'Caveat Brush', cursive",
                fontWeight: 400,
                color: "#4682B4",
                marginBottom: "24px",
                lineHeight: 1.1,
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              Where do you want to stay?
            </h1>
            <p
              style={{
                fontSize: "clamp(16px, 2vw, 20px)",
                opacity: 0.95,
                lineHeight: 1.6,
              }}
            >
              Discover stays that fit your needs—whether you're planning a
              weekend escape, a family holiday, or a long-term adventure.
            </p>
          </div>

          <div
            className="search-form-container"
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              boxSizing: "border-box",
              boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
            }}
          >
            <div>
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    fontSize: "15px",
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
                    padding: "14px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
                <p
                  style={{ fontSize: "14px", color: "#666", marginTop: "6px" }}
                >
                  Enter city name
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "16px",
                  marginBottom: "24px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                className="date-grid"
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      fontSize: "15px",
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
                      padding: "14px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "16px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      fontSize: "15px",
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
                      formData.dateFrom ||
                      new Date().toISOString().split("T")[0]
                    }
                    style={{
                      width: "100%",
                      padding: "14px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "16px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "16px",
                  marginBottom: "24px",
                }}
                className="guest-grid"
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      fontSize: "15px",
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
                      padding: "14px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "16px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      fontSize: "15px",
                    }}
                  >
                    Children
                  </label>
                  <input
                    type="number"
                    name="kids"
                    value={formData.kids === 0 ? "" : formData.kids}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    style={{
                      width: "100%",
                      padding: "14px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "16px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      fontSize: "15px",
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
                      padding: "14px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "16px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {formData.kids > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "12px",
                      fontWeight: "600",
                      fontSize: "15px",
                    }}
                  >
                    Children's Ages (0-16 years)
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(90px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {Array.from({ length: formData.kids }).map((_, index) => (
                      <div key={index}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            marginBottom: "6px",
                            color: "#666",
                          }}
                        >
                          Child {index + 1}
                        </label>
                        <select
                          value={
                            formData.childrenAges[index] === ""
                              ? ""
                              : formData.childrenAges[index]
                          }
                          onChange={(e) =>
                            handleChildAgeChange(index, e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            fontSize: "16px",
                            boxSizing: "border-box",
                            backgroundColor: "white",
                          }}
                        >
                          <option value="">Age</option>
                          {Array.from({ length: 17 }, (_, i) => (
                            <option key={i} value={i}>
                              {i}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                style={{
                  width: "100%",
                  padding: "18px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "18px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#1d4ed8")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
              >
                Search Hotels
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "white",
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: "500" }}>
              Searching for hotels...
            </div>
          </div>
        )}

        {!loading && searched && results.length > 0 && (
          <div>
            <h2
              style={{
                color: "white",
                fontSize: "36px",
                marginBottom: "30px",
                fontWeight: "700",
              }}
            >
              Available Hotels in {cityDisplay} ({filteredResults.length} of{" "}
              {results.length})
            </h2>

            <div
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "32px",
                marginBottom: "30px",
                boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
              }}
            >
              <h3
                style={{
                  marginBottom: "24px",
                  fontSize: "22px",
                  fontWeight: "700",
                }}
              >
                Filter Results
              </h3>
              <div
                className="filter-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "15px",
                      fontWeight: "600",
                    }}
                  >
                    Sort By
                  </label>
                  <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      backgroundColor: "white",
                      fontSize: "15px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="popularity">Popularity</option>
                    <option value="rating">Rating (High to Low)</option>
                    <option value="price-low">Price (Low to High)</option>
                    <option value="price-high">Price (High to Low)</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "15px",
                      fontWeight: "600",
                    }}
                  >
                    Min Rating
                  </label>
                  <input
                    type="number"
                    name="minRating"
                    value={filters.minRating}
                    onChange={handleFilterChange}
                    placeholder="e.g., 4.0"
                    min="0"
                    max="5"
                    step="0.1"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "15px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "15px",
                      fontWeight: "600",
                    }}
                  >
                    Min Price (AUD)
                  </label>
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="e.g., 100"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "15px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "15px",
                      fontWeight: "600",
                    }}
                  >
                    Max Price (AUD)
                  </label>
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="e.g., 500"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "15px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "15px",
                      fontWeight: "600",
                    }}
                  >
                    Min Rooms
                  </label>
                  <input
                    type="number"
                    name="minRooms"
                    value={filters.minRooms}
                    onChange={handleFilterChange}
                    placeholder="e.g., 2"
                    min="1"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "15px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "15px",
                      fontWeight: "600",
                    }}
                  >
                    Min Beds
                  </label>
                  <input
                    type="number"
                    name="minBeds"
                    value={filters.minBeds}
                    onChange={handleFilterChange}
                    placeholder="e.g., 2"
                    min="1"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "15px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "15px",
                      fontWeight: "600",
                    }}
                  >
                    Suburb/Area
                  </label>
                  <input
                    type="text"
                    name="suburb"
                    value={filters.suburb}
                    onChange={handleFilterChange}
                    placeholder="e.g., Manhattan, Camden"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "15px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>

            {filteredResults.map((result) => (
              <div
                key={result.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: "32px",
                  marginBottom: "30px",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                }}
              >
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 250px" }}>
                    {result.photo ? (
                      <img
                        src={result.photo}
                        alt={result.name}
                        style={{
                          width: "100%",
                          height: "220px",
                          objectFit: "cover",
                          borderRadius: "12px",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "220px",
                          backgroundColor: "#f3f4f6",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#9ca3af",
                          fontSize: "16px",
                        }}
                      >
                        No Image
                      </div>
                    )}
                  </div>

                  <div style={{ flex: "1 1 350px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "16px",
                        flexWrap: "wrap",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: "26px",
                            fontWeight: "bold",
                            marginBottom: "10px",
                          }}
                        >
                          {result.name}
                        </h3>
                        <p
                          style={{
                            color: "#666",
                            marginBottom: "10px",
                            fontSize: "15px",
                          }}
                        >
                          {result.type} •{" "}
                          {result.location?.address || result.location?.name}
                        </p>
                        {result.distance && (
                          <p
                            style={{
                              color: "#666",
                              fontSize: "14px",
                              marginBottom: "6px",
                            }}
                          >
                            📍 {result.distance}
                          </p>
                        )}
                        <p
                          style={{
                            color: "#666",
                            fontSize: "14px",
                            marginTop: "6px",
                          }}
                        >
                          🛏️ {result.roomCount} Room(s) • 🛌 {result.bedCount}{" "}
                          Bed(s)
                        </p>
                      </div>
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "bold",
                          color: "#2563eb",
                        }}
                      >
                        {result.price}
                      </div>
                    </div>

                    <p
                      style={{
                        marginBottom: "16px",
                        color: "#444",
                        lineHeight: 1.6,
                      }}
                    >
                      {result.description}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "20px",
                      }}
                    >
                      <span style={{ color: "#f59e0b", fontSize: "22px" }}>
                        ★
                      </span>
                      <span style={{ fontWeight: "600", fontSize: "18px" }}>
                        {typeof result.rating === "number"
                          ? result.rating.toFixed(1)
                          : result.rating}
                      </span>
                      <span style={{ color: "#666", fontSize: "15px" }}>
                        ({result.reviewCount} reviews)
                      </span>
                    </div>

                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        padding: "14px 28px",
                        backgroundColor: "#2563eb",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "16px",
                        transition: "background-color 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.backgroundColor = "#1d4ed8")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.backgroundColor = "#2563eb")
                      }
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
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "white",
            }}
          >
            <h2
              style={{
                fontSize: "28px",
                marginBottom: "16px",
                fontWeight: "600",
              }}
            >
              No hotels found
            </h2>
            <p style={{ fontSize: "18px" }}>
              Try adjusting your search dates or choosing a different location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
