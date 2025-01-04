import { RSVPFormData } from "@/types/invitation";
import { format } from "date-fns";

interface Props {
  data: RSVPFormData;
}

export function RSVPEmailJaneTemplate({ data }: Props) {
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
            textAlign: "center",
          }}
        >
          RSVP Response for BIRAT EXPO 2025
        </h1>

        <div
          style={{
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: data.status === "ACCEPTED" ? "#C6F6D5" : "#FED7D7",
            color: data.status === "ACCEPTED" ? "#2F855A" : "#9B2C2C",
            marginBottom: "20px",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Status: {data.status === "ACCEPTED" ? "Accepted" : "Declined"}
        </div>

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
            <strong>Name:</strong> {data.name}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Designation:</strong> {data.designation}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Company:</strong> {data.company_name}
          </p>
          {data.phone_number && (
            <p style={{ margin: "10px 0", color: "#4b5563" }}>
              <strong>Phone:</strong>{" "}
              <a href={`tel:${data.phone_number}`} style={{ color: "#4b5563" }}>
                {data.phone_number}
              </a>
            </p>
          )}
          {data.email && (
            <p style={{ margin: "10px 0", color: "#4b5563" }}>
              <strong>Email:</strong>{" "}
              <a href={`mailto:${data.email}`} style={{ color: "#4b5563" }}>
                {data.email}
              </a>
            </p>
          )}
          {data.status === "REJECTED" && data.remarks && (
            <p style={{ margin: "10px 0", color: "#4b5563" }}>
              <strong>Remarks:</strong> {data.remarks}
            </p>
          )}
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
        <p>Generated on {format(new Date(), "PPP")}</p>
        <p>&copy; 2025 BIRAT EXPO. All rights reserved.</p>
        <p>
          This is an automated notification. Please do not reply directly to
          this email.
        </p>
      </footer>
    </div>
  );
}
