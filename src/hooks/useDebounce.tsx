import React, { useEffect, useState } from "react";

const useDebounce = (nameSearch: string | undefined) => {
  const [name, setName] = useState<string>();

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setName(nameSearch);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [nameSearch]);

  return {
    name,
  };
};

export default useDebounce;
