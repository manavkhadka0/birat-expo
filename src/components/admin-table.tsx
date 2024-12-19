"use client";
import React, { useState, useMemo } from "react";
import { useGetStallData } from "@/api/admin-data";
import axios from "axios";
import { mutate } from "swr";
import { set } from "react-hook-form";
import { ArrowDownFromLine, DownloadCloud, Loader } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import MyDocument from "./form-pdf";

interface Stall {
  id: number;
  company: string;
  address: string;
  chief_executive: string;
  phone: string;
  city: string;
  country: string;
  email: string;
  status: "Pending" | "Approved" | "Rejected";
  stall_type: string;
  stall_no: string;
  merge_or_separate: string;
  voucher: string;
  total_amount: string;
  advance_amount: string;
  remaining_amount: string;
  amount_in_words: string;
  terms_and_conditions_accepted: boolean;
  created_at: string;
  updated_at: string;
}

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

const AdminTable: React.FC = () => {
  const { stallData, stallDataEmpty, stallDataError, stallDataLoading } =
    useGetStallData();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Stall;
    direction: "asc" | "desc";
  } | null>(null);
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingStallId, setLoadingStallId] = useState<number | null>(null);

  const [pdfData, setPdfData] = useState<Stall | null>(null);

  const handlePdfGeneration = (item: Stall) => {
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
      const response = await axios.get(
        `https://yachu.baliyoventures.com/api/stall/${id}/`
      );
      setSelectedStall(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching stall details:", error);
    }
  };

  const handleStatusChange = async (
    id: number,
    newStatus: "Approved" | "Rejected"
  ) => {
    setLoadingStallId(id);
    try {
      const endpoint =
        newStatus === "Approved" ? "approve-stall" : "reject-stall";
      await axios.post(
        `https://yachu.baliyoventures.com/api/${endpoint}/${id}/`
      );
      if (selectedStall && selectedStall.id === id) {
        setSelectedStall({ ...selectedStall, status: newStatus });
      }
      if (newStatus === "Approved" && isModalOpen) {
        setIsModalOpen(false);
      }
      mutate("https://yachu.baliyoventures.com/api/stall/");
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoadingStallId(null);
    }
  };

  const handleSort = (key: keyof Stall) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    if (!stallData) return [];

    let filteredData = stallData.filter((item) => {
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
          const totalAmount = parseFloat(item.total_amount);
          const advanceAmount = parseFloat(item.advance_amount);
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
        const itemValue = item[key as keyof Stall];
        return (
          itemValue !== null &&
          itemValue !== undefined &&
          itemValue.toString().toLowerCase().includes(value.toLowerCase())
        );
      });
    });

    if (sortConfig !== null) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filteredData;
  }, [stallData, filters, sortConfig]);

  if (stallDataError)
    return <div className="text-red-500">Failed to load data</div>;
  if (stallDataLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  if (stallDataEmpty)
    return <div className="text-gray-500">No data available</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search all fields"
          className="w-full p-2 border rounded"
          onChange={(e) => setFilters({ ...filters, global: e.target.value })}
        />
        <select
          className="w-full p-2 border rounded"
          onChange={(e) =>
            setFilters({ ...filters, stall_type: e.target.value })
          }
        >
          {/* STALL_TYPE_CHOICES = [
         ('National Prime', 'National Prime'),
         ('National General', 'National General'),
         ('International', 'International'),
         ('Agro and MSME', 'Agro and MSME'),
         ('Automobiles', 'Automobiles'),
         ('Food Stalls', 'Food Stalls'),
         ('BDS Providers Stall', 'BDS Providers Stall'),
    ] */}
          <option value="">All Stall Types</option>
          <option value="Automobiles">Automobiles</option>
          <option value="BDS Providers Stall">BDS Providers Stall</option>
          <option value="Food Stalls">Food Stalls</option>
          <option value="National General">National General</option>
          <option value="National Prime">National Prime</option>
          <option value="International">International</option>
          <option value="Agro and MSME">Agro and MSME</option>

          {/* Add more stall types as needed */}
        </select>
        <select
          className="w-full p-2 border rounded"
          onChange={(e) =>
            setFilters({ ...filters, paymentStatus: e.target.value })
          }
        >
          <option value="">All Payment Status</option>
          <option value="fullyPaid">Fully Paid</option>
          <option value="partiallyPaid">Partially Paid</option>
        </select>
        <input
          type="date"
          className="w-full p-2 border rounded"
          onChange={(e) => {
            const endDate = new Date(e.target.value);
            endDate.setDate(endDate.getDate() + 1);
            setFilters({
              ...filters,
              dateRange: `${e.target.value},${
                endDate.toISOString().split("T")[0]
              }`,
            });
          }}
        />
      </div>
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200 text-gray-600">
            <tr>
              {[
                "ID",
                "Company",
                "Chief Executive",
                "Stall Type",
                "Stall No",
                "Total Amount",
                "Status",
                "Action",
                "Details",
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
                <td className="py-4 px-6">{item.company}</td>
                <td className="py-4 px-6">{item.chief_executive}</td>
                <td className="py-4 px-6">{item.stall_type}</td>
                <td className="py-4 px-6">{item.stall_no}</td>
                <td className="py-4 px-6">
                  {parseFloat(item.total_amount).toFixed(2)}
                </td>
                <td
                  className={`py-4 px-6 font-semibold ${getStatusColor(
                    item.status
                  )}`}
                >
                  {item.status}
                </td>
                <td className="py-4 px-6">
                  {loadingStallId === item.id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(item.id, "Approved")}
                        className={`${
                          item.status === "Approved"
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-700"
                        }  text-white font-bold py-1 px-2 rounded text-xs`}
                        disabled={item.status === "Approved"}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(item.id, "Rejected")}
                        className={`${
                          item.status === "Rejected"
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-700"
                        }  text-white font-bold py-1 px-2 rounded text-xs`}
                        disabled={item.status === "Rejected"}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(item.id)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                    >
                      View Details
                    </button>
                    {pdfData && pdfData.id === item.id ? (
                      <PDFDownloadLink
                        document={<MyDocument data={pdfData} />}
                        fileName={`${pdfData.company} Application.pdf`}
                        className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition duration-300"
                      >
                        {/* @ts-ignore - Known issue with PDFDownloadLink types */}
                        {({ loading }) => (
                          <span>
                            {loading ? (
                              <Loader className="animate-spin" />
                            ) : (
                              <ArrowDownFromLine />
                            )}
                          </span>
                        )}
                      </PDFDownloadLink>
                    ) : (
                      <button
                        onClick={() => handlePdfGeneration(item)}
                        className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition duration-300"
                      >
                        <DownloadCloud />
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
        {selectedStall && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
              {selectedStall.company}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(selectedStall).map(([key, value]) => {
                if (key === "company") return null;
                return (
                  <div key={key} className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-600 uppercase">
                      {key.replace(/_/g, " ")}
                    </span>
                    {key === "voucher" ? (
                      <a
                        href={value as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline mt-1"
                      >
                        View Voucher
                      </a>
                    ) : key === "status" ? (
                      <span
                        className={`mt-1 font-semibold ${getStatusColor(
                          value as string
                        )}`}
                      >
                        {value as string}
                      </span>
                    ) : (
                      <span className="mt-1">{value as React.ReactNode}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-8 flex justify-end space-x-4">
              {loadingStallId ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
              ) : (
                <>
                  <button
                    onClick={() =>
                      handleStatusChange(
                        selectedStall.id,
                        selectedStall.status === "Approved"
                          ? "Rejected"
                          : "Approved"
                      ).then(() => setIsModalOpen(false))
                    }
                    className={`${
                      selectedStall.status === "Approved"
                        ? "bg-red-500"
                        : "bg-green-500"
                    } hover:${
                      selectedStall.status === "Approved"
                        ? "bg-red-700"
                        : "bg-green-700"
                    } px-4 py-2 text-white rounded transition duration-300`}
                  >
                    {selectedStall.status === "Approved"
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
    </div>
  );
};

export default AdminTable;
