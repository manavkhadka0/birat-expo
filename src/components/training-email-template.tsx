interface TrainingRegistrationTemplateProps {
  data: {
    id: number;
    time_slot: number;
    registration_type: string;
    status: string;
    full_name: string;
    qualification: string;
    gender: string;
    age: number;
    address: string;
    mobile_number: string;
    group_members: {
      name: string;
      email: string;
      address: string;
      age: number;
    }[];
    email: string;
    total_participants: number;
    total_price: number | null;
    payment_method: string;
    payment_screenshot: string;
    agreed_to_no_refund: boolean;
    is_early_bird: boolean;
    is_expo_access: boolean;
    is_free_entry: boolean;
    qr_code: string;
    created_at: string;
    updated_at: string;
  };
}

const TrainingEmailRegistrationTemplate = ({
  data,
}: TrainingRegistrationTemplateProps) => {
  const registrationTypeDisplay = {
    "Single Person": "Single Person Registration",
    Group: "Group Registration (5 paid + 1 free)",
    "Expo Access": "Expo Access with Training",
  };

  // Format date for better display
  const registrationDate = new Date(data.created_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

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
          Training Registration #{data.id} - BIRAT EXPO 2025
        </h1>

        <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
          Thank you for registering for our training program at BIRAT EXPO 2025.
          Below are your registration details:
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
            <strong>Status:</strong>{" "}
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor:
                  data.status === "PENDING" ? "#FEF3C7" : "#D1FAE5",
                color: data.status === "PENDING" ? "#92400E" : "#065F46",
              }}
            >
              {data.status}
            </span>
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
                    <strong>Name:</strong> {member.name}
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
            <strong>Full Name:</strong> {data.full_name}
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

          {data.qr_code && (
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <h2
                style={
                  {
                    /* existing styles */
                  }
                }
              >
                Your QR Code
              </h2>
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
            backgroundColor: "#fff7ed",
            border: "1px solid #fdba74",
            padding: "15px",
            borderRadius: "8px",
            marginTop: "20px",
            color: "#9a3412",
          }}
        >
          <p style={{ margin: "0", fontSize: "14px" }}>
            <strong>Important:</strong> Please note that this registration is
            non-refundable. Make sure to arrive at least 15 minutes before your
            scheduled session.
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
        <p>&copy; 2025 BIRAT EXPO. All rights reserved.</p>
        <p>
          This is an automated confirmation email. Please do not reply directly
          to this email.
        </p>
      </footer>
    </div>
  );
};

export default TrainingEmailRegistrationTemplate;
