/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottom: 1,
    paddingBottom: 5,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    fontSize: 10,
    padding: 5,
  },
  text: {
    fontSize: 10,
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
  },
  footer: {
    textAlign: "left",
    fontSize: 10,
  },
});

const MyDocument = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image src="/logo.png" style={styles.logo} />
        <Image src="/baliyo-logo.svg" style={styles.logo} />
      </View>

      <Text style={styles.title}>BIRAT EXPO-2025</Text>
      <Text style={styles.subtitle}>
        Digital Koshi : Bridging Innovation and Investment
      </Text>
      <Text style={styles.subtitle}>
        24<sup>th</sup> Jan - 2<sup>nd</sup> Feb, 2025 • Biratnagar, Nepal
      </Text>

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
        Application/Agreement for Exhibition Participation
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>A. EXHIBITOR&apos;S DETAIL</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Company/Organization Name:</Text>{" "}
          {data.company}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Organization Address:</Text> {data.address}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Name of the Chief Executive:</Text>{" "}
          {data.chief_executive}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Phone/Mobile:</Text> {data.phone}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>City:</Text> {data.city}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Country:</Text> {data.country}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>E-mail:</Text> {data.email}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>B. EVENT DETAIL</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, { backgroundColor: "#f0f0f0" }]}>
            <View style={styles.tableCol}>
              <Text style={[styles.tableCell, styles.bold]}>Venue</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={[styles.tableCell, styles.bold]}>Set Up Date</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={[styles.tableCell, styles.bold]}>Event Date</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={[styles.tableCell, styles.bold]}>Time</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                Degree Campus, Biratnagar, Nepal
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                22<sup>nd</sup> & 23<sup>rd</sup> Jan 2025
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                24<sup>th</sup> Jan - 2<sup>nd</sup> Feb 2025
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>10 A.M to 8 P.M</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          C. DETAILS FOR PARTICIPATION & OTHER CHARGES
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Stall Type:</Text> {data.stall_type}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>D. SPACE REQUIREMENT</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Stall no:</Text> {data.stall_no}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>If two or more stalls:</Text>{" "}
          {data.merge_or_separate}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Total Amount:</Text> Rs.{" "}
          {data.total_amount.toLocaleString()}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Advance Amount:</Text> Rs.{" "}
          {data.advance_amount.toLocaleString()}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Remaining Amount:</Text> Rs.{" "}
          {data.remaining_amount.toLocaleString()}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Total Amount in words:</Text>{" "}
          {data.amount_in_words}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text>
          THIS APPLICATION /CONTRACT WILL NOT BE CONSIDERED UNLESS THE PAYMENT
          IS ENCLOSED
        </Text>
        <Text style={{ marginTop: 5 }}>
          I HEREBY CONFIRM THAT I HAVE READ THE TERMS AND CONDITIONS PRINTED IN
          THE EXHIBITION STALL BOOKING FORM AND THAT I AM AUTHORIZED AS
          PROPRIETOR / PARTNER / MANAGER TO SIGN THIS CONTRACT.
        </Text>
      </View>
    </Page>
  </Document>
);

export default MyDocument;
