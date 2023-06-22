import React, { FC, useMemo, useState } from "react";
import Marqee from "react-fast-marquee";
import "react-alice-carousel/lib/alice-carousel.css";
import { collectionsStore } from "../../stores/collectionsStore";
import Balancer from "react-wrap-balancer";
import { COLLECTION } from "../../utilities/constants";
import { Box, Text } from "@primer/react";
import { useRouter } from "next/router";

const CollectionsSlider: FC = () => {
  const { collections } = collectionsStore.getState();
  const [hoveredCollection, setHoveredCollection] = useState<
    number | undefined
  >();

  const { push: navigate } = useRouter();

  const renderCollections = useMemo(() => {
    return collections.map((c, index) => {
      return (
        <Box
          className="box-content cursor-pointer h-36 w-36 overflow-hidden"
          key={index}
          style={{ border: "1px solid rgb(9, 194, 246)", opacity: 0.7 }}
          onMouseEnter={() => setHoveredCollection(index)}
          onMouseLeave={() => setHoveredCollection(undefined)}
          onClick={() => navigate(`${COLLECTION}?symbol=${c.symbol}`)}
        >
          {hoveredCollection === index ? (
            <div className="relative flex justify-center">
              <img
                src={c.image}
                alt="collectionImg"
                className="drop-shadow-2xl"
                style={{
                  opacity: "0.6",
                  filter: "drop-shadow(rgb(9, 194, 246) 0px 0px 15px)",
                }}
              />
              <Balancer className="absolute text-xl text-white font-bold inset-y-1/3 font-bold tracking-[-0.02em] font-mono">
                {c.name}
              </Balancer>
            </div>
          ) : (
            <img src={c.image} alt="collectionImg" />
          )}
        </Box>
      );
    });
  }, [collections, hoveredCollection]);
  return (
    <Box className="relative">
      <Text
        className="text-xl font-mono text-main-blue flex justify-center w-full absolute"
        style={{ transform: "translateY(-100%)" }}
      >
        <span
          className="px-4"
          style={{
            backgroundColor: "#0d1117",
            border: "1px solid rgb(9, 194, 246)",
            borderBottom: "none",
          }}
        >
          browse derugs
        </span>
      </Text>
      <Box className="w-full">
        <Marqee
          pauseOnHover
          loop={0}
          speed={90}
          direction={"left"}
          gradient={false}
        >
          {renderCollections}
        </Marqee>
        <Marqee
          pauseOnHover
          loop={0}
          speed={90}
          direction={"right"}
          gradient={false}
        >
          {renderCollections}
        </Marqee>
      </Box>
    </Box>
  );
};

export default CollectionsSlider;
