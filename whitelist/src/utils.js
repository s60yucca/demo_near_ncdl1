import { utils, providers } from "near-api-js";

export const formatNearAmount = (amount) => {
  if (typeof amount === "number") {
    amount = amount.toLocaleString("fullwide", { useGrouping: false });
  }
  const amountFormatted = utils.format.formatNearAmount(amount);
  return Math.round(Number(amountFormatted) + Number.EPSILON);
};

export const formatDepositAmount = (amount) => {
  if (typeof amount === "number") {
    amount = amount.toLocaleString("fullwide", { useGrouping: false });
  }
  amount = utils.format.formatNearAmount(amount);
  amount = Math.round((Number(amount) + Number.EPSILON) * 1000) / 1000;
  return utils.format.parseNearAmount(amount.toString());
};

export const callPublicRpc = async (contractName, method, arg) => {
  const provider = new providers.JsonRpcProvider(process.env.jsonRpcProvider);
  const args = Buffer.from(JSON.stringify(arg)).toString("base64");
  try {
    const rawResult = await provider.query({
      request_type: "call_function",
      account_id: contractName,
      method_name: method,
      args_base64: args,
      finality: "optimistic",
    });
    const result = JSON.parse(Buffer.from(rawResult.result).toString());
    return result;
  } catch (e) {
    console.log(e);
  }
};
