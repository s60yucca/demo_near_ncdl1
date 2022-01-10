import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { useAppContext } from "../context/app.context";
import { formatDepositAmount, formatNearAmount } from "../utils";
import NearIcon from "../components/NearIcon";
import { useForm, useFieldArray } from "react-hook-form";
import Button from "@material-tailwind/react/Button";
import { toast } from "react-toastify";

const GAS_DEFAULT = 300000000000000

export default function BuyTicket({ ticket, show, company }) {
  const { isAuth, connectContract, login, mainContract } = useAppContext();
  // const contractAddress = process.env.CONTRACT_NAME;
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (!isAuth) {
      toast.warning("You need to login to create");
      return;
    }

    try {

      const submitData = {
        title: data.title,
        fttoken_contract: data.token,
        pool_amount: Number(data.pool),
        conversion_rate: Number(data.rate),
        max_deposit: Number(data.maxdeposit),
        cliff: Number(data.cliff),
        vesting: Number(data.vest),
        tge_time: Number(dayjs(data.tge_time).unix() + "000000000"),
        tge_unlock: Number(data.tge_unlock),
      };

      console.log(submitData);
      // console.log("contract", contractAddress)
      let args = {"prefix": data.prefix, "metadata":submitData};
      const deposit = formatDepositAmount("2000000000000000000000000");
      const params = [
        args,
        "100000000000000",
        deposit,
      ];
      console.log("create contract", params);     
      await mainContract.create_new_whitelist_contract(...params);
      toast.success("Whitelist Sale Contract created successfully");
      // setShowModal(false);
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  // const shouldDisalbeBuy = isNotSoldYet || isSoldOutTime || isSoldOut;
  // const onClickButton = isAuth ? buyTicket : loginToTicketContract;

  // console.log(show);

  return (
    <center>
    <div className="w-full pt-10"  >
    <label className="text-5xl">Create Whitelist Sale Contract</label>
    <form
    id="hook-form"
    className="grid max-w-screen-md gap-6 lg:grid-cols-2 pt-20"
    onSubmit={handleSubmit(onSubmit)}
  >
    <div className="">
      <div className="mb-6" >
        <label htmlFor="title" className="block mb-2 text-base text-white text-left">
          Title
        </label>
        <input
          type="text"
          placeholder="MTP Entertaiment"
          required
          className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
          {...register("title")}
        />
      </div>
      <div className="mb-6">
        <label htmlFor="token" className="block mb-2 text-base text-white text-left">
          Token
        </label>
        <input
          type="text"
          required
          className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
          {...register("token")}
        />
      </div>
      <div className="mb-6">
        <label htmlFor="pool" className="block mb-2 text-base text-white text-left">
          Pool Amount
        </label>
        <input
          type="number"
          required
          className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
          {...register("pool")}
        />
      </div>
      <div className="mb-6">
        <label htmlFor="rate" className="block mb-2 text-base text-white text-left">
          Conversion Rate
        </label>
        <input
          type="number"
          required
          className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
          {...register("rate")}
        />
      </div>
      <div className="mb-6">
        <label htmlFor="maxdeposit" className="block mb-2 text-base text-white text-left">
          Max deposit
        </label>
        <input
          type="number"
          required
          className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
          {...register("maxdeposit")}
        />
      </div>
    </div>
    <div className="">
    <div className="mb-6" >
        <label htmlFor="prefix" className="block mb-2 text-base text-white text-left">
          Prefix
        </label>
        <input
          type="text"
          placeholder="MTP Entertaiment"
          required
          className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
          {...register("prefix")}
        />
      </div>
      <div className="mb-6">
        <label htmlFor="tge_time" className="block mb-2 text-base text-white text-left ">
          TGE Time
        </label>
        <input
          type="date"
          required
          className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
          {...register("tge_time")}
        />
      </div>
      <div className="mb-6">
        <label htmlFor="cliff" className="block mb-2 text-base text-white text-left">
          Cliff (month)
        </label>
        <input
          type="number"
          required
          className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
          {...register("cliff")}
        />
      </div>
      <div className="mb-6">
        <label htmlFor="vest" className="block mb-2 text-base text-white text-left">
          Vesting (% per month)
        </label>
        <input
          type="number"
          required
          className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
          {...register("vest")}
        />
      </div>
      <div className="mb-6">
        <label htmlFor="tge_unlock" className="block mb-2 text-base text-white text-left">
          TGE Unlock (%)
        </label>
        <input
          type="number"
          required
          className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
          {...register("tge_unlock")}
        />
      </div>

    </div>
    <Button type="submit" className="mb-6">Create</Button>
  </form>
    </div>
    </center>
  );
}
