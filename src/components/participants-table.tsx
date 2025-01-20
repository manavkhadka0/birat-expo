import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { mutate } from "swr";
import { ArrowDownFromLine, DownloadCloud, Loader, Mail } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Participant, useGetParticipants } from "@/api/participants";
import { TrainingRegistrationAdminPDF } from "./training-registration-admin-pdf";
import { CSVLink } from "react-csv";

type RegistrationStatus = "Pending" | "Confirmed" | "Cancelled";

const registrationTypes = [
  { value: "Single Person", label: "Single Person" },
  { value: "Group", label: "Group" },
  { value: "Expo Access", label: "Expo Access" },
];

const registrationStatuses = [
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Cancelled", label: "Cancelled" },
];

type TimeSlot = {
  id: number;
  date: string;
  topic: {
    name: string;
  };
};

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

const TRAINING_DATES = [
  "2025-01-24",
  "2025-01-25",
  "2025-01-26",
  "2025-01-27",
  "2025-01-28",
  "2025-01-29",
  "2025-01-30",
  "2025-01-31",
  "2025-02-01",
  "2025-02-02",
];

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
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    if (participants) {
      const uniqueTimeSlots = Array.from(
        new Set(participants.map((p) => JSON.stringify(p.time_slot)))
      ).map((slot) => JSON.parse(slot));
      setTimeSlots(uniqueTimeSlots);
    }
  }, [participants]);

  useEffect(() => {
    if (participants) {
      const uniqueTopics = Array.from(
        new Set(participants.map((p) => p.time_slot.topic.name))
      ).sort();
      setTopics(uniqueTopics);
    }
  }, [participants]);

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

        if (key === "topic") {
          return item.time_slot.topic.name === value;
        }

        if (key === "date") {
          return item.time_slot.date === value;
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

  const csvData =
    participants?.map((participant) => ({
      ID: participant.id,
      Name: `${participant.first_name} ${participant.last_name}`,
      Email: participant.email,
      Mobile: participant.mobile_number,
      Age: participant.age,
      Gender: participant.gender,
      Qualification: participant.qualification,
      RegistrationType: participant.registration_type,
      Status: participant.status,
      TotalPrice: parseFloat(participant.total_price).toFixed(2),
      PaymentMethod: participant.payment_method,
      PaymentScreenshot: participant.payment_screenshot,
      QRCode: participant.qr_code,
      IsEarlyBird: participant.is_early_bird ? "Yes" : "No",
      IsExpoAccess: participant.is_expo_access ? "Yes" : "No",
      IsFreeEntry: participant.is_free_entry ? "Yes" : "No",
      Date: participant.time_slot.date,
      StartTime: participant.time_slot.start_time,
      EndTime: participant.time_slot.end_time,
      Topic: participant.time_slot.topic.name,
      TotalParticipants: participant.total_participants,
      Address: participant.address,
      AgreedToNoRefund: participant.agreed_to_no_refund ? "Yes" : "No",
      CreatedAt: participant.created_at,
      UpdatedAt: participant.updated_at,
    })) || [];

  const downloadCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Mobile",
      "Age",
      "Gender",
      "Qualification",
      "RegistrationType",
      "Status",
      "TotalPrice",
      "PaymentMethod",
      "PaymentScreenshot",
      "QRCode",
      "IsEarlyBird",
      "IsExpoAccess",
      "IsFreeEntry",
      "Date",
      "StartTime",
      "EndTime",
      "Topic",
      "TotalParticipants",
      "Address",
      "AgreedToNoRefund",
      "CreatedAt",
      "UpdatedAt",
      "Description",
    ];

    const rows = csvData.map((participant) => [
      participant.ID,
      participant.Name,
      participant.Email,
      participant.Mobile,
      participant.Age,
      participant.Gender,
      participant.Qualification,
      participant.RegistrationType,
      participant.Status,
      participant.TotalPrice,
      participant.PaymentMethod,
      participant.PaymentScreenshot,
      participant.QRCode,
      participant.IsEarlyBird,
      participant.IsExpoAccess,
      participant.IsFreeEntry,
      participant.Date,
      participant.StartTime,
      participant.EndTime,
      participant.Topic,
      participant.TotalParticipants,
      participant.Address,
      participant.AgreedToNoRefund,
      participant.CreatedAt,
      participant.UpdatedAt,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "participants_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="flex justify-end mb-4">
        <button
          onClick={downloadCSV}
          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <DownloadCloud className="w-5 h-5 mr-2" />
          Download CSV
        </button>
      </div>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
          onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
        >
          <option value="">All Topics</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
        <select
          className="w-full p-2 border rounded"
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        >
          <option value="">All Dates</option>
          {TRAINING_DATES.map((date) => (
            <option key={date} value={date}>
              {date}
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
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <div>
                      {item.time_slot.topic.name} - {item.time_slot.date}
                    </div>
                    <div>
                      {item.time_slot.start_time} - {item.time_slot.end_time}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  Rs. {parseFloat(item.total_price).toFixed(2)}
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col">
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
              {/* Personal Information */}
              <div className="col-span-2">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">
                  Personal Information
                </h3>
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
                    <span className="text-sm font-semibold text-gray-600">
                      Age
                    </span>
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
                </div>
              </div>

              {/* Registration Details */}
              <div className="col-span-2">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">
                  Registration Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      Status
                    </span>
                    <span
                      className={`mt-1 font-semibold ${
                        selectedParticipant.status === "Confirmed"
                          ? "text-green-600"
                          : selectedParticipant.status === "Cancelled"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {selectedParticipant.status}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-600">
                      Total Price
                    </span>
                    <span className="mt-1">
                      Rs.{" "}
                      {parseFloat(selectedParticipant.total_price).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-600">
                      Total Participants
                    </span>
                    <span className="mt-1">
                      {selectedParticipant.total_participants}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time Slot Information */}
              <div className="col-span-2">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">
                  Time Slot Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-600">
                      Topic
                    </span>
                    <span className="mt-1">
                      {selectedParticipant.time_slot.topic.name}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-600">
                      Date
                    </span>
                    <span className="mt-1">
                      {selectedParticipant.time_slot.date}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-600">
                      Time
                    </span>
                    <span className="mt-1">
                      {selectedParticipant.time_slot.start_time} -{" "}
                      {selectedParticipant.time_slot.end_time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="col-span-2">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-600">
                      Qualification
                    </span>
                    <span className="mt-1">
                      {selectedParticipant.qualification}
                    </span>
                  </div>
                  {selectedParticipant.group_members?.length > 0 && (
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-600">
                        Group Members
                      </span>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedParticipant.group_members.map(
                          (member, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded">
                              {member}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
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
                    className={`px-4 py-2 text-white rounded transition duration-300 ${
                      selectedParticipant.status === "Confirmed"
                        ? "bg-red-500 hover:bg-red-700"
                        : "bg-green-500 hover:bg-green-700"
                    }`}
                  >
                    {selectedParticipant.status === "Confirmed"
                      ? "Cancel Registration"
                      : "Confirm Registration"}
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
