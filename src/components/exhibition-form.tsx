"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AnimatedModalDemo } from "./terms-and-conditions";
import { useSearchParams } from "next/navigation";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

const schema = yup.object().shape({
  company: yup.string().required("Company/Organization is required"),
  address: yup.string().required("Address is required"),
  chiefExecutive: yup.string().required("Chief Executive name is required"),
  phone: yup.string().required("Phone/Mobile is required"),
  city: yup.string().required("City is required"),
  country: yup.string().required("Country is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  stallType: yup.string().required("Please select a stall type"),
  stallNo: yup.string().required("Stall number is required"),
  mergeOrSeparate: yup.string().required("Please select merge or separate"),
  voucher: yup
    .mixed()
    .test("fileSize", "File size is too large", function (value) {
      if (!value || !(value instanceof FileList)) return true;
      return value[0]?.size <= MAX_FILE_SIZE;
    })
    .test("fileFormat", "Unsupported file format", function (value) {
      if (!value || !(value instanceof FileList)) return true;
      return SUPPORTED_FORMATS.includes(value[0]?.type);
    })
    .required("Voucher is required"),
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
  termsAndConditions: yup
    .boolean()
    .oneOf([true], "Please accept terms and conditions"),
});

type FormData = yup.InferType<typeof schema>;

const ExhibitionForm = () => {
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      stallNo: searchParams.get("stalls") || "",
      totalAmount: parseInt(searchParams.get("total") || ""),
      stallType: searchParams.get("type") || "",
    },
  });

  // handle voucher upload

  const advanceAmount = watch("advanceAmount");
  const totalAmount = watch("totalAmount");

  React.useEffect(() => {
    setValue("remainingAmount", totalAmount - advanceAmount);
  }, [advanceAmount, setValue, totalAmount]);

  const onSubmit = (data: any) => {
    console.log(JSON.stringify(data, null, 2));
  };

  return (
    <div className="bg-gray-100 p-6 font-serif pb-40 pt-20">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-lg bg-white shadow-md">
        <div className="bg-blue-800 p-6 text-center text-white">
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
                <label className="mb-1 block">Company/Organization Name:</label>
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
                <label className="mb-1 block">Organization Address:</label>
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
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block">City:</label>
                  <input
                    {...register("city")}
                    type="text"
                    className="w-full rounded border p-2"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm">
                      {errors.city.message}
                    </p>
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
              <span className="text-red-500">* </span>
              All above rates are exclusive of VAT
            </p>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 text-xl font-semibold">D. SPACE REQUIREMENT</h3>
            <div className="grid grid-cols-1 gap-4 ">
              <div className="flex items-center gap-2">
                <label className="mb-1 ">Stall no:</label>
                <input
                  {...register("stallNo")}
                  type="text"
                  disabled
                  className=" rounded border p-2"
                />
                {errors.stallNo && (
                  <p className="text-red-500 text-sm">
                    {errors.stallNo.message}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="mb-1 ">
                  If two or more stalls : Merge or Separate?
                </label>
                <select
                  {...register("mergeOrSeparate")}
                  className=" rounded border p-2"
                  defaultValue={"separate"}
                >
                  <option value="merge">Merge</option>
                  <option value="separate">Separate</option>
                </select>
                {errors.mergeOrSeparate && (
                  <p className="text-red-500 text-sm">
                    {errors.mergeOrSeparate.message}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="mb-1 ">Total Amount:</label>
                <input
                  {...register("totalAmount")}
                  type="number"
                  disabled
                  className=" rounded border p-2"
                />
                {errors.totalAmount && (
                  <p className="text-red-500 text-sm">
                    {errors.totalAmount.message}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="mb-1 ">Advance Amount:</label>
                <input
                  {...register("advanceAmount")}
                  type="number"
                  className=" rounded border p-2"
                />
                {errors.advanceAmount && (
                  <p className="text-red-500 text-sm">
                    {errors.advanceAmount.message}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="mb-1 ">Remaining Amount:</label>
                <input
                  {...register("remainingAmount")}
                  type="number"
                  disabled
                  className=" rounded border p-2"
                />
                {errors.remainingAmount && (
                  <p className="text-red-500 text-sm">
                    {errors.remainingAmount.message}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="mb-1 ">Total Amount in words:</label>
                <input
                  {...register("amountInWords")}
                  type="text"
                  className=" rounded border p-2"
                />
                {errors.amountInWords && (
                  <p className="text-red-500 text-sm">
                    {errors.amountInWords.message}
                  </p>
                )}
              </div>

              {/* file field  to upload voucher */}
              <div className="mb-6">
                <label className="mb-1 block">Upload Voucher:</label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("voucher")}
                  className="rounded border p-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Please upload an image file (JPG, JPEG, PNG) up to 1MB in
                  size.
                </p>
                {errors.voucher && (
                  <p className="text-red-500 text-sm">
                    {errors.voucher.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 text-xl font-semibold">Bank Detail:</h3>
            <p className="mb-5">
              <b>Udyog Sangthan Morang-Birat Expo</b>
              <br />
              <b>A/C No</b> : 0701017501451
              <br />
              <b>Bank</b> : Nabil Bank Ltd
              <br />
              <b>Branch</b> : Biratnagar, Nepal (Swift Code : NARBNPKA)
            </p>
            <h1 className="text-6xl mb-4">OR</h1>
            <h1>OR Scan the QR Below for Payment</h1>
            <Image
              src="/scan.png"
              alt="scan qr for payment"
              className="max-w-100"
              width={300}
              height={100}
            />
          </div>

          <div className="mb-6 rounded  p-4">
            <p className="font-semibold">
              THIS APPLICATION /CONTRACT WILL NOT BE CONSIDERED UNLESS THE
              PAYMENT IS ENCLOSED
            </p>
            <p className="mt-2">
              I HEREBY CONFIRM THAT I HAVE READ THE TERMS AND CONDITIONS PRINTED
              IN THE EXHIBITION STALL BOOKING FORM AND THAT I AM AUTHORIZED AS
              PROPRIETOR / PARTNER / MANAGER TO SIGN THIS CONTRACT.
            </p>
          </div>

          {/* checkbox terms and condition with link to terms and condition which will open a modal  */}
          <div className="flex mb-6 flex-col items-start">
            <div className="flex items-center justify-center">
              <label className="flex items-center justify-center">
                <input
                  type="checkbox"
                  {...register("termsAndConditions")}
                  className="form-checkbox mr-2"
                />
                <span>I have read and agree to the</span>
                <AnimatedModalDemo />
              </label>
            </div>
            {errors.termsAndConditions && (
              <div className="text-red-500 text-sm">
                {errors.termsAndConditions.message}
              </div>
            )}
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
