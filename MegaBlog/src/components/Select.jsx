import { forwardRef, useId } from "react";
import React from "react";

function Select({ options, label, className, ...props }, ref) {
  const Id = useId();
  return (
    <div className="w-full">
      {label && (
        <label className="inline-block mb-1 pl-1" htmlFor={Id}>
          {label}
        </label>
      )}

      <select
        {...props}
        id={Id}
        ref={ref}
        className={`px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full ${className}`}
      >
        {options?.map((option, index) => {
          // Added return here to render <option> properly
          return (
            <option key={index} value={option}>
              {option}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default React.forwardRef(Select);
