import { XCircleIcon } from "@heroicons/react/24/outline";
import PaymentQR from "../payment-qr";

interface PaymentStepProps {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  totalAmount: number;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: () => void;
  previewImage: string | null;
  onNext: (data: any) => void;
  onBack: () => void;
}

export function PaymentStep({
  register,
  errors,
  watch,
  setValue,
  totalAmount,
  handleFileUpload,
  removeFile,
  previewImage,
  onNext,
  onBack,
}: PaymentStepProps) {
  return (
    <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Details</h2>

      <PaymentQR amount={totalAmount} />
      <div className="grid grid-cols-1 my-4 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Screenshot
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                className={`flex flex-col w-full ${
                  previewImage ? "h-64" : "h-32"
                } border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-all relative`}
              >
                {previewImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={previewImage}
                      alt="Payment Screenshot"
                      className="w-full h-full object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
                    >
                      <XCircleIcon className="w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            {errors.payment_screenshot && (
              <p className="mt-2 text-sm text-red-600">
                {errors.payment_screenshot.message}
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register("agreed_to_no_refund")}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                I understand and agree to the training terms and conditions,
                including the no-refund policy.
              </span>
            </label>
            {errors.agreed_to_no_refund && (
              <p className="mt-2 text-sm text-red-600">
                {errors.agreed_to_no_refund.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!watch("payment_method") || !watch("payment_screenshot")}
          onClick={() =>
            onNext({
              payment_method: watch("payment_method"),
              payment_screenshot: watch("payment_screenshot"),
              agreed_to_no_refund: watch("agreed_to_no_refund"),
            })
          }
          className={`px-6 py-2 rounded-lg ${
            !watch("payment_method") || !watch("payment_screenshot")
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Next Step
        </button>
      </div>
    </section>
  );
}
