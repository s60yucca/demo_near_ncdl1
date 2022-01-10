import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import LoadingSection from "../components/LoadingSection";
import Shows from "../components/Shows";
import { callPublicRpc } from "../utils";

export default function MarketPage() {
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAllShows = useCallback(async () => {
    const contractAddresses = await callPublicRpc(
      process.env.CONTRACT_NAME,
      "get_ticket_contracts",
      {}
    );
    const showPromises = await Promise.all(
      contractAddresses.map(async (contractAddress) => {
        // const contract = await connectContract(contractAddress);
        const shows = await callPublicRpc(contractAddress, "get_all_shows", {});
        return shows.map((show) => ({ ...show, contractId: contractAddress }));
      })
    );
    const shows = await Promise.all(showPromises);
    setShows(shows.flat());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    getAllShows();
  }, [getAllShows]);

  const isNotSoldYet = (show) => dayjs(show.selling_start_time / 1_000_000).isAfter(dayjs());
  const isSoldOutTime = (show) => dayjs(show.selling_end_time / 1_000_000).isBefore(dayjs());
  const showsToShow = useMemo(() => {
    const result = {
      selling: [],
      ended: [],
      preparing: [],
    };
    shows.forEach((show) => {
      if (isNotSoldYet(show)) {
        result.preparing.unshift(show);
      } else if (isSoldOutTime(show)) {
        result.ended.unshift(show);
      } else {
        result.selling.unshift(show);
      }
    });
    return result;
  }, [shows]);

  return (
    <div className="bg-white">
      <div className="max-w-screen-xl mx-auto ">
        {isLoading ? (
          <LoadingSection />
        ) : (
          <div className="py-20">
            {showsToShow.selling.length > 0 && (
              <div className="flex items-end justify-between px-4 lg:px-0">
                <h3 className="text-3xl font-bold text-gray-600">Selling</h3>
                <span className="text-xl text-yellow-500 cursor-pointer hover:text-yellow-600">
                  View all
                </span>
              </div>
            )}
            <Shows status="selling" shows={showsToShow.selling.slice(0, 4)} />
            {showsToShow.preparing.length > 0 && (
              <div className="flex items-end justify-between px-4 lg:px-0">
                <h3 className="text-3xl font-bold text-gray-600 ">Preparing</h3>
                <span className="text-xl text-yellow-500 cursor-pointer hover:text-yellow-600">
                  View all
                </span>
              </div>
            )}
            <Shows status="preparing" shows={showsToShow.preparing.slice(0, 4)} />
            {showsToShow.ended.length > 0 && (
              <div className="flex items-end justify-between px-4 lg:px-0">
                <h3 className="text-3xl font-bold text-gray-600">Ended</h3>
                <span className="text-xl text-yellow-500 cursor-pointer hover:text-yellow-600">
                  View all
                </span>
              </div>
            )}
            <Shows status="ended" shows={showsToShow.ended.slice(0, 4)} />
          </div>
        )}
      </div>
    </div>
  );
}
