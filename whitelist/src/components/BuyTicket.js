import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { useAppContext } from "../context/app.context";
import { formatDepositAmount, formatNearAmount } from "../utils";
import NearIcon from "./NearIcon";

export default function BuyTicket({ ticket, show, company }) {
  const { isAuth, connectContract, login } = useAppContext();
  const [ticketContract, setTicketContract] = useState(null);
  const contractAddress = `${company}.${process.env.CONTRACT_NAME}`;

  const loginToTicketContract = useCallback(async () => {
    await login(contractAddress);
  }, [login, contractAddress]);

  const buyTicket = useCallback(async () => {
    if (!isAuth) {
      alert("You must be logged in to buy tickets");
      return;
    }
    let _ticketContract = ticketContract;
    if (!_ticketContract) {
      _ticketContract = await connectContract(contractAddress);
      setTicketContract(_ticketContract);
    }
    const deposit = formatDepositAmount(ticket.price);
    const params = [
      {
        show_id: show.show_id,
        ticket_type: ticket.ticket_type,
      },
      "100000000000000",
      deposit,
    ];
    console.log("buy_ticket params", params);
    return _ticketContract.buy_ticket(...params);
  }, [
    isAuth,
    ticketContract,
    ticket.price,
    ticket.ticket_type,
    show.show_id,
    connectContract,
    contractAddress,
  ]);
  const isNotSoldYet = dayjs(show.selling_start_time / 1_000_000).isAfter(dayjs());
  const isSoldOutTime = dayjs(show.selling_end_time / 1_000_000).isBefore(dayjs());
  const isSoldOut = show.supply - show.sold <= 0;

  const buttonText = (() => {
    if (!isAuth) {
      return "Login to buy";
    }
    if (isNotSoldYet) {
      return "Not sold yet";
    }
    if (isSoldOutTime || isSoldOut) {
      return "Sold out";
    }
    return "Buy Now";
  })();

  const shouldDisalbeBuy = isNotSoldYet || isSoldOutTime || isSoldOut;
  const onClickButton = isAuth ? buyTicket : loginToTicketContract;

  console.log(show);

  return (
    <div className="relative flex flex-1">
      <svg viewBox="0 0 666 326" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M663 131.004L662.962 133.503C663.632 133.514 664.277 133.255 664.754 132.785C665.231 132.315 665.5 131.673 665.5 131.004H663ZM663 195.996H665.5C665.5 195.327 665.231 194.685 664.754 194.215C664.277 193.745 663.632 193.486 662.962 193.497L663 195.996ZM3 195.996L3.0376 193.497C2.36812 193.486 1.72257 193.745 1.24558 194.215C0.768581 194.685 0.5 195.327 0.5 195.996H3ZM3 131.004H0.5C0.5 131.673 0.768581 132.315 1.24558 132.785C1.72257 133.255 2.36812 133.514 3.0376 133.503L3 131.004ZM23 0.5C10.5736 0.5 0.5 10.5736 0.5 23H5.5C5.5 13.335 13.335 5.5 23 5.5V0.5ZM643 0.5H23V5.5H643V0.5ZM665.5 23C665.5 10.5736 655.426 0.5 643 0.5V5.5C652.665 5.5 660.5 13.335 660.5 23H665.5ZM665.5 131.004V23H660.5V131.004H665.5ZM662.5 133.5C662.654 133.5 662.808 133.501 662.962 133.503L663.038 128.504C662.859 128.501 662.68 128.5 662.5 128.5V133.5ZM632.5 163.5C632.5 146.931 645.931 133.5 662.5 133.5V128.5C643.17 128.5 627.5 144.17 627.5 163.5H632.5ZM662.5 193.5C645.931 193.5 632.5 180.069 632.5 163.5H627.5C627.5 182.83 643.17 198.5 662.5 198.5V193.5ZM662.962 193.497C662.808 193.499 662.654 193.5 662.5 193.5V198.5C662.68 198.5 662.859 198.499 663.038 198.496L662.962 193.497ZM665.5 303V195.996H660.5V303H665.5ZM643 325.5C655.426 325.5 665.5 315.426 665.5 303H660.5C660.5 312.665 652.665 320.5 643 320.5V325.5ZM23 325.5H643V320.5H23V325.5ZM0.5 303C0.5 315.426 10.5736 325.5 23 325.5V320.5C13.335 320.5 5.5 312.665 5.5 303H0.5ZM0.5 195.996V303H5.5V195.996H0.5ZM3.5 193.5C3.34568 193.5 3.19154 193.499 3.0376 193.497L2.9624 198.496C3.14119 198.499 3.32039 198.5 3.5 198.5V193.5ZM33.5 163.5C33.5 180.069 20.0685 193.5 3.5 193.5V198.5C22.83 198.5 38.5 182.83 38.5 163.5H33.5ZM3.5 133.5C20.0685 133.5 33.5 146.931 33.5 163.5H38.5C38.5 144.17 22.83 128.5 3.5 128.5V133.5ZM3.0376 133.503C3.19154 133.501 3.34568 133.5 3.5 133.5V128.5C3.32039 128.5 3.14119 128.501 2.9624 128.504L3.0376 133.503ZM0.5 23V131.004H5.5V23H0.5Z"
          fill="url(#paint0_linear)"
        />
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
      <div className="absolute inset-0 flex max-w-full items-center py-1.5 divide-x-2 divide-gray-300 divide-dashed">
        <div className="flex flex-col items-start w-full min-w-0 px-8 py-6 lg:px-12">
          <h3 className="w-full text-xl font-extrabold text-left truncate lg:text-2xl">
            {show.show_title}
          </h3>
          <p className="w-full text-left">{ticket.show_description || "No description provided"}</p>
          <div className="flex items-end justify-between w-full my-2">
            <div className="flex items-center">
              <span className="text-4xl">{formatNearAmount(ticket.price)}</span>
              <NearIcon className="ml-2 w-7 h-7" />
            </div>
            <div className="flex flex-col items-end justify-end text-gray-500">
              <span className="text-base font-bold lg:text-xl">
                {ticket.supply - ticket.sold}/{ticket.supply}
              </span>
              <span className="text-xs lg:text-base">
                {isNotSoldYet ? "Sell at" : "Ended"}:{" "}
                {dayjs((isNotSoldYet ? show.selling_start_time : show.selling_end_time) / 1_000_000)
                  .format("DD/MM/YYYY")
                  .toString()}
              </span>
            </div>
          </div>
          <div>
            <div className="inline-block mr-2 lg:mt-2">
              <button
                disabled={shouldDisalbeBuy}
                onClick={onClickButton}
                type="button"
                className="focus:outline-none text-white text-sm py-2 lg:py-2.5 px-5 lg:px-5 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 transform duration-100 hover:scale-105"
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center flex-shrink-0 h-full overflow-hidden w-14 lg:w-20">
          <div className="-ml-4 text-2xl font-semibold uppercase rotate-90 lg:text-3xl">
            <div className="">{ticket.ticket_type}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
