import React from "react";

const StallBookingTemplate = ({ data }: { data: any }) => {
  const renderInfoItem = (label: string, value: string, bold = false) => (
    <div key={label}>
      <p
        style={{
          fontSize: "0.875rem",
          color: "#4b5563",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </p>
      <p style={{ color: "#1f2937", fontWeight: bold ? 600 : "normal" }}>
        {value}
      </p>
    </div>
  );

  const sectionStyle = {
    marginBottom: "1.5rem",
  };

  const headingStyle = {
    fontSize: "1.25rem",
    fontWeight: 600,
    marginBottom: "0.75rem",
    paddingBottom: "0.5rem",
    borderBottom: "1px solid #e5e7eb",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  };

  return (
    <div
      style={{
        backgroundColor: "#f3f4f6",
        padding: "1.5rem",
        fontFamily: "sans-serif",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          backgroundColor: "white",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          borderRadius: "0.5rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            padding: "1.5rem",
          }}
        >
          <h2 style={{ fontSize: "1.875rem", fontWeight: "bold" }}>
            Your Application has been submitted
          </h2>
          <p style={{ marginTop: "0.5rem", color: "#bfdbfe" }}>
            BIRAT EXPO-2025
          </p>
        </div>
        <div style={{ padding: "1.5rem" }}>
          <section style={sectionStyle}>
            <h3 style={headingStyle}>Exhibitor&apos;s Details</h3>
            <div style={gridStyle}>
              {[
                "company",
                "address",
                "chief_executive",
                "phone",
                "city",
                "country",
                "email",
              ].map((item) =>
                renderInfoItem(
                  item.replace("_", " ").charAt(0).toUpperCase() +
                    item.slice(1),
                  data[item]
                )
              )}
            </div>
          </section>
          <section style={sectionStyle}>
            <h3 style={headingStyle}>Participation Details</h3>
            <div style={gridStyle}>
              {renderInfoItem("Stall Type", data.stall_type)}
              {renderInfoItem("Stall Number", data.stall_no)}
              {renderInfoItem("Merge or Separate", data.merge_or_separate)}
              {renderInfoItem(
                "Total Amount",
                `Rs. ${data.total_amount.toLocaleString()}`,
                true
              )}
              {renderInfoItem(
                "Advance Amount",
                `Rs. ${data.advance_amount.toLocaleString()}`
              )}
              {renderInfoItem(
                "Remaining Amount",
                `Rs. ${data.remaining_amount.toLocaleString()}`
              )}
              {renderInfoItem("Amount in Words", data.amount_in_words)}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StallBookingTemplate;
