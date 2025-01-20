import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { mutate } from "swr";
import { ArrowDownFromLine, DownloadCloud, Loader } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useGetThematicRegistrations } from "@/api/thematic";
import { ThematicRegistrationResponse } from "@/types/thematic";
import { ThematicRegistrationAdminPDF } from "./thematic-registration-admin-pdf";

type RegistrationStatus = "Pending" | "Approved" | "Rejected";

const registrationStatuses = [
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
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

const participantTypes = [
  { value: "Speaker", label: "Speaker" },
  { value: "Participant", label: "Participant" },
];

const ConfirmDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  confirmClass?: string;
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmClass,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded transition-colors ${confirmClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const ThematicParticipationTable: React.FC = () => {
  const {
    thematicRegistrations,
    thematicRegistrationsEmpty,
    thematicRegistrationsError,
    thematicRegistrationsLoading,
  } = useGetThematicRegistrations();

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedParticipant, setSelectedParticipant] =
    useState<ThematicRegistrationResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingStallId, setLoadingStallId] = useState<number | null>(null);
  const [pdfData, setPdfData] = useState<ThematicRegistrationResponse | null>(
    null
  );
  const [uniqueSessions, setUniqueSessions] = useState<
    Array<{ id: number; title: string }>
  >([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [statusChangeInfo, setStatusChangeInfo] = useState<{
    id: number;
    newStatus: RegistrationStatus;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (thematicRegistrations) {
      const sessions = new Set<{ id: number; title: string }>();
      thematicRegistrations.forEach((registration) => {
        registration.sessions.forEach((session) => {
          sessions.add({ id: session.id, title: session.title });
        });
      });
      setUniqueSessions(Array.from(sessions));
    }
  }, [thematicRegistrations]);

  const handlePdfGeneration = (item: ThematicRegistrationResponse) => {
    setPdfData(item);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "text-green-600";
      case "Cancelled":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  const handleViewDetails = (id: number) => {
    setSelectedParticipant(
      thematicRegistrations?.find((item) => item.id === id) || null
    );
    setIsModalOpen(true);
  };

  const handleStatusChange = async (
    id: number,
    newStatus: RegistrationStatus
  ) => {
    setLoadingStallId(id);
    try {
      await axios
        .patch(
          `https://yachu.baliyoventures.com/api/thematic-registrations/${id}/`,
          {
            status: newStatus,
          }
        )
        .then(async (res) => {
          if (newStatus === "Approved") {
            try {
              const emailResponse = await fetch("/api/thematic-registration", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...res.data, status: newStatus }),
              });
              if (!emailResponse.ok) {
                console.error("Failed to send confirmation email");
              }
            } catch (emailError) {
              console.error("Error sending confirmation email:", emailError);
            }
          }
        });

      mutate("https://yachu.baliyoventures.com/api/thematic-registrations/");
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoadingStallId(null);
    }
  };

  const handleStatusChangeClick = (
    id: number,
    newStatus: RegistrationStatus,
    name: string
  ) => {
    setStatusChangeInfo({ id, newStatus, name });
    setShowConfirmDialog(true);
  };

  const confirmStatusChange = async () => {
    if (!statusChangeInfo) return;
    await handleStatusChange(statusChangeInfo.id, statusChangeInfo.newStatus);
    setShowConfirmDialog(false);
    setStatusChangeInfo(null);
  };

  const filteredAndSortedData = useMemo(() => {
    if (!thematicRegistrations) return [];

    return thematicRegistrations.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;

        if (key === "global") {
          const searchableFields = [
            item.name,
            item.email,
            item.contact,
            item.organization,
          ];
          return searchableFields.some((field) =>
            field?.toLowerCase().includes(value.toLowerCase())
          );
        }

        if (key === "participant") {
          return item.participant === value;
        }

        if (key === "contact") {
          return item.contact.includes(value);
        }

        if (key === "session") {
          return item.sessions.some(
            (session) => session.id.toString() === value
          );
        }

        const itemValue = item[key as keyof ThematicRegistrationResponse];
        return itemValue
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase());
      });
    });
  }, [thematicRegistrations, filters]);

  const csvData =
    thematicRegistrations?.map((registration) => ({
      ID: registration.id,
      Name: registration.name,
      Email: registration.email,
      Contact: registration.contact,
      Organization: registration.organization,
      Participant: registration.participant,
      HotelAccommodation: registration.hotel_accomodation,
      Food: registration.food,
      ArrivalDate: registration.arrival_date,
      DepartureDate: registration.departure_date,
      Designation: registration.designation,
      Status: registration.status,
      Sessions: registration.sessions
        .map((session) => session.title)
        .join(", "),
      SessionDates: registration.sessions
        .map((session) => session.date)
        .join(", "),
      StartTimes: registration.sessions
        .map((session) => session.start_time)
        .join(", "),
      EndTimes: registration.sessions
        .map((session) => session.end_time)
        .join(", "),
      Description: registration.sessions
        .map((session) => session.description)
        .join(" | "),
    })) || [];

  const downloadCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Contact",
      "Organization",
      "Participant",
      "HotelAccommodation",
      "Food",
      "ArrivalDate",
      "DepartureDate",
      "Designation",
      "Status",
      "Sessions",
      "SessionDates",
      "StartTimes",
      "EndTimes",
      "Description",
    ];

    const rows = csvData.map((registration) => [
      registration.ID,
      registration.Name,
      registration.Email,
      registration.Contact,
      registration.Organization,
      registration.Participant,
      registration.HotelAccommodation,
      registration.Food,
      registration.ArrivalDate,
      registration.DepartureDate,
      registration.Designation,
      registration.Status,
      registration.Sessions,
      registration.SessionDates,
      registration.StartTimes,
      registration.EndTimes,
      registration.Description,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "thematic_participation_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (thematicRegistrationsError)
    return <div className="text-red-500">Failed to load data</div>;
  if (thematicRegistrationsLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  if (thematicRegistrationsEmpty)
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
          placeholder="Search (Name, Email, Organization)"
          className="w-full p-2 border rounded"
          onChange={(e) => setFilters({ ...filters, global: e.target.value })}
        />

        <input
          type="text"
          placeholder="Search Phone Number"
          className="w-full p-2 border rounded"
          onChange={(e) => setFilters({ ...filters, contact: e.target.value })}
        />

        <select
          className="w-full p-2 border rounded"
          onChange={(e) =>
            setFilters({ ...filters, participant: e.target.value })
          }
        >
          <option value="">All Types</option>
          {participantTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <select
          className="w-full p-2 border rounded"
          onChange={(e) => setFilters({ ...filters, session: e.target.value })}
        >
          <option value="">All Sessions</option>
          {uniqueSessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.title}
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
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200 text-gray-600">
            <tr>
              {[
                "ID",
                "Name",
                "Organization",
                "Email",
                "Contact",
                "Sessions",
                "Status",
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
                  {item.name} / {item.participant}
                </td>
                <td className="py-4 px-6">{item.organization}</td>
                <td className="py-4 px-6">{item.email}</td>
                <td className="py-4 px-6">{item.contact}</td>
                <td className="py-4 px-6">
                  <ul className="list-disc list-inside">
                    {item.sessions.map((session) => (
                      <li key={session.id}>{session.title}</li>
                    ))}
                  </ul>
                </td>
                <td
                  className={`py-4 px-6 font-semibold ${getStatusColor(
                    item.status || "Pending"
                  )}`}
                >
                  {loadingStallId === item.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500" />
                  ) : (
                    <select
                      value={item.status || "Pending"}
                      onChange={(e) =>
                        handleStatusChangeClick(
                          item.id!,
                          e.target.value as RegistrationStatus,
                          item.name
                        )
                      }
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : item.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                      disabled={
                        item.status === "Approved" || item.status === "Rejected"
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Accept</option>
                      <option value="Rejected">Reject</option>
                    </select>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(item.id!)}
                      className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                    >
                      View
                    </button>

                    {pdfData && pdfData.id === item.id ? (
                      <PDFDownloadLink
                        document={
                          <ThematicRegistrationAdminPDF data={pdfData} />
                        }
                        fileName={`${pdfData.name}_registration.pdf`}
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

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setStatusChangeInfo(null);
        }}
        onConfirm={confirmStatusChange}
        title="Confirm Status Change"
        message={`Are you sure you want to ${statusChangeInfo?.newStatus.toLowerCase()} the registration for ${
          statusChangeInfo?.name
        }? This action cannot be undone.`}
        confirmText={statusChangeInfo?.newStatus || ""}
        confirmClass={
          statusChangeInfo?.newStatus === "Approved"
            ? "bg-green-600 hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700"
        }
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedParticipant && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
              Participant Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">
                  Name
                </span>
                <span className="mt-1">{selectedParticipant.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">
                  Email
                </span>
                <span className="mt-1">{selectedParticipant.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">
                  Contact
                </span>
                <span className="mt-1">{selectedParticipant.contact}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">
                  Organization
                </span>
                <span className="mt-1">{selectedParticipant.organization}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">
                  Designation
                </span>
                <span className="mt-1">{selectedParticipant.designation}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">
                  Address
                </span>
                <span className="mt-1">{selectedParticipant.address}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">
                  Arrival Date
                </span>
                <span className="mt-1">{selectedParticipant.arrival_date}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">
                  Departure Date
                </span>
                <span className="mt-1">
                  {selectedParticipant.departure_date}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-semibold text-gray-600">
                  Sessions
                </span>
                <div className="mt-2 space-y-2">
                  {selectedParticipant.sessions.map((session, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      {session.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end space-x-4">
              {loadingStallId ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      handleStatusChange(
                        selectedParticipant.id!,
                        selectedParticipant.status === "Approved"
                          ? "Rejected"
                          : "Approved"
                      ).then(() => setIsModalOpen(false));
                    }}
                    className={`${
                      selectedParticipant.status === "Approved"
                        ? "bg-red-500 hover:bg-red-700"
                        : "bg-green-500 hover:bg-green-700"
                    } px-4 py-2 text-white rounded transition duration-300`}
                  >
                    {selectedParticipant.status === "Approved"
                      ? "Reject Registration"
                      : "Accept Registration"}
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
    </div>
  );
};

export default ThematicParticipationTable;
