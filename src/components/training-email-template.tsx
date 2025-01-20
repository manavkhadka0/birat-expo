import { TrainingFormDataResponse } from "./training-registration-form";

interface TrainingRegistrationTemplateProps {
  data: TrainingFormDataResponse;
}

const TrainingEmailRegistrationTemplate = ({
  data,
}: TrainingRegistrationTemplateProps) => {
  // Format date for better display
  const registrationDate = new Date(data.created_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // Determine email content based on status
  const getStatusMessage = () => {
    switch (data.status) {
      case "Confirmed":
        return {
          title: "Registration Confirmed",
          description:
            "Your registration for the training program has been successfully confirmed.",
          color: "#3730a3",
          importantNote:
            "Your registration is confirmed. Please make sure to arrive at least 15 minutes before your scheduled session.",
        };
      case "Pending":
        return {
          title: "Registration Pending",
          description:
            "Your registration for the training program is currently under review.",
          color: "#f59e0b",
          importantNote:
            "Your registration is pending. We will update you once it has been processed.",
        };
      case "Cancelled":
        return {
          title: "Registration Cancelled",
          description:
            "Your registration for the training program has been cancelled.",
          color: "#dc2626",
          importantNote:
            "Your registration has been cancelled. If this was not intended, please contact our support team.",
        };
      default:
        return {
          title: "Registration Status Update",
          description:
            "We have received your registration for the training program.",
          color: "#3730a3",
          importantNote:
            "Please wait for further instructions regarding your registration.",
        };
    }
  };

  const statusMessage = getStatusMessage();

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
            color: statusMessage.color,
            fontSize: "24px",
            marginBottom: "20px",
          }}
        >
          {statusMessage.title} - BIRAT EXPO 2025
        </h1>

        <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
          {statusMessage.description} Below are your registration details:
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
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Number of Participants:</strong> {data.total_participants}
          </p>
          {data.total_price && (
            <p style={{ margin: "10px 0", color: "#4b5563" }}>
              <strong>Total Amount:</strong> Rs. {data.total_price}
            </p>
          )}

          {data.group_members && data.group_members.length > 0 && (
            <>
              <div>
                <h2
                  style={{
                    color: "#3730a3",
                    fontSize: "18px",
                    marginTop: "20px",
                    marginBottom: "15px",
                  }}
                >
                  Group Members
                </h2>
              </div>
              {data.group_members.map((member, index) => (
                <div key={index}>
                  <p style={{ margin: "10px 0", color: "#4b5563" }}>
                    <strong>Name:</strong> {member.first_name}{" "}
                    {member.last_name}
                  </p>
                  <p style={{ margin: "10px 0", color: "#4b5563" }}>
                    <strong>Email:</strong> {member.email}
                  </p>
                  <p style={{ margin: "10px 0", color: "#4b5563" }}>
                    <strong>Address:</strong> {member.address}
                  </p>
                  <p style={{ margin: "10px 0", color: "#4b5563" }}>
                    <strong>Age:</strong> {member.age}
                  </p>
                </div>
              ))}
            </>
          )}

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
            <strong>Full Name:</strong> {data.first_name} {data.last_name}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${data.email}`} style={{ color: "#4b5563" }}>
              {data.email}
            </a>
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Mobile Number:</strong>{" "}
            <a href={`tel:${data.mobile_number}`} style={{ color: "#4b5563" }}>
              {data.mobile_number}
            </a>
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Qualification:</strong> {data.qualification}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Gender:</strong> {data.gender}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Age:</strong> {data.age}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Address:</strong> {data.address}
          </p>

          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Registration Status:</strong>{" "}
            <span
              style={{
                color:
                  data.status === "Confirmed"
                    ? "#16a34a"
                    : data.status === "Cancelled"
                    ? "#dc2626"
                    : "#f59e0b",
              }}
            >
              {data.status}
            </span>
          </p>

          {data.qr_code && (
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <h2>Your QR Code</h2>
              <img
                src={data.qr_code}
                alt="Registration QR Code"
                style={{
                  width: "150px",
                  height: "150px",
                  margin: "10px auto",
                }}
              />
              <p style={{ fontSize: "14px", color: "#4B5563" }}>
                Please present this QR code at the registration desk
              </p>
            </div>
          )}
        </div>

        <p style={{ color: "#4b5563", lineHeight: "1.6", marginTop: "20px" }}>
          Please keep this email for your records. If you have any questions or
          need to make changes to your registration, please contact our support
          team.
        </p>

        <div
          style={{
            backgroundColor:
              data.status === "Confirmed"
                ? "#f0fdf4"
                : data.status === "Cancelled"
                ? "#fef2f2"
                : "#fffbeb",
            border:
              data.status === "Confirmed"
                ? "1px solid #4ade80"
                : data.status === "Cancelled"
                ? "1px solid #fca5a5"
                : "1px solid #fde047",
            padding: "15px",
            borderRadius: "8px",
            marginTop: "20px",
            color:
              data.status === "Confirmed"
                ? "#166534"
                : data.status === "Cancelled"
                ? "#991b1b"
                : "#92400e",
          }}
        >
          <p style={{ margin: "0", fontSize: "14px" }}>
            <strong>Important:</strong> {statusMessage.importantNote}
          </p>
        </div>
      </main>

      <footer
        style={{
          marginTop: "20px",
          textAlign: "center",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        <p>&copy; 2025 CIM. All rights reserved.</p>
        <p>
          This is an automated {data.status.toLowerCase()} registration email.
          Please do not reply directly to this email.
        </p>
      </footer>
    </div>
  );
};

export default TrainingEmailRegistrationTemplate;
