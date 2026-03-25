interface TokenDetailsProps {
  tokenName: string | undefined;
  tokenDecimals: number | undefined;
  total: number;
}
 
export function TokenDetails({ tokenName, tokenDecimals, total }: TokenDetailsProps) {
  const formattedTotal = tokenDecimals !== undefined
    ? (total / 10 ** tokenDecimals).toString()
    : "...";
 
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-zinc-600 font-medium text-sm">Transaction Details</label>
      <div className="bg-white py-2 px-3 border border-zinc-300 text-zinc-900 shadow-xs rounded-lg">
        <p className="text-sm">Token Name: <span className="font-medium">{tokenName ?? "..."}</span></p>
        <p className="text-sm">Total (Wei): <span className="font-medium">{total.toString()}</span></p>
        <p className="text-sm">Total (Tokens): <span className="font-medium">{formattedTotal}</span></p>
      </div>
    </div>
  );
}