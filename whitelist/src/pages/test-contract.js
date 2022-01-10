import { useEffect } from "react";
import { toast } from "react-toastify";
import { useAppContext } from "../context/app.context";
import { utils, providers } from "near-api-js";
import { useRouter } from "next/router";
import dayjs from "dayjs";

export default function TestContract() {
  const { query, replace, pathname } = useRouter();
  const { isAuth, login, mainContract, connectContract, accountId } =
    useAppContext();

  useEffect(() => {
    const { errorCode, errorMessage, transactionHashes } = query;
    if (errorCode) {
      toast.error(`Transaction failed: ${decodeURIComponent(errorMessage)}`);
      replace(pathname, undefined, { shallow: true });
    }
    if (transactionHashes) {
      toast.success("Contract created");

      // const provider = new providers.JsonRpcProvider(
      //   "https://rpc.testnet.near.org"
      // );
      // provider.txStatus(transactionHashes, accountId).then(console.log);
      replace(pathname, undefined, { shallow: true });
    }
  }, [accountId, pathname, query, replace]);

  const handleCreateContract = async () => {
    if (!isAuth) {
      login();
      return;
    }
    await mainContract.create_new_ticket_contract(
      {
        prefix: "show1",
        metadata: {
          spec: "nft-1.0.0",
          name: "Mosaics",
          symbol: "MOSIAC",
        },
      },
      100000000000000,
      process.env.CONTRACT_CREATE_FEE
    );
  };

  const handleCreateTicket = async (prefix) => {
    const contractName = `${prefix}.${process.env.CONTRACT_NAME}`;
    const contract = await connectContract(contractName);

    // if (!walletConnection.isSignedIn()) {
    //   walletConnection.requestSignIn({
    //     contractId: contractName,
    //     successUrl: `${process.env.domain}/user-dashboard`,
    //     failureUrl: process.env.domain,
    //   });
    // }

    await contract.create_new_show({
      show_id: "son_tung_mtp_2",
      show_title: "son tung mtp",
      ticket_types: ["vip", "normal"],
      tickets_supply: [10, 100],
      ticket_prices: [
        3, 1,
        // Number(utils.format.formatNearAmount("3000000000000000000000000")),
        // Number(utils.format.formatNearAmount("1000000000000000000000000")),
        // utils.format.parseNearAmount("0.003"),
        // utils.format.parseNearAmount("0.001"),
      ],
      selling_start_time: Number(dayjs().unix() + "000000000"), // 1641653975225000000
      selling_end_time: Number(dayjs().add(30, "day").unix() + "000000000"),
    });
  };

  const handleBuyTicket = async (prefix, show_id, ticket_type) => {
    const contractName = `${prefix}.${process.env.CONTRACT_NAME}`;
    const { walletConnection, accountId, contract, account } =
      await connectContract(contractName);

    if (!walletConnection.isSignedIn()) {
      walletConnection.requestSignIn({
        contractId: contractName,
        successUrl: `${process.env.domain}/user-dashboard`,
        failureUrl: process.env.domain,
      });
    }
    await contract.buy_ticket(
      { show_id, ticket_type },
      undefined,
      "10000000000000000000003"
    );
  };

  const handleGetShowMetadata = async () => {
    const contractName = `ticket.${process.env.CONTRACT_NAME}`;
    const contract = await connectContract(contractName);

    const result = await contract.show_metadata({ show_id: "1639190491" });
    console.log(result);
  };

  const handlGetMyTicket = async (prefix) => {
    const contractName = `${prefix}.${process.env.CONTRACT_NAME}`;
    const { walletConnection, accountId, contract, account } =
      await connectContract(contractName);

    if (!walletConnection.isSignedIn()) {
      walletConnection.requestSignIn({
        contractId: contractName,
        successUrl: `${process.env.domain}/user-dashboard`,
        failureUrl: process.env.domain,
      });
    }
    const result = await contract.get_tickets_by_owner({ owner: accountId });
    console.log(result);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto py-10">
        <h1 className="uppercase text-gray-700 mb-2 py-3">User Dashboard</h1>
        <div className="space-x-1">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleCreateContract}
          >
            Tao contract
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleCreateTicket("show1")}
          >
            Tao show
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleGetShowMetadata()}
          >
            Get Show Metadata
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleBuyTicket("show1", "son_tung_mtp_2", "vip")}
          >
            Buy ticket
          </button>

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handlGetMyTicket("show1")}
          >
            Get my ticket
          </button>
        </div>
      </div>
    </div>
  );
}
