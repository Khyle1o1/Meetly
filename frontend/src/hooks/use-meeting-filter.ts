import { useQueryState } from "nuqs";

export enum PeriodEnum {
  UPCOMING = "UPCOMING",
  PAST = "PAST",
  CANCELLED = "CANCELLED",
  PENDING_BOOKINGS = "PENDING_BOOKINGS",
}

const useMeetingFilter = () => {
  const [period, setPeriod] = useQueryState("period", {
    defaultValue: PeriodEnum.UPCOMING,
    parse: (value) =>
      Object.values(PeriodEnum).includes(value as PeriodEnum)
        ? (value as PeriodEnum)
        : PeriodEnum.UPCOMING,
    serialize: (value) => value,
  });
  return { period, setPeriod, PeriodEnum };
};

export default useMeetingFilter;
