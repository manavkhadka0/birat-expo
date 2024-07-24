import React from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import MyDocument from "./form-pdf";

type ReviewAndDownloadProps = {
  data: any;
  onSubmit: () => void;
  onEdit: () => void;
  isSubmitting: boolean;
};

const ReviewAndDownload = ({
  data,
  onSubmit,
  onEdit,
  isSubmitting,
}: ReviewAndDownloadProps) => {
  return (
    <div className="bg-gray-100 p-6 font-sans min-h-screen flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <h2 className="text-3xl font-bold">Review Your Application</h2>
          <p className="mt-2 text-blue-100">BIRAT EXPO-2024</p>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3 pb-2 border-b border-gray-200">
              Exhibitor&apos;s Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Company/Organization" value={data.company} />
              <InfoItem label="Address" value={data.address} />
              <InfoItem label="Chief Executive" value={data.chief_executive} />
              <InfoItem label="Phone" value={data.phone} />
              <InfoItem label="City" value={data.city} />
              <InfoItem label="Country" value={data.country} />
              <InfoItem label="Email" value={data.email} />
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 pb-2 border-b border-gray-200">
              Participation Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Stall Type" value={data.stall_type} />
              <InfoItem label="Stall Number" value={data.stall_no} />
              <InfoItem
                label="Merge or Separate"
                value={data.merge_or_separate}
              />
              <InfoItem
                label="Total Amount"
                value={`Rs. ${data.total_amount.toLocaleString()}`}
                bold
              />
              <InfoItem
                label="Advance Amount"
                value={`Rs. ${data.advance_amount.toLocaleString()}`}
              />
              <InfoItem
                label="Remaining Amount"
                value={`Rs. ${data.remaining_amount.toLocaleString()}`}
              />
              <InfoItem
                label="Amount in Words"
                value={data.amount_in_words}
                className="col-span-full"
              />
            </div>
          </section>

          <div className="flex justify-between pt-4">
            <button
              onClick={onEdit}
              className="bg-gray-500 text-white px-6 py-2 rounded-full hover:bg-gray-600 transition duration-300"
            >
              Edit Information
            </button>
            <PDFDownloadLink
              document={<MyDocument data={data} />}
              fileName="birat-expo-application.pdf"
              className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition duration-300"
            >
              {({ loading }) =>
                loading ? "Loading document..." : "Download PDF"
              }
            </PDFDownloadLink>
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={onSubmit}
                className={`rounded px-6 py-2 text-white ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    Submitting...
                  </>
                ) : (
                  "Confirm and Submit"
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6">
          <h3 className="text-xl font-semibold mb-4">Preview PDF</h3>
          <PDFViewer
            width="100%"
            height="500"
            className="border border-gray-300 rounded"
          >
            <MyDocument data={data} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};

type InfoItemProps = {
  label: string;
  value: string;
  bold?: boolean;
  className?: string;
};

const InfoItem = ({
  label,
  value,
  bold = false,
  className = "",
}: InfoItemProps) => (
  <div className={`${className}`}>
    <p className="text-sm text-gray-600">{label}</p>
    <p className={`${bold ? "font-semibold" : ""} text-gray-800`}>{value}</p>
  </div>
);

export default ReviewAndDownload;
