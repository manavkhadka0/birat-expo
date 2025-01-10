import { Topic, TimeSlot } from "@/types/training";
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
  paymentImage: {
    marginTop: 4,
    width: "100%",
    maxHeight: 120,
    objectFit: "contain",
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

export function TrainingRegistrationTemplate({
  data,
  selectedTopic,
}: {
  data: {
    date: string;
    time_slot: string;
    registration_type: string;
    first_name: string;
    last_name: string;
    email: string;
    mobile_number: string;
    qualification: string;
    payment_method: string;
    payment_screenshot?: File;
    group_members?: Array<{ name: string; email: string }>;
  };
  selectedTopic: Topic | null;
}) {
  const [timeSlot, setTimeSlot] = React.useState<TimeSlot | null>(null);

  React.useEffect(() => {
    async function fetchTimeSlot() {
      if (selectedTopic?.id && data.date && data.time_slot) {
        try {
          const date = format(new Date(data.date), "yyyy-MM-dd");
          const response = await fetch(
            `/api/timeslots/?date=${date}&topic=${selectedTopic.id}`
          );
          const slots: TimeSlot[] = await response.json();
          const matchingSlot = slots.find(
            (slot) => slot.id === Number(data.time_slot)
          );
          setTimeSlot(matchingSlot || null);
        } catch (error) {
          console.error("Error fetching time slot:", error);
          setTimeSlot(null);
        }
      }
    }

    fetchTimeSlot();
  }, [selectedTopic?.id, data.date, data.time_slot]);

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
          <Text style={styles.title}>Rojgar Koshi</Text>
          <Text style={styles.subtitle}>Crafting Careers, Shaping Futures</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Training Name:</Text>
            <Text style={styles.value}>{selectedTopic?.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Training Description:</Text>
            <Text style={styles.value}>{selectedTopic?.description}</Text>
          </View>
        </View>

        {/* Session Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {format(new Date(data.date), "PPP")}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Time Slot:</Text>
            <Text style={styles.value}>
              {timeSlot
                ? `${timeSlot.start_time} - ${timeSlot.end_time}`
                : "Loading..."}
            </Text>
          </View>
        </View>

        {/* Registration Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Registration Type:</Text>
            <Text style={styles.value}>{data.registration_type}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>
              {data.first_name} {data.last_name}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{data.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mobile Number:</Text>
            <Text style={styles.value}>{data.mobile_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Qualification:</Text>
            <Text style={styles.value}>{data.qualification}</Text>
          </View>
        </View>

        {/* Group Members Section */}
        {data.registration_type === "Group" && data.group_members && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Group Members</Text>
            {data.group_members.map((member: any, index: number) => (
              <View key={index} style={{ marginBottom: 10 }}>
                <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                  Member {index + 1}
                </Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Name:</Text>
                  <Text style={styles.value}>{member.name}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.value}>{member.email}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Payment Details with Screenshot */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>{data.payment_method}</Text>
          </View>
          {data.payment_screenshot && (
            <View>
              <Text style={[styles.label, { marginBottom: 5 }]}>
                Payment Screenshot:
              </Text>
              <Image
                src={URL.createObjectURL(data.payment_screenshot)}
                style={styles.paymentImage}
              />
            </View>
          )}
        </View>

        {/* Contact Information */}
        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>Contact Information</Text>
          <View style={styles.contactRow}>
            <Text style={styles.label}>Sandeep Chaudhary</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.label}>Co-ordinator</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.label}>Skill Development Unit</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.value}>+9828015958</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated on {format(new Date(), "PPP")}
          </Text>
          <Text style={styles.footerText}>
            BIRAT EXPO-2025 - Training Registration Document
          </Text>
          <Text style={styles.footerText}>
            Digital Koshi: Bridging Innovation and Investment
          </Text>
        </View>
      </Page>
    </Document>
  );
}
