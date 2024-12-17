interface PaymentQRProps {
  amount: number;
}

export default function PaymentQR({ amount }: PaymentQRProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
      <div className="space-y-4">
        <div>
          <p className="text-gray-600">Bank: Nabil Bank</p>
          <p className="text-gray-600">Account Name: Birat Expo</p>
          <p className="text-gray-600">Account Number: XXXX-XXXX-XXXX</p>
          <p className="font-semibold text-blue-600">Amount: Rs. {amount}</p>
        </div>
        <img
          src="/payment-qr.png"
          alt="Payment QR Code"
          className="w-48 h-48 mx-auto"
        />
        <p className="text-sm text-gray-500 text-center">
          Scan QR code to pay via mobile banking
        </p>
      </div>
    </div>
  );
}
