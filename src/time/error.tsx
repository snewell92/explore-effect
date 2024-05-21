export interface Explain {
  _tag: string;
  raw: Date;
  msg: string;
}

export interface DisplayErrorProps {
  error: Explain;
}

export const DisplayError = ({ error }: DisplayErrorProps) => {
  return (
    <div className="text-center border-4 border-red-600 p-4 rounded-lg mx-12 mb-6 min-h-80">
      <h1 className="text-slate-700 text-2xl mb-4">What time is it?</h1>
      <div className="text-left">
        <p>
          Error message: <span className="font-mono">{error.msg}</span>
        </p>
        <p>
          Full Date:{" "}
          <span className="text-sm font-mono">{error.raw.toISOString()}</span>
        </p>
      </div>
    </div>
  );
};
