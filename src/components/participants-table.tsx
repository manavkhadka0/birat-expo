import React, { useState, useMemo } from "react";
import axios from "axios";
import { mutate } from "swr";
import { ArrowDownFromLine, DownloadCloud, Loader, Mail } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Participant, useGetParticipants } from "@/api/participants";
import { TrainingRegistrationTemplate } from "./training-registration-template";
import { TrainingRegistrationAdminPDF } from "./training-registration-admin-pdf";

type RegistrationStatus = "Pending" | "Confirmed" | "Cancelled";

const registrationTypes = [
  { value: "Single Person", label: "Single Person" },
  { value: "Group", label: "Group" },
  { value: "Expo Access", label: "Expo Access" },
];

const paymentMethods = [{ value: "Nabil Bank", label: "Nabil Bank" }];

const registrationStatuses = [
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Cancelled", label: "Cancelled" },
];

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-xl font-bold">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const ParticipantsTable: React.FC = () => {
  const {
    participants,
    participantsEmpty,
    participantsError,
    participantsLoading,
  } = useGetParticipants();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingStallId, setLoadingStallId] = useState<number | null>(null);

  const [pdfData, setPdfData] = useState<Participant | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handlePdfGeneration = (item: Participant) => {
    setPdfData(item);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-green-600";
      case "Rejected":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      setSelectedParticipant(
        participants?.find((item) => item.id === id) || null
      );
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching stall details:", error);
    }
  };

  const handleStatusChange = async (
    id: number,
    newStatus: RegistrationStatus
  ) => {
    setLoadingStallId(id);
    try {
      await axios
        .patch(`https://yachu.baliyoventures.com/api/registrations/${id}/`, {
          status: newStatus,
        })
        .then(async (res) => {
          if (newStatus === "Confirmed") {
            try {
              const emailResponse = await fetch("/api/training-registration", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(res.data),
              });
              if (!emailResponse.ok) {
                console.error("Failed to send confirmation email");
              }
            } catch (emailError) {
              console.error("Error sending confirmation email:", emailError);
            }
          }
        });

      mutate("https://yachu.baliyoventures.com/api/registrations/");
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoadingStallId(null);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const filteredAndSortedData = useMemo(() => {
    if (!participants) return [];

    let filteredData = participants.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        if (key === "global") {
          return Object.values(item).some(
            (field) =>
              field !== null &&
              field !== undefined &&
              field.toString().toLowerCase().includes(value.toLowerCase())
          );
        }
        if (key === "paymentStatus") {
          const totalAmount = parseFloat(item.total_price);
          const advanceAmount = parseFloat(item.payment_method);
          if (value === "fullyPaid") {
            return totalAmount === advanceAmount;
          } else if (value === "partiallyPaid") {
            return advanceAmount > 0 && advanceAmount < totalAmount;
          }
          return true;
        }
        if (key === "dateRange") {
          const [start, end] = value.split(",");
          const createdDate = new Date(item.created_at);
          return createdDate >= new Date(start) && createdDate <= new Date(end);
        }
        const itemValue = item[key as keyof Participant];
        return (
          itemValue !== null &&
          itemValue !== undefined &&
          itemValue.toString().toLowerCase().includes(value.toLowerCase())
        );
      });
    });

    return filteredData;
  }, [participants, filters]);

  if (participantsError)
    return <div className="text-red-500">Failed to load data</div>;
  if (participantsLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  if (participantsEmpty)
    return <div className="text-gray-500">No data available</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search (Name, Email, Mobile)"
          className="w-full p-2 border rounded"
          onChange={(e) => setFilters({ ...filters, global: e.target.value })}
        />
        <select
          className="w-full p-2 border rounded"
          onChange={(e) =>
            setFilters({ ...filters, registration_type: e.target.value })
          }
        >
          <option value="">All Registration Types</option>
          {registrationTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <select
          className="w-full p-2 border rounded"
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          {registrationStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <select
          className="w-full p-2 border rounded"
          onChange={(e) =>
            setFilters({ ...filters, payment_method: e.target.value })
          }
        >
          <option value="">All Payment Methods</option>
          {paymentMethods.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200 text-gray-600">
            <tr>
              {[
                "ID",
                "Name",
                "Registration Type",
                "Status",
                "Time Slot",
                "Total Price",
                "Payment",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="py-3 px-6 text-left font-semibold uppercase text-sm"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {filteredAndSortedData.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-4 px-6">{item.id}</td>
                <td className="py-4 px-6">
                  {item.first_name} {item.last_name}
                </td>
                <td className="py-4 px-6">{item.registration_type}</td>
                <td
                  className={`py-4 px-6 font-semibold ${getStatusColor(
                    item.status
                  )}`}
                >
                  {item.status}
                </td>
                <td className="py-4 px-6">{item.time_slot}</td>
                <td className="py-4 px-6">
                  Rs. {parseFloat(item.total_price).toFixed(2)}
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span>{item.payment_method}</span>
                    {item.payment_screenshot && (
                      <button
                        onClick={() =>
                          handleImageClick(item.payment_screenshot)
                        }
                        className="text-blue-600 hover:text-blue-800 text-xs underline"
                      >
                        View Receipt
                      </button>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex space-x-2">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(
                          item.id,
                          e.target.value as RegistrationStatus
                        )
                      }
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : item.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                      disabled={
                        loadingStallId === item.id ||
                        item.status === "Confirmed"
                      }
                    >
                      {registrationStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleViewDetails(item.id)}
                      className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                    >
                      View
                    </button>

                    {pdfData && pdfData.id === item.id ? (
                      <PDFDownloadLink
                        document={
                          <TrainingRegistrationAdminPDF data={pdfData} />
                        }
                        fileName={`${pdfData.first_name}_registration.pdf`}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                      >
                        {/* @ts-ignore */}
                        {({ loading }) => (
                          <span className="flex items-center">
                            {loading ? (
                              <Loader className="w-3 h-3 animate-spin" />
                            ) : (
                              <ArrowDownFromLine className="w-3 h-3" />
                            )}
                          </span>
                        )}
                      </PDFDownloadLink>
                    ) : (
                      <button
                        onClick={() => handlePdfGeneration(item)}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                      >
                        <DownloadCloud className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedParticipant && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
              Participant Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">
                  Full Name
                </span>
                <span className="mt-1">
                  {selectedParticipant.first_name}{" "}
                  {selectedParticipant.last_name}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">
                  Email
                </span>
                <span className="mt-1">{selectedParticipant.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">
                  Mobile
                </span>
                <span className="mt-1">
                  {selectedParticipant.mobile_number}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">Age</span>
                <span className="mt-1">{selectedParticipant.age}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">
                  Gender
                </span>
                <span className="mt-1">{selectedParticipant.gender}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">
                  Address
                </span>
                <span className="mt-1">{selectedParticipant.address}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">
                  Total Participants
                </span>
                <span className="mt-1">
                  {selectedParticipant.total_participants}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">
                  Registration Type
                </span>
                <span className="mt-1">
                  {selectedParticipant.registration_type}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">
                  Payment Screenshot
                </span>
                <span className="mt-1">
                  <img
                    src={selectedParticipant.payment_screenshot}
                    alt="Payment Screenshot"
                    className="w-full h-auto"
                  />
                </span>
              </div>
              {selectedParticipant.group_members?.length > 0 && (
                <div className="col-span-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Group Members
                  </span>
                  <div className="mt-2 space-y-2">
                    {selectedParticipant.group_members.map((member, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        {member}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-end space-x-4">
              {loadingStallId ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
              ) : (
                <>
                  <button
                    onClick={() =>
                      handleStatusChange(
                        selectedParticipant.id,
                        selectedParticipant.status === "Confirmed"
                          ? "Cancelled"
                          : "Confirmed"
                      ).then(() => setIsModalOpen(false))
                    }
                    className={`${
                      selectedParticipant.status === "Confirmed"
                        ? "bg-red-500"
                        : "bg-green-500"
                    } hover:${
                      selectedParticipant.status === "Confirmed"
                        ? "bg-red-700"
                        : "bg-green-700"
                    } px-4 py-2 text-white rounded transition duration-300`}
                  >
                    {selectedParticipant.status === "Confirmed"
                      ? "Reject Stall"
                      : "Approve Stall"}
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-300"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      >
        {selectedImage && (
          <div className="relative">
            <div className="max-h-[80vh] overflow-auto">
              <img
                src={selectedImage}
                alt="Payment Receipt"
                className="w-full h-auto"
              />
            </div>
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ParticipantsTable;
