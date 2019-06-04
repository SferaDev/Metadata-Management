import _ from "lodash";
import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withRouter } from "react-router-dom";
import { withSnackbar } from "d2-ui-components";
import { withStyles } from "@material-ui/core";
import { Print } from "react-easy-print";

import PageHeader from "../../common/PageHeader";
import MarkdownElement from "../../markdown-element";

import buildInfo from "../../../../package.json";

const styles = () => ({
    code: {
        paddingLeft: "2em",
        paddingBottom: "2em",
        paddingRight: "2em",
    },
});

class About extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        snackbar: PropTypes.object.isRequired,
        classes: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
    };

    state = {
        mainContent: _.join(
            _.compact([
                "## Build Details",
                `* **Package name**: ${buildInfo.name}`,
                `* **Description**: ${buildInfo.description}`,
                `* **Version**: ${buildInfo.version}`,
                "## Contact",
                `* **Author**: ${buildInfo.author.name}`,
                `* **Email**: ${buildInfo.author.email}`,
                `* **Website**: ${buildInfo.author.url}`,
                `* **GitHub**: ${buildInfo.repository.url}`,
            ]),
            "\n\n"
        ),
    };

    goBack = () => {
        this.props.history.push("/");
    };

    render() {
        const { classes } = this.props;
        const { mainContent } = this.state;

        return (
            <React.Fragment>
                <PageHeader title={i18n.t("About Metadata Management")} onBackClick={this.goBack} />

                {mainContent && (
                    <Print single name="markdownMainContent">
                        <MarkdownElement className={classes.code} text={mainContent} />
                    </Print>
                )}
            </React.Fragment>
        );
    }
}

export default withSnackbar(withRouter(withStyles(styles)(About)));
