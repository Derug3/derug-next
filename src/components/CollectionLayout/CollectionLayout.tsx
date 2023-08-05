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
      <div
        style={{
          overflowY: "auto",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            display: "flex",
            placeItems: "start",
          }}
        >
          {header}
        </div>

        <div className="flex">
          <div
            style={{
              maxHeight: "30em",
              overflowY: "scroll",
            }}
          >
            {pane}{" "}
          </div>
          <div>{content}</div>
        </div>
      </div>
      <div>
        {/* <SplitPageLayout.Content>{content}</SplitPageLayout.Content> */}
        <div>
          <div
            style={{
              width: "100%",
              maxWidth: "100%",
              overflowY: "auto",
              border: "none",
              display: "flex",

              borderColor: "border-cyan-200",
            }}
          >
            {proposals}
          </div>
        </div>
      </div>
    </>
  );
};
