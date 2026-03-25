import { ClipLoader } from "react-spinners";

interface SubmitButtonProps {
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  isError: boolean;
  error: Error | null;
}

function getButtonContent(
  isPending: boolean,
  isConfirming: boolean,
  isConfirmed: boolean,
  isError: boolean,
  error: Error | null,
) {
  if (isPending) {
    return (
      <div className="flex items-center justify-center gap-2 w-full">
        <ClipLoader size={16} color="white" />
        <span>Confirming in wallet...</span>
      </div>
    );
  }
  if (isConfirming) {
    return (
      <div className="flex items-center justify-center gap-2 w-full">
        <ClipLoader size={16} color="white" />
        <span>Waiting for transaction to be included...</span>
      </div>
    );
  }
  if (error || isError) {
    return (
      <div className="flex items-center justify-center gap-2 w-full">
        <span>Error, see console.</span>
      </div>
    );
  }
  if (isConfirmed) {
    return "Transaction confirmed.";
  }
  return "Send Tokens";
}

export function SubmitButton({
  isPending,
  isConfirming,
  isConfirmed,
  isError,
  error,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending || isConfirming}
      className="
        px-6 py-3 w-full
        bg-blue-600 hover:bg-blue-700
        text-white font-semibold
        rounded-lg shadow-sm
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      {getButtonContent(isPending, isConfirming, isConfirmed, isError, error)}
    </button>
  );
}