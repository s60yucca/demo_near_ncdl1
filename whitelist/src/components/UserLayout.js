import clsx from "clsx";
import Link from "next/link";
export default function UserLayout({ children, activeIndex }) {
  return (
    <div className="bg-white py-5">
      <div className="container mx-auto space-y-5 p-5">
        <h1 className="uppercase text-gray-800 font-medium">User Dashboard</h1>
        <div className="min-h-screen space-y-3">
          <div className="flex flex-row space-x-5">
            <div className="flex flex-col px-2 space-y-3 w-1/6">
              <Link href="/user-dashboard/my-company" passHref={true}>
                <button
                  className={clsx(
                    activeIndex == 0
                      ? "bg-blue-500 text-white border-0 shadow"
                      : "border hover:text-blue-500",
                    "px-3 py-2 rounded  "
                  )}
                >
                  My Company
                </button>
              </Link>
              <Link href="/user-dashboard/my-show" passHref={true}>
                <button
                  className={clsx(
                    activeIndex == 1
                      ? "bg-blue-500 text-white border-0 shadow"
                      : "border hover:text-blue-500",
                    "px-3 py-2 rounded   "
                  )}
                >
                  My Show
                </button>
              </Link>
              <Link href="/user-dashboard/my-ticket" passHref={true}>
                <button
                  className={clsx(
                    activeIndex == 2
                      ? "bg-blue-500 text-white border-0 shadow"
                      : "border hover:text-blue-500",
                    "px-3 py-2 rounded   "
                  )}
                >
                  My Ticket
                </button>
              </Link>
            </div>
            <div className="w-5/6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
