import Image from "next/image";
import Link from "next/link";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import dayjs from "dayjs";
import SvgWave from "../components/SvgWave";

import {
  FcCurrencyExchange,
  FcTwoSmartphones,
  FcCustomerSupport,
} from "react-icons/fc";
import { useAppContext } from "../context/app.context";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { callPublicRpc } from "../utils";
import { toast } from "react-toastify";

const settings = {
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  autoplay: true,
};

export default function Home() {
  const { mainContract, accountId, isAuth, login } = useAppContext();

  const router = useRouter();

  const handleStartSelling = async () => {
    if (!isAuth) {
      toast("Please login first");
      return;
    }
    const hasCompany = await getCompany();
    if (!hasCompany) {
      mainContract.create_new_ticket_contract(
        {
          prefix: `ticket_${dayjs().unix()}`,
          metadata: {
            spec: "v0.1",
            name: `Ticket contract for ${accountId}`,
            symbol: "TIKTOK",
          },
        },
        process.env.TICKET_PREPARE_GAS,
        process.env.CONTRACT_CREATE_FEE
      );
    } else {
      router.push("/user-dashboard");
    }
  };
  const handleCreateWL = () => {
    if (isAuth) {
      // createWL();
      router.replace("/create_wl");
    } else {
      login(`${process.env.domain}/create_wl`);
    }
  };
  return (
    <>
      <div className="pt-5 px-5 ">


        <div className="w-full grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <WLCard/>
        <WLCard/>
        <WLCard/>
        <WLCard/>
        </div>                    
        <div className="w-full px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center">
          <div className="flex flex-col w-full md:w-4/5 justify-center items-start text-center md:text-left">
            <h1 className="my-4 text-5xl font-bold leading-tight text-gray-800">
              Create your whitelist sale contract
            </h1>
            <button onClick={handleCreateWL} className="mx-auto lg:mx-0  bg-white text-gray-800 font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out">
              Instant Create
            </button>
          </div>
        </div>
      </div>
      <div className="relative -mt-12 lg:-mt-24">
        <SvgWave />
      </div>
    </>
  );
}

function WLCard({whitelist}) {
    return (
        <>
            {/* Card code block start */}
                <div className="bg-white dark:bg-gray-800 rounded py-5 pl-6 flex items-start shadow">
                    <div className="text-gray-700 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-dashboard" width={32} height={32} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" />
                            <circle cx={12} cy={13} r={2} />
                            <line x1="13.45" y1="11.55" x2="15.5" y2="9.5" />
                            <path d="M6.4 20a9 9 0 1 1 11.2 0Z" />
                        </svg>
                    </div>
                    <div className="pl-3 pr-10 mt-1">
                        <h3 className="font-normal leading-4 text-gray-800 dark:text-gray-100 text-base">{whitelist.title}</h3>
                        <div className="flex items-end mt-4">
                            <h2 className="text-indigo-700 dark:text-indigo-600 text-2xl leading-normal font-bold">2,330</h2>
                            <p className="ml-2 mb-1 text-sm text-gray-600 dark:text-gray-400">from 2,125</p>
                        </div>
                        <div className="flex items-center mt-5">
                            <div className="text-green-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-trending-up" width={24} height={24} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" />
                                    <polyline points="3 17 9 11 13 15 21 7" />
                                    <polyline points="14 7 21 7 21 14" />
                                </svg>
                            </div>
                            <p className="text-green-400 text-xs tracking-wide font-bold leading-normal pl-1">7.2% Increase</p>
                        </div>
                    </div>
                </div>                
            {/* Card code block end */}
        </>
    );
}
