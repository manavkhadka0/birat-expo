import React from "react";

interface SponsorEmailTemplateProps {
  stallType: string;
  stallId: string;
  companyName: string;
  companyEmail: string;
  contactNumber: string;
}

const SponsorEmailTemplate = ({
  stallType,
  stallId,
  companyName,
  companyEmail,
  contactNumber,
}: SponsorEmailTemplateProps) => {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#f4f7f9",
        borderRadius: "10px",
      }}
    >
      <main
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1
          style={{
            color: "#3730a3",
            fontSize: "24px",
            marginBottom: "20px",
          }}
        >
          New{" "}
          {`
            ${stallType}
          `}{" "}
          Booking for BIRAT EXPO &quot;24
        </h1>

        <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
          A new stall booking has been received for BIRAT EXPO 2025. Please
          review the details below and process the booking accordingly.
        </p>

        <div
          style={{
            backgroundColor: "#f0f4f8",
            padding: "20px",
            borderRadius: "8px",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Stall Type:</strong> {stallType}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Stall ID:</strong> {stallId}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Company Name:</strong> {companyName}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Company Email:</strong>
            <a href={`mailto:${companyEmail}`} style={{ color: "#4b5563" }}>
              {companyEmail}
            </a>
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Contact Number:</strong>
            <a href={`tel:${contactNumber}`} style={{ color: "#4b5563" }}>
              {contactNumber}
            </a>
          </p>
        </div>

        <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
          Please confirm this booking and send any necessary follow-up
          information to the company within 24 hours.
        </p>
      </main>

      <footer
        style={{
          marginTop: "20px",
          textAlign: "center",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        <p>&copy; 2025 BIRAT EXPO. All rights reserved.</p>
        <p>
          This is an automated notification. Please do not reply directly to
          this email.
        </p>
      </footer>
    </div>
  );
};

export default SponsorEmailTemplate;
