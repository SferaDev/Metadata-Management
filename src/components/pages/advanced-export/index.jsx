import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withRouter } from "react-router-dom";
import { withSnackbar } from "d2-ui-components";
import { withStyles } from "@material-ui/core";

import PageHeader from "../../common/PageHeader";

const styles = () => ({});

class AdvancedExport extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        snackbar: PropTypes.object.isRequired,
        classes: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
    };

    state = {};

    goBack = () => {
        this.props.history.push("/");
    };

    render() {
        return (
            <React.Fragment>
                <PageHeader title={i18n.t("Advanced Export")} onBackClick={this.goBack} />
            </React.Fragment>
        );
    }
}

export default withSnackbar(withRouter(withStyles(styles)(AdvancedExport)));
