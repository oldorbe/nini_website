import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold mb-4">Content Admin</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Edit Installations, Videotapes, and Texts. Changes are saved to the
        GitHub repo and appear on the main site (GitHub Pages) after deploy.
      </p>
      <Link
        href="/admin"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Open Tina CMS
      </Link>
    </main>
  );
}
