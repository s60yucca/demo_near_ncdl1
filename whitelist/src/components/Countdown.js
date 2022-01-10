import { useEffect, useState } from "react";

export const formatCountDown = (endDate, startDate) => {
  if (typeof endDate === "string") {
    endDate = new Date(endDate);
  }
  if (!endDate) {
    endDate = new Date();
  }
  startDate = startDate ? new Date(startDate) : new Date();
  const diff = endDate.getTime() - startDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const daysString = days > 0 ? `${days.toString().padStart(2, "0")}` : "00";
  const hoursString = hours > 0 ? `${hours.toString().padStart(2, "0")}` : "00";
  const minutesString = minutes > 0 ? `${minutes.toString().padStart(2, "0")}` : "00";
  const secondsString = seconds > 0 ? `${seconds.toString().padStart(2, "0")}` : "00";
  return `${daysString}:${hoursString}:${minutesString}:${secondsString}`;
};

const Countdown = ({ className, endDate }) => {
  const [value, setValue] = useState(formatCountDown(new Date()));

  useEffect(() => {
    const updateCountdown = () => {
      setValue(formatCountDown(endDate));
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [endDate]);
  return <span className={className}>{value}</span>;
};

export default Countdown;
