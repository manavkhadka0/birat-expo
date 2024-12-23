interface PaymentQRProps {
  amount: number;
}

export default function PaymentQR({ amount }: PaymentQRProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
      <div className="space-y-4">
        <div>
          <p className="mb-5">
            <b>Udyog Sangthan Morang-Birat Expo</b>
            <br />
            <b>A/C No</b> : 0701017501451
            <br />
            <b>Bank</b> : Nabil Bank Ltd
            <br />
            <b>Branch</b> : Biratnagar, Nepal (Swift Code : NARBNPKA)
          </p>
          <p className="font-semibold text-blue-600">Amount: Rs. {amount}</p>
        </div>
        <img
          src="/scan.png"
          alt="Payment QR Code"
          className="w-full h-auto object-contain rounded-lg"
        />
        <img
          src="/scan2.jpeg"
          alt="Payment QR Code"
          className="w-full h-auto object-contain rounded-lg"
        />
        <p className="text-sm text-gray-500 text-center">
          Scan QR code to pay via mobile banking
        </p>
      </div>
    </div>
  );
}
