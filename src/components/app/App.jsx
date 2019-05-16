import React, { Component } from "react";
import PropTypes from "prop-types";
import { HashRouter } from "react-router-dom";
import HeaderBar from "@dhis2/d2-ui-header-bar";
import { MuiThemeProvider } from "@material-ui/core/styles";
import JssProvider from "react-jss/lib/JssProvider";
import { createGenerateClassName } from "@material-ui/core/styles";
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { SnackbarProvider, LoadingProvider } from "d2-ui-components";
import PrintProvider, { NoPrint } from 'react-easy-print';

import "./App.css";
import Root from "./Root";
import { muiTheme } from "../../themes/dhis2.theme";
import muiThemeLegacy from "../../themes/dhis2-legacy.theme";

const generateClassName = createGenerateClassName({
    dangerouslyUseGlobalCSS: false,
    productionPrefix: "c",
});

class App extends Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    render() {
        const { d2 } = this.props;

        return (
            <HashRouter>
                <JssProvider generateClassName={generateClassName}>
                    <MuiThemeProvider theme={muiTheme}>
                        <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                            <LoadingProvider>
                                <PrintProvider>
                                    <NoPrint>
                                        <HeaderBar d2={d2} />

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
                </JssProvider>
            </HashRouter>
        );
    }
}

export default App;
