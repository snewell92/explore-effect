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

export const ParseError = ({ input }: { input: string }) => {
  return (
    <div className="text-center border-4 border-red-600 p-4 rounded-lg mx-12 mb-6 min-h-80">
      <h1 className="text-slate-700 text-2xl mb-4">What was that?</h1>
      <div className="text-left">
        <p>
          We use "new Date(input)" to parse your input, looks like that failed.
        </p>
        <p>
          You gave us: <span className="font-mono text-slate-600">{input}</span>
        </p>
        <p>Generally, an almost ISO 8601 date string usually works, like:</p>
        <ul className="list-disc pl-8">
          <li>2022-01-01</li>
          <li>2022-01-01T00:00:00</li>
          <li>2022-01-01T00:00:00.000Z</li>
          <li>2022-01-01T00:00:00.000-05:00</li>
          <li>YYYY-MM-DDTHH:mm:ss.sssZ</li>
        </ul>
        <p>etc...</p>
        <p>
          The full docs are{" "}
          <a
            target="_blank"
            className="text-blue-600"
            href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format"
          >
            here
          </a>
        </p>
      </div>
    </div>
  );
};
