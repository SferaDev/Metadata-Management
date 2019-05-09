import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import i18n from "@dhis2/d2-i18n";
import { withSnackbar } from "d2-ui-components";
import { withStyles } from "@material-ui/core";

import PageHeader from "../../common/PageHeader";

const styles = theme => ({});

class MetadataDictionary extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        snackbar: PropTypes.object.isRequired,
        classes: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
    };

    goBack = () => {
        this.props.history.push("/");
    };

    render() {
        return (
            <React.Fragment>
                <PageHeader title={i18n.t("Metadata Dictionary")} onBackClick={this.goBack} />
            </React.Fragment>
        );
    }
}

export default withSnackbar(withRouter(withStyles(styles)(MetadataDictionary)));
