import { useState, useEffect } from "react";
import Logo from "./assets/accommodation-logo.png";
import AirplaneIcon from "./assets/airplane.svg";
import CarIcon from "./assets/car.svg";
import TrainIcon from "./assets/train.svg";

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
  const [showFilters, setShowFilters] = useState(false);

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
          ? `${
              hotel.composite_price_breakdown.gross_amount_per_night.currency
            } ${Number(
              hotel.composite_price_breakdown.gross_amount_per_night.value
            ).toFixed(2)}`
          : hotel.min_total_price
          ? `${hotel.currency_code} ${Number(hotel.min_total_price).toFixed(2)}`
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
        minHeight: "100vh",
      }}
    >
      <style>{`
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
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 12px !important;
          }
          .results-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .filter-toggle {
            display: none !important;
          }
          .filter-content {
            display: block !important;
          }
          .logo-container {
            left: auto !important;
            right: 32px !important;
            transform: none !important;
          }
        }
        @media (max-width: 767px) {
          .filter-content {
            display: none;
          }
          .filter-content.show {
            display: block !important;
          }
        }
      `}</style>

      {/* Hero section with background image */}
      <div
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: "80px",
          paddingBottom: "60px",
          paddingLeft: "20px",
          paddingRight: "20px",
          position: "relative",
          minHeight: searched && results.length > 0 ? "auto" : "100vh",
          boxSizing: "border-box",
        }}
      >
        {/* Logo positioned in top-center on mobile, top-right on desktop */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
          }}
          className="logo-container"
        >
          <img
            src={Logo}
            alt="Logo"
            style={{
              width: "100px",
              height: "auto",
            }}
          />
        </div>

        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              width: "100%",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontFamily: "'Caveat Brush', cursive",
                fontWeight: 400,
                lineHeight: 1.1,
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                color: "white",
                textAlign: "center",
                whiteSpace: "nowrap",
                margin: 0,
              }}
            >
              Where do you want to stay?
            </h1>

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
              <p
                style={{
                  fontSize: "16px",
                  color: "#444",
                  lineHeight: 1.6,
                  textAlign: "center",
                  marginBottom: "24px",
                }}
              >
                Discover stays that fit your needs—whether you're planning a
                weekend escape, a family holiday, or a long-term adventure.
              </p>
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
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginTop: "6px",
                    }}
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
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#2563eb")
                  }
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
                padding: "40px 20px",
              }}
            >
              <style>{`
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
              }
              .travel-icon {
                width: 48px;
                height: 48px;
                animation: bounce 0.8s ease-in-out infinite;
              }
              .travel-icon:nth-child(1) {
                animation-delay: 0s;
              }
              .travel-icon:nth-child(2) {
                animation-delay: 0.2s;
              }
              .travel-icon:nth-child(3) {
                animation-delay: 0.4s;
              }
            `}</style>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "32px",
                  marginBottom: "20px",
                }}
              >
                <img
                  src={AirplaneIcon}
                  alt="Airplane"
                  className="travel-icon"
                />
                <img src={CarIcon} alt="Car" className="travel-icon" />
                <img src={TrainIcon} alt="Train" className="travel-icon" />
              </div>
              <div
                style={{ fontSize: "18px", fontWeight: "500", color: "white" }}
              >
                Searching for hotels...
              </div>
            </div>
          )}

          {/* Scroll indicator when results are available */}
          {!loading && searched && results.length > 0 && (
            <div
              style={{
                textAlign: "center",
                paddingTop: "24px",
                paddingBottom: "16px",
              }}
            >
              <style>{`
              @keyframes scrollBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(12px); }
              }
              @keyframes fadeInDown {
                0% { opacity: 0; transform: translateY(-10px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              .scroll-indicator {
                animation: fadeInDown 0.5s ease-out;
              }
              .scroll-arrow {
                animation: scrollBounce 1.2s ease-in-out infinite;
              }
            `}</style>
              <div className="scroll-indicator">
                <div
                  style={{
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "500",
                    marginBottom: "12px",
                    textShadow: "1px 1px 3px rgba(0,0,0,0.4)",
                  }}
                >
                  {filteredResults.length} hotels found
                </div>
                <div
                  className="scroll-arrow"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))",
                    }}
                  >
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                  <span
                    style={{
                      color: "white",
                      fontSize: "12px",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                    }}
                  >
                    Scroll down
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results section with white background */}
      {!loading && searched && results.length > 0 && (
        <div
          style={{
            backgroundColor: "white",
            padding: "40px 20px 60px",
            minHeight: "50vh",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              padding: "0 24px",
            }}
          >
            <h2
              style={{
                color: "#1f2937",
                fontSize: "32px",
                marginBottom: "30px",
                fontWeight: "700",
              }}
            >
              Available Hotels in {cityDisplay} ({filteredResults.length} of{" "}
              {results.length})
            </h2>

            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "24px",
                border: "1px solid #e2e8f0",
              }}
            >
              {/* Mobile filter toggle button */}
              <button
                className="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: showFilters ? "16px" : "0",
                }}
              >
                <span>Filter & Sort Options</span>
                <span
                  style={{
                    transform: showFilters ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  ▼
                </span>
              </button>

              {/* Filter content */}
              <div className={`filter-content ${showFilters ? "show" : ""}`}>
                <div
                  className="filter-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#555",
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
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        backgroundColor: "white",
                        fontSize: "14px",
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
                        marginBottom: "4px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#555",
                      }}
                    >
                      Min Rating
                    </label>
                    <select
                      name="minRating"
                      value={filters.minRating}
                      onChange={handleFilterChange}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        backgroundColor: "white",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="">Any</option>
                      <option value="3">3+ Stars</option>
                      <option value="3.5">3.5+ Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="4.5">4.5+ Stars</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#555",
                      }}
                    >
                      Min Price (AUD)
                    </label>
                    <select
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        backgroundColor: "white",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="">Any</option>
                      <option value="50">$50+</option>
                      <option value="100">$100+</option>
                      <option value="150">$150+</option>
                      <option value="200">$200+</option>
                      <option value="300">$300+</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#555",
                      }}
                    >
                      Max Price (AUD)
                    </label>
                    <select
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        backgroundColor: "white",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="">Any</option>
                      <option value="100">Up to $100</option>
                      <option value="150">Up to $150</option>
                      <option value="200">Up to $200</option>
                      <option value="300">Up to $300</option>
                      <option value="500">Up to $500</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#555",
                      }}
                    >
                      Min Rooms
                    </label>
                    <select
                      name="minRooms"
                      value={filters.minRooms}
                      onChange={handleFilterChange}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        backgroundColor: "white",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#555",
                      }}
                    >
                      Min Beds
                    </label>
                    <select
                      name="minBeds"
                      value={filters.minBeds}
                      onChange={handleFilterChange}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        backgroundColor: "white",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#555",
                      }}
                    >
                      Suburb/Area
                    </label>
                    <input
                      type="text"
                      name="suburb"
                      value={filters.suburb}
                      onChange={handleFilterChange}
                      placeholder="e.g., Manhattan"
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="results-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "24px",
              }}
            >
              {filteredResults.map((result) => (
                <div
                  key={result.id}
                  style={{
                    backgroundColor: "#f8fafc",
                    borderRadius: "16px",
                    padding: "24px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}
                  >
                    <div style={{ flex: "0 0 200px" }}>
                      {result.photo ? (
                        <img
                          src={result.photo}
                          alt={result.name}
                          style={{
                            width: "100%",
                            height: "160px",
                            objectFit: "cover",
                            borderRadius: "12px",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "160px",
                            backgroundColor: "#e5e7eb",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#9ca3af",
                            fontSize: "14px",
                          }}
                        >
                          No Image
                        </div>
                      )}
                    </div>

                    <div style={{ flex: "1", minWidth: "200px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "12px",
                          flexWrap: "wrap",
                          gap: "12px",
                        }}
                      >
                        <div style={{ flex: "1" }}>
                          <h3
                            style={{
                              fontSize: "18px",
                              fontWeight: "bold",
                              marginBottom: "6px",
                              color: "#1f2937",
                            }}
                          >
                            {result.name}
                          </h3>
                          <p
                            style={{
                              color: "#666",
                              marginBottom: "6px",
                              fontSize: "13px",
                            }}
                          >
                            {result.type} •{" "}
                            {result.location?.address || result.location?.name}
                          </p>
                          {result.distance && (
                            <p
                              style={{
                                color: "#666",
                                fontSize: "12px",
                                marginBottom: "4px",
                              }}
                            >
                              📍 {result.distance}
                            </p>
                          )}
                          <p
                            style={{
                              color: "#666",
                              fontSize: "12px",
                            }}
                          >
                            🛏️ {result.roomCount} Room(s) • 🛌 {result.bedCount}{" "}
                            Bed(s)
                          </p>
                        </div>
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: "bold",
                            color: "#2563eb",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {result.price}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "12px",
                          marginTop: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span style={{ color: "#f59e0b", fontSize: "18px" }}>
                            ★
                          </span>
                          <span style={{ fontWeight: "600", fontSize: "15px" }}>
                            {typeof result.rating === "number"
                              ? result.rating.toFixed(1)
                              : result.rating}
                          </span>
                          <span style={{ color: "#666", fontSize: "13px" }}>
                            ({result.reviewCount} reviews)
                          </span>
                        </div>

                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-block",
                            padding: "10px 20px",
                            backgroundColor: "#2563eb",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            fontSize: "14px",
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
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No results section */}
      {!loading && searched && results.length === 0 && (
        <div
          style={{
            backgroundColor: "white",
            padding: "60px 20px",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "28px",
                marginBottom: "16px",
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              No hotels found
            </h2>
            <p style={{ fontSize: "18px", color: "#666" }}>
              Try adjusting your search dates or choosing a different location.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
