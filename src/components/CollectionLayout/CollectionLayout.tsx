import { Box, SplitPageLayout } from "@primer/react";
import { FC, ReactNode } from "react";

interface ICollectionLayoutProps {
  pane: ReactNode;
  content: ReactNode;
  proposals: ReactNode;
  header: ReactNode;
}
export const CollectionLayout: FC<ICollectionLayoutProps> = ({
  pane,
  content,
  proposals,
  header,
}) => {
  return (
    <>
      <Box
        sx={{
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            position: "sticky",
            top: 0,
            display: "grid",
            placeItems: "start",
          }}
        >
          {header}
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "55% 45%" }}>
          <Box
            sx={{
              maxHeight: "30em",
              overflowY: "scroll",
            }}
          >
            {pane}{" "}
          </Box>
          <Box>{content}</Box>
        </Box>
      </Box>
      <SplitPageLayout>
        {/* <SplitPageLayout.Content>{content}</SplitPageLayout.Content> */}
        <SplitPageLayout.Pane
          sticky
          offsetHeader={64}
          padding="none"
          resizable
          position="end"
          width="large"
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%",
              overflowY: "auto",
              border: "none",
              display: "flex",

              borderColor: "border-cyan-200",
            }}
          >
            {proposals}
          </Box>
        </SplitPageLayout.Pane>
      </SplitPageLayout>
    </>
  );
};
