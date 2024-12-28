import { Topic } from "@/types/training";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  headerLogos: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: "contain",
  },
  mainLogo: {
    width: 120,
    height: 60,
    objectFit: "contain",
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#1a365d",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
    color: "#4a5568",
  },
  section: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderRadius: 4,
    color: "#2d3748",
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  label: {
    width: 150,
    fontWeight: "bold",
    color: "#4a5568",
  },
  value: {
    flex: 1,
    color: "#2d3748",
  },
  paymentImage: {
    marginTop: 10,
    width: "100%",
    maxHeight: 200,
    objectFit: "contain",
  },
  footer: {
    marginTop: 30,
    borderTop: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
    fontSize: 10,
    color: "#4a5568",
  },
  footerText: {
    textAlign: "center",
    marginBottom: 5,
  },
  contactInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  contactTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2d3748",
  },
  contactRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
});

export function TrainingRegistrationTemplate({
  data,
  selectedTopic,
}: {
  data: any;
  selectedTopic: Topic | null;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logos */}
        <View style={styles.headerLogos}>
          <Image src="/logo.png" style={styles.logo} />
          <Image src="/logo-2025.png" style={styles.mainLogo} />
          <Image src="/2.png" style={styles.logo} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>BIRAT EXPO-2025</Text>
          <Text style={styles.subtitle}>
            Training Registration Confirmation
          </Text>
          <Text style={styles.subtitle}>
            Digital Koshi: Bridging Innovation and Investment
          </Text>
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
              {
                selectedTopic?.time_slots.find(
                  (slot) => slot.id === data.time_slot
                )?.start_time
              }{" "}
              -{" "}
              {
                selectedTopic?.time_slots.find(
                  (slot) => slot.id === data.time_slot
                )?.end_time
              }
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
            <Text style={styles.value}>{data.full_name}</Text>
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
            <Text style={styles.label}>Coordinator:</Text>
            <Text style={styles.value}>Sandeep Chaudhary</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.label}>Position:</Text>
            <Text style={styles.value}>
              Skill Development Unit (Co-ordinator)
            </Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>+977 9828015958</Text>
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
