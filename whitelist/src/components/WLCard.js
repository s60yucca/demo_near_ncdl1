import dayjs from "dayjs";
import { formatNearAmount } from "../utils";
import NearIcon from "./NearIcon";

function Ticket({ ticket }) {
  const price = ticket.show.ticket_infos[ticket.ticket_type].price;

  return (
    <div>
      <div className="relative">
        <svg
          viewBox="0 0 666 326"
          fill="#000000"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-hidden bg-bloack"
        >
          <path
            d="M663 131.004L662.962 133.503C663.632 133.514 664.277 133.255 664.754 132.785C665.231 132.315 665.5 131.673 665.5 131.004H663ZM663 195.996H665.5C665.5 195.327 665.231 194.685 664.754 194.215C664.277 193.745 663.632 193.486 662.962 193.497L663 195.996ZM3 195.996L3.0376 193.497C2.36812 193.486 1.72257 193.745 1.24558 194.215C0.768581 194.685 0.5 195.327 0.5 195.996H3ZM3 131.004H0.5C0.5 131.673 0.768581 132.315 1.24558 132.785C1.72257 133.255 2.36812 133.514 3.0376 133.503L3 131.004ZM23 0.5C10.5736 0.5 0.5 10.5736 0.5 23H5.5C5.5 13.335 13.335 5.5 23 5.5V0.5ZM643 0.5H23V5.5H643V0.5ZM665.5 23C665.5 10.5736 655.426 0.5 643 0.5V5.5C652.665 5.5 660.5 13.335 660.5 23H665.5ZM665.5 131.004V23H660.5V131.004H665.5ZM662.5 133.5C662.654 133.5 662.808 133.501 662.962 133.503L663.038 128.504C662.859 128.501 662.68 128.5 662.5 128.5V133.5ZM632.5 163.5C632.5 146.931 645.931 133.5 662.5 133.5V128.5C643.17 128.5 627.5 144.17 627.5 163.5H632.5ZM662.5 193.5C645.931 193.5 632.5 180.069 632.5 163.5H627.5C627.5 182.83 643.17 198.5 662.5 198.5V193.5ZM662.962 193.497C662.808 193.499 662.654 193.5 662.5 193.5V198.5C662.68 198.5 662.859 198.499 663.038 198.496L662.962 193.497ZM665.5 303V195.996H660.5V303H665.5ZM643 325.5C655.426 325.5 665.5 315.426 665.5 303H660.5C660.5 312.665 652.665 320.5 643 320.5V325.5ZM23 325.5H643V320.5H23V325.5ZM0.5 303C0.5 315.426 10.5736 325.5 23 325.5V320.5C13.335 320.5 5.5 312.665 5.5 303H0.5ZM0.5 195.996V303H5.5V195.996H0.5ZM3.5 193.5C3.34568 193.5 3.19154 193.499 3.0376 193.497L2.9624 198.496C3.14119 198.499 3.32039 198.5 3.5 198.5V193.5ZM33.5 163.5C33.5 180.069 20.0685 193.5 3.5 193.5V198.5C22.83 198.5 38.5 182.83 38.5 163.5H33.5ZM3.5 133.5C20.0685 133.5 33.5 146.931 33.5 163.5H38.5C38.5 144.17 22.83 128.5 3.5 128.5V133.5ZM3.0376 133.503C3.19154 133.501 3.34568 133.5 3.5 133.5V128.5C3.32039 128.5 3.14119 128.501 2.9624 128.504L3.0376 133.503ZM0.5 23V131.004H5.5V23H0.5Z"
            fill="url(#paint0_linear)"
          ></path>

          <defs>
            <linearGradient
              id="paint0_linear"
              x1="3"
              y1="158"
              x2="653"
              y2="163"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#D25778" />
              <stop offset="0.354167" stopColor="#EC585C" />
              <stop offset="0.729167" stopColor="#E7D155" />
              <stop offset="1" stopColor="#56A8C6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex max-w-full items-center py-1.5 divide-x-2 divide-gray-300 divide-dashed overflow-hidden">
          <div className="flex flex-col items-start w-full min-w-0 px-8 py-6 lg:px-10">
            <h3 className="w-full text-xl font-extrabold text-left truncate lg:text-2xl">
              {ticket.show.show_title}
            </h3>
            <p className="w-full text-left truncate">
              {ticket.show.show_description || "No description provided"}
            </p>
            <div className="flex items-end justify-between w-full my-2">
              <div className="flex items-center">
                <span className="text-4xl">{formatNearAmount(price)}</span>
                <NearIcon className="ml-2 w-7 h-7" />
              </div>
              <div className="flex flex-col items-end justify-end text-gray-500">
                <span className="text-xs lg:text-base">
                  {"Show time"}:{" "}
                  {dayjs(ticket.show.show_time / 1_000_000)
                    .format("DD/MM/YYYY")
                    .toString()}
                </span>
              </div>
            </div>
            <div>
              <div className="inline-block mr-2 lg:mt-2">
                <button
                  type="button"
                  className="px-8 py-2 text-sm text-white duration-100 transform rounded-lg focus:outline-none lg:py-2 lg:px-12 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:scale-105"
                >
                  SELL
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center flex-shrink-0 h-full overflow-hidden w-14 lg:w-16">
            <div className="-ml-6 text-2xl font-semibold uppercase rotate-90 lg:text-3xl">
              <div className="">{ticket.ticket_type}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tickets({ tickets }) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 py-4 mb-8 lg:grid-cols-2 xl:grid-cols-3">
      {tickets.map((ticket, index) => (
        <Ticket key={index} ticket={ticket} />
      ))}
    </div>
  );
}
