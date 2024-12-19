import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
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
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
    color: "#666",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    backgroundColor: "#f3f4f6",
    padding: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 150,
    fontWeight: "bold",
  },
  value: {
    flex: 1,
  },
  footer: {
    marginTop: 30,
    borderTop: 1,
    paddingTop: 10,
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
});

export function TrainingRegistrationTemplate({ data }: { data: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
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
          <Text style={styles.sectionTitle}>Session Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {format(new Date(data.date), "PPP")}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Time Slot:</Text>
            <Text style={styles.value}>{data.time_slot}</Text>
          </View>
        </View>

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

        <View style={styles.footer}>
          <Text>Generated on {format(new Date(), "PPP")}</Text>
          <Text>BIRAT EXPO-2025 - Training Registration Document</Text>
        </View>
      </Page>
    </Document>
  );
}
