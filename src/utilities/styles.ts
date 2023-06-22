export const selectStyles = {
  control(base: any, props: any) {
    return {
      background: "#0d1117",
      fontFamily: "monospace",
      height: "32px",
      display: "flex",
      alignItems: "center",
    };
  },
  dropdownIndicator(base: any, props: any) {
    return {
      display: "none",
    };
  },
  input(base: any, props: any) {
    return { ...base, color: "white" };
  },
  indicatorSeparator(base: any, props: any) {
    return {
      display: "none",
    };
  },
  menu(base: any, props: any) {
    return {
      ...base,
      border: "1px solid rgba(9, 194, 246, 0.5)",
      zIndex: 999,
    };
  },
  menuList(base: any, props: any) {
    return {
      ...base,
      background: "#161b22",
      color: "white",
    };
  },
  option(base: any, props: any) {
    return {
      ":hover": {
        width: "100%",
        background: "rgba(9, 194, 246, 0.5)",
        cursor: "pointer",
      },
    };
  },
};
export const selectStylesPrimary = {
  control(base: any, props: any) {
    return {
      background: "#0d1117",
      fontFamily: "monospace",
      display: "flex",
      alignItems: "center",
    };
  },
  dropdownIndicator(base: any, props: any) {
    return {
      display: "none",
    };
  },
  input(base: any, props: any) {
    return { ...base, color: "white" };
  },
  indicatorSeparator(base: any, props: any) {
    return {
      display: "none",
    };
  },
  menu(base: any, props: any) {
    return {
      ...base,
      border: "1px solid rgba(9, 194, 246, 0.5)",
      zIndex: 999,
    };
  },
  menuList(base: any, props: any) {
    return {
      ...base,
      background: "#161b22",
      color: "white",
    };
  },
  option(base: any, props: any) {
    return {
      ":hover": {
        width: "100%",
        background: "rgba(9, 194, 246, 0.5)",
        cursor: "pointer",
      },
    };
  },
};
export const selectStylesSecondary = {
  control(base: any, props: any) {
    return {
      background: "#0d1117",
      border: "1px solid rgb(163 230 53)",
      fontFamily: "monospace",
      // height: "32px",
      display: "flex",
      alignItems: "center",
    };
  },
  dropdownIndicator(base: any, props: any) {
    return {
      display: "none",
    };
  },
  input(base: any, props: any) {
    return { ...base, color: "white" };
  },
  indicatorSeparator(base: any, props: any) {
    return {
      display: "none",
    };
  },
  menu(base: any, props: any) {
    return {
      ...base,
      border: "1px solid rgb(163 230 53)",
      zIndex: 999,
    };
  },
  menuList(base: any, props: any) {
    return {
      ...base,
      background: "#161b22",
      color: "white",
    };
  },
  option(base: any, props: any) {
    return {
      ":hover": {
        width: "100%",
        background: "rgba(9, 194, 246, 0.5)",
        cursor: "pointer",
      },
    };
  },
};
