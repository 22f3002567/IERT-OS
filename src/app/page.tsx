import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="relative min-h-screen bg-black text-white flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-md backdrop-blur-md bg-white/[0.02] border border-white/10 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
          IERT-OS
        </h1>

        <p className="text-sm text-gray-400 mb-8 tracking-widest uppercase">
          The Digital Ecosystem
        </p>

        {session?.user ? (
          <div className="flex flex-col items-center w-full">
            <div className="w-20 h-20 rounded-full border border-white/20 overflow-hidden mb-4 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  session.user.image ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`
                }
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <h2 className="text-xl font-medium">
              {session.user.name}
            </h2>

            <p className="text-gray-400 text-sm mb-8">
              {session.user.email}
            </p>

            <div className="flex flex-col gap-3 w-full">
              <Link
                href="/dashboard"
                className="w-full py-3 px-4 bg-white text-black hover:bg-gray-200 rounded-lg transition-all duration-300 ease-out font-medium flex items-center justify-center text-center"
              >
                Enter System
              </Link>

              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
                className="w-full"
              >
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all duration-300 ease-out font-medium"
                >
                  Terminate Session
                </button>
              </form>
            </div>
          </div>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
            className="w-full"
          >
            <button
              type="submit"
              className="w-full py-3 px-4 bg-white text-black hover:bg-gray-200 rounded-lg transition-all duration-300 ease-out font-medium flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>

              Authenticate with Google
            </button>
          </form>
        )}
      </div>
    </main>
  );
}