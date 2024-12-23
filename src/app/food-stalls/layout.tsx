import ContactInformation from "@/components/contact-information";

export default function SponsorshipLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <ContactInformation />
    </>
  );
}
