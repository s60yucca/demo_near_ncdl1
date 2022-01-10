import { useAppContext } from "../../context/app.context";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Button from "@material-tailwind/react/Button";
import dayjs from "dayjs";

export default function UserDashboard() {
  const { isAuth, mainContract, accountId, connectContract } = useAppContext();
  const [company, setCompany] = useState(null);
  const router = useRouter();

  const getCompany = useCallback(async () => {
    if (mainContract && accountId) {
      const company = await mainContract.get_contracts_by_owner({
        owner_id: accountId,
      });
      if (company.length > 0) {
        setCompany(company[0]);
        await connectContract(company[0]);
        router.push("/user-dashboard/my-show");
      }
    }
  }, [accountId, connectContract, mainContract, router]);

  useEffect(() => {
    getCompany();
  }, [getCompany]);

  const handleCreateCompany = () => {
    mainContract.create_new_ticket_contract(
      {
        prefix: `ticket_${dayjs().unix()}`,
        metadata: {
          spec: "v0.1",
          name: `Ticket contract for ${accountId}`,
          symbol: "TIKTOK",
        },
      },
      100000000000000,
      process.env.CONTRACT_CREATE_FEE
    );
  };

  return (
    <div className="bg-white py-5">
      <div className="container mx-auto space-y-5 p-5">
        <h1 className="uppercase font-medium text-indigo-500">
          User Dashboard
        </h1>
        <div className="h-screen">
          {!company && (
            <Button onClick={handleCreateCompany}>Begin selling</Button>
          )}
        </div>
      </div>
    </div>
  );
}
