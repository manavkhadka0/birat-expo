import Image from "next/image";

interface EmailTemplateProps {
  firstName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const EmailTemplate = ({
  email,
  firstName,
  message,
  phone,
  subject,
}: EmailTemplateProps) => {
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
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "10px",
        }}
      >
        <Image
          src="logo.png"
          alt="BIRAT EXPO 2024 Logo"
          style={{ height: "50px" }}
          height={50}
          width={100}
        />
        <Image
          src="baliyo-logo.svg"
          alt="Baliyo Logo"
          style={{ height: "40px" }}
          height={40}
          width={100}
        />
      </header>

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
          Welcome to BIRAT EXPO 2024, {firstName}!
        </h1>

        <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
          Thank you for your interest in BIRAT EXPO 2024. We&apos;ve received
          your inquiry and will get back to you shortly. Here&apos;s a summary
          of the information you provided:
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
            <strong>Email:</strong> {email}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Phone:</strong> {phone}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Subject:</strong> {subject}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Message:</strong> {message}
          </p>
        </div>

        <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
          We&apos;re excited to have you join us for this innovative showcase of
          technology and ideas. Our team will review your message and respond as
          soon as possible.
        </p>

        <a
          href="https://biratexpo2024.com"
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "12px 24px",
            backgroundColor: "#3730a3",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
            fontWeight: "bold",
          }}
        >
          Learn More About BIRAT EXPO 2024
        </a>
      </main>

      <footer
        style={{
          marginTop: "20px",
          textAlign: "center",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        <p>&copy; 2024 BIRAT EXPO. All rights reserved.</p>
        <p>
          You&apos;re receiving this email because you contacted us about BIRAT
          EXPO 2024.
        </p>
      </footer>
    </div>
  );
};

export default EmailTemplate;
