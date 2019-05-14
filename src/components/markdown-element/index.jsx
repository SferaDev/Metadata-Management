import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import marked from "marked";
import { withStyles } from "@material-ui/core/styles";
import prism from "./prism";

// Monkey patch to preserve non-breaking spaces
// https://github.com/chjj/marked/blob/6b0416d10910702f73da9cb6bb3d4c8dcb7dead7/lib/marked.js#L142-L150
marked.Lexer.prototype.lex = function lex(src) {
    src = src
        .replace(/\r\n|\r/g, "\n")
        .replace(/\t/g, "    ")
        .replace(/\u2424/g, "\n");

    return this.token(src, true);
};

const renderer = new marked.Renderer();

export function textToHash(text) {
    return text
        .toLowerCase()
        .replace(/=&gt;|&lt;| \/&gt;|<code>|<\/code>/g, "")
        .replace(/\W+/g, "-")
        .replace(/-$/g, "");
}

renderer.link = (href, title, text) => {
    return `<a
            href="${href}"
            onClick="window.location.href = '${href}'; window.location.reload()"
        >
            ${text}
        </a>`;
};

const markedOptions = {
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    highlight(code, lang) {
        let language;
        switch (lang) {
            case "diff":
                language = prism.languages.diff;
                break;

            case "css":
                language = prism.languages.css;
                break;

            case "ts":
            case "tsx":
                language = prism.languages.typescript;
                break;

            case "js":
            case "jsx":
            default:
                language = prism.languages.jsx;
                break;
        }

        return prism.highlight(code, language);
    },
    renderer,
};

const styles = theme => ({
    root: {
        fontFamily: theme.typography.fontFamily,
        fontSize: 16,
        color: theme.palette.text.primary,
        "& .anchor-link": {
            marginTop: -96, // Offset for the anchor.
            position: "absolute",
        },
        '& pre, & pre[class*="language-"]': {
            margin: "24px 0",
            padding: "12px 18px",
            backgroundColor: theme.palette.background.paper,
            borderRadius: theme.shape.borderRadius,
            overflow: "auto",
            WebkitOverflowScrolling: "touch", // iOS momentum scrolling.
        },
        "& code": {
            display: "inline-block",
            lineHeight: 1.6,
            fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
            padding: "3px 6px",
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.paper,
            fontSize: 14,
        },
        "& p code, & ul code, & pre code": {
            fontSize: 14,
            lineHeight: 1.6,
        },
        "& h1": {
            ...theme.typography.h2,
            margin: "32px 0 16px",
        },
        "& .description": {
            ...theme.typography.h5,
            margin: "0 0 40px",
        },
        "& h2": {
            ...theme.typography.h4,
            margin: "32px 0 24px",
        },
        "& h3": {
            ...theme.typography.h5,
            margin: "32px 0 24px",
        },
        "& h4": {
            ...theme.typography.h6,
            margin: "24px 0 16px",
        },
        "& h5": {
            ...theme.typography.subtitle2,
            margin: "24px 0 16px",
        },
        "& p, & ul, & ol": {
            lineHeight: 1.6,
        },
        "& h1, & h2, & h3, & h4": {
            "& code": {
                fontSize: "inherit",
                lineHeight: "inherit",
                // Remove scroll on small screens.
                wordBreak: "break-word",
            },
            "& .anchor-link-style": {
                opacity: 0,
                // To prevent the link to get the focus.
                display: "none",
            },
            "&:hover .anchor-link-style": {
                display: "inline-block",
                opacity: 1,
                padding: "0 8px",
                color: theme.palette.text.hint,
                "&:hover": {
                    color: theme.palette.text.secondary,
                },
                "& svg": {
                    width: "0.55em",
                    height: "0.55em",
                    fill: "currentColor",
                },
            },
        },
        "& table": {
            width: "100%",
            display: "block",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch", // iOS momentum scrolling.
            borderCollapse: "collapse",
            borderSpacing: 0,
            overflow: "hidden",
            "& .prop-name": {
                fontSize: 13,
                fontFamily: 'Consolas, "Liberation Mono", Menlo, monospace',
            },
            "& .required": {
                color: theme.palette.type === "light" ? "#006500" : "#9bc89b",
            },
            "& .prop-type": {
                fontSize: 13,
                fontFamily: 'Consolas, "Liberation Mono", Menlo, monospace',
                color: theme.palette.type === "light" ? "#932981" : "#dbb0d0",
            },
            "& .prop-default": {
                fontSize: 13,
                fontFamily: 'Consolas, "Liberation Mono", Menlo, monospace',
                borderBottom: `1px dotted ${theme.palette.text.hint}`,
            },
        },
        "& thead": {
            fontSize: 14,
            fontWeight: theme.typography.fontWeightMedium,
            color: theme.palette.text.secondary,
        },
        "& tbody": {
            fontSize: 14,
            lineHeight: 1.5,
            color: theme.palette.text.primary,
        },
        "& td": {
            borderBottom: `1px solid ${theme.palette.divider}`,
            padding: "8px 16px 8px 8px",
            textAlign: "left",
        },
        "& td:last-child": {
            paddingRight: 24,
        },
        "& td compact": {
            paddingRight: 24,
        },
        "& td code": {
            fontSize: 13,
            lineHeight: 1.6,
        },
        "& th": {
            whiteSpace: "pre",
            borderBottom: `1px solid ${theme.palette.divider}`,
            fontWeight: theme.typography.fontWeightMedium,
            padding: "0 16px 0 8px",
            textAlign: "left",
        },
        "& th:last-child": {
            paddingRight: 24,
        },
        "& tr": {
            height: 48,
        },
        "& thead tr": {
            height: 64,
        },
        "& strong": {
            fontWeight: theme.typography.fontWeightMedium,
        },
        "& blockquote": {
            borderLeft: `5px solid ${theme.palette.text.hint}`,
            backgroundColor: theme.palette.background.paper,
            padding: "4px 24px",
            margin: "24px 0",
        },
        "& a, & a code": {
            // Style taken from the Link component
            color: theme.palette.secondary.main,
            textDecoration: "none",
            "&:hover": {
                textDecoration: "underline",
            },
        },
        "& img": {
            maxWidth: "100%",
        },
    },
});

function MarkdownElement(props) {
    const { classes, className, text, ...other } = props;

    /* eslint-disable react/no-danger */
    return (
        <div
            className={classNames(classes.root, "markdown-body", className)}
            dangerouslySetInnerHTML={{ __html: marked(text, markedOptions) }}
            {...other}
        />
    );
    /* eslint-enable */
}

MarkdownElement.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    text: PropTypes.string,
};

export default withStyles(styles, { flip: false })(MarkdownElement);
