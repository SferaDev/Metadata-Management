import React, { Component } from "react";
import PropTypes from "prop-types";
import { HashRouter } from "react-router-dom";
import { HeaderBar } from "@dhis2/ui-widgets";
import { MuiThemeProvider } from "@material-ui/core/styles";
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { SnackbarProvider, LoadingProvider } from "d2-ui-components";
import PrintProvider, { NoPrint } from "react-easy-print";
import i18n from "@dhis2/d2-i18n";

import "./App.css";
import Root from "./Root";
import { muiTheme } from "../../themes/dhis2.theme";
import muiThemeLegacy from "../../themes/dhis2-legacy.theme";

class App extends Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    render() {
        const { d2 } = this.props;

        return (
            <HashRouter>
                <MuiThemeProvider theme={muiTheme}>
                    <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                        <LoadingProvider>
                            <PrintProvider>
                                <NoPrint>
                                    <HeaderBar appName={i18n.t("Metadata Management")} />

                                    <div id="app" className="content">
                                        <SnackbarProvider>
                                            <Root d2={d2} />
                                        </SnackbarProvider>
                                    </div>
                                </NoPrint>
                            </PrintProvider>
                        </LoadingProvider>
                    </OldMuiThemeProvider>
                </MuiThemeProvider>
            </HashRouter>
        );
    }
}

export default App;
