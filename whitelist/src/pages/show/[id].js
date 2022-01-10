import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../context/app.context";
import BuyTicket from "../../components/BuyTicket";
import { Contract, providers } from "near-api-js";
import { NextSeo } from "next-seo";
import FourNotFour from "../../components/404";
import { callPublicRpc } from "../../utils";
import dayjs from "dayjs";

export default function ShowPage() {
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(true);
  const { id, company } = router.query;
  const [showData, setShowData] = useState(null);

  const getShowMetadata = useCallback(async () => {
    if (!id || !company) {
      console.warn(`No show_id or company provided! Skip fetching show metadata.`);
      return;
    }
    setIsFetching(true);
    const result = await callPublicRpc(`${company}.${process.env.CONTRACT_NAME}`, "show_metadata", {
      show_id: id,
    });
    setShowData(result);
    setIsFetching(false);
  }, [id, company]);

  useEffect(() => {
    getShowMetadata();
  }, [getShowMetadata]);

  return (
    <div className="w-full bg-white">
      <NextSeo title={`Show ${showData?.show_title || ""}`} />
      <section className="text-gray-600 body-font">
        <div>
          <Image
            priority={true}
            layout="responsive"
            objectFit="cover"
            src={showData?.show_banner || "https://picsum.photos/1280/450"}
            width={1280}
            height={450}
            alt="show"
          />
          {!isFetching && !showData && <FourNotFour />}
          {showData && (
            <div className="flex-col w-full py-10 text-center">
              <h1 className="mb-4 text-3xl font-medium text-gray-900 uppercase title-font sm:text-4xl">
                {showData.show_title}
              </h1>
              <p className="mb-4 leading-relaxed">{showData.show_description}</p>
              <p className="mb-8 text-2xl leading-relaxed">
                {dayjs(showData.show_time / 1_000_000)
                  .format("DD/MM/YYYY")
                  .toString()}
              </p>
              <div className="grid max-w-screen-lg gap-6 mx-auto lg:grid-cols-2">
                {Object.keys(showData.ticket_infos).map((ticket, index) => (
                  <BuyTicket
                    company={company}
                    show={showData}
                    ticket={showData.ticket_infos[ticket]}
                    key={`ticket_${index}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
