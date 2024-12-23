"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AnimatedModalDemo } from "./terms-and-conditions";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import ReviewAndDownload from "./review-form";
import { formatNumberInternational } from "@/lib/formatNumber";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

const schema = yup.object().shape({
  company: yup.string().required("Company/Organization is required"),
  address: yup.string().required("Address is required"),
  chief_executive: yup.string().required("Chief Executive name is required"),
  phone: yup.string().required("Phone/Mobile is required"),
  city: yup.string().required("City is required"),
  country: yup.string().required("Country is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  stall_type: yup.string().required("Please select a stall type"),
  stall_no: yup.string().required("Stall number is required"),
  merge_or_separate: yup.string().required("Please select merge or separate"),
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
  total_amount: yup
    .number()
    .positive("Amount must be positive")
    .required("Total amount is required"),
  advance_amount: yup
    .number()
    .positive("Amount must be positive")
    .test(
      "is-minimum-30-percent",
      "Advance amount must be at least 30% of the total amount",
      function (value) {
        const totalAmount = this.parent.total_amount;
        return (value as number) >= totalAmount * 0.3;
      }
    )
    .required("Advance amount is required"),
  remaining_amount: yup.number().required("Remaining amount is required"),
  amount_in_words: yup.string().required("Amount in words is required"),
  terms_and_conditions: yup
    .boolean()
    .oneOf([true], "Please accept terms and conditions"),
});

const ExhibitionForm = () => {
  const searchParams = useSearchParams();

  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [reviewMode, setReviewMode] = useState(false);
  const [data, setData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    reValidateMode: "onSubmit",
    defaultValues: {
      stall_no: searchParams.get("stalls") || "",
      total_amount: Math.ceil(parseInt(searchParams.get("total") || "") * 1.13),
      stall_type: searchParams.get("type") || "",
    },
  });

  // handle voucher upload

  const advance_amount = watch("advance_amount");
  const total_amount = watch("total_amount");

  useEffect(() => {
    // Calculate remaining amount when advance amount changes
    if (!advance_amount) return;
    setValue("remaining_amount", total_amount - advance_amount);
  }, [advance_amount, setValue, total_amount]);

  const onSubmit = async (data: any) => {
    setData(data);
    setReviewMode(true);
    scrollToTop();
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    const formData = new FormData();
    for (const key in data) {
      if (key === "voucher") {
        // Check if voucher is an array and has at least one file
        if (Array.isArray(data[key]) && data[key].length > 0) {
          formData.append("voucher", data[key][0]);
        } else if (data[key] instanceof FileList && data[key].length > 0) {
          formData.append("voucher", data[key][0]);
        }
      } else {
        formData.append(key, data[key]);
      }
    }

    try {
      await axios
        .post("https://yachu.baliyoventures.com/api/stall/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(() => {
          axios.post("/api/confirm-booking", data, {
            headers: {
              "Content-Type": "application/json",
            },
          });
        })
        .then(() => {
          router.push("/thank-you");
        });
    } catch (error) {
      console.error(error);
      setError(
        "An error occurred while submitting the form. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (reviewMode) {
    return (
      <ReviewAndDownload
        data={data}
        isSubmitting={isSubmitting}
        onSubmit={handleFinalSubmit}
        onEdit={() => setReviewMode(false)}
      />
    );
  }
  if (isSubmitting) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
          <p className="text-xl font-semibold">
            Submitting your application...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6  pb-40 pt-20">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-lg bg-white shadow-md">
        <div className="bg-blue-800 p-6 text-center text-white">
          <h1 className="text-3xl font-bold ">BIRAT EXPO-2025</h1>
          <p className="mt-2 text-xl">
            Digital Koshi : Bridging Innovation and Investment
          </p>
          <p className="mt-2">
            24<sup>th</sup> Jan - 2<sup>nd</sup> Feb 2025
          </p>
          <p>Biratnagar, Nepal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {error && (
            <div className="mb-6 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          )}
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
                  {...register("chief_executive")}
                  type="text"
                  className="w-full rounded border p-2"
                />
                {errors.chief_executive && (
                  <p className="text-red-500 text-sm">
                    {errors.chief_executive.message}
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
                <td className="border p-2">22nd & 23rd Jan 2025</td>
                <td className="border p-2">24th Jan - 2nd Feb 2025</td>
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
                { type: "National Prime", rate: "Rs. 60,000" },
                { type: "National General", rate: "Rs. 50,000" },
                { type: "International", rate: "US$ 500" },
                { type: "Agro and MSME", rate: "Rs. 25,000" },
                { type: "Automobiles", rate: "Rs. 60,000" },
                { type: "Food Stalls", rate: "Rs. 1,00,000" },
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
                      name="stall_type"
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
            {errors.stall_type && (
              <p className="text-red-500 text-sm">
                {errors.stall_type.message}
              </p>
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
                  {...register("stall_no")}
                  type="text"
                  disabled
                  className=" rounded border p-2"
                />
                {errors.stall_no && (
                  <p className="text-red-500 text-sm">
                    {errors.stall_no.message}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="mb-1 ">
                  If two or more stalls : Merge or Separate?
                </label>
                <select
                  {...register("merge_or_separate")}
                  className=" rounded border p-2"
                  defaultValue={"Separate"}
                >
                  <option value="Merge">Merge</option>
                  <option value="Separate">Separate</option>
                </select>
                {errors.merge_or_separate && (
                  <p className="text-red-500 text-sm">
                    {errors.merge_or_separate.message}
                  </p>
                )}
              </div>
              <div className="items-center italic mt-10 underline underline-offset-4 inline gap-2 p-2">
                <span className="text-red-500">* </span>
                <span className="">
                  Stall Amount : Rs.{" "}
                  {`${formatNumberInternational(
                    parseInt(searchParams.get("total") || "")
                  )}`}
                </span>
                <span className="">
                  +{" Rs. "}
                  {`${formatNumberInternational(
                    parseInt(searchParams.get("total") || "") * 0.13
                  )}`}
                  (13 % VAT) ={" "}
                  <span className="font-semibold">
                    Rs.{" "}
                    {`${formatNumberInternational(
                      parseInt(searchParams.get("total") || "") * 1.13
                    )}`}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="mb-1 ">Total Amount:</label>
                <input
                  {...register("total_amount")}
                  type="number"
                  disabled
                  className=" rounded border p-2"
                />
                {errors.total_amount && (
                  <p className="text-red-500 text-sm">
                    {errors.total_amount.message}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="mb-1">Advance Amount (min 30%):</label>
                <input
                  {...register("advance_amount")}
                  type="number"
                  className=" rounded border p-2"
                />
                {errors.advance_amount && (
                  <p className="text-red-500  text-sm">
                    {errors.advance_amount.message}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="mb-1 ">Remaining Amount:</label>
                <input
                  {...register("remaining_amount")}
                  type="number"
                  disabled
                  className=" rounded border p-2"
                />
                {errors.remaining_amount && (
                  <p className="text-red-500 text-sm">
                    {errors.remaining_amount.message}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="mb-1 ">Total Amount in words:</label>
                <input
                  {...register("amount_in_words")}
                  type="text"
                  className=" rounded border p-2"
                />
                {errors.amount_in_words && (
                  <p className="text-red-500 text-sm">
                    {errors.amount_in_words.message}
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
            <div className="flex mt-2 flex-col md:flex-row gap-2 items-center justify-between">
              <Image
                src="/scan.png"
                alt="scan qr for payment"
                className="max-w-100 rounded-lg"
                width={300}
                height={100}
              />
              <Image
                src="/scan2.jpeg"
                alt="scan qr for payment"
                className="max-w-100 rounded-lg"
                width={300}
                height={100}
              />
            </div>
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
                  {...register("terms_and_conditions")}
                  className="form-checkbox mr-2"
                />
                <span>I have read and agree to the</span>
                <AnimatedModalDemo />
              </label>
            </div>
            {errors.terms_and_conditions && (
              <div className="text-red-500 text-sm">
                {errors.terms_and_conditions.message}
              </div>
            )}
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
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
                "Submit Application"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExhibitionForm;
