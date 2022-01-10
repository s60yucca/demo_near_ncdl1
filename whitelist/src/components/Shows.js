import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { formatNearAmount } from "../utils";
import Countdown from "./Countdown";
import NearIcon from "./NearIcon";

function Show({ show, status }) {
  const contractId = show.contractId.split(".")[0] || "unknown";
  const ticketInfos = Object.values(show.ticket_infos);
  const minPrice =
    ticketInfos.length === 0
      ? 0
      : Math.min.apply(
          null,
          ticketInfos.map((ticket) => formatNearAmount(ticket.price))
        );
  const maxPrice =
    ticketInfos.length === 0
      ? 0
      : Math.max.apply(
          null,
          ticketInfos.map((ticket) => formatNearAmount(ticket.price))
        );

  return (
    <div key={show.show_id} className="w-full p-4 rounded-lg shadow-lg">
      <Link href={`/show/${show.show_id}?company=${contractId}`}>
        <a className="relative block overflow-hidden rounded">
          <Image
            alt="ecommerce"
            className="block object-cover object-center w-full h-full"
            src={show.show_banner || "https://dummyimage.com/420x260"}
            width={420}
            height={260}
          />
        </a>
      </Link>
      <div className="">
        <h2 className="pt-2 text-xl font-semibold text-gray-900 uppercase truncate title-font">
          {show.show_title}
        </h2>
        <p className="text-sm italic truncate">
          {show.show_description || "No description provided"}
        </p>
        <div className="flex flex-col justify-end h-full mt-2 space-y-1">
          <div className="flex items-center text-xl truncate">
            From {minPrice} <NearIcon className="w-4 h-4 ml-1" />
          </div>
          <p className="text-sm text-gray-600">
            Present on:{" "}
            {dayjs(show.show_time / 1_000_000)
              .format("dddd - DD/MM/YYYY")
              .toString()}
          </p>
          <p className="mt-1 text-sm">
            {status === "preparing" ? "Start selling" : "Ended"}:{" "}
            <Countdown
              endDate={
                status === "preparing"
                  ? dayjs(show.selling_start_time / 1_000_000).toISOString()
                  : dayjs(show.selling_end_time / 1_000_000).toISOString()
              }
            />
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Shows({ shows, status }) {
  return (
    <div className="grid grid-cols-1 gap-4 py-4 mb-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {shows.map((show, index) => (
        <Show key={index} show={show} status={status} />
      ))}
    </div>
  );
}
