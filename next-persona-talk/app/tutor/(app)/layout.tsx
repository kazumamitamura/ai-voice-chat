import TutorNav from "@/components/tutor/TutorNav";

export default function TutorAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <TutorNav />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
