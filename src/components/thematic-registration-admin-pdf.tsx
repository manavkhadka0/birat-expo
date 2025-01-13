import { ThematicRegistrationResponse } from "@/types/thematic";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import React from "react";

const styles = StyleSheet.create({
  page: {
    padding: 6,
    fontSize: 10,
    backgroundColor: "#f8fafc",
  },
  header: {
    marginBottom: 4,
    textAlign: "center",
  },
  headerLogos: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    padding: 2,
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: "contain",
  },
  mainLogo: {
    width: 80,
    height: 40,
    objectFit: "contain",
  },
  title: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: "bold",
    color: "#1a365d",
  },
  subtitle: {
    fontSize: 8,
    marginBottom: 2,
    color: "#4a5568",
  },
  section: {
    marginBottom: 4,
    padding: 4,
    backgroundColor: "#ffffff",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 3,
    backgroundColor: "#f3f4f6",
    padding: 3,
    borderRadius: 2,
    color: "#2d3748",
  },
  row: {
    flexDirection: "row",
    marginBottom: 3,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  label: {
    width: 100,
    fontWeight: "bold",
    color: "#4a5568",
    fontSize: 9,
  },
  value: {
    flex: 1,
    color: "#2d3748",
    fontSize: 9,
  },
  footer: {
    marginTop: 15,
    borderTop: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 4,
    fontSize: 8,
    color: "#4a5568",
  },
  footerText: {
    textAlign: "center",
    marginBottom: 2,
  },
  contactInfo: {
    marginTop: 4,
    padding: 4,
    backgroundColor: "#f8fafc",
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  contactTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#2d3748",
  },
  contactRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
});

export function ThematicRegistrationAdminPDF({
  data,
}: {
  data: ThematicRegistrationResponse;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logos */}
        <View style={styles.headerLogos}>
          <Image src="/logo.png" style={styles.logo} />
          <Image src="/logo2025.png" style={styles.mainLogo} />
          <Image src="/2.png" style={styles.logo} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>BIRAT EXPO-2025</Text>
          <Text style={styles.subtitle}>
            Digital Koshi: Bridging Innovation and Investment
          </Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Thematic Session Registration</Text>
          <Text style={styles.subtitle}>Knowledge Exchange & Networking</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>{data.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Organization:</Text>
            <Text style={styles.value}>{data.organization}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Designation:</Text>
            <Text style={styles.value}>{data.designation}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{data.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Contact:</Text>
            <Text style={styles.value}>{data.contact}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{data.address}</Text>
          </View>
        </View>

        {/* Session Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Details</Text>
          {data.sessions.map((session, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>Session {index + 1}:</Text>
              <Text style={styles.value}>{session.title}</Text>
            </View>
          ))}
        </View>

        {/* Travel Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Arrival Date:</Text>
            <Text style={styles.value}>{data.arrival_date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Departure Date:</Text>
            <Text style={styles.value}>{data.departure_date}</Text>
          </View>
          {data.flight_no && (
            <View style={styles.row}>
              <Text style={styles.label}>Flight Number:</Text>
              <Text style={styles.value}>{data.flight_no}</Text>
            </View>
          )}
          {data.flight_time && (
            <View style={styles.row}>
              <Text style={styles.label}>Flight Time:</Text>
              <Text style={styles.value}>{data.flight_time}</Text>
            </View>
          )}
          {data.airline && (
            <View style={styles.row}>
              <Text style={styles.label}>Airline:</Text>
              <Text style={styles.value}>{data.airline}</Text>
            </View>
          )}
        </View>

        {/* Accommodation Details */}
        {data.hotel && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accommodation Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Hotel:</Text>
              <Text style={styles.value}>{data.hotel}</Text>
            </View>
            {data.hotel_accomodation && (
              <View style={styles.row}>
                <Text style={styles.label}>Room Type:</Text>
                <Text style={styles.value}>{data.hotel_accomodation}</Text>
              </View>
            )}
          </View>
        )}

        {/* Contact Information */}
        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>Contact Information</Text>
          <View style={styles.contactRow}>
            <Text style={styles.label}>Thematic Session Coordinator</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.value}>+977-9852056777</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated on {format(new Date(), "PPP")}
          </Text>
          <Text style={styles.footerText}>
            BIRAT EXPO-2025 - Thematic Session Registration Document
          </Text>
          <Text style={styles.footerText}>
            Digital Koshi: Bridging Innovation and Investment
          </Text>
        </View>
      </Page>
    </Document>
  );
}
