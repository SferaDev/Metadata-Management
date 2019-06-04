import React from "react";
import PropTypes from "prop-types";
import { Route, Switch } from "react-router-dom";

import LandingPage from "../pages/landing-page";
import About from "../pages/about";
import AdvancedExport from "../pages/advanced-export";
import MetadataDictionary from "../pages/metadata-dictionary";

class Root extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    render() {
        const { d2 } = this.props;

        return (
            <Switch>
                <Route path={"/about/"} render={props => <About d2={d2} {...props} />} />

                <Route
                    path={"/advanced-export/"}
                    render={props => <AdvancedExport d2={d2} {...props} />}
                />

                <Route
                    path={"/metadata-dictionary/:id?"}
                    render={props => <MetadataDictionary d2={d2} {...props} />}
                />

                <Route render={() => <LandingPage d2={d2} />} />
            </Switch>
        );
    }
}

export default Root;
