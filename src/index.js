import React from "react";
import ReactDOM from "react-dom";
import ReactGA from "react-ga";
import _ from "lodash";
import { init, config, getUserSettings, getManifest } from "d2";
import { DataProvider } from "@dhis2/app-runtime";
import "font-awesome/css/font-awesome.min.css";

import App from "./components/app/App";
import i18n from "./locales";

function isLangRTL(code) {
    const langs = ["ar", "fa", "ur"];
    const prefixed = langs.map(c => `${c}-`);
    return langs.includes(code) || prefixed.filter(c => code.startsWith(c)).length > 0;
}

function configI18n(userSettings) {
    const uiLocale = userSettings.keyUiLocale;

    if (uiLocale && uiLocale !== "en") {
        config.i18n.sources.add(`./i18n/i18n_module_${uiLocale}.properties`);
    }

    config.i18n.sources.add("./i18n/i18n_module_en.properties");
    document.documentElement.setAttribute("dir", isLangRTL(uiLocale) ? "rtl" : "ltr");

    i18n.changeLanguage(uiLocale);
}

async function getBaseUrl() {
    if (process.env.NODE_ENV === "development") {
        const envVariable = "REACT_APP_DHIS2_BASE_URL";
        const defaultServer = "http://localhost:8080";
        const baseUrl = process.env[envVariable] || defaultServer;
        console.info(`[DEV] DHIS2 instance: ${baseUrl}`);
        return baseUrl;
    } else {
        const manifest = await getManifest("./manifest.webapp");
        return manifest.getBaseUrl();
    }
}

function loadHeaderBarTranslations(d2) {
    const keys = _([
        "app_search_placeholder",
        "manage_my_apps",
        "no_results_found",
        "settings",
        "profile",
        "account",
        "help",
        "log_out",
        "about_dhis2",
    ]);
    keys.each(s => d2.i18n.strings.add(s));
    d2.i18n.load();
}

async function main() {
    ReactGA.initialize("UA-140303290-2");
    ReactGA.pageview(window.location.pathname);
    const baseUrl = await getBaseUrl();
    const apiUrl = baseUrl.replace(/\/*$/, "") + "/api";
    try {
        const d2 = await init({ baseUrl: apiUrl });
        window.d2 = d2; // Make d2 available in the console
        loadHeaderBarTranslations(d2);
        const userSettings = await getUserSettings();
        configI18n(userSettings);
        ReactDOM.render(
            <DataProvider baseUrl={baseUrl} apiVersion={d2.system.version.minor}>
                <App d2={d2} />
            </DataProvider>
            , document.getElementById("root"));
    } catch (err) {
        console.error(err);
        const message = err.toString().match("Unable to get schemas") ? (
            <div>
                <a rel="noopener noreferrer" target="_blank" href={baseUrl}>
                    Login
                </a>{" "}
                {baseUrl}
            </div>
        ) : (
            err.toString()
        );
        ReactDOM.render(<div>{message}</div>, document.getElementById("root"));
    }
}

main();
