export interface SmsPriceEstimate {
  rate: number;
  channelCount: number;
}

export function averageSmsPrice(priceList: any[] | null | undefined, fallbackRate = 0): SmsPriceEstimate {
  const rows = (priceList ?? []).filter((row) => Number(row?.localRate) > 0);
  const active = rows.filter((row) => row?.channelActive);
  const used = active.length ? active : rows;

  if (!used.length) {
    return { rate: Number(fallbackRate) || 0, channelCount: 0 };
  }

  const total = used.reduce((sum, row) => sum + Number(row.localRate), 0);
  return { rate: total / used.length, channelCount: used.length };
}

export function smsCapacity(creditBalance: number | null | undefined, rate: number): number {
  const balance = Number(creditBalance) || 0;
  return rate > 0 ? Math.floor(balance / rate) : 0;
}
