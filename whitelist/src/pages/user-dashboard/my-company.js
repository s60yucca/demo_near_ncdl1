import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import UserLayout from "../../components/UserLayout";
import { useAppContext } from "../../context/app.context";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

export default function MyCompany() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { isAuth, mainContract, accountId } = useAppContext();
  const { query, replace, pathname } = useRouter();
  const [company, setCompany] = useState(null);

  const getCompany = useCallback(async () => {
    if (mainContract && accountId) {
      const company = await mainContract.get_contracts_by_owner({
        owner_id: accountId,
      });
      if (company.length > 0) {
        setCompany(company[0]);
      }
    }
  }, [accountId, mainContract]);

  useEffect(() => {
    getCompany();
  }, [getCompany]);

  useEffect(() => {
    const { errorCode, errorMessage, transactionHashes } = query;
    if (errorCode) {
      toast.error(`Transaction failed: ${decodeURIComponent(errorMessage)}`);
      replace(pathname, undefined, { shallow: true });
    }
    if (transactionHashes) {
      toast.success("Company created");
      replace(pathname, undefined, { shallow: true });
    }
  }, [accountId, pathname, query, replace]);

  const onSubmit = (data) => {
    if (!isAuth) {
      toast.warning("Please login to create a company");
      return;
    }
    if (mainContract) {
      const slug = data.name
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "_")
        .slice(0, 10);
      mainContract.create_new_ticket_contract(
        {
          prefix: slug,
          metadata: {
            spec: data.address,
            name: data.name,
            symbol: data.phone,
          },
        },
        100000000000000,
        process.env.CONTRACT_CREATE_FEE
      );
    }
  };

  return (
    <UserLayout activeIndex={0}>
      <div className="space-y-3 border p-5 shadow">
        <div className="flex flex-row justify-between items-center">
          <h1 className="uppercase text-indigo-700 font-medium text-xl">
            Company contract{" "}
            <a
              className="text-gray-800"
              href={`https://explorer.testnet.near.org/accounts/${company}`}
            >
              {company}
            </a>
          </h1>
        </div>
        {/* <div className="space-y-3">
          <div className="flex  w-full p-3">
            <form className="w-1/2" onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="MTP Entertaiment"
                  required
                  className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:border-gray-600 dark:focus:ring-gray-900 dark:focus:border-gray-500"
                  {...register("name")}
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  Address
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:border-gray-600 dark:focus:ring-gray-900 dark:focus:border-gray-500"
                  {...register("address")}
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  Phone
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:border-gray-600 dark:focus:ring-gray-900 dark:focus:border-gray-500"
                  {...register("phone")}
                />
              </div>
              {!company && (
                <input
                  type="submit"
                  className="bg-indigo-500 text-white px-3 py-2 rounded cursor-pointer"
                  value="Create your company"
                />
              )}
            </form>
          </div>
        </div> */}
      </div>
    </UserLayout>
  );
}
