import axios from "axios";
import _ from "lodash";
import "../utils/lodash-mixins";
import { isValidUid } from "d2/uid";

import { cleanModelName } from "./d2";
import { D2, MetadataPackage } from "../types/d2";

export const uidRegEx = /[a-zA-Z][a-zA-Z0-9]{10}/g;

export const getMetadata = async (d2: D2, elements: string[]): Promise<MetadataPackage> => {
    const promises = [];
    for (let i = 0; i < elements.length; i += 100) {
        const requestUrl = d2.Api.getApi().baseUrl + "/metadata.json";
        const requestElements = elements.slice(i, i + 100).toString();
        promises.push(
            axios.get(requestUrl, {
                withCredentials: true,
                params: {
                    fields: ":all,!organisationUnits,dashboardItems[:all,chart[:all]]",
                    filter: "id:in:[" + requestElements + "]",
                    defaults: "EXCLUDE",
                    skipSharing: true,
                },
            })
        );
    }
    const result = await Promise.all(promises);
    const merged = _.deepMerge({}, ...result.map(result => result.data));
    if (merged.system) delete merged.system;
    if (merged.date) delete merged.date;
    if (merged.users) delete merged.users;

    return merged;
};

export const getApiMetadata = async (
    d2: D2,
    model: string,
    element: string
): Promise<MetadataPackage> => {
    const requestUrl = d2.Api.getApi().baseUrl + `/${model}/${element}/metadata.json`;
    const result = await axios.get(requestUrl, {
        withCredentials: true,
        params: {
            fields: ":all,!organisationUnits",
            defaults: "EXCLUDE",
            skipSharing: true,
        },
    });
    const data = result.data;
    if (data.system) delete data.system;
    if (data.date) delete data.date;
    if (data.users) delete data.users;

    return data;
};

export const getAllReferences = (
    d2: D2,
    obj: any,
    type: string,
    parents: string[] = []
): MetadataPackage => {
    let result: MetadataPackage = {};
    _.forEach(obj, (value, key) => {
        if (_.isObject(value) || _.isArray(value)) {
            const recursive = getAllReferences(d2, value, type, [...parents, key]);
            result = _.deepMerge(result, recursive);
        } else if (isValidUid(value)) {
            const metadataType = _(parents)
                .map(k => cleanModelName(d2, k, type))
                .compact()
                .first();
            if (metadataType) {
                result[metadataType] = result[metadataType] || [];
                result[metadataType].push(value);
            }
        }
    });
    return result;
};

export const getExpression = async (d2: D2, expression: string): Promise<string | null> => {
    let requestUrl = d2.Api.getApi().baseUrl + "/expressions/description";
    let response = await axios.get(requestUrl, {
        withCredentials: true,
        params: { expression },
    });

    if (response.data.description) return response.data.description;

    requestUrl = d2.Api.getApi().baseUrl + "/programIndicators/expression/description";
    response = await axios.post(requestUrl, expression, {
        withCredentials: true,
        headers: {
            "Content-Type": "text/plain",
        },
    });

    if (response.data.description) return response.data.description;

    requestUrl = d2.Api.getApi().baseUrl + "/programIndicators/filter/description";
    response = await axios.post(requestUrl, expression, {
        withCredentials: true,
        headers: {
            "Content-Type": "text/plain",
        },
    });

    if (response.data.description) return response.data.description;

    return null;
};
