import { useCallback, useEffect, useState } from "react";
import LoadingSection from "../components/LoadingSection";
import Button from "@material-tailwind/react/Button";
import { useAppContext } from "../context/app.context";
import { callPublicRpc } from "../utils";
import Modal from "@material-tailwind/react/Modal";
import ModalHeader from "@material-tailwind/react/ModalHeader";
import ModalBody from "@material-tailwind/react/ModalBody";
import ModalFooter from "@material-tailwind/react/ModalFooter";
import dayjs from "dayjs";
const decimal = 8
export default function WhitelistSale() {
  const { isAuth, accountId, triedEager, login, connectContract } = useAppContext();
  const [wlcontracts, setWlcontracts] = useState([]);
  const [currentContract, setCurrentContract] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);
  const [unlockDeposit, setUnlockDeposit] = useState(false);
  const [totalBought, setTotalBought] = useState(0);
  const [saleTitle, setSaleTitle] = useState("");
  const getContracts = useCallback(async () => {
    if (!isAuth || !accountId) {
      return;
    }
    const mycontracts = await callPublicRpc(
      process.env.CONTRACT_NAME,
      "get_contracts_by_owner",
      { owner: accountId }
    );

    if (mycontracts && mycontracts.length > 0) {
      setWlcontracts(mycontracts);
    }
    setIsLoading(false)
  }, [accountId]);

const handleViewContract = async (contract) => {
  let wlContract = await connectContract(contract[0]);
  console.log("connected:", connectContract(contract[0]))
  setCurrentContract(wlContract)
  let metadata = await wlContract.get_metadata({})
  let extras = await wlContract.get_extra_meta({})
  setMetadata(metadata)
  setUnlockDeposit(extras[0])
  setTotalBought(extras[1])
  setSaleTitle(contract[1])
  console.log("metadata", metadata, extras)
  setShowModal(true)
};

const handleUnlock = async () => {
  await currentContract.unlock_deposit_now({})
  setUnlockDeposit(true)
}

  useEffect(() => {
    getContracts();
  }, [getContracts]);

  useEffect(() => {
    if (triedEager && !isAuth && !accountId) {
      // login();
      console.log("triedEager", triedEager, "isAuth", isAuth, "accountId", accountId);
    }
  }, [triedEager, isAuth, login, accountId]);

  return (
    <div className="bg-white">
      <div className="max-w-screen-xl mx-auto ">
        {isLoading ? (
          <LoadingSection />
        ) : (
          <center>
          <div className="w-full mt-10 mb-10">
            <table className="table-auto border-collapse border border-gray-400 mt-10 mb-10">
              <thead>
                <tr className="border border-gray-300 px-10 py-2">
                  <th className="border border-gray-300 px-10 py-2">Order</th>
                  <th className="border border-gray-300 px-10 py-2">Contract</th>
                  <th className="border border-gray-300 px-10 py-2">Title</th>
                  <th className="border border-gray-300 px-10 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
              { wlcontracts.map((item, i) => (
                <tr className="border border-gray-300 px-10 py-2" key={i}>
                    <td className="border border-gray-300 px-10 py-2">{i+1}{` `}</td>
                    <td className="border border-gray-300 px-10 py-2">{item[0]}</td>
                    <td className="border border-gray-300 px-10 py-2">{item[1]}</td>
                    <td className="border border-gray-300 px-10 py-2">
                      <Button onClick={e => {handleViewContract(item)}}>View</Button>
                    </td>
                </tr>
              ))}
              </tbody>
          </table>
          </div>
          <Modal size="xl" active={showModal} toggler={() => setShowModal(false)}>
            <ModalHeader toggler={() => setShowModal(false)}>Whitelist Sale {saleTitle}</ModalHeader>
            <ModalBody>
              <table className="table-auto border-collapse border border-gray-400 mt-10 mb-10">
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
            </ModalBody>
            <ModalFooter>
          {!unlockDeposit ? (
          <Button color="blue" buttonType="link" onClick={(e) => handleUnlock()}>
            Unlock Deposit
          </Button>
          ) : (<span/>)}
          <Button color="red" buttonType="link" onClick={(e) => setShowModal(false)}>
            Close
          </Button>
        </ModalFooter>
          </Modal>
          </center>

        )}
      </div>
    </div>
  );
}
