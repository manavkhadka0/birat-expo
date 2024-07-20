"use client";
import React, { useState, useMemo } from "react";
import { useGetStallData } from "@/api/admin-data";
import axios from "axios";
import { mutate } from "swr";

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

const AdminTable: React.FC = () => {
  const { stallData, stallDataEmpty, stallDataError, stallDataLoading } =
    useGetStallData();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Stall;
    direction: "asc" | "desc";
  } | null>(null);

  const handleStatusChange = async (
    id: number,
    newStatus: "Approved" | "Rejected"
  ) => {
    try {
      const endpoint =
        newStatus === "Approved" ? "approve-stall" : "reject-stall";
      await axios.post(
        `https://yachu.baliyoventures.com/api/${endpoint}/${id}/`
      );
      // After successful change, you might want to refetch the data
      // This depends on how your useGetStallData hook is implemented
      //   refresh the data
      //   mutate("https://yachu.baliyoventures.com/api/stall/");
    } catch (error) {
      console.error("Error updating status:", error);
    }
    mutate("https://yachu.baliyoventures.com/api/stall/");
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
          // Global search across all fields
          return Object.values(item).some(
            (field) =>
              field !== null &&
              field !== undefined &&
              field.toString().toLowerCase().includes(value.toLowerCase())
          );
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
  if (stallDataLoading) return <div className="text-blue-500">Loading...</div>;
  if (stallDataEmpty)
    return <div className="text-gray-500">No data available</div>;

  return (
    <div className="">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search all fields"
          className="w-full p-2 border rounded"
          onChange={(e) => setFilters({ global: e.target.value })}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th
                className="py-3 px-6 text-left cursor-pointer"
                onClick={() => handleSort("id")}
              >
                ID
              </th>
              <th
                className="py-3 px-6 text-left cursor-pointer"
                onClick={() => handleSort("company")}
              >
                Company
              </th>
              <th className="py-3 px-6 text-left">Chief Executive</th>
              <th className="py-3 px-6 text-left">Stall Type</th>
              <th className="py-3 px-6 text-left">Stall No</th>
              <th
                className="py-3 px-6 text-left cursor-pointer"
                onClick={() => handleSort("total_amount")}
              >
                Total Amount
              </th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {filteredAndSortedData.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {item.id}
                </td>
                <td className="py-3 px-6 text-left">{item.company}</td>
                <td className="py-3 px-6 text-left">{item.chief_executive}</td>
                <td className="py-3 px-6 text-left">{item.stall_type}</td>
                <td className="py-3 px-6 text-left">{item.stall_no}</td>
                <td className="py-3 px-6 text-left">
                  {parseFloat(item.total_amount).toFixed(2)}
                </td>
                <td className="py-3 px-6 text-left">{item.status}</td>
                <td className="py-3 px-6 text-left">
                  <select
                    className="bg-white border rounded px-3 py-1"
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(
                        item.id,
                        e.target.value as "Approved" | "Rejected"
                      )
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;
