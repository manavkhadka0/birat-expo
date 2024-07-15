"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  company: yup.string().required("Company/Organization is required"),
  address: yup.string().required("Address is required"),
  chiefExecutive: yup.string().required("Chief Executive name is required"),
  phone: yup.string().required("Phone/Mobile is required"),
  city: yup.string().required("City is required"),
  country: yup.string().required("Country is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  stallType: yup.string().required("Please select a stall type"),
  signature: yup.string().required("Signature is required"),
  date: yup.date().required("Date is required"),
  stallNo: yup.string().required("Stall number is required"),
  mergeOrSeparate: yup.string().required("Please select merge or separate"),
  totalAmount: yup
    .number()
    .positive("Amount must be positive")
    .required("Total amount is required"),
  advanceAmount: yup
    .number()
    .positive("Amount must be positive")
    .required("Advance amount is required"),
  remainingAmount: yup
    .number()
    .positive("Amount must be positive")
    .required("Remaining amount is required"),
  amountInWords: yup.string().required("Amount in words is required"),
});

const ExhibitionForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    console.log(data);
    // Handle form submission
  };

  return (
    <div className="bg-gray-100 p-6 font-serif">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-lg bg-white shadow-md">
        <div className="bg-blue-600 p-6 text-center text-white">
          <h1 className="text-3xl font-bold font-serif">BIRAT EXPO-2024</h1>
          <p className="mt-2 text-xl">
            Digital Koshi : Bridging Innovation and Investment
          </p>
          <p className="mt-2">22 to 31 December, 2024</p>
          <p>Biratnagar, Nepal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <h2 className="mb-4 text-2xl font-semibold">
            Application/Agreement for Exhibition Participation
          </h2>

          <div className="mb-6">
            <h3 className="mb-2 text-xl font-semibold">
              A. EXHIBITOR&apos;S DETAIL:
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block">Company/Organization:</label>
                <input
                  {...register("company")}
                  type="text"
                  className="w-full rounded border p-2"
                />
                {errors.company && (
                  <p className="text-red-500 text-sm">
                    {errors.company.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block">Address:</label>
                <input
                  {...register("address")}
                  type="text"
                  className="w-full rounded border p-2"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block">
                  Name of the Chief Executive:
                </label>
                <input
                  {...register("chiefExecutive")}
                  type="text"
                  className="w-full rounded border p-2"
                />
                {errors.chiefExecutive && (
                  <p className="text-red-500 text-sm">
                    {errors.chiefExecutive.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block">Phone/Mobile:</label>
                <input
                  {...register("phone")}
                  type="tel"
                  className="w-full rounded border p-2"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block">City:</label>
                <input
                  {...register("city")}
                  type="text"
                  className="w-full rounded border p-2"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm">{errors.city.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block">Country:</label>
                <input
                  {...register("country")}
                  type="text"
                  className="w-full rounded border p-2"
                />
                {errors.country && (
                  <p className="text-red-500 text-sm">
                    {errors.country.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block">E-mail:</label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full rounded border p-2"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 text-xl font-semibold">B. EVENT DETAIL</h3>
            <table className="w-full border-collapse border">
              <tr className="bg-gray-100">
                <th className="border p-2">Venue</th>
                <th className="border p-2">Set Up Date</th>
                <th className="border p-2">Event Date</th>
                <th className="border p-2">Time</th>
              </tr>
              <tr>
                <td className="border p-2">Degree Campus, Biratnagar, Nepal</td>
                <td className="border p-2">20 & 21st December 2024</td>
                <td className="border p-2">22-31 December 2024</td>
                <td className="border p-2">10 A.M to 8 P.M</td>
              </tr>
            </table>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 text-xl font-semibold">
              C. DETAILS FOR PARTICIPATION & OTHER CHARGES:
            </h3>
            <table className="w-full border-collapse border">
              <tr className="bg-gray-100">
                <th className="border p-2">Stall/Categories</th>
                <th className="border p-2">Rates Exclusive Tax</th>
                <th className="border p-2">Facilities</th>
                <th className="border p-2">Select</th>
              </tr>
              {[
                { type: "National (Prime)", rate: "Rs. 60,000" },
                { type: "National (General)", rate: "Rs. 50,000" },
                { type: "International", rate: "US$ 500" },
                { type: "Agro & MSMEs", rate: "Rs. 25,000" },
                { type: "Automobiles", rate: "Rs. 60,000" },
                { type: "Food stalls", rate: "Rs. 1,00,000" },
                { type: "BDS Providers Stall", rate: "Rs. 60,000" },
              ].map((stall, index) => (
                <tr key={index}>
                  <td className="border p-2">{stall.type}</td>
                  <td className="border p-2">{stall.rate}</td>
                  {index === 0 && (
                    <td className="border p-2" rowSpan={7}>
                      Two Chairs, one table, two lights, one dustbin, company
                      name on fascia, one 15 AMP plug point
                    </td>
                  )}
                  <td className="border p-2">
                    <Controller
                      name="stallType"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          {...field}
                          value={stall.type}
                          checked={field.value === stall.type}
                          onChange={() => field.onChange(stall.type)}
                          className="form-checkbox"
                        />
                      )}
                    />
                  </td>
                </tr>
              ))}
            </table>
            {errors.stallType && (
              <p className="text-red-500 text-sm">{errors.stallType.message}</p>
            )}
            <p className="mt-2 text-sm">
              *All above rates are exclusive of VAT
            </p>
          </div>

          <div className="mb-6 rounded bg-yellow-100 p-4">
            <p className="font-semibold">
              THIS APPLICATION /CONTRACT WILL NOT BE CONSIDERED UNLESS THE
              PAYMENT IS ENCLOSED
            </p>
            <p className="mt-2">
              I HEREBY CONFIRM THAT I HAVE READ THE TERMS AND CONDITIONS PRINTED
              IN THE EXHIBITION STALL BOOKING FORM AND THAT I AM AUTHORIZED AS
              PROPRIETOR / PARTNER / MANAGER TO SIGN THIS CONTRACT.
            </p>
            <div className="mt-4">
              <label className="mb-1 block">Signature:</label>
              <input
                {...register("signature")}
                type="text"
                className="w-full rounded border p-2"
              />
              {errors.signature && (
                <p className="text-red-500 text-sm">
                  {errors.signature.message}
                </p>
              )}
            </div>
            <div className="mt-2">
              <label className="mb-1 block">Date:</label>
              <input
                {...register("date")}
                type="date"
                className="w-full rounded border p-2"
              />
              {errors.date && (
                <p className="text-red-500 text-sm">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 text-xl font-semibold">D. SPACE REQUIREMENT</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block">Stall no:</label>
                <input
                  {...register("stallNo")}
                  type="text"
                  className="w-full rounded border p-2"
                />
                {errors.stallNo && (
                  <p className="text-red-500 text-sm">
                    {errors.stallNo.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block">
                  If two or more stalls : Merge or Separate?
                </label>
                <select
                  {...register("mergeOrSeparate")}
                  className="w-full rounded border p-2"
                >
                  <option value="">Select</option>
                  <option value="merge">Merge</option>
                  <option value="separate">Separate</option>
                </select>
                {errors.mergeOrSeparate && (
                  <p className="text-red-500 text-sm">
                    {errors.mergeOrSeparate.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block">Total Amount:</label>
                <input
                  {...register("totalAmount")}
                  type="number"
                  className="w-full rounded border p-2"
                />
                {errors.totalAmount && (
                  <p className="text-red-500 text-sm">
                    {errors.totalAmount.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block">Advance Amount:</label>
                <input
                  {...register("advanceAmount")}
                  type="number"
                  className="w-full rounded border p-2"
                />
                {errors.advanceAmount && (
                  <p className="text-red-500 text-sm">
                    {errors.advanceAmount.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block">Remaining Amount:</label>
                <input
                  {...register("remainingAmount")}
                  type="number"
                  className="w-full rounded border p-2"
                />
                {errors.remainingAmount && (
                  <p className="text-red-500 text-sm">
                    {errors.remainingAmount.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block">Total Amount in words:</label>
                <input
                  {...register("amountInWords")}
                  type="text"
                  className="w-full rounded border p-2"
                />
                {errors.amountInWords && (
                  <p className="text-red-500 text-sm">
                    {errors.amountInWords.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 text-xl font-semibold">Bank Detail:</h3>
            <p>
              Udyog Sangthan Morang-Birat Expo, A/C No. 0701017501451, Nabil
              Bank Ltd, Biratnagar, Nepal (Swift Code : NARBNPKA)
            </p>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExhibitionForm;
