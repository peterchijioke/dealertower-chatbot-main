import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row h-dvh w-screen">
      {/* Left Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-4 md:p-8 min-h-[60vh] lg:min-h-full">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="flex-1 bg-sidebar hidden md:flex items-center justify-center p-4 md:p-8 min-h-[40vh] lg:min-h-full">
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="flexw-full flex-col relative text-white">
              <img
                src="/logoG.png"
                alt="Dealertower Logo"
                className="rounded-lg w-64 md:w-96 h-auto mx-auto"
                width={384}
                height={96}
              />
              <span className="text-3xl font-semibold uppercase">ai Assistant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
