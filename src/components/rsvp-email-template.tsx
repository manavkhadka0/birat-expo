import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { RSVPFormData } from "@/types/invitation";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: "#1a365d",
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    color: "#4a5568",
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    color: "#2d3748",
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    padding: 10,
    borderRadius: 4,
  },
  statusAccepted: {
    backgroundColor: "#C6F6D5",
    color: "#2F855A",
  },
  statusRejected: {
    backgroundColor: "#FED7D7",
    color: "#9B2C2C",
  },
  footer: {
    marginTop: 30,
    borderTop: 1,
    paddingTop: 10,
    fontSize: 10,
    color: "#718096",
    textAlign: "center",
  },
});

interface Props {
  data: RSVPFormData;
}

export function RSVPEmailTemplate({ data }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>RSVP Response</Text>
        </View>

        <View style={styles.section}>
          <View
            style={[
              styles.status,
              data.status === "ACCEPTED"
                ? styles.statusAccepted
                : styles.statusRejected,
            ]}
          >
            <Text>
              Status: {data.status === "ACCEPTED" ? "Accepted" : "Declined"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{data.name}</Text>

          <Text style={styles.label}>Designation</Text>
          <Text style={styles.value}>{data.designation}</Text>

          <Text style={styles.label}>Company</Text>
          <Text style={styles.value}>{data.company_name}</Text>

          {data.phone_number && (
            <>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{data.phone_number}</Text>
            </>
          )}

          {data.email && (
            <>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{data.email}</Text>
            </>
          )}

          {data.status === "REJECTED" && data.remarks && (
            <>
              <Text style={styles.label}>Remarks</Text>
              <Text style={styles.value}>{data.remarks}</Text>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text>Generated on {format(new Date(), "PPP")}</Text>
        </View>
      </Page>
    </Document>
  );
}
