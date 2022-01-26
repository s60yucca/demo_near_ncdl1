import Image from "next/image";
import Link from "next/link";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import LoadingSection from "../components/LoadingSection";

import dayjs from "dayjs";
import SvgWave from "../components/SvgWave";

import { useAppContext } from "../context/app.context";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { callPublicRpc } from "../utils";
import { toast } from "react-toastify";
const decimal = 8

export default function Home() {
  const { mainContract, accountId, isAuth, login } = useAppContext();
  const [allContract, setAllContract] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getAllContracts = useCallback(async () => {
    const allcontracts = await callPublicRpc(
      process.env.CONTRACT_NAME,
      "all_contracts",
      { }
    );

    if (allcontracts && allcontracts.length > 0) {
      console.log("allcontracts",allcontracts)
      setAllContract(allcontracts);
    }
    setIsLoading(false)
  }, []);
  useEffect(() => {
    getAllContracts();
  }, [getAllContracts]);

  const handleCreateWL = () => {
    console.log("handleCreateWL")
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
        <div className="w-full grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-center" >
        { allContract.map((item, key) => (
          <WLCard whitelist={item[0]} t={item[1]} key={key}/>
        ))}
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
      {/* <div className="relative -mt-32 lg:-mt-32">
        <SvgWave />
      </div> */}
    </>
  );
}

function WLCard({whitelist, t}) {
    const {connectContract } = useAppContext();
    const [metadata, setMetadata] = useState(null) 
    const [extraData, setExtraData] = useState(null) 
    const [totalBought, setTotalBought] = useState(0) 
    // const [totalBought, setTotalBought] = useState(0) 
    const loadContract = useCallback(async (contract) => {
      let wlContract = await connectContract(contract);
      // console.log("connected:", wlContract)
      let meta = await wlContract.get_metadata({})
      setMetadata(meta)
      try {
        let extras = await wlContract.get_extra_meta({})
        setExtraData(extras)
        console.log("metadata", meta, extras)
      } catch (error) {
        console.error(error)
      }

    },[]);
    useEffect(() => {
      loadContract(whitelist);
    }, [loadContract]);
    return (
        <>
            {/* Card code block start */}
                <div className="bg-white dark:bg-gray-800 rounded py-5 pl-6 flex items-start shadow">
                    <div className="pl-3 pr-10 mt-1">
                    <h3 className="text-center text-xl">{t}</h3>
                      <table className="table-auto border-collapse border border-gray-400 mt-4 mb-10">
                        <tbody>
                          <tr className="border border-gray-300 px-10 py-2">
                            <td className="border border-gray-300 px-10 py-2">
                              Token
                            </td>
                            <td className="border border-gray-300 px-10 py-2">{metadata && metadata.fttoken_contract}</td>
                          </tr>
                          <tr className="border border-gray-300 px-10 py-2">
                            <td className="border border-gray-300 px-10 py-2">
                              Pool Amount
                            </td>
                            <td className="border border-gray-300 px-10 py-2">{metadata && metadata.pool_amount/10**decimal}</td>
                          </tr>
                          <tr className="border border-gray-300 px-10 py-2">
                            <td className="border border-gray-300 px-10 py-2">
                              Filled
                            </td>
                            <td className="border border-gray-300 px-10 py-2">{totalBought/10**decimal} {metadata ? `(${totalBought*100/metadata.pool_amount}%)` : ""}</td>
                          </tr>
                          <tr className="border border-gray-300 px-10 py-2">
                            <td className="border border-gray-300 px-10 py-2">
                              Conversion Rate 
                            </td>
                            <td className="border border-gray-300 px-10 py-2">{metadata && metadata.conversion_rate}</td>
                          </tr>
                          <tr className="border border-gray-300 px-10 py-2">
                            <td className="border border-gray-300 px-10 py-2">
                              TGE Time
                            </td>
                            <td className="border border-gray-300 px-10 py-2">{dayjs(metadata && metadata.tge_time / 1_000_000)
                                      .format("DD/MM/YYYY")
                                      .toString()}</td>
                          </tr>
                          <tr className="border border-gray-300 px-10 py-2">
                            <td className="border border-gray-300 px-10 py-2">
                              Cliff
                            </td>
                            <td className="border border-gray-300 px-10 py-2">{metadata && metadata.cliff} month</td>
                          </tr>
                          <tr className="border border-gray-300 px-10 py-2">
                            <td className="border border-gray-300 px-10 py-2">
                              Vesting
                            </td>
                            <td className="border border-gray-300 px-10 py-2">{metadata && metadata.vesting}% per month</td>
                          </tr>
                          <tr className="border border-gray-300 px-10 py-2">
                            <td className="border border-gray-300 px-10 py-2">
                              Vesting
                            </td>
                            <td className="border border-gray-300 px-10 py-2">{metadata && metadata.tge_unlock}%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                </div>                
            {/* Card code block end */}
        </>
    );
}
