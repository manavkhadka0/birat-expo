import { ThematicRegistrationResponse } from "@/types/thematic";

const formatDate = (date: string | null): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getValueOrNA = (value: string | null | undefined): string => {
  return value || "N/A";
};

interface DetailRowProps {
  label: string;
  value: string | number;
  isLink?: "email" | "tel" | false;
}

const DetailRow = ({ label, value, isLink }: DetailRowProps) => (
  <p style={{ margin: "10px 0", color: "#4b5563" }}>
    <strong>{label}:</strong>{" "}
    {isLink ? (
      <a href={`${isLink}:${value}`} style={{ color: "#4b5563" }}>
        {value}
      </a>
    ) : (
      value
    )}
  </p>
);

const ThematicEmailRegistrationTemplate = ({
  data,
}: {
  data: ThematicRegistrationResponse;
}) => {
  const registrationDate = formatDate(new Date().toISOString());

  const personalDetails = [
    { label: "Registration ID", value: `#${data.id}` },
    { label: "Registration Date", value: registrationDate },
    { label: "Full Name", value: data.name },
    { label: "Organization", value: data.organization },
    { label: "Designation", value: data.designation },
    { label: "Address", value: data.address },
    { label: "Email", value: data.email, isLink: "email" as const },
    { label: "Contact", value: data.contact, isLink: "tel" as const },
  ];

  const travelDetails = [
    { label: "Participant Type", value: getValueOrNA(data.participant) },
    { label: "Arrival Date", value: formatDate(data.arrival_date) },
    { label: "Departure Date", value: formatDate(data.departure_date) },
    { label: "Airline", value: getValueOrNA(data.airline) },
    { label: "Flight Number", value: getValueOrNA(data.flight_no) },
    { label: "Flight Time", value: getValueOrNA(data.flight_time) },
  ];

  const accommodationDetails = [
    { label: "Food Preference", value: getValueOrNA(data.food) },
    {
      label: "Hotel Accommodation",
      value: getValueOrNA(data.hotel_accomodation),
    },
    { label: "Hotel", value: getValueOrNA(data.hotel) },
    { label: "Check-in Date", value: formatDate(data.check_in_date || "") },
    { label: "Checked In", value: data.checked_in ? "Yes" : "No" },
  ];

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
          Thematic Session Registration Confirmation - BIRAT EXPO 2025
        </h1>

        <p style={{ color: "#4b5563", lineHeight: "1.6" }}>Dear {data.name},</p>

        <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
          Thank you for registering for the Thematic Sessions at BIRAT EXPO
          2025. We have received your registration and will review it shortly.
          Please note that your registration is pending approval.
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
          <h2
            style={{ color: "#3730a3", fontSize: "18px", marginBottom: "15px" }}
          >
            Personal Information
          </h2>
          {personalDetails.map((detail) => (
            <DetailRow key={detail.label} {...detail} />
          ))}

          <h2
            style={{
              color: "#3730a3",
              fontSize: "18px",
              marginTop: "20px",
              marginBottom: "15px",
            }}
          >
            Travel Details
          </h2>
          {travelDetails.map((detail) => (
            <DetailRow key={detail.label} {...detail} />
          ))}

          <h2
            style={{
              color: "#3730a3",
              fontSize: "18px",
              marginTop: "20px",
              marginBottom: "15px",
            }}
          >
            Accommodation Details
          </h2>
          {accommodationDetails.map((detail) => (
            <DetailRow key={detail.label} {...detail} />
          ))}

          <h2
            style={{
              color: "#3730a3",
              fontSize: "18px",
              marginTop: "20px",
              marginBottom: "15px",
            }}
          >
            Registered Sessions
          </h2>
          {data.sessions.map((session) => (
            <div
              key={session.id}
              style={{
                margin: "15px 0",
                padding: "10px",
                backgroundColor: "white",
                borderRadius: "6px",
              }}
            >
              <p style={{ fontWeight: "600", color: "#4b5563" }}>
                {session.title}
              </p>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                Date: {session.date}
              </p>
              {session.sub_sessions.length > 0 && (
                <div style={{ marginTop: "10px", paddingLeft: "15px" }}>
                  <p style={{ fontWeight: "500", color: "#4b5563" }}>
                    Sub Sessions:
                  </p>
                  {session.sub_sessions.map((subSession) => (
                    <div key={subSession.id} style={{ marginTop: "5px" }}>
                      <p style={{ color: "#4b5563" }}>- {subSession.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Important Notes Section */}
        <div
          style={{
            backgroundColor: "#fff7ed",
            border: "1px solid #fdba74",
            padding: "15px",
            borderRadius: "8px",
            marginTop: "20px",
            color: "#9a3412",
          }}
        >
          <p style={{ margin: "0", fontSize: "14px" }}>
            <strong>Important Notes:</strong>
          </p>
          <ul style={{ margin: "10px 0 0 20px", fontSize: "14px" }}>
            <li>Please arrive 15 minutes before your scheduled sessions</li>
            <li>Participation is limited to the first 200 registrants</li>
            <li>You may attend multiple thematic sessions as registered</li>
          </ul>
        </div>

        <p style={{ color: "#4b5563", lineHeight: "1.6", marginTop: "20px" }}>
          The Chamber of Industries Morang (CIM) is organizing the Birat Expo
          2025 from 24th January to 2nd February in Biratnagar under the theme
          Digital Koshi: Bridging Innovation and Investment.
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
        <p>
          &copy; 2025 Chamber of Industries Morang (CIM). All rights reserved.
        </p>
        <p>
          This is an automated confirmation email. Please do not reply directly
          to this email.
        </p>
      </footer>
    </div>
  );
};

export default ThematicEmailRegistrationTemplate;
