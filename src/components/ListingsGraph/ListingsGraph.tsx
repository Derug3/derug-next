import React, { useContext, useEffect, useRef, useState } from "react";
import { CollectionContext } from "../../stores/collectionContext";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
} from "chart.js";
import dayjs from "dayjs";
import { getRecentActivities } from "../../api/tensor";
import toast from "react-hot-toast";
import { Oval } from "react-loader-spinner";
import { mapByDates } from "../../api/graphql/mapper";
import { IGraphData } from "../../interface/derug.interface";
const ListingsGraph = () => {
  const {
    collection,
    setRecentActivities,
    recentActivities,
    graphData,
    collectionStats,
    setGraphData,
  } = useContext(CollectionContext);

  const [loading, toggleLoading] = useState(false);

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  let myChart: any = null;
  useEffect(() => {
    if (recentActivities) {
      if (myChart) {
        myChart.destroy();
      }
      Chart.register(
        CategoryScale,
        LineController,
        LineElement,
        PointElement,
        LinearScale,
        Title
      );

      const chartContext = chartRef.current?.getContext("2d");
      myChart = new Chart(chartContext!, {
        type: "line",
        data: {
          labels: graphData?.months,
          datasets: [
            {
              data: graphData?.prices,
              fill: false,
              borderColor: "rgb(9, 194, 246)",
              tension: 0.1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              min: 0,
              max: graphData?.largestPrice! + graphData?.smallestPrice! * 2,
            },
          },
        },
      });
      return () => {
        myChart.destroy();
      };
    }
  }, [recentActivities]);

  useEffect(() => {
    if (!recentActivities && !loading) {
      void fetchFirstActivities();
    }
  }, []);

  const fetchFirstActivities = async () => {
    try {
      if (collectionStats?.slug || collection?.symbol) {
        toggleLoading(true);
        let recentAct = await getRecentActivities(collection?.symbol ?? "");
        if (recentAct.length === 0 && collectionStats?.slug) {
          recentAct = await getRecentActivities(collectionStats.slug);
        }
        const mappedValues = mapByDates(recentAct);
        setGraphData(mappedValues);
        setRecentActivities(recentAct);
      }
    } catch (error: any) {
      toast.error("Failed to get listing details ", error.message);
    } finally {
      toggleLoading(false);
    }
  };

  return (
    <>
      {recentActivities && recentActivities.length > 0 && graphData ? (
        <div className="h-96 mt-4">
          {" "}
          <canvas ref={chartRef} />
        </div>
      ) : (
        <div className="flex flex-col items-center mt-50">
          {loading ? (
            <div className="mt-40">
              <Oval
                width={"5em"}
                height={"3em"}
                color="rgb(9, 194, 246)"
                secondaryColor="rgba(9,194,246,.15)"
              />
            </div>
          ) : (
            <div style={{ marginTop: "10%" }}>
              <p>No listings data for collection</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ListingsGraph;
