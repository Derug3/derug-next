import { Box } from "@primer/react";
import React, { FC, useMemo } from "react";
import { ITrait } from "../../interface/collections.interface";
import Traits from "./Traits";

const TraitsList: FC<{ traits: ITrait[] }> = ({ traits }) => {
  const renderTraits = useMemo(() => {
    return traits.map((t) => {
      return <Traits trait={t} key={t.name} />;
    });
  }, [traits]);
  return <Box className="flex flex-col gap-5 pl-0">{renderTraits}</Box>;
};

export default TraitsList;
