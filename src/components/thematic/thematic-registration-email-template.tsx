import { ThematicRegistrationResponse } from "@/types/thematic";

const ThematicEmailRegistrationTemplate = ({
  data,
}: {
  data: ThematicRegistrationResponse;
}) => {
  // Format date for better display
  const registrationDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
          2025. Your participation has been confirmed.
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
            style={{
              color: "#3730a3",
              fontSize: "18px",
              marginBottom: "15px",
            }}
          >
            Registration Information
          </h2>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Registration ID:</strong> #{data.id}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Registration Date:</strong> {registrationDate}
          </p>

          <h2
            style={{
              color: "#3730a3",
              fontSize: "18px",
              marginTop: "20px",
              marginBottom: "15px",
            }}
          >
            Personal Details
          </h2>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Full Name:</strong> {data.name}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Organization:</strong> {data.organization}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Designation:</strong> {data.designation}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Address:</strong> {data.address}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${data.email}`} style={{ color: "#4b5563" }}>
              {data.email}
            </a>
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Contact:</strong>{" "}
            <a href={`tel:${data.contact}`} style={{ color: "#4b5563" }}>
              {data.contact}
            </a>
          </p>

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
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                {session.description}
              </p>
            </div>
          ))}
        </div>

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
