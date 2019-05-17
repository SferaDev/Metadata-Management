export const goToDhis2Url = path => {
    const baseUrl = process.env.REACT_APP_DHIS2_BASE_URL || "";
    window.location = [baseUrl.replace(/\/$/, ""), path.replace(/^\//, "")].join("/");
    return null;
};
