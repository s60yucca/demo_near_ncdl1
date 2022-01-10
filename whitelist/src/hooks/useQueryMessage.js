import { useRouter } from "next/router";
import { useEffect } from "react";
export default function useQueryMessage() {
  const { query, replace } = useRouter();
  const { transactionHashes } = query || {};

  useEffect(() => {
    console.log(transactionHashes);
  }, [transactionHashes]);
}
