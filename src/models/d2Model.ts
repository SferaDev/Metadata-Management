import _ from "lodash";
import { isValidUid } from "d2/uid";

import {
    cleanParams,
    d2BaseModelColumns,
    d2BaseModelDetails,
    organisationUnitsColumns,
    organisationUnitsDetails,
} from "../utils/d2";
import {
    OrganisationUnitTableFilters,
    TableFilters,
    TableLabel,
    TableList,
    TablePagination,
} from "../types/d2-ui-components";
import { D2, ModelDefinition } from "../types/d2";

export abstract class D2Model {
    // Metadata Type should be defined on subclasses
    protected static metadataType: string;
    protected static groupFilterName: string;

    // Other static properties can be optionally overridden on subclasses
    protected static columns = d2BaseModelColumns;
    protected static details = d2BaseModelDetails;
    protected static initialSorting = ["name", "asc"];

    // List method should be executed by a wrapper to preserve static context binding
    public static async listMethod(
        d2: D2,
        filters: TableFilters,
        pagination: TablePagination
    ): Promise<TableList> {
        const {
            search = null,
            fields: overriddenFields = null,
            lastUpdatedDate = null,
            groupFilter = null,
            customFilters = [],
            customFields = [],
        } = filters || {};
        const { page = 1, pageSize = 20, sorting = this.initialSorting, paging = true } =
            pagination || {};

        const details = this.details.map(e => e.name);
        const columns = this.columns.map(e => e.name);
        const fields = overriddenFields
            ? overriddenFields
            : _.union(details, columns, customFields);

        const [field, direction] = sorting;
        const order = `${field}:i${direction}`;
        const filter = _.compact([
            search && isValidUid(search) ? `id:eq:${search}` : null,
            search && !isValidUid(search) ? `displayName:ilike:${search}` : null,
            lastUpdatedDate ? `lastUpdated:ge:${lastUpdatedDate.toISOString()}` : null,
            groupFilter ? `${this.groupFilterName}.id:eq:${groupFilter}` : null,
            ...customFilters,
        ]);

        const listParams = cleanParams({ fields, filter, page, pageSize, order, paging });
        const collection = await this.getD2Model(d2).list(listParams);
        return { pager: collection.pager, objects: collection.toArray() };
    }

    public static getD2Model(d2: D2): ModelDefinition {
        return d2.models[this.metadataType];
    }

    public static getMetadataType(): string {
        return this.metadataType;
    }

    public static getColumns(): TableLabel[] {
        return this.columns;
    }

    public static getDetails(): TableLabel[] {
        return this.details;
    }

    public static getInitialSorting(): string[] {
        return this.initialSorting;
    }
}

export class OrganisationUnitModel extends D2Model {
    protected static metadataType = "organisationUnit";
    protected static groupFilterName = "organisationUnitGroups";

    protected static columns = organisationUnitsColumns;
    protected static details = organisationUnitsDetails;

    public static async listMethod(
        d2: D2,
        filters: OrganisationUnitTableFilters,
        pagination: TablePagination
    ): Promise<TableList> {
        const { orgUnitLevel = null } = filters || {};
        const newFilters = {
            ...filters,
            customFilters: _.compact([orgUnitLevel ? `level:eq:${orgUnitLevel}` : null]),
        };
        return await super.listMethod(d2, newFilters, pagination);
    }
}

export class DataElementModel extends D2Model {
    protected static metadataType = "dataElement";
}

export class IndicatorModel extends D2Model {
    protected static metadataType = "indicator";
    protected static groupFilterName = "indicatorGroups";
}

export class ValidationRuleModel extends D2Model {
    protected static metadataType = "validationRule";
    protected static groupFilterName = "validationRuleGroups";
}

export function defaultModel(pascalCaseModelName: string): any {
    return class DefaultModel extends D2Model {
        protected static metadataType = pascalCaseModelName;
    };
}
