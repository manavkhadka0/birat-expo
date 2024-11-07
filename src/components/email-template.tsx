interface EmailTemplateProps {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const EmailTemplate = ({ email, name, message, phone }: EmailTemplateProps) => {
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
          New Contact Inquiry for BIRAT EXPO 2025
        </h1>

        <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
          You have received a new contact inquiry from a potential participant
          or visitor for BIRAT EXPO 2025. Please review the details below and
          respond promptly.
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
            <strong>Name:</strong> {name}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Email:</strong>
            <a href={`mailto:${email}`} style={{ color: "#4b5563" }}>
              {email}
            </a>
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Phone:</strong>
            <a href={`tel:${phone}`} style={{ color: "#4b5563" }}>
              {phone}
            </a>
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Message:</strong> {message}
          </p>
        </div>

        <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
          Please ensure to follow up with this inquiry within 24 hours to
          maintain our commitment to excellent customer service.
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

export default EmailTemplate;
