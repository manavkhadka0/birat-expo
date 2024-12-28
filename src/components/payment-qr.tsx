interface PaymentQRProps {
  amount: number;
}

export default function PaymentQR({ amount }: PaymentQRProps) {
  return (
    <>
      <div className="bg-blue-50 border-dashed border-2 border-blue-200 mb-6 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Bank details */}
          <div className="space-y-2">
            <b className="text-indigo-600 block text-lg">
              Udyog Sangthan Morang-Birat Expo
            </b>
            <span className="block">
              <b className="text-gray-600">A/C No</b>: 0701017501451
            </span>
            <span className="block">
              <b className="text-gray-600">Bank</b>: Nabil Bank Ltd
            </span>
            <span className="block">
              <b className="text-gray-600">Branch</b>: Biratnagar, Nepal (Swift
              Code: NARBNPKA)
            </span>
          </div>

          {/* Right column - Amount */}
          <div className="flex items-center justify-center border-l pl-6">
            <div className="text-center">
              <div className="text-gray-600 mb-2">Your Total Amount</div>
              <div className="text-3xl font-bold text-blue-600">
                Rs. {amount}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-full mx-auto">
        <p className="text-lg text-black/90 font-bold mb-4">
          Scan QR code to pay via mobile banking
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="aspect-square relative">
            <img
              src="/scan.png"
              alt="Payment QR Code"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="aspect-square relative">
            <img
              src="/scan2.jpeg"
              alt="Payment QR Code"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      </div>
    </>
  );
}
