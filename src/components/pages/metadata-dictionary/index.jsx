import _ from "lodash";
import React from "react";
import Select from "react-select";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withRouter } from "react-router-dom";
import { withSnackbar } from "d2-ui-components";
import { withStyles } from "@material-ui/core";

import PageHeader from "../../common/PageHeader";
import MarkdownElement from "../../markdown-element";
import { d2ModelFactory } from "../../../models/d2ModelFactory";
import Dictionary from "../../../logic/dictionary";

const styles = () => ({
    options: {
        display: "flex",
    },
    metadataTypeSelect: {
        margin: "1em",
        minWidth: "20em",
    },
    metadataObjectSelect: {
        margin: "1em",
        minWidth: "40em",
    },
});

class MetadataDictionary extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        snackbar: PropTypes.object.isRequired,
        classes: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
    };

    state = {
        mainContent: "",
        metadataTypes: [],
        metadataObjects: [],
    };

    goBack = () => {
        this.props.history.push("/");
    };

    changeMetadataType = async selectedOption => {
        const { d2 } = this.props;

        const d2Class = d2ModelFactory(d2, selectedOption.value);
        const { objects } = await d2Class.listMethod(
            d2,
            { customFields: ["id", "name"] },
            { paging: false }
        );

        const metadataObjects = objects.map(object => ({
            label: object.name,
            value: object.id,
        }));

        this.setState({ metadataObjects });
    };

    selectMetadataObject = async selectedOption => {
        const id = selectedOption.value;

        this.props.history.push(`/metadata-dictionary/${id}`);

        const mainContent = id ? await Dictionary.build(id) : "";
        this.setState({ mainContent });
    };

    componentDidMount = async () => {
        const { d2, match } = this.props;
        const { id } = match.params;

        const metadataTypes = _(d2.models)
            .keys()
            .filter(model => {
                return d2.models[model].isMetaData;
            })
            .map(model => {
                return { label: d2.models[model].displayName, value: model };
            })
            .sortBy("label")
            .sortedUniqBy("label");

        const mainContent = id ? await Dictionary.build(id) : "";

        this.setState({ metadataTypes, mainContent });
    };

    render() {
        const { classes } = this.props;
        const { mainContent, metadataTypes, metadataObjects } = this.state;

        return (
            <React.Fragment>
                <PageHeader title={i18n.t("Metadata Dictionary")} onBackClick={this.goBack} />

                <div className={classes.options}>
                    <div className={classes.metadataTypeSelect}>
                        <Select
                            isSearchable={true}
                            options={metadataTypes}
                            onChange={this.changeMetadataType}
                        />
                    </div>
                    <div className={classes.metadataObjectSelect}>
                        <Select
                            isSearchable={true}
                            options={metadataObjects}
                            onChange={this.selectMetadataObject}
                        />
                    </div>
                </div>

                {mainContent && <MarkdownElement className={classes.code} text={mainContent} />}
            </React.Fragment>
        );
    }
}

export default withSnackbar(withRouter(withStyles(styles)(MetadataDictionary)));
