import ContactCard from "@/components/contact-card";

export default function LiveTrainingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container mx-auto px-4">
      {children}
      <ContactCard />
    </div>
  );
}
