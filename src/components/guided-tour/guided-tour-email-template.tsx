import { GuidedTourResponse } from "@/types/guided-tour";

export default function GuidedTourEmailTemplate({
  data,
}: {
  data: GuidedTourResponse;
}) {
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
          Guided Tour Registration Confirmation - BIRAT EXPO 2025
        </h1>

        <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
          Dear {data.contact_person_name},
        </p>

        <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
          Thank you for registering {data.college_name} for the Guided Exposure
          Tour at BIRAT EXPO 2025. Your participation has been confirmed.
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
            <strong>Registration Date:</strong> {registrationDate}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Tour Date:</strong>{" "}
            {new Date(data.tour_date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <h2
            style={{
              color: "#3730a3",
              fontSize: "18px",
              marginTop: "20px",
              marginBottom: "15px",
            }}
          >
            College Details
          </h2>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>College Name:</strong> {data.college_name}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Address:</strong> Ward {data.ward}, {data.municipality},{" "}
            {data.district}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Phone:</strong>{" "}
            <a href={`tel:${data.phone}`} style={{ color: "#4b5563" }}>
              {data.phone}
            </a>
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${data.email}`} style={{ color: "#4b5563" }}>
              {data.email}
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
            Contact Person Details
          </h2>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Name:</strong> {data.contact_person_name}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Designation:</strong> {data.designation}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Mobile:</strong>{" "}
            <a href={`tel:${data.mobile_no}`} style={{ color: "#4b5563" }}>
              {data.mobile_no}
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
            Student Information
          </h2>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Number of Students:</strong> {data.number_of_students}
          </p>
          <p style={{ margin: "10px 0", color: "#4b5563" }}>
            <strong>Student Level:</strong> {data.student_level}
          </p>
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
            <li>Please arrive by 10:00 AM on your scheduled date</li>
            <li>All students must wear proper school/college uniforms</li>
            <li>Maximum 50 students are allowed per college</li>
            <li>The tour will conclude by 12:30 PM</li>
          </ul>
        </div>

        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#f0f4f8",
            borderRadius: "8px",
          }}
        >
          <h3
            style={{
              color: "#3730a3",
              fontSize: "16px",
              marginBottom: "10px",
            }}
          >
            Tour Schedule Overview
          </h3>
          <ul style={{ margin: "0", paddingLeft: "20px", color: "#4b5563" }}>
            <li>10:00 AM - Entry and Registration</li>
            <li>10:05 - 10:20 AM - CIM Centre for Excellence Session</li>
            <li>10:30 - 11:00 AM - Vision Koshi Startup Hackathon Session</li>
            <li>11:05 - 11:30 AM - Rojgar Koshi Pavilion Session</li>
            <li>11:30 - 12:00 PM - Digital Koshi Pavilion Session</li>
            <li>12:00 - 12:30 PM - Free Exploration Time</li>
          </ul>
        </div>

        <p style={{ color: "#4b5563", lineHeight: "1.6", marginTop: "20px" }}>
          The Chamber of Industries Morang (CIM) is organizing this Guided
          Exposure Tour as part of Birat Expo 2025 to create a positive impact
          by showcasing local opportunities and developments to students and
          youth.
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
}
