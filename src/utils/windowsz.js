import { createTheme } from "@mui/material/styles";
import { isMobileOnly } from "react-device-detect";

export function getWindowSize() {
    var oWidth;
    var oHeight;
    var marginTop;
    const defaultTheme = createTheme();

    console.log("gws isMobile: ", isMobileOnly);
    if (isMobileOnly) {
        oWidth = "100vw";
        oHeight = `calc(100vh - ${defaultTheme.mixins.toolbar.minHeight}px)`;
        marginTop = "0vh";
    } else {
        oWidth = "80vw";
        oHeight = "80vh";
        marginTop = "2vh";
    }
    return {
        outerWidth: oWidth,
        outerHeight: oHeight,
        marginTop: marginTop,
    };
}
