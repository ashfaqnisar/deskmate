import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <div className="m-auto text-center">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="mt-1 text-stone-500">That page doesn&apos;t exist.</p>
      <Link to="/" className="mt-4 inline-block text-indigo-600 underline dark:text-indigo-400">
        Back to chat
      </Link>
    </div>
  );
}
